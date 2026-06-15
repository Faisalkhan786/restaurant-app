import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "../src/store/store";
import { setCredentials } from "../src/store/slices/authSlice";
import { tokenService } from "../src/services/tokenService";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import Toast from "react-native-toast-message";
import { toastConfig } from "../src/utils/toastConfig";
import { API_BASE_URL } from "../src/constants/config";
import { useTheme } from "../src/hooks/useTheme";

SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { c } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const token = await tokenService.getAccessToken();
        if (token) {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const data = await response.json();
            dispatch(setCredentials({ user: data.data.user, token }));
          } else {
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

  // Role-based routing
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inAdminGroup = segments[0] === "(admin)";
    const inAppGroup = segments[0] === "(app)"; // shared screens (detail pages)
    const inCustomerTabs = segments[0] === "(tabs)";
    const isAdmin = user?.role === "admin";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      if (isAdmin) {
        router.replace("/(admin)/dashboard");
      } else {
        router.replace("/(tabs)/home");
      }
    } else if (isAuthenticated && isAdmin && inCustomerTabs) {
      // Admin trying to access customer tabs - block
      router.replace("/(admin)/dashboard");
    } else if (isAuthenticated && !isAdmin && inAdminGroup) {
      // Customer trying to access admin screens - block
      router.replace("/(tabs)/home");
    }
    // (app) group is accessible by BOTH admin and customer (shared detail screens)
  }, [isAuthenticated, user, segments, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: c.bg }}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={c.statusBar} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: c.bg },
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="(admin)" />
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
