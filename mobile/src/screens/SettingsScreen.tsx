import React from "react";
import { Alert, Linking, StyleSheet, Text, View } from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import Constants from "expo-constants";
import { CozyButton } from "../components/CozyButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAuth } from "../context/AuthContext";
import { MainTabParamList } from "../navigation/types";
import { palette, radii, spacing } from "../theme/tokens";

type Props = BottomTabScreenProps<MainTabParamList, "Settings">;

export function SettingsScreen({ navigation }: Props) {
  const { logout } = useAuth();

  return (
    <ScreenContainer>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account</Text>
        <CozyButton
          title="Verify email token"
          variant="secondary"
          onPress={() => navigation.getParent()?.navigate("VerifyEmail" as never)}
        />
        <CozyButton
          title="Reset password token"
          variant="secondary"
          onPress={() => navigation.getParent()?.navigate("ResetPassword" as never)}
        />
        <CozyButton
          title="Logout"
          onPress={async () => {
            await logout();
          }}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>App info</Text>
        <Text style={styles.info}>Version: {Constants.expoConfig?.version ?? "1.0.0"}</Text>
        <Text style={styles.info}>Build: Cozy minimal theme, premium unlock flow, Stripe checkout.</Text>
        <CozyButton
          title="Privacy policy"
          variant="ghost"
          onPress={async () => {
            const url = "https://pookiestudios.in/privacy";
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
              await Linking.openURL(url);
            } else {
              Alert.alert("Unable to open link");
            }
          }}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    color: palette.text,
    fontSize: 30,
    fontWeight: "700"
  },
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm
  },
  cardTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "700"
  },
  info: {
    color: palette.textMuted,
    lineHeight: 20
  }
});
