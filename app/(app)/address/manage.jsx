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

export default function ManageAddressScreen() {
  const router = useRouter();
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
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
        <View className="flex-row items-center">
          <TouchableOpacity
            className="mr-3 w-10 h-10 rounded-full bg-gray-light items-center justify-center"
            onPress={() => router.back()}
          >
            <Text className="text-lg">←</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-dark">My Addresses</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/(app)/address/add")}>
          <Text className="text-primary font-bold text-base">+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View className="border border-gray-200 rounded-xl p-4 mb-3">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Text className="text-sm font-bold text-dark">{item.label}</Text>
                {item.is_default ? (
                  <View className="bg-success px-2 py-0.5 rounded-full ml-2">
                    <Text className="text-white text-xs font-bold">Default</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <Text className="text-sm text-gray-dark" numberOfLines={2}>
              {item.full_address}
            </Text>
            {item.area || item.city ? (
              <Text className="text-xs text-gray-medium mt-1">
                {[item.area, item.city].filter(Boolean).join(", ")}
              </Text>
            ) : null}

            {/* Actions */}
            <View className="flex-row mt-3 pt-3 border-t border-gray-100">
              {!item.is_default ? (
                <TouchableOpacity
                  className="mr-5"
                  onPress={() => handleSetDefault(item.id)}
                >
                  <Text className="text-primary font-semibold text-sm">
                    Set Default
                  </Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text className="text-danger font-semibold text-sm">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-4xl mb-3">📍</Text>
            <Text className="text-gray-medium text-base mb-4">No addresses saved</Text>
            <TouchableOpacity
              className="bg-primary px-6 py-3 rounded-xl"
              onPress={() => router.push("/(app)/address/add")}
            >
              <Text className="text-white font-bold">Add Address</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}
