import { View, Text } from "react-native";

const STATUSES = [
  { key: "placed", label: "Placed", icon: "📋" },
  { key: "confirmed", label: "Confirmed", icon: "✅" },
  { key: "preparing", label: "Preparing", icon: "👨‍🍳" },
  { key: "ready", label: "Ready", icon: "📦" },
  { key: "out_for_delivery", label: "On the Way", icon: "🚀" },
  { key: "delivered", label: "Delivered", icon: "🎉" },
];

export default function OrderStatusTracker({ currentStatus }) {
  if (currentStatus === "cancelled") {
    return (
      <View className="bg-red-50 rounded-xl p-4 items-center">
        <Text className="text-3xl mb-2">❌</Text>
        <Text className="text-lg font-bold text-danger">Order Cancelled</Text>
      </View>
    );
  }

  const currentIndex = STATUSES.findIndex((s) => s.key === currentStatus);

  return (
    <View className="py-2">
      {STATUSES.map((status, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === STATUSES.length - 1;

        return (
          <View key={status.key} className="flex-row">
            {/* Icon + Line */}
            <View className="items-center mr-4" style={{ width: 36 }}>
              <View
                className={`w-9 h-9 rounded-full items-center justify-center ${
                  isCompleted ? "bg-primary" : "bg-gray-200"
                } ${isCurrent ? "border-2 border-secondary" : ""}`}
              >
                <Text className="text-base">{status.icon}</Text>
              </View>
              {!isLast ? (
                <View
                  className={`w-0.5 flex-1 my-1 ${
                    index < currentIndex ? "bg-primary" : "bg-gray-200"
                  }`}
                  style={{ minHeight: 24 }}
                />
              ) : null}
            </View>

            {/* Label */}
            <View className="flex-1 pt-1.5 pb-4">
              <Text
                className={`text-base font-semibold ${
                  isCompleted ? "text-dark" : "text-gray-medium"
                } ${isCurrent ? "text-primary" : ""}`}
              >
                {status.label}
              </Text>
              {isCurrent ? (
                <Text className="text-xs text-gray-medium mt-0.5">
                  Current status
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
