import React from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";
import { palette, radii, spacing } from "../theme/tokens";

export function CozyInput(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={palette.textMuted}
      style={styles.input}
      autoCapitalize="none"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: palette.text,
    fontSize: 15
  }
});
