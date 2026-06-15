import { TouchableOpacity, Text, Image, View } from "react-native";
import { CURRENCY_SYMBOL } from "../../constants/config";
import { useTheme } from "../../hooks/useTheme";

export default function MenuItemCard({ item, onPress, onAddToCart }) {
  const { c } = useTheme();
  return (
    <TouchableOpacity
      style={{ backgroundColor: c.card, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: c.border, overflow: "hidden", flexDirection: "row" }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={{ width: 112, height: 112 }} resizeMode="cover" />
      ) : (
        <View style={{ width: 112, height: 112, backgroundColor: c.bgSecondary, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 36 }}>🍔</Text>
        </View>
      )}
      <View style={{ flex: 1, padding: 12, justifyContent: "space-between" }}>
        <View>
          <Text style={{ fontSize: 15, fontWeight: "bold", color: c.text }} numberOfLines={1}>{item.name}</Text>
          {item.description ? <Text style={{ fontSize: 11, color: c.textSecondary, marginTop: 4 }} numberOfLines={2}>{item.description}</Text> : null}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <Text style={{ fontSize: 17, fontWeight: "bold", color: c.primary }}>{CURRENCY_SYMBOL}{item.price}</Text>
          {item.prep_time ? <Text style={{ fontSize: 11, color: c.textSecondary }}>⏱️ {item.prep_time} min</Text> : null}
          <TouchableOpacity
            style={{ backgroundColor: c.primary, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 }}
            onPress={(e) => { e.stopPropagation?.(); onAddToCart?.(item); }}
            activeOpacity={0.7}
          >
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "bold" }}>ADD</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
