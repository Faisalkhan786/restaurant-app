import { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, Alert, Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useForgotPasswordMutation } from "../../src/store/api/authApi";
import { useTheme } from "../../src/hooks/useTheme";
import { fonts } from "../../src/utils/fonts";
import { haptic } from "../../src/utils/haptics";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const router = useRouter();
  const { c, shadow } = useTheme();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  // Animations
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSendOTP = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    try {
      haptic.medium();
      const res = await forgotPassword({ email: email.trim().toLowerCase() }).unwrap();
      haptic.success();
      const devOtp = res?.data?.otp;
      const alertMsg = devOtp ? `Your OTP is: ${devOtp}` : "Check your email for the OTP";
      Alert.alert("OTP Sent", alertMsg, [
        { text: "OK", onPress: () => router.push({ pathname: "/(auth)/reset-password", params: { email: email.trim().toLowerCase() } }) },
      ]);
    } catch (err) {
      haptic.error();
      Alert.alert("Error", err?.data?.message || "Failed to send OTP. Please try again.");
    }
  };

  const inputStyle = (field) => ({
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
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 28 }}>

            {/* Header */}
            <Animated.View style={{ alignItems: "center", marginBottom: 40, opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
              <LinearGradient
                colors={c.gradient.accent}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{ width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center", ...shadow.lg }}
              >
                <Text style={{ fontSize: 38 }}>🔑</Text>
              </LinearGradient>
              <Text style={{ fontSize: 28, fontFamily: fonts.extrabold, color: c.text, marginTop: 18 }}>Forgot Password?</Text>
              <Text style={{ fontSize: 16, fontFamily: fonts.regular, color: c.textSecondary, marginTop: 8, textAlign: "center", paddingHorizontal: 20 }}>
                Enter your email and we'll send you a 6-digit OTP to reset your password
              </Text>
            </Animated.View>

            {/* Form */}
            <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
              {/* Email */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 14, fontFamily: fonts.semibold, color: c.textMuted, marginBottom: 8, marginLeft: 4 }}>EMAIL</Text>
                <TextInput
                  style={inputStyle("email")}
                  placeholder="your@email.com"
                  placeholderTextColor={c.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoFocus
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              {/* Send OTP Button */}
              <TouchableOpacity onPress={handleSendOTP} disabled={isLoading} activeOpacity={0.85}>
                <LinearGradient
                  colors={isLoading ? ["#A5B4FC", "#A5B4FC"] : c.gradient.primary}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 16, paddingVertical: 18, alignItems: "center", ...shadow.md }}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: "#fff", fontSize: 18, fontFamily: fonts.bold, letterSpacing: 0.5 }}>Send OTP</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Back to Login */}
              <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 28 }}>
                <Text style={{ color: c.textSecondary, fontSize: 16, fontFamily: fonts.regular }}>Remember your password? </Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={{ color: c.primary, fontFamily: fonts.bold, fontSize: 16 }}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
