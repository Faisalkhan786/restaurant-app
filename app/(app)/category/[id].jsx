import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { useGetByCategoryQuery } from "../../../src/store/api/menuApi";
import { addToCart } from "../../../src/store/slices/cartSlice";
import MenuItemCard from "../../../src/components/common/MenuItemCard";
import LoadingScreen from "../../../src/components/common/LoadingScreen";
import ErrorScreen from "../../../src/components/common/ErrorScreen";
import Toast from "react-native-toast-message";
import { useTheme } from "../../../src/hooks/useTheme";

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { c } = useTheme();
  const { data, isLoading, error, refetch } = useGetByCategoryQuery(id);

  const category = data?.data;
  const items = category?.items || [];

  const handleItemPress = (item) => {
    router.push(`/(app)/item/${item.id}`);
  };

  const handleAddToCart = (item) => {
    dispatch(addToCart({ id: item.id, name: item.name, price: item.price, image_url: item.image_url }));
    Toast.show({ type: "cart", text1: "Added to Cart", text2: item.name, visibilityTime: 1500 });
  };

  if (isLoading) return <LoadingScreen message="Loading category..." />;
  if (error) return <ErrorScreen message="Category not found" onRetry={refetch} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <TouchableOpacity
          style={{ marginRight: 12, width: 40, height: 40, borderRadius: 20, backgroundColor: c.bgSecondary, alignItems: "center", justifyContent: "center" }}
          onPress={() => router.back()}
        >
          <Text style={{ fontSize: 18, color: c.text }}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: c.text }}>
            {category?.name || "Category"}
          </Text>
          <Text style={{ fontSize: 14, color: c.textSecondary }}>
            {items.length} item{items.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      {/* Items */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <MenuItemCard
            item={item}
            onPress={() => handleItemPress(item)}
            onAddToCart={handleAddToCart}
          />
        )}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <Text style={{ fontSize: 36, marginBottom: 12 }}>🍽️</Text>
            <Text style={{ color: c.textSecondary, fontSize: 16 }}>
              No items available in this category
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
