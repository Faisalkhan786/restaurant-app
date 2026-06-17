import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { useGetDashboardQuery } from "../../src/store/api/adminApi";
import { useAuth } from "../../src/hooks/useAuth";
import { useTheme } from "../../src/hooks/useTheme";
import { toggleTheme } from "../../src/store/slices/themeSlice";
import { CURRENCY_SYMBOL } from "../../src/constants/config";
import AnimatedLoading from "../../src/components/common/AnimatedLoading";
import ErrorScreen from "../../src/components/common/ErrorScreen";
import { fonts } from "../../src/utils/fonts";
import AnimatedNumber from "../../src/components/common/AnimatedNumber";

function StatCard({ icon, label, value, color, c, shadow }) {
  return (
    <View style={{
      backgroundColor: c.card, borderRadius: 16, padding: 16, flex: 1,
      marginHorizontal: 4, borderWidth: 1, borderColor: c.border, ...shadow.md,
    }}>
      <Text style={{ fontSize: 28, marginBottom: 8 }}>{icon}</Text>
      <AnimatedNumber value={value} style={{ fontSize: 24, fontWeight: "bold", color: color || c.text, fontFamily: fonts.extrabold }} />
      <Text style={{ fontSize: 12, color: c.textSecondary, marginTop: 4, fontFamily: fonts.regular }}>{label}</Text>
    </View>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const { isDark, c, shadow } = useTheme();
  const { data, isLoading, error, refetch, isFetching } = useGetDashboardQuery(undefined, {
    pollingInterval: 30000,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  const stats = data?.data;

  if (isLoading) return <AnimatedLoading message="Loading dashboard..." />;
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
              <Text style={{ fontSize: 14, color: c.textSecondary, fontFamily: fonts.regular }}>Admin Panel</Text>
              <Text style={{ fontSize: 24, fontWeight: "bold", color: c.text, marginTop: 2, fontFamily: fonts.extrabold }}>
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

        {/* Revenue Card - Gradient Style */}
        <View style={{
          marginHorizontal: 20, marginTop: 16, borderRadius: 24, padding: 24, overflow: "hidden",
          backgroundColor: isDark ? "#1E1B4B" : "#312E81",
        }}>
          {/* Decorative circles */}
          <View style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.08)" }} />
          <View style={{ position: "absolute", bottom: -40, left: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,255,255,0.05)" }} />

          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
            <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", letterSpacing: 1, textTransform: "uppercase", fontFamily: fonts.semibold }}>Today's Revenue</Text>
          </View>
          <AnimatedNumber value={today.revenue || 0} prefix={CURRENCY_SYMBOL} style={{ fontSize: 42, fontWeight: "800", color: "#fff", marginTop: 4, letterSpacing: 1, fontFamily: fonts.extrabold }} duration={1200} />

          <View style={{ flexDirection: "row", marginTop: 20, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 16, padding: 14 }}>
            <View style={{ flex: 1, alignItems: "center", borderRightWidth: 1, borderRightColor: "rgba(255,255,255,0.15)" }}>
              <AnimatedNumber value={today.total_orders || 0} style={{ fontSize: 24, fontWeight: "bold", color: "#fff", fontFamily: fonts.extrabold }} />
              <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 4, fontFamily: fonts.regular }}>Total Orders</Text>
            </View>
            <View style={{ flex: 1, alignItems: "center" }}>
              <AnimatedNumber value={today.delivered_orders || 0} style={{ fontSize: 24, fontWeight: "bold", color: "#34D399", fontFamily: fonts.extrabold }} />
              <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 4, fontFamily: fonts.regular }}>Delivered</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: c.text, paddingHorizontal: 4, marginBottom: 12, fontFamily: fonts.bold }}>Order Stats</Text>
          <View style={{ flexDirection: "row", marginBottom: 8 }}>
            <StatCard icon="⏳" label="Pending" value={today.pending_orders || 0} color="#F59E0B" c={c} shadow={shadow} />
            <StatCard icon="🔥" label="Active" value={today.active_orders || 0} color="#3B82F6" c={c} shadow={shadow} />
          </View>
          <View style={{ flexDirection: "row", marginBottom: 8 }}>
            <StatCard icon="✅" label="Delivered" value={today.delivered_orders || 0} color="#22C55E" c={c} shadow={shadow} />
            <StatCard icon="❌" label="Cancelled" value={today.cancelled_orders || 0} color="#EF4444" c={c} shadow={shadow} />
          </View>
        </View>

        {/* Quick Info */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: c.text, marginBottom: 12, fontFamily: fonts.bold }}>Quick Info</Text>
          <View style={{ backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.border, ...shadow.md }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: c.border }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 20, marginRight: 12 }}>👥</Text>
                <Text style={{ fontSize: 16, color: c.text, fontFamily: fonts.regular }}>Total Customers</Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: c.text, fontFamily: fonts.bold }}>{stats?.total_customers || 0}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 20, marginRight: 12 }}>🏍️</Text>
                <Text style={{ fontSize: 16, color: c.text, fontFamily: fonts.regular }}>Online Riders</Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#22C55E", fontFamily: fonts.bold }}>{stats?.online_riders || 0}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 20, marginTop: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: c.text, marginBottom: 12, fontFamily: fonts.bold }}>Quick Actions</Text>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: c.bgSecondary, borderRadius: 16, padding: 16, alignItems: "center", marginRight: 8 }}
              onPress={() => router.push("/(admin)/orders-mgmt")}
            >
              <Text style={{ fontSize: 28, marginBottom: 8 }}>📋</Text>
              <Text style={{ fontSize: 14, fontWeight: "600", color: c.text, fontFamily: fonts.semibold }}>View Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: c.bgSecondary, borderRadius: 16, padding: 16, alignItems: "center", marginLeft: 8 }}
              onPress={() => router.push("/(admin)/menu-mgmt")}
            >
              <Text style={{ fontSize: 28, marginBottom: 8 }}>🍔</Text>
              <Text style={{ fontSize: 14, fontWeight: "600", color: c.text, fontFamily: fonts.semibold }}>Manage Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
