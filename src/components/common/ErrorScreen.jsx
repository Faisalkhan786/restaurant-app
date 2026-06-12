import { View, Text, TouchableOpacity } from "react-native";

export default function ErrorScreen({ message = "Something went wrong", onRetry }) {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-5xl mb-4">😕</Text>
      <Text className="text-lg font-bold text-dark text-center">{message}</Text>
      {onRetry ? (
        <TouchableOpacity
          className="bg-primary px-8 py-3 rounded-xl mt-6"
          onPress={onRetry}
          activeOpacity={0.7}
        >
          <Text className="text-white font-bold text-base">Try Again</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
