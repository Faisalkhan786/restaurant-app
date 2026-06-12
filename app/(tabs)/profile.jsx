import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/hooks/useAuth";
import { APP_NAME } from "../../src/constants/config";

const MenuItem = ({ icon, label, subtitle, onPress, danger }) => (
  <TouchableOpacity
    className="flex-row items-center py-4 border-b border-gray-100"
    onPress={onPress}
    activeOpacity={0.6}
  >
    <Text className="text-xl mr-4">{icon}</Text>
    <View className="flex-1">
      <Text className={`text-base ${danger ? "text-danger" : "text-dark"} font-medium`}>
        {label}
      </Text>
      {subtitle ? (
        <Text className="text-xs text-gray-medium mt-0.5">{subtitle}</Text>
      ) : null}
    </View>
    <Text className="text-gray-medium text-lg">›</Text>
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-2xl font-bold text-dark">Profile</Text>
        </View>

        {/* User Card */}
        <View className="mx-5 mt-4 bg-gray-light rounded-2xl p-5 flex-row items-center">
          <View className="w-16 h-16 rounded-full bg-primary items-center justify-center mr-4">
            <Text className="text-white text-2xl font-bold">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-dark">
              {user?.name || "User"}
            </Text>
            <Text className="text-sm text-gray-medium">{user?.email || ""}</Text>
            {user?.phone ? (
              <Text className="text-sm text-gray-medium">📞 {user.phone}</Text>
            ) : null}
          </View>
          <TouchableOpacity
            className="bg-white px-4 py-2 rounded-xl"
            onPress={() => router.push("/(app)/edit-profile")}
          >
            <Text className="text-primary font-semibold text-sm">Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View className="px-5 mt-6">
          <Text className="text-sm font-bold text-gray-medium uppercase mb-2">
            Orders
          </Text>
          <MenuItem
            icon="📦"
            label="My Orders"
            subtitle="View order history & track orders"
            onPress={() => router.push("/(app)/orders")}
          />
        </View>

        <View className="px-5 mt-6">
          <Text className="text-sm font-bold text-gray-medium uppercase mb-2">
            Account
          </Text>
          <MenuItem
            icon="📍"
            label="My Addresses"
            subtitle="Manage delivery addresses"
            onPress={() => router.push("/(app)/address/manage")}
          />
          <MenuItem
            icon="✏️"
            label="Edit Profile"
            subtitle="Update name, phone"
            onPress={() => router.push("/(app)/edit-profile")}
          />
        </View>

        <View className="px-5 mt-6">
          <Text className="text-sm font-bold text-gray-medium uppercase mb-2">
            More
          </Text>
          <MenuItem
            icon="ℹ️"
            label="About"
            subtitle={APP_NAME}
            onPress={() => {}}
          />
          <MenuItem
            icon="🚪"
            label="Logout"
            onPress={handleLogout}
            danger
          />
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
