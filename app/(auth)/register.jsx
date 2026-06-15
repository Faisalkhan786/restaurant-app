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

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { register, isRegisterLoading } = useAuth();
  const { c } = useTheme();

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
      await register(name.trim(), email.trim().toLowerCase(), password, phone || undefined);
    } catch (err) {
      const message = err?.data?.message || "Registration failed. Please try again.";
      Alert.alert("Registration Failed", message);
    }
  };

  const inputStyle = {
    borderWidth: 1, borderColor: c.borderInput, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
    color: c.text, backgroundColor: c.inputBg,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 32 }}>
            {/* Header */}
            <View style={{ alignItems: "center", marginBottom: 32 }}>
              <Text style={{ fontSize: 48, marginBottom: 8 }}>🍽️</Text>
              <Text style={{ fontSize: 28, fontWeight: "bold", color: c.text }}>Create Account</Text>
              <Text style={{ fontSize: 15, color: c.textSecondary, marginTop: 8 }}>Sign up to get started</Text>
            </View>

            {/* Name */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: c.text, marginBottom: 8 }}>
                Full Name <Text style={{ color: "#F44336" }}>*</Text>
              </Text>
              <TextInput style={inputStyle} placeholder="Enter your full name" placeholderTextColor={c.textSecondary} value={name} onChangeText={setName} autoCapitalize="words" />
            </View>

            {/* Email */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: c.text, marginBottom: 8 }}>
                Email <Text style={{ color: "#F44336" }}>*</Text>
              </Text>
              <TextInput style={inputStyle} placeholder="Enter your email" placeholderTextColor={c.textSecondary} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            </View>

            {/* Phone */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: c.text, marginBottom: 8 }}>
                Phone Number <Text style={{ color: c.textSecondary, fontWeight: "400" }}>(optional)</Text>
              </Text>
              <TextInput style={inputStyle} placeholder="Enter your phone number" placeholderTextColor={c.textSecondary} value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={15} />
            </View>

            {/* Password */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: c.text, marginBottom: 8 }}>
                Password <Text style={{ color: "#F44336" }}>*</Text>
              </Text>
              <View style={{ position: "relative" }}>
                <TextInput style={{ ...inputStyle, paddingRight: 64 }} placeholder="Min 6 characters" placeholderTextColor={c.textSecondary} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                <TouchableOpacity style={{ position: "absolute", right: 16, top: 14 }} onPress={() => setShowPassword(!showPassword)}>
                  <Text style={{ color: c.primary, fontWeight: "600" }}>{showPassword ? "Hide" : "Show"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: c.text, marginBottom: 8 }}>
                Confirm Password <Text style={{ color: "#F44336" }}>*</Text>
              </Text>
              <TextInput style={inputStyle} placeholder="Re-enter your password" placeholderTextColor={c.textSecondary} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} />
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={{ backgroundColor: isRegisterLoading ? "#FDBA74" : c.primary, borderRadius: 12, paddingVertical: 16, alignItems: "center" }}
              onPress={handleRegister}
              disabled={isRegisterLoading}
              activeOpacity={0.8}
            >
              {isRegisterLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontSize: 17, fontWeight: "bold" }}>Create Account</Text>}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24 }}>
              <Text style={{ color: c.textSecondary, fontSize: 15 }}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text style={{ color: c.primary, fontWeight: "bold", fontSize: 15 }}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
