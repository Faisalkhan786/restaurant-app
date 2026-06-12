import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useGetMyOrdersQuery } from "../../src/store/api/orderApi";
import OrderCard from "../../src/components/common/OrderCard";
import LoadingScreen from "../../src/components/common/LoadingScreen";
import ErrorScreen from "../../src/components/common/ErrorScreen";

const FILTERS = [
  { key: null, label: "All" },
  { key: "placed", label: "Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "out_for_delivery", label: "On the Way" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

export default function OrdersScreen() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, error, refetch } = useGetMyOrdersQuery({
    page,
    limit: 10,
    status: statusFilter,
  });

  const orders = data?.data || [];
  const pagination = data?.pagination;
  const hasMore = pagination ? page < pagination.totalPages : false;

  const handleOrderPress = (order) => {
    router.push(`/(app)/order/${order.id}`);
  };

  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    setPage(1);
  };

  const loadMore = () => {
    if (hasMore && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  if (isLoading) return <LoadingScreen message="Loading orders..." />;
  if (error) return <ErrorScreen message="Failed to load orders" onRetry={refetch} />;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-3">
        <TouchableOpacity
          className="mr-3 w-10 h-10 rounded-full bg-gray-light items-center justify-center"
          onPress={() => router.back()}
        >
          <Text className="text-lg">←</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-dark">My Orders</Text>
      </View>

      {/* Status Filters */}
      <View className="mb-2">
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          keyExtractor={(item) => item.label}
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`px-4 py-2 mr-2 rounded-full ${
                statusFilter === item.key ? "bg-primary" : "bg-gray-light"
              }`}
              onPress={() => handleFilterChange(item.key)}
            >
              <Text
                className={`text-sm font-semibold ${
                  statusFilter === item.key ? "text-white" : "text-gray-dark"
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={() => handleOrderPress(item)} />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetching && !isLoading ? (
            <ActivityIndicator color="#FF6B35" style={{ padding: 16 }} />
          ) : null
        }
        ListEmptyComponent={
          <View className="items-center py-16">
            <Text className="text-5xl mb-3">📦</Text>
            <Text className="text-lg font-bold text-dark">No Orders Yet</Text>
            <Text className="text-gray-medium mt-1 text-center">
              {statusFilter
                ? "No orders with this status"
                : "Your order history will appear here"}
            </Text>
            {!statusFilter ? (
              <TouchableOpacity
                className="bg-primary px-8 py-3 rounded-xl mt-5"
                onPress={() => router.push("/(tabs)/menu")}
              >
                <Text className="text-white font-bold">Order Now</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        }
      />
    </SafeAreaView>
  );
}
