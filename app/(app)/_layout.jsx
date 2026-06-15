import { Stack } from "expo-router";
import { useTheme } from "../../src/hooks/useTheme";

export default function AppLayout() {
  const { c } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: c.primary,
        headerStyle: {
          backgroundColor: c.bg,
        },
        headerTitleStyle: {
          color: c.text,
        },
      }}
    />
  );
}
