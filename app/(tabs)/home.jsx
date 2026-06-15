import { View, Text, FlatList, ScrollView, TextInput, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { useGetFullMenuQuery } from "../../src/store/api/menuApi";
import { addToCart } from "../../src/store/slices/cartSlice";
import CategoryCard from "../../src/components/common/CategoryCard";
import FeaturedItemCard from "../../src/components/common/FeaturedItemCard";
import MenuItemCard from "../../src/components/common/MenuItemCard";
import AnimatedLoading from "../../src/components/common/AnimatedLoading";
import ErrorScreen from "../../src/components/common/ErrorScreen";
import EmptyState from "../../src/components/common/EmptyState";
import { MenuItemSkeleton, CategorySkeleton } from "../../src/components/common/SkeletonLoader";
import Toast from "react-native-toast-message";
import { useTheme } from "../../src/hooks/useTheme";
import { useDebounce } from "../../src/hooks/useDebounce";
import { useState, useMemo } from "react";
import { fonts } from "../../src/utils/fonts";

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { data, isLoading, isFetching, error, refetch } = useGetFullMenuQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { c, shadow } = useTheme();

  const categories = data?.data || [];
  const featuredItems = useMemo(() => categories.flatMap((cat) => (cat.items || []).filter((item) => item.is_featured)), [categories]);
  const allItems = useMemo(() => categories.flatMap((cat) => cat.items || []), [categories]);
  const searchResults = useMemo(() => {
    if (!debouncedSearch.trim()) return [];
    const query = debouncedSearch.toLowerCase();
    return allItems.filter((item) => item.name.toLowerCase().includes(query) || item.description?.toLowerCase().includes(query));
  }, [searchQuery, allItems]);

  const handleItemPress = (item) => router.push(`/(app)/item/${item.id}`);
  const handleAddToCart = (item) => {
    dispatch(addToCart({ id: item.id, name: item.name, price: item.price, image_url: item.image_url }));
    Toast.show({ type: "cart", text1: "Added to Cart", text2: item.name, visibilityTime: 1500 });
  };
  const handleCategoryPress = (category) => router.push(`/(app)/category/${category.id}`);

  if (isLoading) return <AnimatedLoading message="Loading menu..." />;
  if (error) return <ErrorScreen message="Failed to load menu" onRetry={refetch} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={c.primary} />}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ color: c.textSecondary, fontSize: 13, fontFamily: fonts.regular }}>Hello, {user?.name || "Guest"} 👋</Text>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: c.text, marginTop: 4, fontFamily: fonts.extrabold }}>What would you like to eat?</Text>
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: 20, marginTop: 12, marginBottom: 16 }}>
          <View style={{ backgroundColor: c.inputBg, borderRadius: 12, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text style={{ marginRight: 8, fontSize: 17 }}>🔍</Text>
            <TextInput
              style={{ flex: 1, fontSize: 15, color: c.text, fontFamily: fonts.regular }}
              placeholder="Search dishes..."
              placeholderTextColor={c.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Text style={{ color: c.textSecondary, fontSize: 17 }}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {debouncedSearch.trim() ? (
          <View style={{ paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 17, fontWeight: "bold", color: c.text, marginBottom: 12, fontFamily: fonts.bold }}>Results ({searchResults.length})</Text>
            {searchResults.length === 0 ? (
              <EmptyState type="search" />
            ) : (
              searchResults.map((item) => <MenuItemCard key={item.id} item={item} onPress={() => handleItemPress(item)} onAddToCart={handleAddToCart} />)
            )}
          </View>
        ) : (
          <>
            {categories.length > 0 ? (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 17, fontWeight: "bold", color: c.text, paddingHorizontal: 20, marginBottom: 12, fontFamily: fonts.bold }}>Categories</Text>
                <FlatList data={categories} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }} keyExtractor={(item) => item.id.toString()} renderItem={({ item }) => <CategoryCard category={item} onPress={() => handleCategoryPress(item)} />} />
              </View>
            ) : null}

            {featuredItems.length > 0 ? (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 17, fontWeight: "bold", color: c.text, paddingHorizontal: 20, marginBottom: 12, fontFamily: fonts.bold }}>⭐ Featured</Text>
                <FlatList data={featuredItems} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }} keyExtractor={(item) => `featured-${item.id}`} renderItem={({ item }) => <FeaturedItemCard item={item} onPress={() => handleItemPress(item)} />} />
              </View>
            ) : null}

            <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
              <Text style={{ fontSize: 17, fontWeight: "bold", color: c.text, marginBottom: 12, fontFamily: fonts.bold }}>🔥 Popular Items</Text>
              {allItems.slice(0, 6).map((item) => <MenuItemCard key={item.id} item={item} onPress={() => handleItemPress(item)} onAddToCart={handleAddToCart} />)}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
