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

export default function EditProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
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
          <Text className="text-2xl font-bold text-dark">Edit Profile</Text>
        </View>

        {/* Avatar */}
        <View className="items-center mt-6 mb-8">
          <View className="w-24 h-24 rounded-full bg-primary items-center justify-center">
            <Text className="text-white text-4xl font-bold">
              {name?.[0]?.toUpperCase() || "U"}
            </Text>
          </View>
        </View>

        <View className="px-5">
          {/* Email (read-only) */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-dark mb-2">Email</Text>
            <View className="border border-gray-200 rounded-xl px-4 py-3.5 bg-gray-200">
              <Text className="text-base text-gray-medium">
                {user?.email || ""}
              </Text>
            </View>
            <Text className="text-xs text-gray-medium mt-1">
              Email cannot be changed
            </Text>
          </View>

          {/* Name */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-dark mb-2">
              Full Name <Text className="text-danger">*</Text>
            </Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3.5 text-base text-dark bg-gray-light"
              placeholder="Enter your name"
              placeholderTextColor="#9E9E9E"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* Phone */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-dark mb-2">
              Phone Number
            </Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3.5 text-base text-dark bg-gray-light"
              placeholder="Enter phone number"
              placeholderTextColor="#9E9E9E"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={15}
            />
          </View>

          {/* Role (read-only) */}
          <View className="mb-8">
            <Text className="text-sm font-semibold text-dark mb-2">Role</Text>
            <View className="border border-gray-200 rounded-xl px-4 py-3.5 bg-gray-200">
              <Text className="text-base text-gray-medium capitalize">
                {user?.role || "customer"}
              </Text>
            </View>
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
              <Text className="text-white font-bold text-lg">Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
