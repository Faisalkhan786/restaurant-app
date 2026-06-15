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
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/hooks/useAuth";
import { useTheme } from "../../src/hooks/useTheme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, isLoginLoading } = useAuth();
  const { c } = useTheme();

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
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24 }}>
            {/* Header */}
            <View style={{ alignItems: "center", marginBottom: 40 }}>
              <Text style={{ fontSize: 48, marginBottom: 8 }}>🍽️</Text>
              <Text style={{ fontSize: 28, fontWeight: "bold", color: c.text }}>Welcome Back</Text>
              <Text style={{ fontSize: 15, color: c.textSecondary, marginTop: 8 }}>
                Sign in to your account
              </Text>
            </View>

            {/* Email */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: c.text, marginBottom: 8 }}>Email</Text>
              <TextInput
                style={{
                  borderWidth: 1, borderColor: c.borderInput, borderRadius: 12,
                  paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
                  color: c.text, backgroundColor: c.inputBg,
                }}
                placeholder="Enter your email"
                placeholderTextColor={c.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: c.text, marginBottom: 8 }}>Password</Text>
              <View style={{ position: "relative" }}>
                <TextInput
                  style={{
                    borderWidth: 1, borderColor: c.borderInput, borderRadius: 12,
                    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
                    color: c.text, backgroundColor: c.inputBg, paddingRight: 64,
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor={c.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={{ position: "absolute", right: 16, top: 14 }}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={{ color: c.primary, fontWeight: "600" }}>
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={{ alignSelf: "flex-end", marginBottom: 24 }}>
              <Text style={{ color: c.primary, fontWeight: "600", fontSize: 13 }}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={{
                backgroundColor: isLoginLoading ? "#FDBA74" : c.primary,
                borderRadius: 12, paddingVertical: 16, alignItems: "center",
              }}
              onPress={handleLogin}
              disabled={isLoginLoading}
              activeOpacity={0.8}
            >
              {isLoginLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontSize: 17, fontWeight: "bold" }}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24 }}>
              <Text style={{ color: c.textSecondary, fontSize: 15 }}>
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text style={{ color: c.primary, fontWeight: "bold", fontSize: 15 }}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
