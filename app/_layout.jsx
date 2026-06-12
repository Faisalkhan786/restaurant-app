import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "../src/store/store";
import { setCredentials, logout } from "../src/store/slices/authSlice";
import { tokenService } from "../src/services/tokenService";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import Toast from "react-native-toast-message";
import { toastConfig } from "../src/utils/toastConfig";
import { API_BASE_URL } from "../src/constants/config";

SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored token & fetch user on app start
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const token = await tokenService.getAccessToken();
        if (token) {
          // Fetch user profile with stored token
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const data = await response.json();
            dispatch(setCredentials({ user: data.data.user, token }));
          } else {
            // Token expired or invalid, try refresh
            const refreshToken = await tokenService.getRefreshToken();
            if (refreshToken) {
              const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
              });

              if (refreshRes.ok) {
                const refreshData = await refreshRes.json();
                const { accessToken, refreshToken: newRefresh } = refreshData.data;
                await tokenService.setTokens(accessToken, newRefresh);

                // Retry getMe with new token
                const retryRes = await fetch(`${API_BASE_URL}/auth/me`, {
                  headers: { Authorization: `Bearer ${accessToken}` },
                });
                if (retryRes.ok) {
                  const retryData = await retryRes.json();
                  dispatch(setCredentials({ user: retryData.data.user, token: accessToken }));
                } else {
                  await tokenService.clearTokens();
                }
              } else {
                await tokenService.clearTokens();
              }
            } else {
              await tokenService.clearTokens();
            }
          }
        }
      } catch (_) {
        await tokenService.clearTokens();
      } finally {
        setIsLoading(false);
        SplashScreen.hideAsync();
      }
    };
    loadAuth();
  }, []);

  // Redirect based on auth state
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)/home");
    }
  }, [isAuthenticated, segments, isLoading]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthGate />
      <Toast config={toastConfig} />
    </Provider>
  );
}
