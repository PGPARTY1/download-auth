import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { PremiumGate } from "../components/PremiumGate";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAuth } from "../context/AuthContext";
import { MainTabParamList } from "../navigation/types";
import { palette, radii, spacing } from "../theme/tokens";

type Props = BottomTabScreenProps<MainTabParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const locked = !user?.premiumUnlocked;

  return (
    <ScreenContainer>
      <Text style={styles.title}>Hi{user?.name ? `, ${user.name}` : ""}</Text>
      <Text style={styles.subtitle}>Your calm studio dashboard for shipping beautiful work.</Text>

      <PremiumGate locked={locked} onUnlockPress={() => navigation.navigate("Store")}>
        <View style={styles.premiumPanel}>
          <Text style={styles.panelTitle}>Premium Workspace</Text>
          <Text style={styles.panelBody}>
            Access release assets, private notes, and latest studio drop builds in one place.
          </Text>
          <View style={styles.metricRow}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Assets</Text>
              <Text style={styles.metricValue}>124</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Projects</Text>
              <Text style={styles.metricValue}>8</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Builds</Text>
              <Text style={styles.metricValue}>17</Text>
            </View>
          </View>
        </View>
      </PremiumGate>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>What is new</Text>
        <Text style={styles.infoBody}>
          Improved navigation, smoother checkout, and better purchase recovery flow.
        </Text>
      </View>
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
  premiumPanel: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    padding: spacing.lg,
    gap: spacing.md,
    minHeight: 240
  },
  panelTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: palette.text
  },
  panelBody: {
    color: palette.textMuted,
    lineHeight: 22
  },
  metricRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  metric: {
    flex: 1,
    borderRadius: radii.md,
    backgroundColor: palette.surfaceMuted,
    padding: spacing.md,
    alignItems: "center"
  },
  metricLabel: {
    color: palette.textMuted,
    fontSize: 12
  },
  metricValue: {
    color: palette.text,
    fontSize: 22,
    fontWeight: "700"
  },
  infoCard: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderColor: palette.border,
    borderWidth: 1
  },
  infoTitle: {
    color: palette.text,
    fontWeight: "700",
    marginBottom: spacing.xs
  },
  infoBody: {
    color: palette.textMuted,
    lineHeight: 20
  }
});
