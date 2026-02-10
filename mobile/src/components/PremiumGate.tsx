import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { palette, radii, spacing } from "../theme/tokens";
import { CozyButton } from "./CozyButton";

type PremiumGateProps = {
  locked: boolean;
  onUnlockPress: () => void;
  children: React.ReactNode;
};

export function PremiumGate({ locked, onUnlockPress, children }: PremiumGateProps) {
  return (
    <View style={styles.container}>
      {children}
      {locked ? (
        <View style={styles.overlayContainer}>
          <BlurView intensity={32} tint="light" style={styles.overlay}>
            <Text style={styles.title}>Premium required</Text>
            <Text style={styles.body}>Unlock the full creative toolkit and private builds.</Text>
            <CozyButton title="Unlock Premium" onPress={onUnlockPress} />
          </BlurView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.lg,
    overflow: "hidden"
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject
  },
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: palette.text
  },
  body: {
    fontSize: 14,
    textAlign: "center",
    color: palette.textMuted,
    marginBottom: spacing.sm
  }
});
