import { useEffect, useRef } from "react";
import { View, Text, Animated, Easing } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { fonts } from "../../utils/fonts";

export default function SuccessAnimation({ title = "Success!", subtitle }) {
  const { c } = useTheme();
  const scale = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.5)).current;
  const ringOpacity = useRef(new Animated.Value(1)).current;
  const textFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Icon pop in with rotation
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, friction: 3, tension: 80, useNativeDriver: true }),
        Animated.timing(rotate, { toValue: 1, duration: 600, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
      ]),
      // Ring pulse out
      Animated.parallel([
        Animated.timing(ringScale, { toValue: 2, duration: 600, useNativeDriver: true }),
        Animated.timing(ringOpacity, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      // Text fade in
      Animated.timing(textFade, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-30deg", "0deg"],
  });

  return (
    <View style={{ alignItems: "center" }}>
      <View style={{ width: 120, height: 120, alignItems: "center", justifyContent: "center" }}>
        {/* Pulse ring */}
        <Animated.View
          style={{
            position: "absolute", width: 96, height: 96, borderRadius: 48,
            borderWidth: 3, borderColor: "#22C55E",
            transform: [{ scale: ringScale }], opacity: ringOpacity,
          }}
        />
        {/* Icon */}
        <Animated.View
          style={{
            width: 96, height: 96, borderRadius: 48, backgroundColor: "#DCFCE7",
            alignItems: "center", justifyContent: "center",
            transform: [{ scale }, { rotate: rotateInterpolate }],
          }}
        >
          <Text style={{ fontSize: 48 }}>✅</Text>
        </Animated.View>
      </View>

      <Animated.View style={{ alignItems: "center", opacity: textFade, marginTop: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: c.text, textAlign: "center", fontFamily: fonts.extrabold }}>{title}</Text>
        {subtitle ? (
          <Text style={{ fontSize: 15, color: c.textSecondary, marginTop: 8, textAlign: "center", fontFamily: fonts.regular }}>{subtitle}</Text>
        ) : null}
      </Animated.View>
    </View>
  );
}
