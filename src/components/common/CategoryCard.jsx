import { TouchableOpacity, Text, Image, View } from "react-native";

export default function CategoryCard({ category, onPress, isActive }) {
  return (
    <TouchableOpacity
      className={`items-center mr-4 px-3 py-2 rounded-2xl ${
        isActive ? "bg-primary" : "bg-gray-light"
      }`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {category.image_url ? (
        <Image
          source={{ uri: category.image_url }}
          className="w-14 h-14 rounded-full mb-1"
          resizeMode="cover"
        />
      ) : (
        <View className="w-14 h-14 rounded-full bg-gray-200 items-center justify-center mb-1">
          <Text className="text-2xl">🍽️</Text>
        </View>
      )}
      <Text
        className={`text-xs font-semibold mt-1 ${
          isActive ? "text-white" : "text-dark"
        }`}
        numberOfLines={1}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}
