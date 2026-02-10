import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CozyButton } from "../components/CozyButton";
import { CozyInput } from "../components/CozyInput";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAuth } from "../context/AuthContext";
import { AuthStackParamList } from "../navigation/types";
import { palette, radii, spacing } from "../theme/tokens";

type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Reset password</Text>
      <Text style={styles.subtitle}>Enter your email and we will send a reset link.</Text>

      <View style={styles.card}>
        <CozyInput placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <CozyButton
          title={busy ? "Sending..." : "Send reset link"}
          disabled={busy}
          onPress={async () => {
            setBusy(true);
            try {
              const info = await forgotPassword(email.trim());
              setMessage(info);
            } catch (error) {
              const reason = error instanceof Error ? error.message : "Failed to send reset link.";
              Alert.alert("Request failed", reason);
            } finally {
              setBusy(false);
            }
          }}
        />
      </View>

      {message ? <Text style={styles.message}>{message}</Text> : null}
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
  },
  message: {
    color: palette.success
  }
});
