import { View, Text, TouchableOpacity } from "react-native";
import { CURRENCY_SYMBOL } from "../../constants/config";

const STATUS_COLORS = {
  placed: "bg-blue-100 text-blue-700",
  confirmed: "bg-green-100 text-green-700",
  preparing: "bg-yellow-100 text-yellow-700",
  ready: "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

const STATUS_LABELS = {
  placed: "Placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "On the Way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrderCard({ order, onPress }) {
  const itemCount = order.items?.length || 0;
  const statusColor = STATUS_COLORS[order.status] || "bg-gray-100 text-gray-700";
  const bgColor = statusColor.split(" ")[0];
  const textColor = statusColor.split(" ")[1];

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <TouchableOpacity
      className="bg-white border border-gray-100 rounded-2xl p-4 mb-3"
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Top Row */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base font-bold text-dark">
          #{order.order_number}
        </Text>
        <View className={`px-3 py-1 rounded-full ${bgColor}`}>
          <Text className={`text-xs font-bold ${textColor}`}>
            {STATUS_LABELS[order.status] || order.status}
          </Text>
        </View>
      </View>

      {/* Items Preview */}
      <Text className="text-sm text-gray-medium mb-2" numberOfLines={1}>
        {order.items
          ? order.items
              .map((i) => `${i.menuItem?.name || "Item"} ×${i.quantity}`)
              .join(", ")
          : `${itemCount} item${itemCount !== 1 ? "s" : ""}`}
      </Text>

      {/* Bottom Row */}
      <View className="flex-row items-center justify-between pt-2 border-t border-gray-100">
        <Text className="text-xs text-gray-medium">
          {formatDate(order.created_at || order.createdAt)}
        </Text>
        <Text className="text-base font-bold text-primary">
          {CURRENCY_SYMBOL}{order.total}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
