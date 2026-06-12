import { View, Text, FlatList, TouchableOpacity, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../../src/store/slices/cartSlice";
import { CURRENCY_SYMBOL } from "../../src/constants/config";

export default function CartScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items, totalAmount, totalItems } = useSelector((state) => state.cart);

  const handleRemove = (id) => {
    Alert.alert("Remove Item", "Are you sure you want to remove this item?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => dispatch(removeFromCart(id)) },
    ]);
  };

  const handleClearCart = () => {
    Alert.alert("Clear Cart", "Remove all items from cart?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: () => dispatch(clearCart()) },
    ]);
  };

  const handleCheckout = () => {
    router.push("/(app)/checkout");
  };

  const renderItem = ({ item }) => (
    <View className="flex-row bg-white rounded-2xl mb-3 p-3 border border-gray-100">
      {/* Image */}
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          className="w-20 h-20 rounded-xl"
          resizeMode="cover"
        />
      ) : (
        <View className="w-20 h-20 rounded-xl bg-gray-light items-center justify-center">
          <Text className="text-3xl">🍔</Text>
        </View>
      )}

      {/* Info */}
      <View className="flex-1 ml-3 justify-between">
        <View>
          <Text className="text-base font-bold text-dark" numberOfLines={1}>
            {item.name}
          </Text>
          {item.variation ? (
            <Text className="text-xs text-gray-medium mt-0.5">
              Variant: {item.variation}
            </Text>
          ) : null}
          {item.addons?.length > 0 ? (
            <Text className="text-xs text-gray-medium mt-0.5">
              + {item.addons.join(", ")}
            </Text>
          ) : null}
        </View>

        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-base font-bold text-primary">
            {CURRENCY_SYMBOL}{(item.price * item.quantity).toFixed(2)}
          </Text>

          {/* Quantity Controls */}
          <View className="flex-row items-center bg-gray-light rounded-lg">
            <TouchableOpacity
              className="px-3 py-1.5"
              onPress={() => {
                if (item.quantity <= 1) {
                  handleRemove(item.id);
                } else {
                  dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }));
                }
              }}
            >
              <Text className="text-base font-bold text-dark">−</Text>
            </TouchableOpacity>
            <Text className="text-base font-bold text-dark px-2">
              {item.quantity}
            </Text>
            <TouchableOpacity
              className="px-3 py-1.5"
              onPress={() =>
                dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))
              }
            >
              <Text className="text-base font-bold text-dark">+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Remove Button */}
      <TouchableOpacity
        className="absolute top-2 right-2"
        onPress={() => handleRemove(item.id)}
      >
        <Text className="text-gray-medium text-lg">✕</Text>
      </TouchableOpacity>
    </View>
  );

  // Empty Cart
  if (items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-6xl mb-4">🛒</Text>
          <Text className="text-2xl font-bold text-dark">Cart is Empty</Text>
          <Text className="text-gray-medium mt-2 text-center">
            Add some delicious items from our menu
          </Text>
          <TouchableOpacity
            className="bg-primary px-8 py-3.5 rounded-xl mt-6"
            onPress={() => router.push("/(tabs)/menu")}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base">Browse Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
        <View>
          <Text className="text-2xl font-bold text-dark">Your Cart</Text>
          <Text className="text-sm text-gray-medium mt-0.5">
            {totalItems} item{totalItems !== 1 ? "s" : ""}
          </Text>
        </View>
        <TouchableOpacity onPress={handleClearCart}>
          <Text className="text-danger font-semibold text-sm">Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Cart Items */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
      />

      {/* Bottom - Total + Checkout */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4">
        {/* Price Breakdown */}
        <View className="flex-row justify-between mb-1">
          <Text className="text-sm text-gray-medium">Subtotal</Text>
          <Text className="text-sm text-dark font-semibold">
            {CURRENCY_SYMBOL}{totalAmount.toFixed(2)}
          </Text>
        </View>
        <View className="flex-row justify-between mb-3">
          <Text className="text-sm text-gray-medium">Delivery & Tax</Text>
          <Text className="text-sm text-gray-medium">Calculated at checkout</Text>
        </View>
        <View className="flex-row justify-between mb-4">
          <Text className="text-lg font-bold text-dark">Total</Text>
          <Text className="text-lg font-bold text-primary">
            {CURRENCY_SYMBOL}{totalAmount.toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          className="bg-primary py-4 rounded-xl items-center"
          onPress={handleCheckout}
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-lg">
            Proceed to Checkout
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
