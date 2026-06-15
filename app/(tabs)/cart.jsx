import { View, Text, FlatList, TouchableOpacity, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, updateQuantity, clearCart } from "../../src/store/slices/cartSlice";
import { CURRENCY_SYMBOL } from "../../src/constants/config";
import { useTheme } from "../../src/hooks/useTheme";

export default function CartScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items, totalAmount, totalItems } = useSelector((state) => state.cart);
  const { c } = useTheme();

  const handleRemove = (id) => {
    Alert.alert("Remove Item", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => dispatch(removeFromCart(id)) },
    ]);
  };

  const handleClearCart = () => {
    Alert.alert("Clear Cart", "Remove all items?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: () => dispatch(clearCart()) },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={{ flexDirection: "row", backgroundColor: c.card, borderRadius: 16, marginBottom: 12, padding: 12, borderWidth: 1, borderColor: c.border }}>
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={{ width: 80, height: 80, borderRadius: 12 }} resizeMode="cover" />
      ) : (
        <View style={{ width: 80, height: 80, borderRadius: 12, backgroundColor: c.bgSecondary, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 28 }}>🍔</Text>
        </View>
      )}
      <View style={{ flex: 1, marginLeft: 12, justifyContent: "space-between" }}>
        <View>
          <Text style={{ fontSize: 15, fontWeight: "bold", color: c.text }} numberOfLines={1}>{item.name}</Text>
          {item.variation ? <Text style={{ fontSize: 11, color: c.textSecondary, marginTop: 2 }}>Variant: {item.variation}</Text> : null}
          {item.addons?.length > 0 ? <Text style={{ fontSize: 11, color: c.textSecondary, marginTop: 2 }}>+ {item.addons.join(", ")}</Text> : null}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <Text style={{ fontSize: 15, fontWeight: "bold", color: c.primary }}>{CURRENCY_SYMBOL}{(item.price * item.quantity).toFixed(2)}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: c.bgSecondary, borderRadius: 8 }}>
            <TouchableOpacity style={{ paddingHorizontal: 12, paddingVertical: 6 }} onPress={() => item.quantity <= 1 ? handleRemove(item.id) : dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}>
              <Text style={{ fontSize: 15, fontWeight: "bold", color: c.text }}>−</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 15, fontWeight: "bold", color: c.text, paddingHorizontal: 8 }}>{item.quantity}</Text>
            <TouchableOpacity style={{ paddingHorizontal: 12, paddingVertical: 6 }} onPress={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}>
              <Text style={{ fontSize: 15, fontWeight: "bold", color: c.text }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <TouchableOpacity style={{ position: "absolute", top: 8, right: 8 }} onPress={() => handleRemove(item.id)}>
        <Text style={{ color: c.textSecondary, fontSize: 17 }}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  if (items.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 56, marginBottom: 16 }}>🛒</Text>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: c.text }}>Cart is Empty</Text>
          <Text style={{ color: c.textSecondary, marginTop: 8, textAlign: "center" }}>Add some delicious items from our menu</Text>
          <TouchableOpacity style={{ backgroundColor: c.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, marginTop: 24 }} onPress={() => router.push("/(tabs)/menu")} activeOpacity={0.8}>
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <View>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: c.text }}>Your Cart</Text>
          <Text style={{ fontSize: 13, color: c.textSecondary, marginTop: 2 }}>{totalItems} item{totalItems !== 1 ? "s" : ""}</Text>
        </View>
        <TouchableOpacity onPress={handleClearCart}>
          <Text style={{ color: "#F44336", fontWeight: "600", fontSize: 13 }}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <FlatList data={items} keyExtractor={(item) => item.id.toString()} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 180 }} showsVerticalScrollIndicator={false} renderItem={renderItem} />

      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: c.bg, borderTopWidth: 1, borderTopColor: c.border, paddingHorizontal: 20, paddingVertical: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
          <Text style={{ fontSize: 13, color: c.textSecondary }}>Subtotal</Text>
          <Text style={{ fontSize: 13, color: c.text, fontWeight: "600" }}>{CURRENCY_SYMBOL}{totalAmount.toFixed(2)}</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
          <Text style={{ fontSize: 13, color: c.textSecondary }}>Delivery & Tax</Text>
          <Text style={{ fontSize: 13, color: c.textSecondary }}>Calculated at checkout</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
          <Text style={{ fontSize: 17, fontWeight: "bold", color: c.text }}>Total</Text>
          <Text style={{ fontSize: 17, fontWeight: "bold", color: c.primary }}>{CURRENCY_SYMBOL}{totalAmount.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={{ backgroundColor: c.primary, paddingVertical: 16, borderRadius: 12, alignItems: "center" }} onPress={() => router.push("/(app)/checkout")} activeOpacity={0.8}>
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 17 }}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
