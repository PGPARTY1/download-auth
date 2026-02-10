import * as SecureStore from "expo-secure-store";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest, ApiError } from "../lib/api";
import { AuthTokens, User } from "../types/models";

const ACCESS_TOKEN_KEY = "pookie_access_token";
const REFRESH_TOKEN_KEY = "pookie_refresh_token";

type AuthContextValue = {
  loading: boolean;
  user: User | null;
  accessToken: string | null;
  errorMessage: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (token: string, newPassword: string) => Promise<string>;
  oauthGoogle: (idToken: string, name?: string) => Promise<void>;
  oauthApple: (identityToken: string, name?: string) => Promise<void>;
  refreshAuth: () => Promise<string | null>;
  loadMe: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function saveTokens(tokens: AuthTokens) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setSession = useCallback(
    async (payload: { user: User; accessToken: string; refreshToken: string }) => {
      setUser(payload.user);
      setAccessToken(payload.accessToken);
      setRefreshToken(payload.refreshToken);
      await saveTokens({ accessToken: payload.accessToken, refreshToken: payload.refreshToken });
    },
    []
  );

  const loadMe = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    const data = await apiRequest<{ user: User }>({
      path: "/auth/me",
      accessToken
    });
    setUser(data.user);
  }, [accessToken]);

  const refreshAuth = useCallback(async () => {
    if (!refreshToken) {
      return null;
    }
    try {
      const refreshed = await apiRequest<AuthTokens>({
        method: "POST",
        path: "/auth/refresh",
        body: { refreshToken }
      });
      setAccessToken(refreshed.accessToken);
      setRefreshToken(refreshed.refreshToken);
      await saveTokens(refreshed);
      return refreshed.accessToken;
    } catch {
      await clearTokens();
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      return null;
    }
  }, [refreshToken]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [storedAccessToken, storedRefreshToken] = await Promise.all([
          SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
          SecureStore.getItemAsync(REFRESH_TOKEN_KEY)
        ]);

        if (!storedAccessToken || !storedRefreshToken) {
          return;
        }

        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);

        try {
          const me = await apiRequest<{ user: User }>({
            path: "/auth/me",
            accessToken: storedAccessToken
          });
          setUser(me.user);
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            const refreshed = await apiRequest<AuthTokens>({
              method: "POST",
              path: "/auth/refresh",
              body: { refreshToken: storedRefreshToken }
            });
            setAccessToken(refreshed.accessToken);
            setRefreshToken(refreshed.refreshToken);
            await saveTokens(refreshed);
            const me = await apiRequest<{ user: User }>({
              path: "/auth/me",
              accessToken: refreshed.accessToken
            });
            setUser(me.user);
          } else {
            throw error;
          }
        }
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setErrorMessage(null);
    try {
      const data = await apiRequest<{ user: User; accessToken: string; refreshToken: string }>({
        method: "POST",
        path: "/auth/login",
        body: { email, password }
      });
      await setSession(data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Login failed.");
      throw error;
    }
  }, [setSession]);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    setErrorMessage(null);
    try {
      await apiRequest<{ message: string }>({
        method: "POST",
        path: "/auth/signup",
        body: { name, email, password }
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Sign up failed.");
      throw error;
    }
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    setErrorMessage(null);
    try {
      const data = await apiRequest<{ user: User; accessToken: string; refreshToken: string }>({
        method: "POST",
        path: "/auth/verify-email",
        body: { token }
      });
      await setSession(data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Email verification failed.");
      throw error;
    }
  }, [setSession]);

  const forgotPassword = useCallback(async (email: string) => {
    const data = await apiRequest<{ message: string }>({
      method: "POST",
      path: "/auth/forgot-password",
      body: { email }
    });
    return data.message;
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    const data = await apiRequest<{ message: string }>({
      method: "POST",
      path: "/auth/reset-password",
      body: { token, newPassword }
    });
    return data.message;
  }, []);

  const oauthGoogle = useCallback(async (idToken: string, name?: string) => {
    const data = await apiRequest<{ user: User; accessToken: string; refreshToken: string }>({
      method: "POST",
      path: "/auth/oauth/google",
      body: { idToken, name }
    });
    await setSession(data);
  }, [setSession]);

  const oauthApple = useCallback(async (identityToken: string, name?: string) => {
    const data = await apiRequest<{ user: User; accessToken: string; refreshToken: string }>({
      method: "POST",
      path: "/auth/oauth/apple",
      body: { identityToken, name }
    });
    await setSession(data);
  }, [setSession]);

  const logout = useCallback(async () => {
    try {
      if (refreshToken) {
        await apiRequest({
          method: "POST",
          path: "/auth/logout",
          body: { refreshToken }
        });
      }
    } finally {
      await clearTokens();
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
    }
  }, [refreshToken]);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const value = useMemo(
    () => ({
      loading,
      user,
      accessToken,
      errorMessage,
      login,
      signup,
      verifyEmail,
      forgotPassword,
      resetPassword,
      oauthGoogle,
      oauthApple,
      refreshAuth,
      loadMe,
      logout,
      clearError
    }),
    [loading, user, accessToken, errorMessage, login, signup, verifyEmail, forgotPassword, resetPassword, oauthGoogle, oauthApple, refreshAuth, loadMe, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
