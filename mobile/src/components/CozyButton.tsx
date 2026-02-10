import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { palette, radii, spacing } from "../theme/tokens";

type CozyButtonProps = {
  title: string;
  onPress: () => void | Promise<void>;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  style?: ViewStyle;
};

export function CozyButton({ title, onPress, disabled, variant = "primary", style }: CozyButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={async () => {
        await Haptics.selectionAsync();
        await onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "ghost" && styles.ghost,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === "primary" && styles.primaryText,
          variant === "secondary" && styles.secondaryText,
          variant === "ghost" && styles.ghostText
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: palette.shadow,
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2
  },
  primary: {
    backgroundColor: palette.accent
  },
  secondary: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border
  },
  ghost: {
    backgroundColor: "transparent"
  },
  text: {
    fontSize: 15,
    fontWeight: "600"
  },
  primaryText: {
    color: "#fff"
  },
  secondaryText: {
    color: palette.text
  },
  ghostText: {
    color: palette.textMuted
  },
  pressed: {
    transform: [{ scale: 0.98 }]
  },
  disabled: {
    opacity: 0.5
  }
});
