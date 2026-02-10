import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CozyButton } from "../components/CozyButton";
import { CozyInput } from "../components/CozyInput";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAuth } from "../context/AuthContext";
import { AuthStackParamList } from "../navigation/types";
import { palette, radii, spacing } from "../theme/tokens";

type Props = NativeStackScreenProps<AuthStackParamList, "Signup">;

export function SignupScreen({ navigation }: Props) {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Your premium studio starts here.</Text>

      <View style={styles.card}>
        <CozyInput placeholder="Name" value={name} onChangeText={setName} />
        <CozyInput placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <CozyInput placeholder="Password (8+ chars)" secureTextEntry value={password} onChangeText={setPassword} />
        <CozyButton
          title={busy ? "Creating..." : "Create account"}
          disabled={busy}
          onPress={async () => {
            setBusy(true);
            try {
              await signup(name.trim(), email.trim(), password);
              Alert.alert("Check your inbox", "We sent an email verification link.");
              navigation.navigate("Login");
            } catch (error) {
              const message = error instanceof Error ? error.message : "Sign up failed.";
              Alert.alert("Sign up failed", message);
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
    fontSize: 30,
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
