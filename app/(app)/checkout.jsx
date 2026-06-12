import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { useGetAddressesQuery } from "../../src/store/api/customerApi";
import { usePlaceOrderMutation } from "../../src/store/api/orderApi";
import { clearCart } from "../../src/store/slices/cartSlice";
import { CURRENCY_SYMBOL } from "../../src/constants/config";
import LoadingScreen from "../../src/components/common/LoadingScreen";

export default function CheckoutScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items, totalAmount } = useSelector((state) => state.cart);
  const { data: addressData, isLoading: addressLoading } = useGetAddressesQuery();
  const [placeOrder, { isLoading: isPlacing }] = usePlaceOrderMutation();

  const addresses = addressData?.data || [];
  const defaultAddress = addresses.find((a) => a.is_default) || addresses[0];

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");

  const activeAddressId = selectedAddressId || defaultAddress?.id;

  const handlePlaceOrder = async () => {
    if (!activeAddressId) {
      Alert.alert("No Address", "Please add a delivery address first.", [
        { text: "Cancel", style: "cancel" },
        { text: "Add Address", onPress: () => router.push("/(app)/address/add") },
      ]);
      return;
    }

    if (items.length === 0) {
      Alert.alert("Empty Cart", "Please add items to your cart first.");
      return;
    }

    const orderData = {
      delivery_address_id: activeAddressId,
      items: items.map((item) => ({
        menu_item_id: item.itemId || item.id,
        quantity: item.quantity,
        ...(item.variationId && { variation_id: item.variationId }),
        ...(item.addonIds?.length > 0 && { addon_ids: item.addonIds }),
      })),
      payment_method: paymentMethod,
      ...(deliveryNotes.trim() && { delivery_notes: deliveryNotes.trim() }),
      ...(couponCode.trim() && { coupon_code: couponCode.trim().toUpperCase() }),
    };

    try {
      const result = await placeOrder(orderData).unwrap();
      dispatch(clearCart());
      router.replace(`/(app)/order-success/${result.data.id}`);
    } catch (err) {
      const message = err?.data?.message || "Failed to place order. Please try again.";
      Alert.alert("Order Failed", message);
    }
  };

  if (addressLoading) return <LoadingScreen message="Loading addresses..." />;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-3">
          <TouchableOpacity
            className="mr-3 w-10 h-10 rounded-full bg-gray-light items-center justify-center"
            onPress={() => router.back()}
          >
            <Text className="text-lg">←</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-dark">Checkout</Text>
        </View>

        {/* Delivery Address */}
        <View className="px-5 mt-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-dark">📍 Delivery Address</Text>
            <TouchableOpacity onPress={() => router.push("/(app)/address/manage")}>
              <Text className="text-primary font-semibold text-sm">Manage</Text>
            </TouchableOpacity>
          </View>

          {addresses.length === 0 ? (
            <TouchableOpacity
              className="border-2 border-dashed border-gray-300 rounded-xl p-5 items-center"
              onPress={() => router.push("/(app)/address/add")}
            >
              <Text className="text-gray-medium text-base">+ Add Delivery Address</Text>
            </TouchableOpacity>
          ) : (
            addresses.map((address) => (
              <TouchableOpacity
                key={address.id}
                className={`p-4 rounded-xl mb-2 border ${
                  activeAddressId === address.id
                    ? "border-primary bg-orange-50"
                    : "border-gray-200"
                }`}
                onPress={() => setSelectedAddressId(address.id)}
              >
                <View className="flex-row items-center">
                  <View
                    className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                      activeAddressId === address.id
                        ? "border-primary"
                        : "border-gray-300"
                    }`}
                  >
                    {activeAddressId === address.id ? (
                      <View className="w-3 h-3 rounded-full bg-primary" />
                    ) : null}
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-dark">
                      {address.label}
                      {address.is_default ? " (Default)" : ""}
                    </Text>
                    <Text className="text-sm text-gray-medium mt-1" numberOfLines={2}>
                      {address.full_address}
                    </Text>
                    {address.area || address.city ? (
                      <Text className="text-xs text-gray-medium mt-0.5">
                        {[address.area, address.city].filter(Boolean).join(", ")}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Payment Method */}
        <View className="px-5 mt-6">
          <Text className="text-lg font-bold text-dark mb-3">💳 Payment Method</Text>
          {[
            { key: "COD", label: "Cash on Delivery", icon: "💵" },
            { key: "online", label: "Online Payment", icon: "📱" },
          ].map((method) => (
            <TouchableOpacity
              key={method.key}
              className={`flex-row items-center p-4 rounded-xl mb-2 border ${
                paymentMethod === method.key
                  ? "border-primary bg-orange-50"
                  : "border-gray-200"
              }`}
              onPress={() => setPaymentMethod(method.key)}
            >
              <View
                className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                  paymentMethod === method.key ? "border-primary" : "border-gray-300"
                }`}
              >
                {paymentMethod === method.key ? (
                  <View className="w-3 h-3 rounded-full bg-primary" />
                ) : null}
              </View>
              <Text className="text-lg mr-2">{method.icon}</Text>
              <Text className="text-base text-dark">{method.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Coupon Code */}
        <View className="px-5 mt-6">
          <Text className="text-lg font-bold text-dark mb-3">🏷️ Coupon Code</Text>
          <View className="flex-row">
            <TextInput
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-base text-dark bg-gray-light mr-2"
              placeholder="Enter coupon code"
              placeholderTextColor="#9E9E9E"
              value={couponCode}
              onChangeText={setCouponCode}
              autoCapitalize="characters"
            />
            {couponCode ? (
              <TouchableOpacity
                className="px-4 justify-center"
                onPress={() => setCouponCode("")}
              >
                <Text className="text-danger font-semibold">Clear</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Delivery Notes */}
        <View className="px-5 mt-6">
          <Text className="text-lg font-bold text-dark mb-3">📝 Delivery Notes</Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base text-dark bg-gray-light"
            placeholder="Any special instructions? (optional)"
            placeholderTextColor="#9E9E9E"
            value={deliveryNotes}
            onChangeText={setDeliveryNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        {/* Order Summary */}
        <View className="px-5 mt-6 mb-4">
          <Text className="text-lg font-bold text-dark mb-3">🧾 Order Summary</Text>
          <View className="bg-gray-light rounded-xl p-4">
            {items.map((item) => (
              <View key={item.id} className="flex-row justify-between mb-2">
                <Text className="text-sm text-dark flex-1" numberOfLines={1}>
                  {item.name} × {item.quantity}
                </Text>
                <Text className="text-sm font-semibold text-dark ml-2">
                  {CURRENCY_SYMBOL}{(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
            <View className="border-t border-gray-200 mt-2 pt-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-medium">Subtotal</Text>
                <Text className="text-sm font-semibold text-dark">
                  {CURRENCY_SYMBOL}{totalAmount.toFixed(2)}
                </Text>
              </View>
              <View className="flex-row justify-between mt-1">
                <Text className="text-sm text-gray-medium">Delivery & Tax</Text>
                <Text className="text-sm text-gray-medium">Added by restaurant</Text>
              </View>
              {couponCode.trim() ? (
                <View className="flex-row justify-between mt-1">
                  <Text className="text-sm text-success">Coupon: {couponCode}</Text>
                  <Text className="text-sm text-success">Applied at checkout</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Spacer */}
        <View className="h-28" />
      </ScrollView>

      {/* Bottom - Place Order */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4">
        <View className="flex-row justify-between mb-3">
          <Text className="text-lg font-bold text-dark">Estimated Total</Text>
          <Text className="text-lg font-bold text-primary">
            {CURRENCY_SYMBOL}{totalAmount.toFixed(2)}+
          </Text>
        </View>
        <TouchableOpacity
          className={`py-4 rounded-xl items-center ${
            isPlacing ? "bg-orange-300" : "bg-primary"
          }`}
          onPress={handlePlaceOrder}
          disabled={isPlacing}
          activeOpacity={0.8}
        >
          {isPlacing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">Place Order</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
