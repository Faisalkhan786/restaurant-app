import { useEffect, useRef } from "react";
import { View, Animated, Easing } from "react-native";
import { useTheme } from "../../hooks/useTheme";

function SkeletonBox({ width, height, borderRadius = 8, style }) {
  const { isDark } = useTheme();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1000, easing: Easing.ease, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1000, easing: Easing.ease, useNativeDriver: true }),
      ])
    ).start();
    return () => shimmer.stopAnimation();
  }, []);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[{
        width, height, borderRadius,
        backgroundColor: isDark ? "#2A2A3E" : "#E5E7EB",
        opacity,
      }, style]}
    />
  );
}

// Pre-built skeleton layouts
export function MenuItemSkeleton() {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: "row", backgroundColor: c.card, borderRadius: 16, marginBottom: 16, padding: 12, borderWidth: 1, borderColor: c.border }}>
      <SkeletonBox width={100} height={100} borderRadius={12} />
      <View style={{ flex: 1, marginLeft: 12, justifyContent: "space-between" }}>
        <SkeletonBox width="70%" height={16} />
        <SkeletonBox width="90%" height={12} style={{ marginTop: 8 }} />
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
          <SkeletonBox width={60} height={20} />
          <SkeletonBox width={60} height={28} borderRadius={8} />
        </View>
      </View>
    </View>
  );
}

export function CategorySkeleton() {
  return (
    <View style={{ alignItems: "center", marginRight: 16 }}>
      <SkeletonBox width={56} height={56} borderRadius={28} />
      <SkeletonBox width={40} height={10} style={{ marginTop: 8 }} />
    </View>
  );
}

export function OrderCardSkeleton() {
  const { c } = useTheme();
  return (
    <View style={{ backgroundColor: c.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: c.border }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
        <SkeletonBox width={120} height={16} />
        <SkeletonBox width={70} height={22} borderRadius={10} />
      </View>
      <SkeletonBox width="80%" height={12} />
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.border }}>
        <SkeletonBox width={100} height={12} />
        <SkeletonBox width={60} height={16} />
      </View>
    </View>
  );
}

export function DashboardSkeleton() {
  const { c } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingHorizontal: 20, paddingTop: 20 }}>
      <SkeletonBox width="50%" height={20} style={{ marginBottom: 8 }} />
      <SkeletonBox width="70%" height={28} style={{ marginBottom: 20 }} />
      <SkeletonBox width="100%" height={180} borderRadius={24} style={{ marginBottom: 20 }} />
      <View style={{ flexDirection: "row", marginBottom: 8 }}>
        <SkeletonBox width="48%" height={100} borderRadius={16} style={{ marginRight: "4%" }} />
        <SkeletonBox width="48%" height={100} borderRadius={16} />
      </View>
      <View style={{ flexDirection: "row" }}>
        <SkeletonBox width="48%" height={100} borderRadius={16} style={{ marginRight: "4%" }} />
        <SkeletonBox width="48%" height={100} borderRadius={16} />
      </View>
    </View>
  );
}

export default SkeletonBox;
