import { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, Alert, Animated,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useResetPasswordMutation, useForgotPasswordMutation } from "../../src/store/api/authApi";
import { useTheme } from "../../src/hooks/useTheme";
import { fonts } from "../../src/utils/fonts";
import { haptic } from "../../src/utils/haptics";

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const router = useRouter();
  const { c, shadow } = useTheme();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [forgotPassword, { isLoading: isResending }] = useForgotPasswordMutation();

  // Animations
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleReset = async () => {
    if (!otp.trim()) {
      Alert.alert("Error", "Please enter the OTP");
      return;
    }
    if (otp.length !== 6) {
      Alert.alert("Error", "OTP must be 6 digits");
      return;
    }
    if (!newPassword.trim()) {
      Alert.alert("Error", "Please enter a new password");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    try {
      haptic.medium();
      await resetPassword({ email, otp: otp.trim(), newPassword }).unwrap();
      haptic.success();
      Alert.alert("Success", "Password reset successful! Please login with your new password.", [
        { text: "Login", onPress: () => router.replace("/(auth)/login") },
      ]);
    } catch (err) {
      haptic.error();
      Alert.alert("Error", err?.data?.message || "Failed to reset password. Please try again.");
    }
  };

  const handleResendOTP = async () => {
    try {
      haptic.medium();
      await forgotPassword({ email }).unwrap();
      haptic.success();
      Alert.alert("OTP Resent", "A new OTP has been sent to your email");
    } catch (err) {
      haptic.error();
      Alert.alert("Error", err?.data?.message || "Failed to resend OTP");
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
            <Animated.View style={{ alignItems: "center", marginBottom: 36, opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
              <LinearGradient
                colors={c.gradient.accent}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{ width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center", ...shadow.lg }}
              >
                <Text style={{ fontSize: 38 }}>🔒</Text>
              </LinearGradient>
              <Text style={{ fontSize: 28, fontFamily: fonts.extrabold, color: c.text, marginTop: 18 }}>Reset Password</Text>
              <Text style={{ fontSize: 16, fontFamily: fonts.regular, color: c.textSecondary, marginTop: 8, textAlign: "center", paddingHorizontal: 10 }}>
                Enter the OTP sent to{" "}
                <Text style={{ fontFamily: fonts.semibold, color: c.primary }}>{email}</Text>
                {" "}and set your new password
              </Text>
            </Animated.View>

            {/* Form */}
            <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
              {/* OTP */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontFamily: fonts.semibold, color: c.textMuted, marginBottom: 8, marginLeft: 4 }}>OTP CODE</Text>
                <TextInput
                  style={{ ...inputStyle("otp"), textAlign: "center", fontSize: 24, letterSpacing: 8, fontFamily: fonts.bold }}
                  placeholder="000000"
                  placeholderTextColor={c.textSecondary}
                  value={otp}
                  onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ""))}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                  onFocus={() => setFocusedField("otp")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              {/* Resend OTP */}
              <TouchableOpacity
                style={{ alignSelf: "flex-end", marginBottom: 20 }}
                onPress={handleResendOTP}
                disabled={isResending}
              >
                <Text style={{ color: c.primary, fontFamily: fonts.semibold, fontSize: 14 }}>
                  {isResending ? "Sending..." : "Resend OTP"}
                </Text>
              </TouchableOpacity>

              {/* New Password */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontFamily: fonts.semibold, color: c.textMuted, marginBottom: 8, marginLeft: 4 }}>NEW PASSWORD</Text>
                <View style={{ position: "relative" }}>
                  <TextInput
                    style={{ ...inputStyle("password"), paddingRight: 70 }}
                    placeholder="Min 6 characters"
                    placeholderTextColor={c.textSecondary}
                    value={newPassword}
                    onChangeText={setNewPassword}
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

              {/* Confirm Password */}
              <View style={{ marginBottom: 28 }}>
                <Text style={{ fontSize: 14, fontFamily: fonts.semibold, color: c.textMuted, marginBottom: 8, marginLeft: 4 }}>CONFIRM PASSWORD</Text>
                <TextInput
                  style={inputStyle("confirm")}
                  placeholder="Re-enter password"
                  placeholderTextColor={c.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedField("confirm")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              {/* Reset Button */}
              <TouchableOpacity onPress={handleReset} disabled={isLoading} activeOpacity={0.85}>
                <LinearGradient
                  colors={isLoading ? ["#A5B4FC", "#A5B4FC"] : c.gradient.primary}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 16, paddingVertical: 18, alignItems: "center", ...shadow.md }}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: "#fff", fontSize: 18, fontFamily: fonts.bold, letterSpacing: 0.5 }}>Reset Password</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Back to Login */}
              <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 28 }}>
                <Text style={{ color: c.textSecondary, fontSize: 16, fontFamily: fonts.regular }}>Remember your password? </Text>
                <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
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
