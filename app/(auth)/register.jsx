import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../src/hooks/useAuth";
import { useTheme } from "../../src/hooks/useTheme";
import { fonts } from "../../src/utils/fonts";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const router = useRouter();
  const { register, isRegisterLoading } = useAuth();
  const { c, shadow } = useTheme();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all required fields"); return;
    }
    if (name.trim().length < 2) { Alert.alert("Error", "Name must be at least 2 characters"); return; }
    if (password.length < 6) { Alert.alert("Error", "Password must be at least 6 characters"); return; }
    if (password !== confirmPassword) { Alert.alert("Error", "Passwords do not match"); return; }
    if (phone && !/^[0-9]{10,15}$/.test(phone)) { Alert.alert("Error", "Phone must be 10-15 digits"); return; }
    try {
      await register(name.trim(), email.trim().toLowerCase(), password, phone || undefined);
    } catch (err) {
      Alert.alert("Registration Failed", err?.data?.message || "Please try again.");
    }
  };

  const inputStyle = (field) => ({
    borderWidth: 1.5,
    borderColor: focusedField === field ? c.primary : c.borderInput,
    borderRadius: 16, paddingHorizontal: 18, paddingVertical: 16,
    fontSize: 16, color: c.text, backgroundColor: c.inputBg,
    fontFamily: fonts.regular,
    ...(focusedField === field ? shadow.md : {}),
  });

  const label = (text, required) => (
    <Text style={{ fontSize: 14, fontFamily: fonts.semibold, color: c.textMuted, marginBottom: 8, marginLeft: 4 }}>
      {text} {required ? <Text style={{ color: "#EF4444" }}>*</Text> : <Text style={{ fontFamily: fonts.regular, color: c.textSecondary }}>(optional)</Text>}
    </Text>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 28, paddingVertical: 32 }}>

            {/* Header */}
            <View style={{ alignItems: "center", marginBottom: 32 }}>
              <LinearGradient
                colors={c.gradient.accent}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{ width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center", ...shadow.lg }}
              >
                <Text style={{ fontSize: 38 }}>🍽️</Text>
              </LinearGradient>
              <Text style={{ fontSize: 28, fontFamily: fonts.extrabold, color: c.text, marginTop: 18 }}>Create Account</Text>
              <Text style={{ fontSize: 16, fontFamily: fonts.regular, color: c.textSecondary, marginTop: 6 }}>Sign up to get started</Text>
            </View>

            {/* Name */}
            <View style={{ marginBottom: 16 }}>
              {label("FULL NAME", true)}
              <TextInput style={inputStyle("name")} placeholder="John Doe" placeholderTextColor={c.textSecondary} value={name} onChangeText={setName} autoCapitalize="words" onFocus={() => setFocusedField("name")} onBlur={() => setFocusedField(null)} />
            </View>

            {/* Email */}
            <View style={{ marginBottom: 16 }}>
              {label("EMAIL", true)}
              <TextInput style={inputStyle("email")} placeholder="your@email.com" placeholderTextColor={c.textSecondary} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)} />
            </View>

            {/* Phone */}
            <View style={{ marginBottom: 16 }}>
              {label("PHONE NUMBER", false)}
              <TextInput style={inputStyle("phone")} placeholder="9876543210" placeholderTextColor={c.textSecondary} value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={15} onFocus={() => setFocusedField("phone")} onBlur={() => setFocusedField(null)} />
            </View>

            {/* Password */}
            <View style={{ marginBottom: 16 }}>
              {label("PASSWORD", true)}
              <View style={{ position: "relative" }}>
                <TextInput style={{ ...inputStyle("password"), paddingRight: 70 }} placeholder="Min 6 characters" placeholderTextColor={c.textSecondary} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)} />
                <TouchableOpacity style={{ position: "absolute", right: 18, top: 16 }} onPress={() => setShowPassword(!showPassword)}>
                  <Text style={{ color: c.primary, fontFamily: fonts.semibold, fontSize: 14 }}>{showPassword ? "HIDE" : "SHOW"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={{ marginBottom: 28 }}>
              {label("CONFIRM PASSWORD", true)}
              <TextInput style={inputStyle("confirm")} placeholder="Re-enter password" placeholderTextColor={c.textSecondary} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} onFocus={() => setFocusedField("confirm")} onBlur={() => setFocusedField(null)} />
            </View>

            {/* Register Button */}
            <TouchableOpacity onPress={handleRegister} disabled={isRegisterLoading} activeOpacity={0.85}>
              <LinearGradient
                colors={isRegisterLoading ? ["#A5B4FC", "#A5B4FC"] : c.gradient.primary}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ borderRadius: 16, paddingVertical: 18, alignItems: "center", ...shadow.md }}
              >
                {isRegisterLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontSize: 18, fontFamily: fonts.bold, letterSpacing: 0.5 }}>Create Account</Text>}
              </LinearGradient>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24 }}>
              <Text style={{ color: c.textSecondary, fontSize: 16, fontFamily: fonts.regular }}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text style={{ color: c.primary, fontFamily: fonts.bold, fontSize: 16 }}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
