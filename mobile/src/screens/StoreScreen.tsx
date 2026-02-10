import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, View } from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useStripe } from "@stripe/stripe-react-native";
import { CozyButton } from "../components/CozyButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";
import { formatMoney } from "../lib/format";
import { MainTabParamList } from "../navigation/types";
import { palette, radii, spacing } from "../theme/tokens";
import { Product, Purchase } from "../types/models";

type Props = BottomTabScreenProps<MainTabParamList, "Store">;

type PaymentIntentResponse = {
  clientSecret: string;
  publishableKey: string;
  merchantCountry: string;
};

export function StoreScreen({ navigation }: Props) {
  const { accessToken, user, loadMe } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [busyProductId, setBusyProductId] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const data = await apiRequest<{ products: Product[] }>({
        path: "/products"
      });
      setProducts(data.products);
    } catch (error) {
      Alert.alert("Could not load plans", error instanceof Error ? error.message : "Unexpected error");
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const restorePurchases = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    try {
      const data = await apiRequest<{ premiumUnlocked: boolean; purchases: Purchase[] }>({
        method: "POST",
        path: "/payments/restore",
        accessToken
      });
      await loadMe();
      setRestoreMessage(data.premiumUnlocked ? "Premium restored successfully." : "No completed purchases found.");
    } catch (error) {
      setRestoreMessage(error instanceof Error ? error.message : "Failed to restore purchases.");
    }
  }, [accessToken, loadMe]);

  const buyProduct = useCallback(
    async (product: Product) => {
      if (!accessToken) {
        Alert.alert("Sign in required", "Please sign in before purchasing.");
        return;
      }

      Alert.alert("Confirm purchase", `Unlock ${product.name} for ${formatMoney(product.amountCents, product.currency)}?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: async () => {
            setBusyProductId(product.id);
            try {
              const data = await apiRequest<PaymentIntentResponse>({
                method: "POST",
                path: "/payments/payment-intent",
                accessToken,
                body: {
                  productId: product.id,
                  platform: Platform.OS === "ios" ? "ios" : "android"
                }
              });

              const initResult = await initPaymentSheet({
                merchantDisplayName: "PookieStudios",
                paymentIntentClientSecret: data.clientSecret,
                allowsDelayedPaymentMethods: true,
                applePay: {
                  merchantCountryCode: data.merchantCountry
                },
                googlePay: {
                  merchantCountryCode: data.merchantCountry,
                  currencyCode: product.currency.toUpperCase(),
                  testEnv: true
                },
                returnURL: "pookiestudios://stripe-redirect"
              });

              if (initResult.error) {
                Alert.alert("Checkout error", initResult.error.message);
                return;
              }

              const presentResult = await presentPaymentSheet();
              if (presentResult.error) {
                Alert.alert("Payment not completed", presentResult.error.message);
                return;
              }

              await restorePurchases();
              Alert.alert("Purchase complete", "Premium unlock was successful.");
              navigation.navigate("Home");
            } catch (error) {
              Alert.alert("Payment failed", error instanceof Error ? error.message : "Unexpected payment error");
            } finally {
              setBusyProductId(null);
            }
          }
        }
      ]);
    },
    [accessToken, initPaymentSheet, navigation, presentPaymentSheet, restorePurchases]
  );

  return (
    <ScreenContainer>
      <Text style={styles.title}>Premium Store</Text>
      <Text style={styles.subtitle}>
        One-time checkout with Stripe Payment Sheet. Apple Pay and Google Pay are supported where available.
      </Text>

      {user?.premiumUnlocked ? (
        <View style={styles.unlockedBanner}>
          <Text style={styles.unlockedText}>Premium is active on this account.</Text>
        </View>
      ) : null}

      {loadingProducts ? (
        <ActivityIndicator color={palette.accent} />
      ) : (
        products.map((product) => (
          <View key={product.id} style={styles.planCard}>
            <Text style={styles.planName}>{product.name}</Text>
            <Text style={styles.planDescription}>{product.description}</Text>
            <Text style={styles.planPrice}>{formatMoney(product.amountCents, product.currency)}</Text>
            <CozyButton
              title={busyProductId === product.id ? "Processing..." : `Unlock ${product.name}`}
              disabled={busyProductId !== null}
              onPress={async () => buyProduct(product)}
            />
          </View>
        ))
      )}

      <CozyButton title="Restore purchases" variant="secondary" onPress={restorePurchases} />
      {restoreMessage ? <Text style={styles.restoreText}>{restoreMessage}</Text> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 29,
    fontWeight: "700",
    color: palette.text
  },
  subtitle: {
    color: palette.textMuted,
    lineHeight: 20
  },
  unlockedBanner: {
    backgroundColor: "#deefe4",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "#b9d8c3",
    padding: spacing.sm
  },
  unlockedText: {
    color: palette.success,
    fontWeight: "600"
  },
  planCard: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    borderColor: palette.border,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm
  },
  planName: {
    color: palette.text,
    fontWeight: "700",
    fontSize: 20
  },
  planDescription: {
    color: palette.textMuted
  },
  planPrice: {
    color: palette.accent,
    fontWeight: "700",
    fontSize: 22
  },
  restoreText: {
    color: palette.textMuted
  }
});
