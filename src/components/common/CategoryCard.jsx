import { TouchableOpacity, Text, Image, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../hooks/useTheme";
import { fonts } from "../../utils/fonts";

export default function CategoryCard({ category, onPress, isActive }) {
  const { c, shadow } = useTheme();
  return (
    <TouchableOpacity
      style={{ alignItems: "center", marginRight: 14, ...shadow.sm }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {isActive ? (
        <LinearGradient
          colors={c.gradient.primary}
          style={{ width: 64, height: 64, borderRadius: 22, alignItems: "center", justifyContent: "center" }}
        >
          {category.image_url ? (
            <Image source={{ uri: category.image_url }} style={{ width: 60, height: 60, borderRadius: 20 }} resizeMode="cover" />
          ) : (
            <Text style={{ fontSize: 28 }}>🍽️</Text>
          )}
        </LinearGradient>
      ) : (
        <View style={{ width: 64, height: 64, borderRadius: 22, backgroundColor: c.card, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: c.border }}>
          {category.image_url ? (
            <Image source={{ uri: category.image_url }} style={{ width: 60, height: 60, borderRadius: 20 }} resizeMode="cover" />
          ) : (
            <Text style={{ fontSize: 28 }}>🍽️</Text>
          )}
        </View>
      )}
      <Text
        style={{ fontSize: 11, fontFamily: isActive ? fonts.bold : fonts.medium, marginTop: 6, color: isActive ? c.primary : c.textMuted }}
        numberOfLines={1}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}
