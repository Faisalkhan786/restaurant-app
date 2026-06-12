import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: "#FF6B35",
        headerStyle: {
          backgroundColor: "#FFFFFF",
        },
      }}
    />
  );
}
