import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { palette } from "../theme/tokens";

type SplashScreenProps = {
  onDone: () => void;
};

export function SplashScreen({ onDone }: SplashScreenProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 7, useNativeDriver: true })
      ]),
      Animated.delay(800),
      Animated.timing(opacity, { toValue: 0, duration: 350, useNativeDriver: true })
    ]).start(() => onDone());
  }, [onDone, opacity, scale]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Text style={styles.logo}>PookieStudios</Text>
        <Text style={styles.caption}>Crafted with warmth.</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.background
  },
  logo: {
    fontSize: 38,
    fontWeight: "700",
    color: palette.text,
    letterSpacing: 0.6,
    textAlign: "center"
  },
  caption: {
    marginTop: 10,
    textAlign: "center",
    color: palette.textMuted,
    fontSize: 14
  }
});
