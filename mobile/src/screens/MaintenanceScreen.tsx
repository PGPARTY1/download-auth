import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "../components/ScreenContainer";
import { palette, radii, spacing } from "../theme/tokens";

export function MaintenanceScreen() {
  return (
    <ScreenContainer scroll={false}>
      <View style={styles.card}>
        <Text style={styles.title}>Quick maintenance break</Text>
        <Text style={styles.body}>
          We are polishing a few details right now. Please check back shortly.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 60,
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: palette.border,
    gap: spacing.sm
  },
  title: {
    color: palette.text,
    fontSize: 23,
    fontWeight: "700"
  },
  body: {
    color: palette.textMuted,
    lineHeight: 22
  }
});
