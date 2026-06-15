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
import { useTheme } from "../../../src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { fonts } from "../../../src/utils/fonts";

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { c, shadow } = useTheme();
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
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back Button + Image */}
        <View style={{ position: "relative" }}>
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={{ width: "100%", height: 288 }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ width: "100%", height: 288, backgroundColor: c.bgSecondary, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 96 }}>🍔</Text>
            </View>
          )}
          <TouchableOpacity
            style={{ position: "absolute", top: 16, left: 16, width: 42, height: 42, borderRadius: 14, backgroundColor: c.card, alignItems: "center", justifyContent: "center", ...shadow.sm }}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={22} color={c.text} />
          </TouchableOpacity>
        </View>

        {/* Item Info */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: c.text, flex: 1, marginRight: 8 }}>
              {item.name}
            </Text>
            {item.is_featured ? (
              <View style={{ backgroundColor: "#FDE68A", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
                <Text style={{ fontSize: 12, fontWeight: "bold", color: c.text }}>⭐ Featured</Text>
              </View>
            ) : null}
          </View>

          {item.category ? (
            <Text style={{ fontSize: 14, color: c.textSecondary, marginTop: 4 }}>
              {item.category.name}
            </Text>
          ) : null}

          {item.description ? (
            <Text style={{ fontSize: 16, color: c.textMuted, marginTop: 12, lineHeight: 24 }}>
              {item.description}
            </Text>
          ) : null}

          {item.prep_time ? (
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
              <Text style={{ fontSize: 14, color: c.textSecondary }}>
                ⏱️ Prep time: {item.prep_time} min
              </Text>
            </View>
          ) : null}

          <Text style={{ fontSize: 24, fontWeight: "bold", color: c.primary, marginTop: 12 }}>
            {CURRENCY_SYMBOL}{item.price}
          </Text>
        </View>

        {/* Variations */}
        {item.variations?.length > 0 ? (
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: c.text, marginBottom: 12 }}>
              Choose Variation
            </Text>
            {item.variations.map((variation) => (
              <TouchableOpacity
                key={variation.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: selectedVariation?.id === variation.id ? c.primary : c.border,
                  backgroundColor: selectedVariation?.id === variation.id ? c.primaryLight : c.bg,
                }}
                onPress={() =>
                  setSelectedVariation(
                    selectedVariation?.id === variation.id ? null : variation
                  )
                }
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                      borderColor: selectedVariation?.id === variation.id ? c.primary : c.borderInput,
                    }}
                  >
                    {selectedVariation?.id === variation.id ? (
                      <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: c.primary }} />
                    ) : null}
                  </View>
                  <Text style={{ fontSize: 16, color: c.text }}>{variation.name}</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: c.primary }}>
                  {CURRENCY_SYMBOL}{variation.price}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {/* Addons */}
        {item.addons?.length > 0 ? (
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: c.text, marginBottom: 12 }}>
              Add Extras
            </Text>
            {item.addons.map((addon) => {
              const isSelected = selectedAddons.find((a) => a.id === addon.id);
              return (
                <TouchableOpacity
                  key={addon.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: isSelected ? c.primary : c.border,
                    backgroundColor: isSelected ? c.primaryLight : c.bg,
                  }}
                  onPress={() => toggleAddon(addon)}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        borderWidth: 2,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                        borderColor: isSelected ? c.primary : c.borderInput,
                        backgroundColor: isSelected ? c.primary : "transparent",
                      }}
                    >
                      {isSelected ? (
                        <Text style={{ color: "#FFFFFF", fontSize: 12 }}>✓</Text>
                      ) : null}
                    </View>
                    <Text style={{ fontSize: 16, color: c.text }}>{addon.name}</Text>
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: "#22C55E" }}>
                    +{CURRENCY_SYMBOL}{addon.price}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        {/* Spacer for bottom bar */}
        <View style={{ height: 112 }} />
      </ScrollView>

      {/* Bottom Bar - Quantity + Add to Cart */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: c.bg, borderTopWidth: 1, borderTopColor: c.border, paddingHorizontal: 20, paddingVertical: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          {/* Quantity */}
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: c.bgSecondary, borderRadius: 12 }}>
            <TouchableOpacity
              style={{ paddingHorizontal: 16, paddingVertical: 12 }}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Text style={{ fontSize: 18, fontWeight: "bold", color: c.text }}>−</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: c.text, paddingHorizontal: 8 }}>{quantity}</Text>
            <TouchableOpacity
              style={{ paddingHorizontal: 16, paddingVertical: 12 }}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Text style={{ fontSize: 18, fontWeight: "bold", color: c.text }}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity
            style={{ backgroundColor: c.primary, flex: 1, marginLeft: 16, paddingVertical: 16, borderRadius: 12, alignItems: "center", flexDirection: "row", justifyContent: "center" }}
            onPress={handleAddToCart}
            activeOpacity={0.8}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 16 }}>
              Add to Cart • {CURRENCY_SYMBOL}{totalPrice.toFixed(2)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
