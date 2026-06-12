import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { useGetFullMenuQuery } from "../../src/store/api/menuApi";
import { addToCart } from "../../src/store/slices/cartSlice";
import MenuItemCard from "../../src/components/common/MenuItemCard";
import LoadingScreen from "../../src/components/common/LoadingScreen";
import ErrorScreen from "../../src/components/common/ErrorScreen";
import Toast from "react-native-toast-message";
import { useState, useMemo } from "react";

export default function MenuScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data, isLoading, error, refetch } = useGetFullMenuQuery();
  const [activeCategoryId, setActiveCategoryId] = useState(null);

  const categories = data?.data || [];

  // Set first category as active by default
  const selectedCategoryId = activeCategoryId || categories[0]?.id;

  // Get items for selected category
  const items = useMemo(() => {
    if (!selectedCategoryId) return [];
    const category = categories.find((c) => c.id === selectedCategoryId);
    return category?.items || [];
  }, [selectedCategoryId, categories]);

  const handleItemPress = (item) => {
    router.push(`/(app)/item/${item.id}`);
  };

  const handleAddToCart = (item) => {
    dispatch(addToCart({ id: item.id, name: item.name, price: item.price, image_url: item.image_url }));
    Toast.show({ type: "cart", text1: "Added to Cart", text2: item.name, visibilityTime: 1500 });
  };

  if (isLoading) return <LoadingScreen message="Loading menu..." />;
  if (error) return <ErrorScreen message="Failed to load menu" onRetry={refetch} />;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-4 pb-3">
        <Text className="text-2xl font-bold text-dark">Our Menu</Text>
      </View>

      {/* Category Tabs */}
      <View className="mb-2">
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`px-5 py-2.5 mr-2 rounded-full ${
                selectedCategoryId === item.id
                  ? "bg-primary"
                  : "bg-gray-light"
              }`}
              onPress={() => setActiveCategoryId(item.id)}
              activeOpacity={0.7}
            >
              <Text
                className={`text-sm font-semibold ${
                  selectedCategoryId === item.id
                    ? "text-white"
                    : "text-gray-dark"
                }`}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Items List */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <MenuItemCard
            item={item}
            onPress={() => handleItemPress(item)}
            onAddToCart={handleAddToCart}
          />
        )}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-4xl mb-3">🍽️</Text>
            <Text className="text-gray-medium text-base">
              No items in this category
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
