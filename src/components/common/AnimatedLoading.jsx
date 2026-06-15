import { useEffect, useRef } from "react";
import { View, Text, Animated, Easing } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { fonts } from "../../utils/fonts";

export default function AnimatedLoading({ message = "Loading..." }) {
  const { c } = useTheme();
  const bounce1 = useRef(new Animated.Value(0)).current;
  const bounce2 = useRef(new Animated.Value(0)).current;
  const bounce3 = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createBounce = (anim, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: -18, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 300, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        ])
      );

    const spinAnim = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true })
    );

    createBounce(bounce1, 0).start();
    createBounce(bounce2, 150).start();
    createBounce(bounce3, 300).start();
    spinAnim.start();

    return () => {
      bounce1.stopAnimation();
      bounce2.stopAnimation();
      bounce3.stopAnimation();
      spin.stopAnimation();
    };
  }, []);

  const spinInterpolate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: c.bg }}>
      {/* Spinning plate */}
      <Animated.Text style={{ fontSize: 56, transform: [{ rotate: spinInterpolate }], marginBottom: 24 }}>
        🍽️
      </Animated.Text>

      {/* Bouncing dots */}
      <View style={{ flexDirection: "row", alignItems: "flex-end", height: 30, marginBottom: 16 }}>
        {[bounce1, bounce2, bounce3].map((anim, i) => (
          <Animated.View
            key={i}
            style={{
              width: 10, height: 10, borderRadius: 5, backgroundColor: c.primary,
              marginHorizontal: 4, transform: [{ translateY: anim }],
            }}
          />
        ))}
      </View>

      <Text style={{ color: c.textSecondary, fontSize: 14, fontFamily: fonts.regular }}>{message}</Text>
    </View>
  );
}
