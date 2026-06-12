import { View, ActivityIndicator, Text } from "react-native";

export default function LoadingScreen({ message = "Loading..." }) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#FF6B35" />
      <Text className="text-gray-medium mt-3 text-sm">{message}</Text>
    </View>
  );
}
