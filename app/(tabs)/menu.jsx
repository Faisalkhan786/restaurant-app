import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { useGetFullMenuQuery } from "../../src/store/api/menuApi";
import { addToCart } from "../../src/store/slices/cartSlice";
import MenuItemCard from "../../src/components/common/MenuItemCard";
import AnimatedLoading from "../../src/components/common/AnimatedLoading";
import ErrorScreen from "../../src/components/common/ErrorScreen";
import EmptyState from "../../src/components/common/EmptyState";
import Toast from "react-native-toast-message";
import { useTheme } from "../../src/hooks/useTheme";
import { useState, useMemo } from "react";
import { fonts } from "../../src/utils/fonts";

export default function MenuScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data, isLoading, isFetching, error, refetch } = useGetFullMenuQuery();
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const { c, shadow } = useTheme();

  const categories = data?.data || [];
  const selectedCategoryId = activeCategoryId || categories[0]?.id;
  const items = useMemo(() => {
    if (!selectedCategoryId) return [];
    const category = categories.find((cat) => cat.id === selectedCategoryId);
    return category?.items || [];
  }, [selectedCategoryId, categories]);

  const handleItemPress = (item) => router.push(`/(app)/item/${item.id}`);
  const handleAddToCart = (item) => {
    dispatch(addToCart({ id: item.id, name: item.name, price: item.price, image_url: item.image_url }));
    Toast.show({ type: "cart", text1: "Added to Cart", text2: item.name, visibilityTime: 1500 });
  };

  if (isLoading) return <AnimatedLoading message="Loading menu..." />;
  if (error) return <ErrorScreen message="Failed to load menu" onRetry={refetch} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: c.text, fontFamily: fonts.extrabold }}>Our Menu</Text>
      </View>

      {/* Category Tabs */}
      <View style={{ marginBottom: 8 }}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                paddingHorizontal: 20, paddingVertical: 10, marginRight: 8, borderRadius: 20,
                backgroundColor: selectedCategoryId === item.id ? c.primary : c.bgSecondary,
              }}
              onPress={() => setActiveCategoryId(item.id)}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: selectedCategoryId === item.id ? "#fff" : c.textMuted, fontFamily: fonts.semibold }}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={c.primary} />}
        renderItem={({ item }) => <MenuItemCard item={item} onPress={() => handleItemPress(item)} onAddToCart={handleAddToCart} />}
        ListEmptyComponent={<EmptyState type="menu" />}
      />
    </SafeAreaView>
  );
}
