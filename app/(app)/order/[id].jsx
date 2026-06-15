import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useGetOrderDetailQuery,
  useCancelOrderMutation,
} from "../../../src/store/api/orderApi";
import { CURRENCY_SYMBOL } from "../../../src/constants/config";
import OrderStatusTracker from "../../../src/components/common/OrderStatusTracker";
import LoadingScreen from "../../../src/components/common/LoadingScreen";
import ErrorScreen from "../../../src/components/common/ErrorScreen";
import { useTheme } from "../../../src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { fonts } from "../../../src/utils/fonts";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { c, shadow } = useTheme();
  const { data, isLoading, error, refetch } = useGetOrderDetailQuery(id, {
    pollingInterval: 15000,
  });
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const order = data?.data;

  const canCancel =
    order?.status === "placed" || order?.status === "confirmed";

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    try {
      await cancelOrder({
        id: order.id,
        reason: cancelReason.trim() || undefined,
      }).unwrap();
      setShowCancelModal(false);
      setCancelReason("");
      Alert.alert("Cancelled", "Your order has been cancelled.");
    } catch (err) {
      Alert.alert("Error", err?.data?.message || "Failed to cancel order");
    }
  };

  if (isLoading) return <LoadingScreen message="Loading order..." />;
  if (error || !order)
    return <ErrorScreen message="Order not found" onRetry={refetch} />;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: c.card, alignItems: "center", justifyContent: "center", marginRight: 12, ...shadow.sm }}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={22} color={c.text} />
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: c.text, fontFamily: fonts.bold }}>
                #{order.order_number}
              </Text>
              <Text style={{ fontSize: 12, color: c.textSecondary }}>
                {formatDate(order.created_at || order.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Status Tracker */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: c.text, marginBottom: 12 }}>Order Status</Text>
          <OrderStatusTracker currentStatus={order.status} />
        </View>

        {/* Estimated Delivery */}
        {order.status !== "delivered" && order.status !== "cancelled" ? (
          <View style={{ marginHorizontal: 20, marginTop: 16, backgroundColor: c.primaryLight, borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 24, marginRight: 12 }}>⏱️</Text>
            <View>
              <Text style={{ fontSize: 14, fontWeight: "bold", color: c.text }}>
                Estimated Delivery
              </Text>
              <Text style={{ fontSize: 14, color: c.textMuted }}>
                {order.estimated_delivery_time} minutes
              </Text>
            </View>
          </View>
        ) : null}

        {/* Cancel Reason */}
        {order.status === "cancelled" && order.cancel_reason ? (
          <View style={{ marginHorizontal: 20, marginTop: 16, backgroundColor: "#FEF2F2", borderRadius: 12, padding: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "bold", color: "#EF4444", marginBottom: 4 }}>
              Cancellation Reason
            </Text>
            <Text style={{ fontSize: 14, color: c.textMuted }}>{order.cancel_reason}</Text>
          </View>
        ) : null}

        {/* Order Items */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: c.text, marginBottom: 12 }}>Order Items</Text>
          <View style={{ backgroundColor: c.bgSecondary, borderRadius: 12, padding: 16 }}>
            {order.items?.map((item) => (
              <View
                key={item.id}
                style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: c.border }}
              >
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: "bold", color: c.text }}>
                    {item.menuItem?.name || "Item"}
                  </Text>
                  {item.variation_name ? (
                    <Text style={{ fontSize: 12, color: c.textSecondary, marginTop: 2 }}>
                      Variant: {item.variation_name}
                    </Text>
                  ) : null}
                  {item.addons?.length > 0 ? (
                    <Text style={{ fontSize: 12, color: c.textSecondary, marginTop: 2 }}>
                      + {item.addons.map((a) => a.name).join(", ")}
                    </Text>
                  ) : null}
                  <Text style={{ fontSize: 12, color: c.textSecondary, marginTop: 2 }}>
                    Qty: {item.quantity} × {CURRENCY_SYMBOL}
                    {item.variation_price || item.unit_price}
                  </Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: "bold", color: c.text }}>
                  {CURRENCY_SYMBOL}{item.subtotal}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: c.text, marginBottom: 12 }}>Bill Details</Text>
          <View style={{ backgroundColor: c.bgSecondary, borderRadius: 12, padding: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: c.textSecondary }}>Subtotal</Text>
              <Text style={{ fontSize: 14, color: c.text }}>
                {CURRENCY_SYMBOL}{order.subtotal}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: c.textSecondary }}>Delivery Charge</Text>
              <Text style={{ fontSize: 14, color: c.text }}>
                {CURRENCY_SYMBOL}{order.delivery_charge}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: c.textSecondary }}>Tax</Text>
              <Text style={{ fontSize: 14, color: c.text }}>
                {CURRENCY_SYMBOL}{order.tax}
              </Text>
            </View>
            {parseFloat(order.discount) > 0 ? (
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: "#22C55E" }}>Discount</Text>
                <Text style={{ fontSize: 14, color: "#22C55E" }}>
                  -{CURRENCY_SYMBOL}{order.discount}
                </Text>
              </View>
            ) : null}
            <View style={{ borderTopWidth: 1, borderTopColor: c.border, marginTop: 8, paddingTop: 8, flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: c.text }}>Total</Text>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: c.primary }}>
                {CURRENCY_SYMBOL}{order.total}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Info */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: c.text, marginBottom: 12 }}>Payment</Text>
          <View style={{ backgroundColor: c.bgSecondary, borderRadius: 12, padding: 16, flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 14, color: c.textSecondary }}>Method</Text>
            <Text style={{ fontSize: 14, fontWeight: "bold", color: c.text }}>
              {order.payment_method === "COD" ? "💵 Cash on Delivery" : "📱 Online"}
            </Text>
          </View>
        </View>

        {/* Delivery Address */}
        {order.deliveryAddress ? (
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: c.text, marginBottom: 12 }}>
              Delivery Address
            </Text>
            <View style={{ backgroundColor: c.bgSecondary, borderRadius: 12, padding: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: "bold", color: c.text }}>
                {order.deliveryAddress.label}
              </Text>
              <Text style={{ fontSize: 14, color: c.textMuted, marginTop: 4 }}>
                {order.deliveryAddress.full_address}
              </Text>
              {order.deliveryAddress.area || order.deliveryAddress.city ? (
                <Text style={{ fontSize: 12, color: c.textSecondary, marginTop: 4 }}>
                  {[order.deliveryAddress.area, order.deliveryAddress.city]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* Delivery Notes */}
        {order.delivery_notes ? (
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: c.text, marginBottom: 12 }}>
              Delivery Notes
            </Text>
            <View style={{ backgroundColor: c.bgSecondary, borderRadius: 12, padding: 16 }}>
              <Text style={{ fontSize: 14, color: c.textMuted }}>
                {order.delivery_notes}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Delivery Boy Info */}
        {order.deliveryBoy ? (
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: c.text, marginBottom: 12 }}>
              Delivery Partner
            </Text>
            <View style={{ backgroundColor: c.bgSecondary, borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: c.primary, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "bold" }}>
                  {order.deliveryBoy.name?.[0]?.toUpperCase() || "D"}
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: c.text }}>
                  {order.deliveryBoy.name}
                </Text>
                {order.deliveryBoy.phone ? (
                  <Text style={{ fontSize: 14, color: c.textSecondary }}>
                    📞 {order.deliveryBoy.phone}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
        ) : null}

        {/* Cancel Button */}
        {canCancel && !showCancelModal ? (
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <TouchableOpacity
              style={{ borderWidth: 1, borderColor: "#EF4444", borderRadius: 12, paddingVertical: 14, alignItems: "center" }}
              onPress={handleCancel}
            >
              <Text style={{ color: "#EF4444", fontWeight: "bold", fontSize: 16 }}>Cancel Order</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Cancel Modal Inline */}
        {showCancelModal ? (
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <View style={{ backgroundColor: "#FEF2F2", borderRadius: 12, padding: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: c.text, marginBottom: 12 }}>
                Cancel this order?
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: c.borderInput,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 14,
                  color: c.text,
                  backgroundColor: c.bg,
                  marginBottom: 12,
                }}
                placeholder="Reason for cancellation (optional)"
                placeholderTextColor={c.textSecondary}
                value={cancelReason}
                onChangeText={setCancelReason}
                multiline
                maxLength={500}
              />
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: c.bgSecondary, paddingVertical: 12, borderRadius: 12, alignItems: "center", marginRight: 8 }}
                  onPress={() => {
                    setShowCancelModal(false);
                    setCancelReason("");
                  }}
                >
                  <Text style={{ color: c.text, fontWeight: "bold" }}>Keep Order</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: "center",
                    backgroundColor: isCancelling ? "#FCA5A5" : "#EF4444",
                  }}
                  onPress={confirmCancel}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>Yes, Cancel</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}

        {/* Spacer */}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
