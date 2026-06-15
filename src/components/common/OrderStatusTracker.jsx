import { View, Text } from "react-native";
import { useTheme } from "../../hooks/useTheme";

const STATUSES = [
  { key: "placed", label: "Placed", icon: "📋" },
  { key: "confirmed", label: "Confirmed", icon: "✅" },
  { key: "preparing", label: "Preparing", icon: "👨‍🍳" },
  { key: "ready", label: "Ready", icon: "📦" },
  { key: "out_for_delivery", label: "On the Way", icon: "🚀" },
  { key: "delivered", label: "Delivered", icon: "🎉" },
];

export default function OrderStatusTracker({ currentStatus }) {
  const { c } = useTheme();

  if (currentStatus === "cancelled") {
    return (
      <View style={{ backgroundColor: "#FEE2E2", borderRadius: 12, padding: 16, alignItems: "center" }}>
        <Text style={{ fontSize: 28, marginBottom: 8 }}>❌</Text>
        <Text style={{ fontSize: 17, fontWeight: "bold", color: "#DC2626" }}>Order Cancelled</Text>
      </View>
    );
  }

  const currentIndex = STATUSES.findIndex((s) => s.key === currentStatus);

  return (
    <View style={{ paddingVertical: 8 }}>
      {STATUSES.map((status, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === STATUSES.length - 1;

        return (
          <View key={status.key} style={{ flexDirection: "row" }}>
            <View style={{ alignItems: "center", marginRight: 16, width: 36 }}>
              <View style={{
                width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center",
                backgroundColor: isCompleted ? c.primary : c.bgSecondary,
                borderWidth: isCurrent ? 2 : 0, borderColor: "#FFB563",
              }}>
                <Text style={{ fontSize: 15 }}>{status.icon}</Text>
              </View>
              {!isLast ? <View style={{ width: 2, flex: 1, marginVertical: 4, minHeight: 24, backgroundColor: index < currentIndex ? c.primary : c.bgSecondary }} /> : null}
            </View>
            <View style={{ flex: 1, paddingTop: 6, paddingBottom: 16 }}>
              <Text style={{ fontSize: 15, fontWeight: "600", color: isCurrent ? c.primary : isCompleted ? c.text : c.textSecondary }}>
                {status.label}
              </Text>
              {isCurrent ? <Text style={{ fontSize: 11, color: c.textSecondary, marginTop: 2 }}>Current status</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
