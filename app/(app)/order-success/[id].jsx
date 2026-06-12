import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGetOrderDetailQuery } from "../../../src/store/api/orderApi";
import { CURRENCY_SYMBOL } from "../../../src/constants/config";
import LoadingScreen from "../../../src/components/common/LoadingScreen";

export default function OrderSuccessScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data, isLoading } = useGetOrderDetailQuery(id);

  const order = data?.data;

  if (isLoading) return <LoadingScreen message="Loading order..." />;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        {/* Success Icon */}
        <View className="w-24 h-24 rounded-full bg-green-100 items-center justify-center mb-6">
          <Text className="text-5xl">✅</Text>
        </View>

        <Text className="text-2xl font-bold text-dark text-center">
          Order Placed!
        </Text>
        <Text className="text-gray-medium text-base mt-2 text-center">
          Your order has been placed successfully
        </Text>

        {order ? (
          <View className="bg-gray-light rounded-xl p-5 mt-6 w-full">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-medium">Order Number</Text>
              <Text className="text-sm font-bold text-dark">
                {order.order_number}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-medium">Status</Text>
              <Text className="text-sm font-bold text-success capitalize">
                {order.status}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-medium">Payment</Text>
              <Text className="text-sm font-bold text-dark">
                {order.payment_method === "COD" ? "Cash on Delivery" : "Online"}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-medium">Total</Text>
              <Text className="text-sm font-bold text-primary">
                {CURRENCY_SYMBOL}{order.total}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-medium">Est. Delivery</Text>
              <Text className="text-sm font-bold text-dark">
                {order.estimated_delivery_time} mins
              </Text>
            </View>
          </View>
        ) : null}

        {/* Actions */}
        <View className="w-full mt-8">
          <TouchableOpacity
            className="bg-primary py-4 rounded-xl items-center mb-3"
            onPress={() => router.replace("/(tabs)/home")}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base">Back to Home</Text>
          </TouchableOpacity>

          {order ? (
            <TouchableOpacity
              className="bg-gray-light py-4 rounded-xl items-center"
              onPress={() => {
                router.replace("/(tabs)/home");
                setTimeout(() => router.push(`/(app)/order/${order.id}`), 100);
              }}
              activeOpacity={0.8}
            >
              <Text className="text-dark font-bold text-base">Track Order</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}
