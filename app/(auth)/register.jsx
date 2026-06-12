import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/hooks/useAuth";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { register, isRegisterLoading } = useAuth();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (name.trim().length < 2) {
      Alert.alert("Error", "Name must be at least 2 characters");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (phone && !/^[0-9]{10,15}$/.test(phone)) {
      Alert.alert("Error", "Phone number must be 10-15 digits");
      return;
    }

    try {
      await register(
        name.trim(),
        email.trim().toLowerCase(),
        password,
        phone || undefined
      );
    } catch (err) {
      const message = err?.data?.message || "Registration failed. Please try again.";
      Alert.alert("Registration Failed", message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center px-6 py-8">
            {/* Header */}
            <View className="items-center mb-8">
              <Text className="text-5xl mb-2">🍽️</Text>
              <Text className="text-3xl font-bold text-dark">Create Account</Text>
              <Text className="text-base text-gray-medium mt-2">
                Sign up to get started
              </Text>
            </View>

            {/* Name Input */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-dark mb-2">
                Full Name <Text className="text-danger">*</Text>
              </Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3.5 text-base text-dark bg-gray-light"
                placeholder="Enter your full name"
                placeholderTextColor="#9E9E9E"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-dark mb-2">
                Email <Text className="text-danger">*</Text>
              </Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3.5 text-base text-dark bg-gray-light"
                placeholder="Enter your email"
                placeholderTextColor="#9E9E9E"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Phone Input */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-dark mb-2">
                Phone Number{" "}
                <Text className="text-gray-medium font-normal">(optional)</Text>
              </Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3.5 text-base text-dark bg-gray-light"
                placeholder="Enter your phone number"
                placeholderTextColor="#9E9E9E"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-dark mb-2">
                Password <Text className="text-danger">*</Text>
              </Text>
              <View className="relative">
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-3.5 text-base text-dark bg-gray-light pr-16"
                  placeholder="Min 6 characters"
                  placeholderTextColor="#9E9E9E"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  className="absolute right-4 top-3.5"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text className="text-primary font-semibold">
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-dark mb-2">
                Confirm Password <Text className="text-danger">*</Text>
              </Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3.5 text-base text-dark bg-gray-light"
                placeholder="Re-enter your password"
                placeholderTextColor="#9E9E9E"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>

            {/* Register Button */}
            <TouchableOpacity
              className={`rounded-xl py-4 items-center ${
                isRegisterLoading ? "bg-orange-300" : "bg-primary"
              }`}
              onPress={handleRegister}
              disabled={isRegisterLoading}
              activeOpacity={0.8}
            >
              {isRegisterLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-lg font-bold">Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-medium text-base">
                Already have an account?{" "}
              </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text className="text-primary font-bold text-base">Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
