import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CozyButton } from "../components/CozyButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { palette, radii, spacing } from "../theme/tokens";

type ErrorScreenProps = {
  message: string;
  onRetry: () => void;
};

export function ErrorScreen({ message, onRetry }: ErrorScreenProps) {
  return (
    <ScreenContainer scroll={false}>
      <View style={styles.card}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.body}>{message}</Text>
        <CozyButton title="Try again" onPress={onRetry} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 60,
    borderRadius: radii.lg,
    borderColor: palette.border,
    borderWidth: 1,
    backgroundColor: palette.surface,
    padding: spacing.lg,
    gap: spacing.md
  },
  title: {
    color: palette.error,
    fontSize: 22,
    fontWeight: "700"
  },
  body: {
    color: palette.textMuted,
    lineHeight: 21
  }
});
