import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useGetAdminOrdersQuery } from "../../src/store/api/adminApi";
import { useTheme } from "../../src/hooks/useTheme";
import { CURRENCY_SYMBOL } from "../../src/constants/config";
import LoadingScreen from "../../src/components/common/LoadingScreen";
import ErrorScreen from "../../src/components/common/ErrorScreen";

const FILTERS = [
  { key: null, label: "All" },
  { key: "placed", label: "New" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "out_for_delivery", label: "On Way" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_COLORS = {
  placed: { bg: "#DBEAFE", text: "#2563EB" },
  confirmed: { bg: "#DCFCE7", text: "#16A34A" },
  preparing: { bg: "#FEF9C3", text: "#CA8A04" },
  ready: { bg: "#F3E8FF", text: "#9333EA" },
  out_for_delivery: { bg: "#EEF2FF", text: "#4F46E5" },
  delivered: { bg: "#DCFCE7", text: "#16A34A" },
  cancelled: { bg: "#FEE2E2", text: "#DC2626" },
};

const STATUS_LABELS = {
  placed: "New", confirmed: "Confirmed", preparing: "Preparing",
  ready: "Ready", out_for_delivery: "On Way", delivered: "Delivered", cancelled: "Cancelled",
};

export default function OrdersManagementScreen() {
  const router = useRouter();
  const { c } = useTheme();
  const [statusFilter, setStatusFilter] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, error, refetch } = useGetAdminOrdersQuery({
    page, limit: 20, status: statusFilter, search: search.trim() || undefined,
  });

  const orders = data?.data || [];
  const pagination = data?.pagination;
  const hasMore = pagination ? page < pagination.totalPages : false;

  const handleFilterChange = (filter) => { setStatusFilter(filter); setPage(1); };
  const handleSearch = () => setPage(1);
  const loadMore = () => { if (hasMore && !isFetching) setPage((p) => p + 1); };

  if (isLoading) return <LoadingScreen message="Loading orders..." />;
  if (error) return <ErrorScreen message="Failed to load orders" onRetry={refetch} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: c.text }}>Order Management</Text>
        <Text style={{ fontSize: 14, color: c.textSecondary, marginTop: 2 }}>
          {pagination?.total || 0} total orders
        </Text>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 20, marginTop: 8, marginBottom: 8 }}>
        <View style={{ backgroundColor: c.inputBg, borderRadius: 12, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: c.borderInput }}>
          <Text style={{ marginRight: 8, fontSize: 16 }}>🔍</Text>
          <TextInput
            style={{ flex: 1, fontSize: 14, color: c.text }}
            placeholder="Search by order number..."
            placeholderTextColor={c.textSecondary}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {search ? (
            <TouchableOpacity onPress={() => { setSearch(""); setPage(1); }}>
              <Text style={{ color: c.textSecondary, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
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
                paddingHorizontal: 14, paddingVertical: 7, marginRight: 6, borderRadius: 16,
                backgroundColor: statusFilter === item.key ? c.primary : c.bgSecondary,
              }}
              onPress={() => handleFilterChange(item.key)}
            >
              <Text style={{ fontSize: 12, fontWeight: "600", color: statusFilter === item.key ? "#fff" : c.textMuted }}>
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
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        renderItem={({ item: order }) => {
          const sc = STATUS_COLORS[order.status] || { bg: c.bgSecondary, text: c.textMuted };
          return (
            <TouchableOpacity
              style={{ backgroundColor: c.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: c.border }}
              onPress={() => router.push(`/(app)/admin-order-detail?id=${order.id}`)}
              activeOpacity={0.7}
            >
              {/* Top Row */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: c.text }}>#{order.order_number}</Text>
                <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: sc.bg }}>
                  <Text style={{ fontSize: 14, fontWeight: "bold", color: sc.text }}>{STATUS_LABELS[order.status]}</Text>
                </View>
              </View>

              {/* Customer */}
              <Text style={{ fontSize: 14, color: c.textMuted, marginBottom: 4 }}>
                👤 {order.customer?.name || "Customer"} {order.customer?.phone ? `• ${order.customer.phone}` : ""}
              </Text>

              {/* Items preview */}
              <Text style={{ fontSize: 12, color: c.textSecondary, marginBottom: 8 }} numberOfLines={1}>
                {order.items?.map((i) => `${i.menuItem?.name || "Item"} ×${i.quantity}`).join(", ")}
              </Text>

              {/* Bottom Row */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTopWidth: 1, borderTopColor: c.border }}>
                <Text style={{ fontSize: 14, color: c.textSecondary }}>
                  {new Date(order.created_at || order.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {order.deliveryBoy ? (
                    <Text style={{ fontSize: 14, color: c.textSecondary, marginRight: 12 }}>🏍️ {order.deliveryBoy.name}</Text>
                  ) : order.status !== "cancelled" && order.status !== "placed" ? (
                    <Text style={{ fontSize: 14, color: "#F59E0B", marginRight: 12 }}>⚠️ No rider</Text>
                  ) : null}
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: c.primary }}>{CURRENCY_SYMBOL}{order.total}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={
          isFetching && !isLoading ? <ActivityIndicator color={c.primary} style={{ padding: 16 }} /> : null
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📦</Text>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: c.text }}>No Orders</Text>
            <Text style={{ color: c.textSecondary, marginTop: 4 }}>
              {statusFilter ? "No orders with this status" : "Orders will appear here"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
