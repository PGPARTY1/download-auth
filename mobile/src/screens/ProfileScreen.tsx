import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CozyButton } from "../components/CozyButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";
import { formatDate, formatMoney } from "../lib/format";
import { MainTabParamList } from "../navigation/types";
import { palette, radii, spacing } from "../theme/tokens";
import { Purchase } from "../types/models";

type Props = BottomTabScreenProps<MainTabParamList, "Profile">;

export function ProfileScreen({ navigation }: Props) {
  const { user, accessToken } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    const data = await apiRequest<{ purchases: Purchase[] }>({
      path: "/payments/history",
      accessToken
    });
    setPurchases(data.purchases);
  }, [accessToken]);

  useEffect(() => {
    void (async () => {
      try {
        await loadHistory();
      } finally {
        setLoading(false);
      }
    })();
  }, [loadHistory]);

  return (
    <ScreenContainer>
      <View style={styles.profileCard}>
        <Text style={styles.name}>{user?.name || "PookieStudios Member"}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.status}>{user?.premiumUnlocked ? "Premium unlocked" : "Free tier"}</Text>
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Purchase history</Text>
        <CozyButton
          title="Refresh"
          variant="ghost"
          onPress={async () => {
            setRefreshing(true);
            try {
              await loadHistory();
            } finally {
              setRefreshing(false);
            }
          }}
        />
      </View>

      {loading ? <ActivityIndicator color={palette.accent} /> : null}
      {!loading && purchases.length === 0 ? <Text style={styles.empty}>No purchases yet.</Text> : null}
      {!loading &&
        purchases.map((purchase) => (
          <View key={purchase.id} style={styles.purchaseCard}>
            <Text style={styles.purchaseName}>{purchase.product.name}</Text>
            <Text style={styles.purchaseLine}>
              {formatMoney(purchase.amountCents, purchase.currency)} - {purchase.status}
            </Text>
            <Text style={styles.purchaseDate}>{formatDate(purchase.createdAt)}</Text>
          </View>
        ))}

      <View style={styles.actions}>
        <CozyButton title="Open store" variant="secondary" onPress={() => navigation.navigate("Store")} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.xs
  },
  name: {
    color: palette.text,
    fontSize: 22,
    fontWeight: "700"
  },
  email: {
    color: palette.textMuted
  },
  status: {
    color: palette.accent,
    fontWeight: "600"
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  sectionTitle: {
    fontSize: 20,
    color: palette.text,
    fontWeight: "700"
  },
  empty: {
    color: palette.textMuted
  },
  purchaseCard: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs
  },
  purchaseName: {
    color: palette.text,
    fontWeight: "700"
  },
  purchaseLine: {
    color: palette.textMuted
  },
  purchaseDate: {
    color: palette.textMuted,
    fontSize: 12
  },
  actions: {
    marginTop: spacing.sm
  }
});
