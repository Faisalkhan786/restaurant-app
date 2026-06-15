import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { useGetByCategoryQuery } from "../../../src/store/api/menuApi";
import { addToCart } from "../../../src/store/slices/cartSlice";
import MenuItemCard from "../../../src/components/common/MenuItemCard";
import AnimatedLoading from "../../../src/components/common/AnimatedLoading";
import ErrorScreen from "../../../src/components/common/ErrorScreen";
import EmptyState from "../../../src/components/common/EmptyState";
import Toast from "react-native-toast-message";
import { useTheme } from "../../../src/hooks/useTheme";
import { fonts } from "../../../src/utils/fonts";

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { c, shadow } = useTheme();
  const { data, isLoading, error, refetch } = useGetByCategoryQuery(id);

  const category = data?.data;
  const items = category?.items || [];

  const handleItemPress = (item) => router.push(`/(app)/item/${item.id}`);
  const handleAddToCart = (item) => {
    dispatch(addToCart({ id: item.id, name: item.name, price: item.price, image_url: item.image_url }));
    Toast.show({ type: "cart", text1: "Added to Cart", text2: item.name, visibilityTime: 1500 });
  };

  if (isLoading) return <AnimatedLoading message="Loading category..." />;
  if (error) return <ErrorScreen message="Category not found" onRetry={refetch} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Header */}
      <View style={{
        flexDirection: "row", alignItems: "center", paddingHorizontal: 20,
        paddingTop: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: c.border,
      }}>
        <TouchableOpacity
          style={{
            width: 42, height: 42, borderRadius: 14, backgroundColor: c.card,
            alignItems: "center", justifyContent: "center", ...shadow.sm,
          }}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color={c.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={{ fontSize: 20, fontFamily: fonts.bold, color: c.text }}>
            {category?.name || "Category"}
          </Text>
          <Text style={{ fontSize: 13, fontFamily: fonts.regular, color: c.textSecondary, marginTop: 2 }}>
            {items.length} item{items.length !== 1 ? "s" : ""} available
          </Text>
        </View>
      </View>

      {/* Items */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <MenuItemCard item={item} onPress={() => handleItemPress(item)} onAddToCart={handleAddToCart} />
        )}
        ListEmptyComponent={<EmptyState type="menu" />}
      />
    </SafeAreaView>
  );
}
