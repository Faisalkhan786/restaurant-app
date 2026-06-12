import { View, Text, FlatList, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { useGetFullMenuQuery } from "../../src/store/api/menuApi";
import { addToCart } from "../../src/store/slices/cartSlice";
import CategoryCard from "../../src/components/common/CategoryCard";
import FeaturedItemCard from "../../src/components/common/FeaturedItemCard";
import MenuItemCard from "../../src/components/common/MenuItemCard";
import LoadingScreen from "../../src/components/common/LoadingScreen";
import ErrorScreen from "../../src/components/common/ErrorScreen";
import Toast from "react-native-toast-message";
import { useState, useMemo } from "react";

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { data, isLoading, error, refetch } = useGetFullMenuQuery();
  const [searchQuery, setSearchQuery] = useState("");

  const categories = data?.data || [];

  // Get all featured items across categories
  const featuredItems = useMemo(() => {
    return categories.flatMap((cat) =>
      (cat.items || []).filter((item) => item.is_featured)
    );
  }, [categories]);

  // Get all items for search
  const allItems = useMemo(() => {
    return categories.flatMap((cat) => cat.items || []);
  }, [categories]);

  // Filter items by search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
    );
  }, [searchQuery, allItems]);

  const handleItemPress = (item) => {
    router.push(`/(app)/item/${item.id}`);
  };

  const handleAddToCart = (item) => {
    dispatch(addToCart({ id: item.id, name: item.name, price: item.price, image_url: item.image_url }));
    Toast.show({ type: "cart", text1: "Added to Cart", text2: item.name, visibilityTime: 1500 });
  };

  const handleCategoryPress = (category) => {
    router.push(`/(app)/category/${category.id}`);
  };

  if (isLoading) return <LoadingScreen message="Loading menu..." />;
  if (error) return <ErrorScreen message="Failed to load menu" onRetry={refetch} />;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-gray-medium text-sm">
            Hello, {user?.name || "Guest"} 👋
          </Text>
          <Text className="text-2xl font-bold text-dark mt-1">
            What would you like to eat?
          </Text>
        </View>

        {/* Search Bar */}
        <View className="px-5 mt-3 mb-4">
          <View className="bg-gray-light rounded-xl flex-row items-center px-4 py-3">
            <Text className="mr-2 text-lg">🔍</Text>
            <TextInput
              className="flex-1 text-base text-dark"
              placeholder="Search dishes..."
              placeholderTextColor="#9E9E9E"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Text className="text-gray-medium text-lg">✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Search Results */}
        {searchQuery.trim() ? (
          <View className="px-5">
            <Text className="text-lg font-bold text-dark mb-3">
              Results ({searchResults.length})
            </Text>
            {searchResults.length === 0 ? (
              <View className="items-center py-8">
                <Text className="text-4xl mb-2">🔍</Text>
                <Text className="text-gray-medium">No items found</Text>
              </View>
            ) : (
              searchResults.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onPress={() => handleItemPress(item)}
                  onAddToCart={handleAddToCart}
                />
              ))
            )}
          </View>
        ) : (
          <>
            {/* Categories */}
            {categories.length > 0 ? (
              <View className="mb-4">
                <Text className="text-lg font-bold text-dark px-5 mb-3">
                  Categories
                </Text>
                <FlatList
                  data={categories}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <CategoryCard
                      category={item}
                      onPress={() => handleCategoryPress(item)}
                    />
                  )}
                />
              </View>
            ) : null}

            {/* Featured Items */}
            {featuredItems.length > 0 ? (
              <View className="mb-4">
                <Text className="text-lg font-bold text-dark px-5 mb-3">
                  ⭐ Featured
                </Text>
                <FlatList
                  data={featuredItems}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                  keyExtractor={(item) => `featured-${item.id}`}
                  renderItem={({ item }) => (
                    <FeaturedItemCard
                      item={item}
                      onPress={() => handleItemPress(item)}
                    />
                  )}
                />
              </View>
            ) : null}

            {/* Popular Items (first 6 items) */}
            <View className="px-5 mb-6">
              <Text className="text-lg font-bold text-dark mb-3">
                🔥 Popular Items
              </Text>
              {allItems.slice(0, 6).map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onPress={() => handleItemPress(item)}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
