import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../hooks/useTheme";

export default function ErrorScreen({ message = "Something went wrong", onRetry }) {
  const { c } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: c.bg, paddingHorizontal: 24 }}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>😕</Text>
      <Text style={{ fontSize: 17, fontWeight: "bold", color: c.text, textAlign: "center" }}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity style={{ backgroundColor: c.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12, marginTop: 24 }} onPress={onRetry} activeOpacity={0.7}>
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}>Try Again</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
