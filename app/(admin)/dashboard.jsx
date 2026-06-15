import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { useGetDashboardQuery } from "../../src/store/api/adminApi";
import { useAuth } from "../../src/hooks/useAuth";
import { useTheme } from "../../src/hooks/useTheme";
import { toggleTheme } from "../../src/store/slices/themeSlice";
import { CURRENCY_SYMBOL } from "../../src/constants/config";
import LoadingScreen from "../../src/components/common/LoadingScreen";
import ErrorScreen from "../../src/components/common/ErrorScreen";

function StatCard({ icon, label, value, color, c }) {
  return (
    <View style={{
      backgroundColor: c.card, borderRadius: 16, padding: 16, flex: 1,
      marginHorizontal: 4, borderWidth: 1, borderColor: c.border,
    }}>
      <Text style={{ fontSize: 28, marginBottom: 8 }}>{icon}</Text>
      <Text style={{ fontSize: 22, fontWeight: "bold", color: color || c.text }}>{value}</Text>
      <Text style={{ fontSize: 12, color: c.textSecondary, marginTop: 4 }}>{label}</Text>
    </View>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const { isDark, c } = useTheme();
  const { data, isLoading, error, refetch, isFetching } = useGetDashboardQuery(undefined, {
    pollingInterval: 30000, // Refresh every 30 seconds
  });

  const stats = data?.data;

  if (isLoading) return <LoadingScreen message="Loading dashboard..." />;
  if (error) return <ErrorScreen message="Failed to load dashboard" onRetry={refetch} />;

  const today = stats?.today || {};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={c.primary} />}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View>
              <Text style={{ fontSize: 13, color: c.textSecondary }}>Admin Panel</Text>
              <Text style={{ fontSize: 22, fontWeight: "bold", color: c.text, marginTop: 2 }}>
                Hello, {user?.name || "Admin"} 👋
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                style={{ marginRight: 12, width: 40, height: 40, borderRadius: 20, backgroundColor: c.bgSecondary, alignItems: "center", justifyContent: "center" }}
                onPress={() => dispatch(toggleTheme())}
              >
                <Text style={{ fontSize: 18 }}>{isDark ? "☀️" : "🌙"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" }}
                onPress={logout}
              >
                <Text style={{ fontSize: 16 }}>🚪</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Revenue Card */}
        <View style={{ marginHorizontal: 20, marginTop: 16, backgroundColor: c.primary, borderRadius: 20, padding: 24 }}>
          <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>Today's Revenue</Text>
          <Text style={{ fontSize: 36, fontWeight: "bold", color: "#fff", marginTop: 8 }}>
            {CURRENCY_SYMBOL}{today.revenue || "0.00"}
          </Text>
          <View style={{ flexDirection: "row", marginTop: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: "#fff" }}>{today.total_orders || 0}</Text>
              <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Total Orders</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: "#fff" }}>{today.delivered_orders || 0}</Text>
              <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Delivered</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <Text style={{ fontSize: 17, fontWeight: "bold", color: c.text, paddingHorizontal: 4, marginBottom: 12 }}>Order Stats</Text>
          <View style={{ flexDirection: "row", marginBottom: 8 }}>
            <StatCard icon="⏳" label="Pending" value={today.pending_orders || 0} color="#F59E0B" c={c} />
            <StatCard icon="🔥" label="Active" value={today.active_orders || 0} color="#3B82F6" c={c} />
          </View>
          <View style={{ flexDirection: "row", marginBottom: 8 }}>
            <StatCard icon="✅" label="Delivered" value={today.delivered_orders || 0} color="#22C55E" c={c} />
            <StatCard icon="❌" label="Cancelled" value={today.cancelled_orders || 0} color="#EF4444" c={c} />
          </View>
        </View>

        {/* Quick Info */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Text style={{ fontSize: 17, fontWeight: "bold", color: c.text, marginBottom: 12 }}>Quick Info</Text>
          <View style={{ backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.border }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: c.border }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 20, marginRight: 12 }}>👥</Text>
                <Text style={{ fontSize: 15, color: c.text }}>Total Customers</Text>
              </View>
              <Text style={{ fontSize: 17, fontWeight: "bold", color: c.text }}>{stats?.total_customers || 0}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 20, marginRight: 12 }}>🏍️</Text>
                <Text style={{ fontSize: 15, color: c.text }}>Online Riders</Text>
              </View>
              <Text style={{ fontSize: 17, fontWeight: "bold", color: "#22C55E" }}>{stats?.online_riders || 0}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 20, marginTop: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: 17, fontWeight: "bold", color: c.text, marginBottom: 12 }}>Quick Actions</Text>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: c.bgSecondary, borderRadius: 16, padding: 16, alignItems: "center", marginRight: 8 }}
              onPress={() => router.push("/(admin)/orders-mgmt")}
            >
              <Text style={{ fontSize: 28, marginBottom: 8 }}>📋</Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: c.text }}>View Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: c.bgSecondary, borderRadius: 16, padding: 16, alignItems: "center", marginLeft: 8 }}
              onPress={() => router.push("/(admin)/menu-mgmt")}
            >
              <Text style={{ fontSize: 28, marginBottom: 8 }}>🍔</Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: c.text }}>Manage Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
