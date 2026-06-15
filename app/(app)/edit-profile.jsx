import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { useUpdateProfileMutation } from "../../src/store/api/customerApi";
import { updateUser } from "../../src/store/slices/authSlice";
import { useTheme } from "../../src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { fonts } from "../../src/utils/fonts";

export default function EditProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { c, shadow } = useTheme();
  const { user } = useSelector((state) => state.auth);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    if (name.trim().length < 2) {
      Alert.alert("Error", "Name must be at least 2 characters");
      return;
    }

    if (phone && !/^[0-9]{10,15}$/.test(phone)) {
      Alert.alert("Error", "Phone number must be 10-15 digits");
      return;
    }

    try {
      const result = await updateProfile({
        name: name.trim(),
        phone: phone || null,
      }).unwrap();

      dispatch(updateUser(result.data.user));
      Alert.alert("Success", "Profile updated successfully");
      router.back();
    } catch (err) {
      Alert.alert("Error", err?.data?.message || "Failed to update profile");
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
          <Text style={{ fontSize: 24, fontWeight: "bold", color: c.text, fontFamily: fonts.bold, marginLeft: 12 }}>Edit Profile</Text>
        </View>

        {/* Avatar */}
        <View style={{ alignItems: "center", marginTop: 24, marginBottom: 32 }}>
          <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#FFFFFF", fontSize: 36, fontWeight: "bold" }}>
              {name?.[0]?.toUpperCase() || "U"}
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {/* Email (read-only) */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: c.text, marginBottom: 8 }}>Email</Text>
            <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: c.bgSecondary }}>
              <Text style={{ fontSize: 16, color: c.textSecondary }}>
                {user?.email || ""}
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: c.textSecondary, marginTop: 4 }}>
              Email cannot be changed
            </Text>
          </View>

          {/* Name */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: c.text, marginBottom: 8 }}>
              Full Name <Text style={{ color: "#EF4444" }}>*</Text>
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
              }}
              placeholder="Enter your name"
              placeholderTextColor={c.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* Phone */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: c.text, marginBottom: 8 }}>
              Phone Number
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
              }}
              placeholder="Enter phone number"
              placeholderTextColor={c.textSecondary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={15}
            />
          </View>

          {/* Role (read-only) */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: c.text, marginBottom: 8 }}>Role</Text>
            <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: c.bgSecondary }}>
              <Text style={{ fontSize: 16, color: c.textSecondary, textTransform: "capitalize" }}>
                {user?.role || "customer"}
              </Text>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={{
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: "center",
              marginBottom: 24,
              backgroundColor: isLoading ? "#FDBA74" : c.primary,
            }}
            onPress={handleSave}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 18 }}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
