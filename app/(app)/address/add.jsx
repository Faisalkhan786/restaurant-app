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
import { useTheme } from "../../../src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { fonts } from "../../../src/utils/fonts";

const LABELS = ["Home", "Office", "Other"];

export default function AddAddressScreen() {
  const router = useRouter();
  const { c, shadow } = useTheme();
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
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
          <TouchableOpacity
            style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: c.card, alignItems: "center", justifyContent: "center", ...shadow.sm }}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={22} color={c.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: c.text, fontFamily: fonts.bold, marginLeft: 12 }}>Add Address</Text>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          {/* Label Selection */}
          <Text style={{ fontSize: 14, fontWeight: "600", color: c.text, marginBottom: 8 }}>Label</Text>
          <View style={{ flexDirection: "row", marginBottom: 20 }}>
            {LABELS.map((l) => (
              <TouchableOpacity
                key={l}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 20,
                  marginRight: 8,
                  backgroundColor: label === l ? c.primary : c.bgSecondary,
                }}
                onPress={() => setLabel(l)}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: label === l ? "#FFFFFF" : c.textMuted,
                  }}
                >
                  {l}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Full Address */}
          <Text style={{ fontSize: 14, fontWeight: "600", color: c.text, marginBottom: 8 }}>
            Full Address <Text style={{ color: "#EF4444" }}>*</Text>
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: c.borderInput,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 16,
              color: c.text,
              backgroundColor: c.inputBg,
              marginBottom: 16,
            }}
            placeholder="House no, Street, Landmark"
            placeholderTextColor={c.textSecondary}
            value={fullAddress}
            onChangeText={setFullAddress}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />

          {/* Area */}
          <Text style={{ fontSize: 14, fontWeight: "600", color: c.text, marginBottom: 8 }}>Area / Locality</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: c.borderInput,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 16,
              color: c.text,
              backgroundColor: c.inputBg,
              marginBottom: 16,
            }}
            placeholder="Neighbourhood / Area"
            placeholderTextColor={c.textSecondary}
            value={area}
            onChangeText={setArea}
          />

          {/* City */}
          <Text style={{ fontSize: 14, fontWeight: "600", color: c.text, marginBottom: 8 }}>City</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: c.borderInput,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 16,
              color: c.text,
              backgroundColor: c.inputBg,
              marginBottom: 16,
            }}
            placeholder="City name"
            placeholderTextColor={c.textSecondary}
            value={city}
            onChangeText={setCity}
          />

          {/* Default Toggle */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, marginBottom: 24 }}>
            <Text style={{ fontSize: 16, color: c.text }}>Set as default address</Text>
            <Switch
              value={isDefault}
              onValueChange={setIsDefault}
              trackColor={{ false: "#E0E0E0", true: "#818CF8" }}
              thumbColor={isDefault ? "#4F46E5" : "#F5F5F5"}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={{
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: "center",
              marginBottom: 24,
              backgroundColor: isLoading ? "#A5B4FC" : c.primary,
            }}
            onPress={handleSave}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 18 }}>Save Address</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
