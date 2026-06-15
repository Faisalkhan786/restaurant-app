import { useEffect, useRef, useState } from "react";
import { Animated, Text } from "react-native";

export default function AnimatedNumber({ value, style, duration = 800, prefix = "" }) {
  const animValue = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const numValue = typeof value === "string" ? parseFloat(value) || 0 : value || 0;
    animValue.setValue(0);

    const listener = animValue.addListener(({ value: v }) => {
      const formatted = numValue % 1 !== 0 ? v.toFixed(2) : Math.round(v).toString();
      setDisplay(formatted);
    });

    Animated.timing(animValue, {
      toValue: numValue,
      duration,
      useNativeDriver: false,
    }).start();

    return () => animValue.removeListener(listener);
  }, [value]);

  return <Text style={style}>{prefix}{display}</Text>;
}
