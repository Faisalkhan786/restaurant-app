import { useEffect, useRef } from "react";
import { View, Text, Animated, Easing, TouchableOpacity } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { fonts } from "../../utils/fonts";

const PRESETS = {
  cart: { icon: "🛒", title: "Cart is Empty", subtitle: "Add some delicious items from our menu" },
  orders: { icon: "📦", title: "No Orders Yet", subtitle: "Your order history will appear here" },
  search: { icon: "🔍", title: "No Results", subtitle: "Try a different search term" },
  menu: { icon: "🍽️", title: "No Items", subtitle: "No items available in this category" },
  address: { icon: "📍", title: "No Addresses", subtitle: "Add a delivery address to get started" },
  staff: { icon: "👥", title: "No Staff Yet", subtitle: "Add delivery partners to start assigning orders" },
  error: { icon: "😕", title: "Something Went Wrong", subtitle: "Please try again" },
};

export default function EmptyState({ type = "cart", title, subtitle, actionLabel, onAction }) {
  const { c } = useTheme();
  const preset = PRESETS[type] || PRESETS.cart;
  const scale = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideUp, { toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={{ alignItems: "center", paddingVertical: 48, paddingHorizontal: 32 }}>
      <Animated.Text style={{ fontSize: 72, transform: [{ scale }] }}>
        {preset.icon}
      </Animated.Text>

      <Animated.View style={{ alignItems: "center", opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: c.text, marginTop: 16, textAlign: "center", fontFamily: fonts.bold }}>
          {title || preset.title}
        </Text>
        <Text style={{ fontSize: 14, color: c.textSecondary, marginTop: 8, textAlign: "center", lineHeight: 20, fontFamily: fonts.regular }}>
          {subtitle || preset.subtitle}
        </Text>

        {actionLabel && onAction ? (
          <TouchableOpacity
            style={{ backgroundColor: c.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, marginTop: 20 }}
            onPress={onAction}
            activeOpacity={0.8}
          >
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 15, fontFamily: fonts.bold }}>{actionLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </Animated.View>
    </View>
  );
}
