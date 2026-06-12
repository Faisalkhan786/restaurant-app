import { TouchableOpacity, Text, Image, View } from "react-native";
import { CURRENCY_SYMBOL } from "../../constants/config";

export default function MenuItemCard({ item, onPress, onAddToCart }) {
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl mb-4 shadow-sm border border-gray-100 overflow-hidden flex-row"
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Image */}
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          className="w-28 h-28"
          resizeMode="cover"
        />
      ) : (
        <View className="w-28 h-28 bg-gray-light items-center justify-center">
          <Text className="text-4xl">🍔</Text>
        </View>
      )}

      {/* Info */}
      <View className="flex-1 p-3 justify-between">
        <View>
          <Text className="text-base font-bold text-dark" numberOfLines={1}>
            {item.name}
          </Text>
          {item.description ? (
            <Text className="text-xs text-gray-medium mt-1" numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
        </View>

        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-lg font-bold text-primary">
            {CURRENCY_SYMBOL}{item.price}
          </Text>

          {item.prep_time ? (
            <Text className="text-xs text-gray-medium">
              ⏱️ {item.prep_time} min
            </Text>
          ) : null}

          <TouchableOpacity
            className="bg-primary px-4 py-1.5 rounded-lg"
            onPress={(e) => {
              e.stopPropagation?.();
              onAddToCart?.(item);
            }}
            activeOpacity={0.7}
          >
            <Text className="text-white text-sm font-bold">ADD</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
