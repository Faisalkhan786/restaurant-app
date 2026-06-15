import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
  ActivityIndicator, Modal, FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
  useAssignDeliveryBoyMutation,
  useGetDeliveryBoysQuery,
} from "../../src/store/api/adminApi";
import { useTheme } from "../../src/hooks/useTheme";
import { CURRENCY_SYMBOL } from "../../src/constants/config";
import OrderStatusTracker from "../../src/components/common/OrderStatusTracker";
import LoadingScreen from "../../src/components/common/LoadingScreen";
import ErrorScreen from "../../src/components/common/ErrorScreen";

const NEXT_STATUS = {
  placed: [{ key: "confirmed", label: "Confirm Order", color: "#22C55E", icon: "✅" }],
  confirmed: [{ key: "preparing", label: "Start Preparing", color: "#3B82F6", icon: "👨‍🍳" }],
  preparing: [{ key: "ready", label: "Mark Ready", color: "#9333EA", icon: "📦" }],
  ready: [{ key: "out_for_delivery", label: "Out for Delivery", color: "#EA580C", icon: "🚀" }],
  out_for_delivery: [{ key: "delivered", label: "Mark Delivered", color: "#16A34A", icon: "🎉" }],
};

export default function AdminOrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { c } = useTheme();

  const { data: ordersData, isLoading, error, refetch } = useGetAdminOrdersQuery({});
  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
  const [assignBoy, { isLoading: isAssigning }] = useAssignDeliveryBoyMutation();
  const { data: boysData } = useGetDeliveryBoysQuery();

  const [riderModal, setRiderModal] = useState(false);

  const order = (ordersData?.data || []).find((o) => o.id === parseInt(id));
  const deliveryBoys = boysData?.data || [];

  if (isLoading) return <LoadingScreen message="Loading order..." />;
  if (error || !order) return <ErrorScreen message="Order not found" onRetry={refetch} />;

  const canCancel = ["placed", "confirmed", "preparing"].includes(order.status);
  const nextActions = NEXT_STATUS[order.status] || [];

  const handleStatusUpdate = (status) => {
    Alert.alert("Update Status", `Change status to "${status}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Update",
        onPress: async () => {
          try {
            await updateStatus({ id: order.id, status }).unwrap();
          } catch (err) {
            Alert.alert("Error", err?.data?.message || "Failed to update status");
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "No", style: "cancel" },
      {
        text: "Cancel Order", style: "destructive",
        onPress: async () => {
          try {
            await updateStatus({ id: order.id, status: "cancelled", reason: "Cancelled by admin" }).unwrap();
          } catch (err) {
            Alert.alert("Error", err?.data?.message || "Failed to cancel");
          }
        },
      },
    ]);
  };

  const handleAssignRider = async (boyId) => {
    try {
      await assignBoy({ id: order.id, delivery_boy_id: boyId }).unwrap();
      setRiderModal(false);
    } catch (err) {
      Alert.alert("Error", err?.data?.message || "Failed to assign rider");
    }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

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
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: c.text }}>#{order.order_number}</Text>
            <Text style={{ fontSize: 12, color: c.textSecondary }}>{formatDate(order.created_at || order.createdAt)}</Text>
          </View>
        </View>

        {/* Status Tracker */}
        <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
          <Text style={{ fontSize: 17, fontWeight: "bold", color: c.text, marginBottom: 12 }}>Order Status</Text>
          <OrderStatusTracker currentStatus={order.status} />
        </View>

        {/* Action Buttons */}
        {nextActions.length > 0 ? (
          <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
            {nextActions.map((action) => (
              <TouchableOpacity
                key={action.key}
                style={{ backgroundColor: action.color, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginBottom: 8, flexDirection: "row", justifyContent: "center" }}
                onPress={() => handleStatusUpdate(action.key)}
                disabled={isUpdating}
              >
                {isUpdating ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <Text style={{ fontSize: 18, marginRight: 8 }}>{action.icon}</Text>
                    <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>{action.label}</Text>
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {/* Assign Rider */}
        {order.status !== "cancelled" && order.status !== "delivered" ? (
          <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
            <Text style={{ fontSize: 17, fontWeight: "bold", color: c.text, marginBottom: 12 }}>Delivery Partner</Text>
            {order.deliveryBoy ? (
              <View style={{ backgroundColor: c.bgSecondary, borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.primary, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>{order.deliveryBoy.name?.[0]}</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 15, fontWeight: "bold", color: c.text }}>{order.deliveryBoy.name}</Text>
                    {order.deliveryBoy.phone ? <Text style={{ fontSize: 12, color: c.textSecondary }}>📞 {order.deliveryBoy.phone}</Text> : null}
                  </View>
                </View>
                <TouchableOpacity
                  style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: c.bg }}
                  onPress={() => setRiderModal(true)}
                >
                  <Text style={{ fontSize: 13, fontWeight: "600", color: c.primary }}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={{ borderWidth: 2, borderStyle: "dashed", borderColor: c.borderInput, borderRadius: 12, padding: 16, alignItems: "center" }}
                onPress={() => setRiderModal(true)}
              >
                <Text style={{ color: c.primary, fontWeight: "600", fontSize: 15 }}>🏍️ Assign Delivery Partner</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}

        {/* Customer Info */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Text style={{ fontSize: 17, fontWeight: "bold", color: c.text, marginBottom: 12 }}>Customer</Text>
          <View style={{ backgroundColor: c.bgSecondary, borderRadius: 12, padding: 16 }}>
            <Text style={{ fontSize: 15, fontWeight: "bold", color: c.text }}>{order.customer?.name || "Customer"}</Text>
            {order.customer?.email ? <Text style={{ fontSize: 13, color: c.textSecondary, marginTop: 4 }}>📧 {order.customer.email}</Text> : null}
            {order.customer?.phone ? <Text style={{ fontSize: 13, color: c.textSecondary, marginTop: 2 }}>📞 {order.customer.phone}</Text> : null}
          </View>
        </View>

        {/* Delivery Address */}
        {order.deliveryAddress ? (
          <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <Text style={{ fontSize: 17, fontWeight: "bold", color: c.text, marginBottom: 12 }}>Delivery Address</Text>
            <View style={{ backgroundColor: c.bgSecondary, borderRadius: 12, padding: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: "bold", color: c.text }}>{order.deliveryAddress.label}</Text>
              <Text style={{ fontSize: 14, color: c.textMuted, marginTop: 4 }}>{order.deliveryAddress.full_address}</Text>
              {order.deliveryAddress.area || order.deliveryAddress.city ? (
                <Text style={{ fontSize: 12, color: c.textSecondary, marginTop: 4 }}>
                  {[order.deliveryAddress.area, order.deliveryAddress.city].filter(Boolean).join(", ")}
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* Delivery Notes */}
        {order.delivery_notes ? (
          <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <Text style={{ fontSize: 17, fontWeight: "bold", color: c.text, marginBottom: 12 }}>Delivery Notes</Text>
            <View style={{ backgroundColor: c.primaryLight, borderRadius: 12, padding: 16 }}>
              <Text style={{ fontSize: 14, color: c.text }}>{order.delivery_notes}</Text>
            </View>
          </View>
        ) : null}

        {/* Order Items */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Text style={{ fontSize: 17, fontWeight: "bold", color: c.text, marginBottom: 12 }}>Items</Text>
          <View style={{ backgroundColor: c.bgSecondary, borderRadius: 12, padding: 16 }}>
            {order.items?.map((item) => (
              <View key={item.id} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: c.border }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: "bold", color: c.text }}>{item.menuItem?.name || "Item"}</Text>
                  {item.variation_name ? <Text style={{ fontSize: 12, color: c.textSecondary, marginTop: 2 }}>Variant: {item.variation_name}</Text> : null}
                  {item.addons?.length > 0 ? <Text style={{ fontSize: 12, color: c.textSecondary, marginTop: 2 }}>+ {item.addons.map((a) => a.name).join(", ")}</Text> : null}
                  <Text style={{ fontSize: 12, color: c.textSecondary, marginTop: 2 }}>Qty: {item.quantity}</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: "bold", color: c.text }}>{CURRENCY_SYMBOL}{item.subtotal}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bill */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Text style={{ fontSize: 17, fontWeight: "bold", color: c.text, marginBottom: 12 }}>Bill Summary</Text>
          <View style={{ backgroundColor: c.bgSecondary, borderRadius: 12, padding: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ fontSize: 14, color: c.textSecondary }}>Subtotal</Text>
              <Text style={{ fontSize: 14, color: c.text }}>{CURRENCY_SYMBOL}{order.subtotal}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ fontSize: 14, color: c.textSecondary }}>Delivery</Text>
              <Text style={{ fontSize: 14, color: c.text }}>{CURRENCY_SYMBOL}{order.delivery_charge}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ fontSize: 14, color: c.textSecondary }}>Tax</Text>
              <Text style={{ fontSize: 14, color: c.text }}>{CURRENCY_SYMBOL}{order.tax}</Text>
            </View>
            {parseFloat(order.discount) > 0 ? (
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                <Text style={{ fontSize: 14, color: "#22C55E" }}>Discount</Text>
                <Text style={{ fontSize: 14, color: "#22C55E" }}>-{CURRENCY_SYMBOL}{order.discount}</Text>
              </View>
            ) : null}
            <View style={{ borderTopWidth: 1, borderTopColor: c.border, marginTop: 8, paddingTop: 8, flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: c.text }}>Total</Text>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: c.primary }}>{CURRENCY_SYMBOL}{order.total}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
              <Text style={{ fontSize: 13, color: c.textSecondary }}>Payment</Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: c.text }}>{order.payment_method === "COD" ? "💵 COD" : "📱 Online"} • {order.payment_status}</Text>
            </View>
          </View>
        </View>

        {/* Cancel Button */}
        {canCancel ? (
          <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <TouchableOpacity
              style={{ borderWidth: 1, borderColor: "#EF4444", borderRadius: 12, paddingVertical: 14, alignItems: "center" }}
              onPress={handleCancel}
            >
              <Text style={{ color: "#EF4444", fontWeight: "bold", fontSize: 15 }}>Cancel Order</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Rider Assignment Modal */}
      <Modal visible={riderModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: c.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "70%" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: c.text }}>Assign Rider</Text>
              <TouchableOpacity onPress={() => setRiderModal(false)}>
                <Text style={{ fontSize: 20, color: c.textSecondary }}>✕</Text>
              </TouchableOpacity>
            </View>

            {isAssigning ? (
              <ActivityIndicator size="large" color={c.primary} style={{ padding: 32 }} />
            ) : (
              <FlatList
                data={deliveryBoys}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item: boy }) => (
                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 12, marginBottom: 8, backgroundColor: c.bgSecondary }}
                    onPress={() => handleAssignRider(boy.id)}
                  >
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.primary, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                      <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>{boy.name?.[0]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: "bold", color: c.text }}>{boy.name}</Text>
                      <Text style={{ fontSize: 12, color: c.textSecondary }}>{boy.phone || boy.email}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: boy.deliveryProfile?.is_available ? "#22C55E" : "#9CA3AF", marginBottom: 4 }} />
                      <Text style={{ fontSize: 11, color: c.textSecondary }}>{boy.active_orders || 0} active</Text>
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={{ alignItems: "center", paddingVertical: 32 }}>
                    <Text style={{ fontSize: 32, marginBottom: 8 }}>🏍️</Text>
                    <Text style={{ color: c.textSecondary }}>No delivery partners available</Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
