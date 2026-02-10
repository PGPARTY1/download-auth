import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { palette, spacing } from "../theme/tokens";

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
};

export function ScreenContainer({ children, scroll = true }: Props) {
  if (scroll) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.background
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    gap: spacing.md
  }
});
