import { TouchableOpacity, Text, Image, View } from "react-native";
import { useTheme } from "../../hooks/useTheme";

export default function CategoryCard({ category, onPress, isActive }) {
  const { c } = useTheme();
  return (
    <TouchableOpacity
      style={{
        alignItems: "center", marginRight: 16, paddingHorizontal: 12, paddingVertical: 8,
        borderRadius: 16, backgroundColor: isActive ? c.primary : c.bgSecondary,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {category.image_url ? (
        <Image source={{ uri: category.image_url }} style={{ width: 56, height: 56, borderRadius: 28, marginBottom: 4 }} resizeMode="cover" />
      ) : (
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: c.border, alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
          <Text style={{ fontSize: 24 }}>🍽️</Text>
        </View>
      )}
      <Text style={{ fontSize: 11, fontWeight: "600", marginTop: 4, color: isActive ? "#fff" : c.text }} numberOfLines={1}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}
