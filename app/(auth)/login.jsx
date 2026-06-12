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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoginLoading } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      const message = err?.data?.message || "Login failed. Please try again.";
      Alert.alert("Login Failed", message);
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
          <View className="flex-1 justify-center px-6">
            {/* Header */}
            <View className="items-center mb-10">
              <Text className="text-5xl mb-2">🍽️</Text>
              <Text className="text-3xl font-bold text-dark">Welcome Back</Text>
              <Text className="text-base text-gray-medium mt-2">
                Sign in to your account
              </Text>
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-dark mb-2">Email</Text>
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

            {/* Password Input */}
            <View className="mb-2">
              <Text className="text-sm font-semibold text-dark mb-2">Password</Text>
              <View className="relative">
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-3.5 text-base text-dark bg-gray-light pr-16"
                  placeholder="Enter your password"
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

            {/* Forgot Password */}
            <TouchableOpacity className="self-end mb-6">
              <Text className="text-primary font-semibold text-sm">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              className={`rounded-xl py-4 items-center ${
                isLoginLoading ? "bg-orange-300" : "bg-primary"
              }`}
              onPress={handleLogin}
              disabled={isLoginLoading}
              activeOpacity={0.8}
            >
              {isLoginLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-lg font-bold">Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-medium text-base">
                Don't have an account?{" "}
              </Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <Text className="text-primary font-bold text-base">Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
