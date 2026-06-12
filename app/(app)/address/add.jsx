import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAddAddressMutation } from "../../../src/store/api/customerApi";

const LABELS = ["Home", "Office", "Other"];

export default function AddAddressScreen() {
  const router = useRouter();
  const [addAddress, { isLoading }] = useAddAddressMutation();

  const [label, setLabel] = useState("Home");
  const [fullAddress, setFullAddress] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const handleSave = async () => {
    if (!fullAddress.trim()) {
      Alert.alert("Error", "Please enter your full address");
      return;
    }

    try {
      await addAddress({
        label,
        full_address: fullAddress.trim(),
        area: area.trim() || undefined,
        city: city.trim() || undefined,
        is_default: isDefault,
      }).unwrap();

      router.back();
    } catch (err) {
      const message = err?.data?.message || "Failed to add address";
      Alert.alert("Error", message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-3">
          <TouchableOpacity
            className="mr-3 w-10 h-10 rounded-full bg-gray-light items-center justify-center"
            onPress={() => router.back()}
          >
            <Text className="text-lg">←</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-dark">Add Address</Text>
        </View>

        <View className="px-5 mt-4">
          {/* Label Selection */}
          <Text className="text-sm font-semibold text-dark mb-2">Label</Text>
          <View className="flex-row mb-5">
            {LABELS.map((l) => (
              <TouchableOpacity
                key={l}
                className={`px-5 py-2.5 rounded-full mr-2 ${
                  label === l ? "bg-primary" : "bg-gray-light"
                }`}
                onPress={() => setLabel(l)}
              >
                <Text
                  className={`text-sm font-semibold ${
                    label === l ? "text-white" : "text-gray-dark"
                  }`}
                >
                  {l}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Full Address */}
          <Text className="text-sm font-semibold text-dark mb-2">
            Full Address <Text className="text-danger">*</Text>
          </Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3.5 text-base text-dark bg-gray-light mb-4"
            placeholder="House no, Street, Landmark"
            placeholderTextColor="#9E9E9E"
            value={fullAddress}
            onChangeText={setFullAddress}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />

          {/* Area */}
          <Text className="text-sm font-semibold text-dark mb-2">Area / Locality</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3.5 text-base text-dark bg-gray-light mb-4"
            placeholder="Neighbourhood / Area"
            placeholderTextColor="#9E9E9E"
            value={area}
            onChangeText={setArea}
          />

          {/* City */}
          <Text className="text-sm font-semibold text-dark mb-2">City</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3.5 text-base text-dark bg-gray-light mb-4"
            placeholder="City name"
            placeholderTextColor="#9E9E9E"
            value={city}
            onChangeText={setCity}
          />

          {/* Default Toggle */}
          <View className="flex-row items-center justify-between py-3 mb-6">
            <Text className="text-base text-dark">Set as default address</Text>
            <Switch
              value={isDefault}
              onValueChange={setIsDefault}
              trackColor={{ false: "#E0E0E0", true: "#FFB563" }}
              thumbColor={isDefault ? "#FF6B35" : "#F5F5F5"}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            className={`py-4 rounded-xl items-center mb-6 ${
              isLoading ? "bg-orange-300" : "bg-primary"
            }`}
            onPress={handleSave}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">Save Address</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
