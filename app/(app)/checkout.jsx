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
import { useTheme } from "../../src/hooks/useTheme";

export default function CheckoutScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { c } = useTheme();
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
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
          <TouchableOpacity
            style={{ marginRight: 12, width: 40, height: 40, borderRadius: 20, backgroundColor: c.bgSecondary, alignItems: "center", justifyContent: "center" }}
            onPress={() => router.back()}
          >
            <Text style={{ fontSize: 18, color: c.text }}>←</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: c.text }}>Checkout</Text>
        </View>

        {/* Delivery Address */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: c.text }}>📍 Delivery Address</Text>
            <TouchableOpacity onPress={() => router.push("/(app)/address/manage")}>
              <Text style={{ color: c.primary, fontWeight: "600", fontSize: 14 }}>Manage</Text>
            </TouchableOpacity>
          </View>

          {addresses.length === 0 ? (
            <TouchableOpacity
              style={{ borderWidth: 2, borderStyle: "dashed", borderColor: c.borderInput, borderRadius: 12, padding: 20, alignItems: "center" }}
              onPress={() => router.push("/(app)/address/add")}
            >
              <Text style={{ color: c.textSecondary, fontSize: 16 }}>+ Add Delivery Address</Text>
            </TouchableOpacity>
          ) : (
            addresses.map((address) => (
              <TouchableOpacity
                key={address.id}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: activeAddressId === address.id ? c.primary : c.border,
                  backgroundColor: activeAddressId === address.id ? c.primaryLight : "transparent",
                }}
                onPress={() => setSelectedAddressId(address.id)}
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
                      borderColor: activeAddressId === address.id ? c.primary : c.borderInput,
                    }}
                  >
                    {activeAddressId === address.id ? (
                      <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: c.primary }} />
                    ) : null}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "bold", color: c.text }}>
                      {address.label}
                      {address.is_default ? " (Default)" : ""}
                    </Text>
                    <Text style={{ fontSize: 14, color: c.textSecondary, marginTop: 4 }} numberOfLines={2}>
                      {address.full_address}
                    </Text>
                    {address.area || address.city ? (
                      <Text style={{ fontSize: 12, color: c.textSecondary, marginTop: 2 }}>
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
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: c.text, marginBottom: 12 }}>💳 Payment Method</Text>
          {[
            { key: "COD", label: "Cash on Delivery", icon: "💵" },
            { key: "online", label: "Online Payment", icon: "📱" },
          ].map((method) => (
            <TouchableOpacity
              key={method.key}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                borderRadius: 12,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: paymentMethod === method.key ? c.primary : c.border,
                backgroundColor: paymentMethod === method.key ? c.primaryLight : "transparent",
              }}
              onPress={() => setPaymentMethod(method.key)}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                  borderColor: paymentMethod === method.key ? c.primary : c.borderInput,
                }}
              >
                {paymentMethod === method.key ? (
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: c.primary }} />
                ) : null}
              </View>
              <Text style={{ fontSize: 18, marginRight: 8 }}>{method.icon}</Text>
              <Text style={{ fontSize: 16, color: c.text }}>{method.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Coupon Code */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: c.text, marginBottom: 12 }}>🏷️ Coupon Code</Text>
          <View style={{ flexDirection: "row" }}>
            <TextInput
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: c.text,
                backgroundColor: c.inputBg,
                marginRight: 8,
              }}
              placeholder="Enter coupon code"
              placeholderTextColor={c.textSecondary}
              value={couponCode}
              onChangeText={setCouponCode}
              autoCapitalize="characters"
            />
            {couponCode ? (
              <TouchableOpacity
                style={{ paddingHorizontal: 16, justifyContent: "center" }}
                onPress={() => setCouponCode("")}
              >
                <Text style={{ color: "#EF4444", fontWeight: "600" }}>Clear</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Delivery Notes */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: c.text, marginBottom: 12 }}>📝 Delivery Notes</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              color: c.text,
              backgroundColor: c.inputBg,
            }}
            placeholder="Any special instructions? (optional)"
            placeholderTextColor={c.textSecondary}
            value={deliveryNotes}
            onChangeText={setDeliveryNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        {/* Order Summary */}
        <View style={{ paddingHorizontal: 20, marginTop: 24, marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: c.text, marginBottom: 12 }}>🧾 Order Summary</Text>
          <View style={{ backgroundColor: c.bgSecondary, borderRadius: 12, padding: 16 }}>
            {items.map((item) => (
              <View key={item.id} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: c.text, flex: 1 }} numberOfLines={1}>
                  {item.name} × {item.quantity}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: "600", color: c.text, marginLeft: 8 }}>
                  {CURRENCY_SYMBOL}{(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
            <View style={{ borderTopWidth: 1, borderTopColor: c.border, marginTop: 8, paddingTop: 8 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 14, color: c.textSecondary }}>Subtotal</Text>
                <Text style={{ fontSize: 14, fontWeight: "600", color: c.text }}>
                  {CURRENCY_SYMBOL}{totalAmount.toFixed(2)}
                </Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
                <Text style={{ fontSize: 14, color: c.textSecondary }}>Delivery & Tax</Text>
                <Text style={{ fontSize: 14, color: c.textSecondary }}>Added by restaurant</Text>
              </View>
              {couponCode.trim() ? (
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
                  <Text style={{ fontSize: 14, color: "#22C55E" }}>Coupon: {couponCode}</Text>
                  <Text style={{ fontSize: 14, color: "#22C55E" }}>Applied at checkout</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Spacer */}
        <View style={{ height: 112 }} />
      </ScrollView>

      {/* Bottom - Place Order */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: c.bg, borderTopWidth: 1, borderTopColor: c.border, paddingHorizontal: 20, paddingVertical: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: c.text }}>Estimated Total</Text>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: c.primary }}>
            {CURRENCY_SYMBOL}{totalAmount.toFixed(2)}+
          </Text>
        </View>
        <TouchableOpacity
          style={{
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: "center",
            backgroundColor: isPlacing ? "#FDBA74" : c.primary,
          }}
          onPress={handlePlaceOrder}
          disabled={isPlacing}
          activeOpacity={0.8}
        >
          {isPlacing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 18 }}>Place Order</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
