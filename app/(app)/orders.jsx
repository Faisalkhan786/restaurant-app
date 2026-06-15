import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useGetMyOrdersQuery } from "../../src/store/api/orderApi";
import OrderCard from "../../src/components/common/OrderCard";
import LoadingScreen from "../../src/components/common/LoadingScreen";
import ErrorScreen from "../../src/components/common/ErrorScreen";
import { useTheme } from "../../src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { fonts } from "../../src/utils/fonts";

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
  const { c, shadow } = useTheme();
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
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <TouchableOpacity
          style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: c.card, alignItems: "center", justifyContent: "center", ...shadow.sm }}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color={c.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: c.text, fontFamily: fonts.bold, marginLeft: 12 }}>My Orders</Text>
      </View>

      {/* Status Filters */}
      <View style={{ marginBottom: 8 }}>
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          keyExtractor={(item) => item.label}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginRight: 8,
                borderRadius: 20,
                backgroundColor: statusFilter === item.key ? c.primary : c.bgSecondary,
              }}
              onPress={() => handleFilterChange(item.key)}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: statusFilter === item.key ? "#FFFFFF" : c.textMuted,
                }}
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
            <ActivityIndicator color={c.primary} style={{ padding: 16 }} />
          ) : null
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 64 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📦</Text>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: c.text }}>No Orders Yet</Text>
            <Text style={{ color: c.textSecondary, marginTop: 4, textAlign: "center" }}>
              {statusFilter
                ? "No orders with this status"
                : "Your order history will appear here"}
            </Text>
            {!statusFilter ? (
              <TouchableOpacity
                style={{ backgroundColor: c.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12, marginTop: 20 }}
                onPress={() => router.push("/(tabs)/menu")}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>Order Now</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        }
      />
    </SafeAreaView>
  );
}
