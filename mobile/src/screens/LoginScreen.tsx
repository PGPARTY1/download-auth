import * as AppleAuthentication from "expo-apple-authentication";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import { Alert, Platform, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CozyButton } from "../components/CozyButton";
import { CozyInput } from "../components/CozyInput";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAuth } from "../context/AuthContext";
import { config } from "../lib/config";
import { AuthStackParamList } from "../navigation/types";
import { palette, radii, spacing } from "../theme/tokens";

WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { login, oauthGoogle, oauthApple, errorMessage, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const [googleRequest, googleResponse, promptGoogleSignIn] = Google.useAuthRequest({
    iosClientId: config.googleIosClientId || undefined,
    androidClientId: config.googleAndroidClientId || undefined,
    webClientId: config.googleWebClientId || undefined
  });

  useEffect(() => {
    if (googleResponse?.type === "success") {
      const idToken = googleResponse.authentication?.idToken || googleResponse.params?.id_token;
      if (!idToken) {
        Alert.alert("Google sign-in failed", "Google did not return an identity token.");
        return;
      }
      void oauthGoogle(idToken).catch((error: Error) => Alert.alert("Google sign-in failed", error.message));
    }
  }, [googleResponse, oauthGoogle]);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue your cozy workflow.</Text>
      </View>

      <View style={styles.card}>
        <CozyInput
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCorrect={false}
        />
        <CozyInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <CozyButton
          title={busy ? "Signing in..." : "Sign in"}
          disabled={busy}
          onPress={async () => {
            setBusy(true);
            clearError();
            try {
              await login(email.trim(), password);
            } catch {
              // Error is surfaced from context
            } finally {
              setBusy(false);
            }
          }}
        />
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        <CozyButton title="Forgot password?" variant="ghost" onPress={() => navigation.navigate("ForgotPassword")} />
      </View>

      <View style={styles.oauthCard}>
        <CozyButton
          title="Continue with Google"
          variant="secondary"
          disabled={!googleRequest}
          onPress={async () => {
            await promptGoogleSignIn({ showInRecents: true });
          }}
        />
        {Platform.OS === "ios" ? (
          <CozyButton
            title="Continue with Apple"
            variant="secondary"
            onPress={async () => {
              try {
                const credential = await AppleAuthentication.signInAsync({
                  requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL
                  ]
                });
                if (!credential.identityToken) {
                  Alert.alert("Apple sign-in failed", "Apple did not return an identity token.");
                  return;
                }
                const name = [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(" ").trim();
                await oauthApple(credential.identityToken, name || undefined);
              } catch (error) {
                const message = error instanceof Error ? error.message : "Apple sign-in failed.";
                Alert.alert("Apple sign-in failed", message);
              }
            }}
          />
        ) : null}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>New to PookieStudios?</Text>
        <CozyButton title="Create account" variant="ghost" onPress={() => navigation.navigate("Signup")} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.sm
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: palette.text
  },
  subtitle: {
    marginTop: spacing.xs,
    color: palette.textMuted,
    fontSize: 15
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    borderColor: palette.border,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm
  },
  oauthCard: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm
  },
  footer: {
    marginTop: "auto",
    alignItems: "center",
    gap: spacing.xs
  },
  footerText: {
    color: palette.textMuted
  },
  error: {
    color: palette.error,
    fontSize: 13
  }
});
