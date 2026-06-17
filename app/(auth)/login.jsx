import { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, Alert, Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch } from "react-redux";
import { useAuth } from "../../src/hooks/useAuth";
import { useTheme } from "../../src/hooks/useTheme";
import { toggleTheme } from "../../src/store/slices/themeSlice";
import { fonts } from "../../src/utils/fonts";
import { haptic } from "../../src/utils/haptics";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const { login, isLoginLoading } = useAuth();
  const { isDark, c, shadow } = useTheme();

  // Animations
  const logoScale = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(40)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logoScale, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(formSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(formOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    try {
      haptic.medium();
      await login(email.trim().toLowerCase(), password);
      haptic.success();
    } catch (err) {
      haptic.error();
      Alert.alert("Login Failed", err?.data?.message || "Please try again.");
    }
  };

  const inputContainer = (field) => ({
    borderWidth: 1.5,
    borderColor: focusedField === field ? c.primary : c.borderInput,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: c.text,
    backgroundColor: c.inputBg,
    fontFamily: fonts.regular,
    ...(focusedField === field ? shadow.md : {}),
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Theme Toggle */}
      <TouchableOpacity
        style={{
          position: "absolute", top: 50, right: 20, zIndex: 10,
          width: 44, height: 44, borderRadius: 22,
          backgroundColor: c.card, alignItems: "center", justifyContent: "center",
          ...shadow.sm,
        }}
        onPress={() => dispatch(toggleTheme())}
      >
        <Text style={{ fontSize: 20 }}>{isDark ? "☀️" : "🌙"}</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 28 }}>

            {/* Animated Logo */}
            <Animated.View style={{ alignItems: "center", marginBottom: 40, transform: [{ scale: logoScale }] }}>
              <View style={{
                width: 90, height: 90, borderRadius: 28, alignItems: "center", justifyContent: "center",
                ...shadow.lg,
              }}>
                <LinearGradient
                  colors={c.gradient.accent}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={{ width: 90, height: 90, borderRadius: 28, alignItems: "center", justifyContent: "center" }}
                >
                  <Text style={{ fontSize: 44 }}>🍽️</Text>
                </LinearGradient>
              </View>
              <Text style={{ fontSize: 30, fontFamily: fonts.extrabold, color: c.text, marginTop: 20 }}>Welcome Back</Text>
              <Text style={{ fontSize: 16, fontFamily: fonts.regular, color: c.textSecondary, marginTop: 6 }}>
                Sign in to your account
              </Text>
            </Animated.View>

            {/* Form */}
            <Animated.View style={{ opacity: formOpacity, transform: [{ translateY: formSlide }] }}>
              {/* Email */}
              <View style={{ marginBottom: 18 }}>
                <Text style={{ fontSize: 14, fontFamily: fonts.semibold, color: c.textMuted, marginBottom: 8, marginLeft: 4 }}>EMAIL</Text>
                <TextInput
                  style={inputContainer("email")}
                  placeholder="your@email.com"
                  placeholderTextColor={c.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              {/* Password */}
              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 14, fontFamily: fonts.semibold, color: c.textMuted, marginBottom: 8, marginLeft: 4 }}>PASSWORD</Text>
                <View style={{ position: "relative" }}>
                  <TextInput
                    style={{ ...inputContainer("password"), paddingRight: 70 }}
                    placeholder="••••••••"
                    placeholderTextColor={c.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity
                    style={{ position: "absolute", right: 18, top: 16 }}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={{ color: c.primary, fontFamily: fonts.semibold, fontSize: 14 }}>
                      {showPassword ? "HIDE" : "SHOW"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot */}
              <TouchableOpacity style={{ alignSelf: "flex-end", marginBottom: 28 }} onPress={() => router.push("/(auth)/forgot-password")}>
                <Text style={{ color: c.primary, fontFamily: fonts.semibold, fontSize: 14 }}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity onPress={handleLogin} disabled={isLoginLoading} activeOpacity={0.85}>
                <LinearGradient
                  colors={isLoginLoading ? ["#A5B4FC", "#A5B4FC"] : c.gradient.primary}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: 16, paddingVertical: 18, alignItems: "center",
                    ...shadow.md,
                  }}
                >
                  {isLoginLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: "#fff", fontSize: 18, fontFamily: fonts.bold, letterSpacing: 0.5 }}>Sign In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Register Link */}
              <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 28 }}>
                <Text style={{ color: c.textSecondary, fontSize: 16, fontFamily: fonts.regular }}>
                  Don't have an account?{" "}
                </Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                  <Text style={{ color: c.primary, fontFamily: fonts.bold, fontSize: 16 }}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
