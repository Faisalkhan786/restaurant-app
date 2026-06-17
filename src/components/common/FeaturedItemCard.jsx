import { TouchableOpacity, Text, Image, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CURRENCY_SYMBOL } from "../../constants/config";
import { useTheme } from "../../hooks/useTheme";
import { fonts } from "../../utils/fonts";

export default function FeaturedItemCard({ item, onPress }) {
  const { c, shadow } = useTheme();
  return (
    <TouchableOpacity
      style={{ backgroundColor: c.card, borderRadius: 20, marginRight: 14, overflow: "hidden", width: 200, ...shadow.md }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={{ width: "100%", height: 130 }} resizeMode="cover" />
      ) : (
        <LinearGradient
          colors={[c.bgSecondary, c.border]}
          style={{ width: "100%", height: 130, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ fontSize: 48 }}>🍔</Text>
        </LinearGradient>
      )}
      {/* Featured badge */}
      <View style={{ position: "absolute", top: 10, left: 10, backgroundColor: "rgba(79,70,229,0.9)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
        <Text style={{ color: "#fff", fontSize: 12, fontFamily: fonts.bold }}>⭐ FEATURED</Text>
      </View>
      <View style={{ padding: 14 }}>
        <Text style={{ fontSize: 14, fontFamily: fonts.bold, color: c.text }} numberOfLines={1}>{item.name}</Text>
        {item.description ? <Text style={{ fontSize: 14, fontFamily: fonts.regular, color: c.textSecondary, marginTop: 4 }} numberOfLines={1}>{item.description}</Text> : null}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
          <Text style={{ fontSize: 18, fontFamily: fonts.extrabold, color: c.primary }}>{CURRENCY_SYMBOL}{item.price}</Text>
          {item.prep_time ? <Text style={{ fontSize: 14, fontFamily: fonts.medium, color: c.textSecondary }}>⏱ {item.prep_time}m</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}
