import "react-native-gesture-handler";
import React, { useMemo, useState } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StripeProvider } from "@stripe/stripe-react-native";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { config } from "./src/lib/config";
import { AuthStackParamList, MainTabParamList } from "./src/navigation/types";
import { ErrorScreen } from "./src/screens/ErrorScreen";
import { ForgotPasswordScreen } from "./src/screens/ForgotPasswordScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { MaintenanceScreen } from "./src/screens/MaintenanceScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { ResetPasswordScreen } from "./src/screens/ResetPasswordScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { SignupScreen } from "./src/screens/SignupScreen";
import { SplashScreen } from "./src/screens/SplashScreen";
import { StoreScreen } from "./src/screens/StoreScreen";
import { VerifyEmailScreen } from "./src/screens/VerifyEmailScreen";
import { palette } from "./src/theme/tokens";

type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  VerifyEmail: { token?: string } | undefined;
  ResetPassword: { token?: string } | undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: palette.background,
    card: palette.surface,
    text: palette.text,
    border: palette.border,
    primary: palette.accent
  }
};

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainTabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.accent,
        tabBarInactiveTintColor: palette.textMuted,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.border
        }
      }}
    >
      <MainTabs.Screen name="Home" component={HomeScreen} />
      <MainTabs.Screen name="Store" component={StoreScreen} />
      <MainTabs.Screen name="Profile" component={ProfileScreen} />
      <MainTabs.Screen name="Settings" component={SettingsScreen} />
    </MainTabs.Navigator>
  );
}

function RootNavigator() {
  const { loading, user } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [fatalError, setFatalError] = useState<string | null>(null);

  if (config.maintenanceMode) {
    return <MaintenanceScreen />;
  }

  if (showSplash || loading) {
    return <SplashScreen onDone={() => setShowSplash(false)} />;
  }

  if (fatalError) {
    return (
      <ErrorScreen
        message={fatalError}
        onRetry={() => {
          setFatalError(null);
        }}
      />
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {user ? <RootStack.Screen name="Main" component={MainNavigator} /> : <RootStack.Screen name="Auth" component={AuthNavigator} />}
      <RootStack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <RootStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </RootStack.Navigator>
  );
}

export default function App() {
  const providerKey = useMemo(() => config.stripePublishableKey || "pk_test_51_replace_me", []);

  return (
    <StripeProvider
      publishableKey={providerKey}
      merchantIdentifier="merchant.com.pookiestudios.app"
      urlScheme="pookiestudios"
    >
      <AuthProvider>
        <NavigationContainer theme={navTheme}>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </StripeProvider>
  );
}
