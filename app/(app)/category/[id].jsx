import { View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { useGetByCategoryQuery } from "../../../src/store/api/menuApi";
import { addToCart } from "../../../src/store/slices/cartSlice";
import MenuItemCard from "../../../src/components/common/MenuItemCard";
import LoadingScreen from "../../../src/components/common/LoadingScreen";
import ErrorScreen from "../../../src/components/common/ErrorScreen";
import Toast from "react-native-toast-message";
import { TouchableOpacity } from "react-native";

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
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
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-3">
        <TouchableOpacity
          className="mr-3 w-10 h-10 rounded-full bg-gray-light items-center justify-center"
          onPress={() => router.back()}
        >
          <Text className="text-lg">←</Text>
        </TouchableOpacity>
        <View>
          <Text className="text-2xl font-bold text-dark">
            {category?.name || "Category"}
          </Text>
          <Text className="text-sm text-gray-medium">
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
          <View className="items-center py-12">
            <Text className="text-4xl mb-3">🍽️</Text>
            <Text className="text-gray-medium text-base">
              No items available in this category
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
