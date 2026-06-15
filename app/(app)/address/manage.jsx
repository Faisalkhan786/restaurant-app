import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  useGetAddressesQuery,
  useDeleteAddressMutation,
  useUpdateAddressMutation,
} from "../../../src/store/api/customerApi";
import LoadingScreen from "../../../src/components/common/LoadingScreen";
import ErrorScreen from "../../../src/components/common/ErrorScreen";
import { useTheme } from "../../../src/hooks/useTheme";

export default function ManageAddressScreen() {
  const router = useRouter();
  const { c } = useTheme();
  const { data, isLoading, error, refetch } = useGetAddressesQuery();
  const [deleteAddress] = useDeleteAddressMutation();
  const [updateAddress] = useUpdateAddressMutation();

  const addresses = data?.data || [];

  const handleDelete = (id) => {
    Alert.alert("Delete Address", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAddress(id).unwrap();
          } catch (err) {
            Alert.alert("Error", err?.data?.message || "Failed to delete");
          }
        },
      },
    ]);
  };

  const handleSetDefault = async (id) => {
    try {
      await updateAddress({ id, is_default: true }).unwrap();
    } catch (err) {
      Alert.alert("Error", err?.data?.message || "Failed to update");
    }
  };

  if (isLoading) return <LoadingScreen message="Loading addresses..." />;
  if (error) return <ErrorScreen message="Failed to load addresses" onRetry={refetch} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            style={{ marginRight: 12, width: 40, height: 40, borderRadius: 20, backgroundColor: c.bgSecondary, alignItems: "center", justifyContent: "center" }}
            onPress={() => router.back()}
          >
            <Text style={{ fontSize: 18, color: c.text }}>←</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: c.text }}>My Addresses</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/(app)/address/add")}>
          <Text style={{ color: c.primary, fontWeight: "bold", fontSize: 16 }}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 14, fontWeight: "bold", color: c.text }}>{item.label}</Text>
                {item.is_default ? (
                  <View style={{ backgroundColor: "#22C55E", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, marginLeft: 8 }}>
                    <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "bold" }}>Default</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <Text style={{ fontSize: 14, color: c.textMuted }} numberOfLines={2}>
              {item.full_address}
            </Text>
            {item.area || item.city ? (
              <Text style={{ fontSize: 12, color: c.textSecondary, marginTop: 4 }}>
                {[item.area, item.city].filter(Boolean).join(", ")}
              </Text>
            ) : null}

            {/* Actions */}
            <View style={{ flexDirection: "row", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.border }}>
              {!item.is_default ? (
                <TouchableOpacity
                  style={{ marginRight: 20 }}
                  onPress={() => handleSetDefault(item.id)}
                >
                  <Text style={{ color: c.primary, fontWeight: "600", fontSize: 14 }}>
                    Set Default
                  </Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={{ color: "#EF4444", fontWeight: "600", fontSize: 14 }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <Text style={{ fontSize: 36, marginBottom: 12 }}>📍</Text>
            <Text style={{ color: c.textSecondary, fontSize: 16, marginBottom: 16 }}>No addresses saved</Text>
            <TouchableOpacity
              style={{ backgroundColor: c.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
              onPress={() => router.push("/(app)/address/add")}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>Add Address</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}
