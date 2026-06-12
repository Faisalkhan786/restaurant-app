import { TouchableOpacity, Text, Image, View } from "react-native";
import { CURRENCY_SYMBOL } from "../../constants/config";

export default function FeaturedItemCard({ item, onPress }) {
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl mr-4 shadow-sm border border-gray-100 overflow-hidden"
      style={{ width: 200 }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Image */}
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          className="w-full h-32"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-32 bg-gray-light items-center justify-center">
          <Text className="text-5xl">🍔</Text>
        </View>
      )}

      {/* Info */}
      <View className="p-3">
        <Text className="text-sm font-bold text-dark" numberOfLines={1}>
          {item.name}
        </Text>
        {item.description ? (
          <Text className="text-xs text-gray-medium mt-1" numberOfLines={1}>
            {item.description}
          </Text>
        ) : null}
        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-base font-bold text-primary">
            {CURRENCY_SYMBOL}{item.price}
          </Text>
          {item.prep_time ? (
            <Text className="text-xs text-gray-medium">⏱️ {item.prep_time}m</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}
