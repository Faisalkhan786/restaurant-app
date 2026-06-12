import { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { useGetItemDetailQuery } from "../../../src/store/api/menuApi";
import { addToCart } from "../../../src/store/slices/cartSlice";
import { CURRENCY_SYMBOL } from "../../../src/constants/config";
import LoadingScreen from "../../../src/components/common/LoadingScreen";
import ErrorScreen from "../../../src/components/common/ErrorScreen";
import Toast from "react-native-toast-message";

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { data, isLoading, error, refetch } = useGetItemDetailQuery(id);

  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [quantity, setQuantity] = useState(1);

  const item = data?.data;

  if (isLoading) return <LoadingScreen message="Loading item..." />;
  if (error || !item) return <ErrorScreen message="Item not found" onRetry={refetch} />;

  const basePrice = selectedVariation ? selectedVariation.price : item.price;
  const addonsPrice = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  const totalPrice = (parseFloat(basePrice) + addonsPrice) * quantity;

  const toggleAddon = (addon) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((a) => a.id === addon.id);
      if (exists) return prev.filter((a) => a.id !== addon.id);
      return [...prev, addon];
    });
  };

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: `${item.id}-${selectedVariation?.id || "base"}-${selectedAddons.map((a) => a.id).join(",")}`,
        itemId: item.id,
        name: item.name,
        variation: selectedVariation?.name || null,
        addons: selectedAddons.map((a) => a.name),
        price: parseFloat(basePrice) + addonsPrice,
        image_url: item.image_url,
      })
    );

    Toast.show({
      type: "cart",
      text1: "Added to Cart",
      text2: `${item.name}${selectedVariation ? ` (${selectedVariation.name})` : ""}`,
      visibilityTime: 2000,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back Button + Image */}
        <View className="relative">
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              className="w-full h-72"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-72 bg-gray-light items-center justify-center">
              <Text className="text-8xl">🍔</Text>
            </View>
          )}
          <TouchableOpacity
            className="absolute top-4 left-4 bg-white w-10 h-10 rounded-full items-center justify-center shadow-md"
            onPress={() => router.back()}
          >
            <Text className="text-lg">←</Text>
          </TouchableOpacity>
        </View>

        {/* Item Info */}
        <View className="px-5 pt-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-dark flex-1 mr-2">
              {item.name}
            </Text>
            {item.is_featured ? (
              <View className="bg-secondary px-3 py-1 rounded-full">
                <Text className="text-xs font-bold text-dark">⭐ Featured</Text>
              </View>
            ) : null}
          </View>

          {item.category ? (
            <Text className="text-sm text-gray-medium mt-1">
              {item.category.name}
            </Text>
          ) : null}

          {item.description ? (
            <Text className="text-base text-gray-dark mt-3 leading-6">
              {item.description}
            </Text>
          ) : null}

          {item.prep_time ? (
            <View className="flex-row items-center mt-3">
              <Text className="text-sm text-gray-medium">
                ⏱️ Prep time: {item.prep_time} min
              </Text>
            </View>
          ) : null}

          <Text className="text-2xl font-bold text-primary mt-3">
            {CURRENCY_SYMBOL}{item.price}
          </Text>
        </View>

        {/* Variations */}
        {item.variations?.length > 0 ? (
          <View className="px-5 mt-6">
            <Text className="text-lg font-bold text-dark mb-3">
              Choose Variation
            </Text>
            {item.variations.map((variation) => (
              <TouchableOpacity
                key={variation.id}
                className={`flex-row items-center justify-between p-4 rounded-xl mb-2 border ${
                  selectedVariation?.id === variation.id
                    ? "border-primary bg-orange-50"
                    : "border-gray-200 bg-white"
                }`}
                onPress={() =>
                  setSelectedVariation(
                    selectedVariation?.id === variation.id ? null : variation
                  )
                }
              >
                <View className="flex-row items-center">
                  <View
                    className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                      selectedVariation?.id === variation.id
                        ? "border-primary"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedVariation?.id === variation.id ? (
                      <View className="w-3 h-3 rounded-full bg-primary" />
                    ) : null}
                  </View>
                  <Text className="text-base text-dark">{variation.name}</Text>
                </View>
                <Text className="text-base font-bold text-primary">
                  {CURRENCY_SYMBOL}{variation.price}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {/* Addons */}
        {item.addons?.length > 0 ? (
          <View className="px-5 mt-6">
            <Text className="text-lg font-bold text-dark mb-3">
              Add Extras
            </Text>
            {item.addons.map((addon) => {
              const isSelected = selectedAddons.find((a) => a.id === addon.id);
              return (
                <TouchableOpacity
                  key={addon.id}
                  className={`flex-row items-center justify-between p-4 rounded-xl mb-2 border ${
                    isSelected
                      ? "border-primary bg-orange-50"
                      : "border-gray-200 bg-white"
                  }`}
                  onPress={() => toggleAddon(addon)}
                >
                  <View className="flex-row items-center">
                    <View
                      className={`w-5 h-5 rounded border-2 items-center justify-center mr-3 ${
                        isSelected ? "border-primary bg-primary" : "border-gray-300"
                      }`}
                    >
                      {isSelected ? (
                        <Text className="text-white text-xs">✓</Text>
                      ) : null}
                    </View>
                    <Text className="text-base text-dark">{addon.name}</Text>
                  </View>
                  <Text className="text-base font-bold text-success">
                    +{CURRENCY_SYMBOL}{addon.price}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        {/* Spacer for bottom bar */}
        <View className="h-28" />
      </ScrollView>

      {/* Bottom Bar - Quantity + Add to Cart */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4">
        <View className="flex-row items-center justify-between">
          {/* Quantity */}
          <View className="flex-row items-center bg-gray-light rounded-xl">
            <TouchableOpacity
              className="px-4 py-3"
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Text className="text-lg font-bold text-dark">−</Text>
            </TouchableOpacity>
            <Text className="text-lg font-bold text-dark px-2">{quantity}</Text>
            <TouchableOpacity
              className="px-4 py-3"
              onPress={() => setQuantity(quantity + 1)}
            >
              <Text className="text-lg font-bold text-dark">+</Text>
            </TouchableOpacity>
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity
            className="bg-primary flex-1 ml-4 py-4 rounded-xl items-center flex-row justify-center"
            onPress={handleAddToCart}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base">
              Add to Cart • {CURRENCY_SYMBOL}{totalPrice.toFixed(2)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
