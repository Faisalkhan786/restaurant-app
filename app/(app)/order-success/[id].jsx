import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGetOrderDetailQuery } from "../../../src/store/api/orderApi";
import { CURRENCY_SYMBOL } from "../../../src/constants/config";
import LoadingScreen from "../../../src/components/common/LoadingScreen";
import { useTheme } from "../../../src/hooks/useTheme";

export default function OrderSuccessScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { c } = useTheme();
  const { data, isLoading } = useGetOrderDetailQuery(id);

  const order = data?.data;

  if (isLoading) return <LoadingScreen message="Loading order..." />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
        {/* Success Icon */}
        <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: "#DCFCE7", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <Text style={{ fontSize: 48 }}>✅</Text>
        </View>

        <Text style={{ fontSize: 24, fontWeight: "bold", color: c.text, textAlign: "center" }}>
          Order Placed!
        </Text>
        <Text style={{ color: c.textSecondary, fontSize: 16, marginTop: 8, textAlign: "center" }}>
          Your order has been placed successfully
        </Text>

        {order ? (
          <View style={{ backgroundColor: c.bgSecondary, borderRadius: 12, padding: 20, marginTop: 24, width: "100%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: c.textSecondary }}>Order Number</Text>
              <Text style={{ fontSize: 14, fontWeight: "bold", color: c.text }}>
                {order.order_number}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: c.textSecondary }}>Status</Text>
              <Text style={{ fontSize: 14, fontWeight: "bold", color: "#22C55E", textTransform: "capitalize" }}>
                {order.status}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: c.textSecondary }}>Payment</Text>
              <Text style={{ fontSize: 14, fontWeight: "bold", color: c.text }}>
                {order.payment_method === "COD" ? "Cash on Delivery" : "Online"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: c.textSecondary }}>Total</Text>
              <Text style={{ fontSize: 14, fontWeight: "bold", color: c.primary }}>
                {CURRENCY_SYMBOL}{order.total}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 14, color: c.textSecondary }}>Est. Delivery</Text>
              <Text style={{ fontSize: 14, fontWeight: "bold", color: c.text }}>
                {order.estimated_delivery_time} mins
              </Text>
            </View>
          </View>
        ) : null}

        {/* Actions */}
        <View style={{ width: "100%", marginTop: 32 }}>
          <TouchableOpacity
            style={{ backgroundColor: c.primary, paddingVertical: 16, borderRadius: 12, alignItems: "center", marginBottom: 12 }}
            onPress={() => router.replace("/(tabs)/home")}
            activeOpacity={0.8}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 16 }}>Back to Home</Text>
          </TouchableOpacity>

          {order ? (
            <TouchableOpacity
              style={{ backgroundColor: c.bgSecondary, paddingVertical: 16, borderRadius: 12, alignItems: "center" }}
              onPress={() => {
                router.replace("/(tabs)/home");
                setTimeout(() => router.push(`/(app)/order/${order.id}`), 100);
              }}
              activeOpacity={0.8}
            >
              <Text style={{ color: c.text, fontWeight: "bold", fontSize: 16 }}>Track Order</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}
