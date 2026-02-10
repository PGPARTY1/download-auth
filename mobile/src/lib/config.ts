const fallbackBaseUrl = "http://10.0.2.2:4100";

function normalizeApiBaseUrl(raw: string) {
  const trimmed = raw.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

export const config = {
  apiBaseUrl: normalizeApiBaseUrl(process.env.EXPO_PUBLIC_API_URL ?? fallbackBaseUrl),
  stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "",
  googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "",
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "",
  maintenanceMode: process.env.EXPO_PUBLIC_MAINTENANCE_MODE === "true"
};
