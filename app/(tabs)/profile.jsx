import { View, Text, TouchableOpacity, ScrollView, Alert, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { useAuth } from "../../src/hooks/useAuth";
import { useTheme } from "../../src/hooks/useTheme";
import { toggleTheme } from "../../src/store/slices/themeSlice";
import { APP_NAME } from "../../src/constants/config";

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const { isDark, c } = useTheme();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  const MenuItem = ({ icon, label, subtitle, onPress, danger, rightElement }) => (
    <TouchableOpacity
      style={{ flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: c.border }}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <Text style={{ fontSize: 20, marginRight: 16 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, color: danger ? "#F44336" : c.text, fontWeight: "500" }}>{label}</Text>
        {subtitle ? <Text style={{ fontSize: 12, color: c.textSecondary, marginTop: 2 }}>{subtitle}</Text> : null}
      </View>
      {rightElement || <Text style={{ color: c.textSecondary, fontSize: 17 }}>›</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: c.text }}>Profile</Text>
        </View>

        {/* User Card */}
        <View style={{ marginHorizontal: 20, marginTop: 16, backgroundColor: c.bgSecondary, borderRadius: 16, padding: 20, flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: c.primary, alignItems: "center", justifyContent: "center", marginRight: 16 }}>
            <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}>{user?.name?.[0]?.toUpperCase() || "U"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: "bold", color: c.text }}>{user?.name || "User"}</Text>
            <Text style={{ fontSize: 13, color: c.textSecondary }}>{user?.email || ""}</Text>
            {user?.phone ? <Text style={{ fontSize: 13, color: c.textSecondary }}>📞 {user.phone}</Text> : null}
          </View>
          <TouchableOpacity
            style={{ backgroundColor: c.bg, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}
            onPress={() => router.push("/(app)/edit-profile")}
          >
            <Text style={{ color: c.primary, fontWeight: "600", fontSize: 13 }}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Theme Toggle */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text style={{ fontSize: 12, fontWeight: "bold", color: c.textSecondary, textTransform: "uppercase", marginBottom: 8 }}>Appearance</Text>
          <MenuItem
            icon={isDark ? "🌙" : "☀️"}
            label="Dark Mode"
            subtitle={isDark ? "Dark theme enabled" : "Light theme enabled"}
            onPress={() => dispatch(toggleTheme())}
            rightElement={
              <Switch
                value={isDark}
                onValueChange={() => dispatch(toggleTheme())}
                trackColor={{ false: "#E0E0E0", true: "#FFB563" }}
                thumbColor={isDark ? "#FF6B35" : "#F5F5F5"}
              />
            }
          />
        </View>

        {/* Orders */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text style={{ fontSize: 12, fontWeight: "bold", color: c.textSecondary, textTransform: "uppercase", marginBottom: 8 }}>Orders</Text>
          <MenuItem icon="📦" label="My Orders" subtitle="View order history & track orders" onPress={() => router.push("/(app)/orders")} />
        </View>

        {/* Account */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text style={{ fontSize: 12, fontWeight: "bold", color: c.textSecondary, textTransform: "uppercase", marginBottom: 8 }}>Account</Text>
          <MenuItem icon="📍" label="My Addresses" subtitle="Manage delivery addresses" onPress={() => router.push("/(app)/address/manage")} />
          <MenuItem icon="✏️" label="Edit Profile" subtitle="Update name, phone" onPress={() => router.push("/(app)/edit-profile")} />
        </View>

        {/* More */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text style={{ fontSize: 12, fontWeight: "bold", color: c.textSecondary, textTransform: "uppercase", marginBottom: 8 }}>More</Text>
          <MenuItem icon="ℹ️" label="About" subtitle={APP_NAME} onPress={() => {}} />
          <MenuItem icon="🚪" label="Logout" onPress={handleLogout} danger />
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
