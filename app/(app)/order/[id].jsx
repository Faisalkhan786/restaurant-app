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

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data, isLoading, error, refetch } = useGetOrderDetailQuery(id, {
    pollingInterval: 15000, // Poll every 15 seconds for status updates
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
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
          <View className="flex-row items-center">
            <TouchableOpacity
              className="mr-3 w-10 h-10 rounded-full bg-gray-light items-center justify-center"
              onPress={() => router.back()}
            >
              <Text className="text-lg">←</Text>
            </TouchableOpacity>
            <View>
              <Text className="text-xl font-bold text-dark">
                #{order.order_number}
              </Text>
              <Text className="text-xs text-gray-medium">
                {formatDate(order.created_at || order.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Status Tracker */}
        <View className="px-5 mt-4">
          <Text className="text-lg font-bold text-dark mb-3">Order Status</Text>
          <OrderStatusTracker currentStatus={order.status} />
        </View>

        {/* Estimated Delivery */}
        {order.status !== "delivered" && order.status !== "cancelled" ? (
          <View className="mx-5 mt-4 bg-orange-50 rounded-xl p-4 flex-row items-center">
            <Text className="text-2xl mr-3">⏱️</Text>
            <View>
              <Text className="text-sm font-bold text-dark">
                Estimated Delivery
              </Text>
              <Text className="text-sm text-gray-dark">
                {order.estimated_delivery_time} minutes
              </Text>
            </View>
          </View>
        ) : null}

        {/* Cancel Reason */}
        {order.status === "cancelled" && order.cancel_reason ? (
          <View className="mx-5 mt-4 bg-red-50 rounded-xl p-4">
            <Text className="text-sm font-bold text-danger mb-1">
              Cancellation Reason
            </Text>
            <Text className="text-sm text-gray-dark">{order.cancel_reason}</Text>
          </View>
        ) : null}

        {/* Order Items */}
        <View className="px-5 mt-6">
          <Text className="text-lg font-bold text-dark mb-3">Order Items</Text>
          <View className="bg-gray-light rounded-xl p-4">
            {order.items?.map((item) => (
              <View
                key={item.id}
                className="flex-row justify-between mb-3 pb-3 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0"
              >
                <View className="flex-1 mr-3">
                  <Text className="text-sm font-bold text-dark">
                    {item.menuItem?.name || "Item"}
                  </Text>
                  {item.variation_name ? (
                    <Text className="text-xs text-gray-medium mt-0.5">
                      Variant: {item.variation_name}
                    </Text>
                  ) : null}
                  {item.addons?.length > 0 ? (
                    <Text className="text-xs text-gray-medium mt-0.5">
                      + {item.addons.map((a) => a.name).join(", ")}
                    </Text>
                  ) : null}
                  <Text className="text-xs text-gray-medium mt-0.5">
                    Qty: {item.quantity} × {CURRENCY_SYMBOL}
                    {item.variation_price || item.unit_price}
                  </Text>
                </View>
                <Text className="text-sm font-bold text-dark">
                  {CURRENCY_SYMBOL}{item.subtotal}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Price Breakdown */}
        <View className="px-5 mt-6">
          <Text className="text-lg font-bold text-dark mb-3">Bill Details</Text>
          <View className="bg-gray-light rounded-xl p-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-medium">Subtotal</Text>
              <Text className="text-sm text-dark">
                {CURRENCY_SYMBOL}{order.subtotal}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-medium">Delivery Charge</Text>
              <Text className="text-sm text-dark">
                {CURRENCY_SYMBOL}{order.delivery_charge}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-medium">Tax</Text>
              <Text className="text-sm text-dark">
                {CURRENCY_SYMBOL}{order.tax}
              </Text>
            </View>
            {parseFloat(order.discount) > 0 ? (
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-success">Discount</Text>
                <Text className="text-sm text-success">
                  -{CURRENCY_SYMBOL}{order.discount}
                </Text>
              </View>
            ) : null}
            <View className="border-t border-gray-200 mt-2 pt-2 flex-row justify-between">
              <Text className="text-base font-bold text-dark">Total</Text>
              <Text className="text-base font-bold text-primary">
                {CURRENCY_SYMBOL}{order.total}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Info */}
        <View className="px-5 mt-6">
          <Text className="text-lg font-bold text-dark mb-3">Payment</Text>
          <View className="bg-gray-light rounded-xl p-4 flex-row justify-between">
            <Text className="text-sm text-gray-medium">Method</Text>
            <Text className="text-sm font-bold text-dark">
              {order.payment_method === "COD" ? "💵 Cash on Delivery" : "📱 Online"}
            </Text>
          </View>
        </View>

        {/* Delivery Address */}
        {order.deliveryAddress ? (
          <View className="px-5 mt-6">
            <Text className="text-lg font-bold text-dark mb-3">
              Delivery Address
            </Text>
            <View className="bg-gray-light rounded-xl p-4">
              <Text className="text-sm font-bold text-dark">
                {order.deliveryAddress.label}
              </Text>
              <Text className="text-sm text-gray-dark mt-1">
                {order.deliveryAddress.full_address}
              </Text>
              {order.deliveryAddress.area || order.deliveryAddress.city ? (
                <Text className="text-xs text-gray-medium mt-1">
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
          <View className="px-5 mt-6">
            <Text className="text-lg font-bold text-dark mb-3">
              Delivery Notes
            </Text>
            <View className="bg-gray-light rounded-xl p-4">
              <Text className="text-sm text-gray-dark">
                {order.delivery_notes}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Delivery Boy Info */}
        {order.deliveryBoy ? (
          <View className="px-5 mt-6">
            <Text className="text-lg font-bold text-dark mb-3">
              Delivery Partner
            </Text>
            <View className="bg-gray-light rounded-xl p-4 flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-primary items-center justify-center mr-3">
                <Text className="text-white text-lg font-bold">
                  {order.deliveryBoy.name?.[0]?.toUpperCase() || "D"}
                </Text>
              </View>
              <View>
                <Text className="text-base font-bold text-dark">
                  {order.deliveryBoy.name}
                </Text>
                {order.deliveryBoy.phone ? (
                  <Text className="text-sm text-gray-medium">
                    📞 {order.deliveryBoy.phone}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
        ) : null}

        {/* Cancel Button */}
        {canCancel && !showCancelModal ? (
          <View className="px-5 mt-6">
            <TouchableOpacity
              className="border border-danger rounded-xl py-3.5 items-center"
              onPress={handleCancel}
            >
              <Text className="text-danger font-bold text-base">Cancel Order</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Cancel Modal Inline */}
        {showCancelModal ? (
          <View className="px-5 mt-6">
            <View className="bg-red-50 rounded-xl p-4">
              <Text className="text-base font-bold text-dark mb-3">
                Cancel this order?
              </Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 text-sm text-dark bg-white mb-3"
                placeholder="Reason for cancellation (optional)"
                placeholderTextColor="#9E9E9E"
                value={cancelReason}
                onChangeText={setCancelReason}
                multiline
                maxLength={500}
              />
              <View className="flex-row">
                <TouchableOpacity
                  className="flex-1 bg-gray-200 py-3 rounded-xl items-center mr-2"
                  onPress={() => {
                    setShowCancelModal(false);
                    setCancelReason("");
                  }}
                >
                  <Text className="text-dark font-bold">Keep Order</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-xl items-center ${
                    isCancelling ? "bg-red-300" : "bg-danger"
                  }`}
                  onPress={confirmCancel}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-bold">Yes, Cancel</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}

        {/* Spacer */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
