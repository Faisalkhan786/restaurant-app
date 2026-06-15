import { TouchableOpacity, Text, Image, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CURRENCY_SYMBOL } from "../../constants/config";
import { useTheme } from "../../hooks/useTheme";
import { fonts } from "../../utils/fonts";
import { haptic } from "../../utils/haptics";

export default function MenuItemCard({ item, onPress, onAddToCart }) {
  const { c, shadow } = useTheme();
  return (
    <TouchableOpacity
      style={{
        backgroundColor: c.card, borderRadius: 20, marginBottom: 16,
        overflow: "hidden", flexDirection: "row", ...shadow.md,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={{ width: 120, height: 120 }} resizeMode="cover" />
      ) : (
        <LinearGradient
          colors={[c.bgSecondary, c.border]}
          style={{ width: 120, height: 120, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ fontSize: 40 }}>🍔</Text>
        </LinearGradient>
      )}
      <View style={{ flex: 1, padding: 14, justifyContent: "space-between" }}>
        <View>
          <Text style={{ fontSize: 16, fontFamily: fonts.bold, color: c.text }} numberOfLines={1}>{item.name}</Text>
          {item.description ? <Text style={{ fontSize: 12, fontFamily: fonts.regular, color: c.textSecondary, marginTop: 4, lineHeight: 16 }} numberOfLines={2}>{item.description}</Text> : null}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <Text style={{ fontSize: 18, fontFamily: fonts.extrabold, color: c.primary }}>{CURRENCY_SYMBOL}{item.price}</Text>
          {item.prep_time ? <Text style={{ fontSize: 11, fontFamily: fonts.medium, color: c.textSecondary }}>⏱ {item.prep_time}m</Text> : null}
          <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); haptic.light(); onAddToCart?.(item); }} activeOpacity={0.8}>
            <LinearGradient
              colors={c.gradient.primary}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ paddingHorizontal: 18, paddingVertical: 7, borderRadius: 10 }}
            >
              <Text style={{ color: "#fff", fontSize: 13, fontFamily: fonts.bold }}>ADD</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
