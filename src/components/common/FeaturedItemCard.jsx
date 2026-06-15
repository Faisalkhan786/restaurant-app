import { TouchableOpacity, Text, Image, View } from "react-native";
import { CURRENCY_SYMBOL } from "../../constants/config";
import { useTheme } from "../../hooks/useTheme";

export default function FeaturedItemCard({ item, onPress }) {
  const { c } = useTheme();
  return (
    <TouchableOpacity
      style={{ backgroundColor: c.card, borderRadius: 16, marginRight: 16, borderWidth: 1, borderColor: c.border, overflow: "hidden", width: 200 }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={{ width: "100%", height: 128 }} resizeMode="cover" />
      ) : (
        <View style={{ width: "100%", height: 128, backgroundColor: c.bgSecondary, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 48 }}>🍔</Text>
        </View>
      )}
      <View style={{ padding: 12 }}>
        <Text style={{ fontSize: 13, fontWeight: "bold", color: c.text }} numberOfLines={1}>{item.name}</Text>
        {item.description ? <Text style={{ fontSize: 11, color: c.textSecondary, marginTop: 4 }} numberOfLines={1}>{item.description}</Text> : null}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <Text style={{ fontSize: 15, fontWeight: "bold", color: c.primary }}>{CURRENCY_SYMBOL}{item.price}</Text>
          {item.prep_time ? <Text style={{ fontSize: 11, color: c.textSecondary }}>⏱️ {item.prep_time}m</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}
