import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CozyButton } from "../components/CozyButton";
import { CozyInput } from "../components/CozyInput";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAuth } from "../context/AuthContext";
import { AuthStackParamList } from "../navigation/types";
import { palette, radii, spacing } from "../theme/tokens";

type Props = NativeStackScreenProps<AuthStackParamList, "VerifyEmail">;

export function VerifyEmailScreen({ route, navigation }: Props) {
  const { verifyEmail } = useAuth();
  const [token, setToken] = useState(route.params?.token ?? "");
  const [busy, setBusy] = useState(false);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Verify your email</Text>
      <Text style={styles.subtitle}>Paste the verification token from your email link.</Text>
      <View style={styles.card}>
        <CozyInput placeholder="Verification token" value={token} onChangeText={setToken} />
        <CozyButton
          title={busy ? "Verifying..." : "Verify email"}
          disabled={busy}
          onPress={async () => {
            setBusy(true);
            try {
              await verifyEmail(token.trim());
            } catch (error) {
              const reason = error instanceof Error ? error.message : "Verification failed.";
              Alert.alert("Verification failed", reason);
            } finally {
              setBusy(false);
            }
          }}
        />
      </View>
      <CozyButton title="Back to login" variant="ghost" onPress={() => navigation.navigate("Login")} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: palette.text
  },
  subtitle: {
    color: palette.textMuted
  },
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm
  }
});
