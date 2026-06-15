import { View, Text, TouchableOpacity } from "react-native";
import { CURRENCY_SYMBOL } from "../../constants/config";
import { useTheme } from "../../hooks/useTheme";

const STATUS_LABELS = { placed: "Placed", confirmed: "Confirmed", preparing: "Preparing", ready: "Ready", out_for_delivery: "On the Way", delivered: "Delivered", cancelled: "Cancelled" };

export default function OrderCard({ order, onPress }) {
  const { c } = useTheme();
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const isCancelled = order.status === "cancelled";
  const isDelivered = order.status === "delivered";

  return (
    <TouchableOpacity style={{ backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 16, marginBottom: 12 }} onPress={onPress} activeOpacity={0.7}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <Text style={{ fontSize: 15, fontWeight: "bold", color: c.text }}>#{order.order_number}</Text>
        <View style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, backgroundColor: isCancelled ? "#FEE2E2" : isDelivered ? "#DCFCE7" : c.primaryLight }}>
          <Text style={{ fontSize: 11, fontWeight: "bold", color: isCancelled ? "#DC2626" : isDelivered ? "#16A34A" : c.primary }}>
            {STATUS_LABELS[order.status] || order.status}
          </Text>
        </View>
      </View>
      <Text style={{ fontSize: 13, color: c.textSecondary, marginBottom: 8 }} numberOfLines={1}>
        {order.items ? order.items.map((i) => `${i.menuItem?.name || "Item"} ×${i.quantity}`).join(", ") : ""}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTopWidth: 1, borderTopColor: c.border }}>
        <Text style={{ fontSize: 11, color: c.textSecondary }}>{formatDate(order.created_at || order.createdAt)}</Text>
        <Text style={{ fontSize: 15, fontWeight: "bold", color: c.primary }}>{CURRENCY_SYMBOL}{order.total}</Text>
      </View>
    </TouchableOpacity>
  );
}
