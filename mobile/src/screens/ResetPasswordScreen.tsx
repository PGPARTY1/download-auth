import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CozyButton } from "../components/CozyButton";
import { CozyInput } from "../components/CozyInput";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAuth } from "../context/AuthContext";
import { AuthStackParamList } from "../navigation/types";
import { palette, radii, spacing } from "../theme/tokens";

type Props = NativeStackScreenProps<AuthStackParamList, "ResetPassword">;

export function ResetPasswordScreen({ route, navigation }: Props) {
  const { resetPassword } = useAuth();
  const [token, setToken] = useState(route.params?.token ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Set new password</Text>
      <Text style={styles.subtitle}>Use the token from your reset email.</Text>
      <View style={styles.card}>
        <CozyInput placeholder="Reset token" value={token} onChangeText={setToken} />
        <CozyInput placeholder="New password" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
        <CozyButton
          title={busy ? "Saving..." : "Save password"}
          disabled={busy}
          onPress={async () => {
            setBusy(true);
            try {
              const message = await resetPassword(token.trim(), newPassword);
              Alert.alert("Password updated", message, [
                {
                  text: "Back to login",
                  onPress: () => navigation.navigate("Login")
                }
              ]);
            } catch (error) {
              const reason = error instanceof Error ? error.message : "Password reset failed.";
              Alert.alert("Reset failed", reason);
            } finally {
              setBusy(false);
            }
          }}
        />
      </View>
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
