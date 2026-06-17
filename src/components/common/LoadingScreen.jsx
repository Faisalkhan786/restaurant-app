import { View, ActivityIndicator, Text } from "react-native";
import { useTheme } from "../../hooks/useTheme";

export default function LoadingScreen({ message = "Loading..." }) {
  const { c } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: c.bg }}>
      <ActivityIndicator size="large" color={c.primary} />
      <Text style={{ color: c.textSecondary, marginTop: 12, fontSize: 14 }}>{message}</Text>
    </View>
  );
}
