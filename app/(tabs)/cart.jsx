import { View, Text, FlatList, TouchableOpacity, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, updateQuantity, clearCart } from "../../src/store/slices/cartSlice";
import { CURRENCY_SYMBOL } from "../../src/constants/config";
import { useTheme } from "../../src/hooks/useTheme";
import EmptyState from "../../src/components/common/EmptyState";
import { fonts } from "../../src/utils/fonts";
import { haptic } from "../../src/utils/haptics";
import { LinearGradient } from "expo-linear-gradient";

export default function CartScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items, totalAmount, totalItems } = useSelector((state) => state.cart);
  const { c, shadow } = useTheme();

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
    <View style={{ flexDirection: "row", backgroundColor: c.card, borderRadius: 16, marginBottom: 12, padding: 12, borderWidth: 1, borderColor: c.border, ...shadow.md }}>
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={{ width: 80, height: 80, borderRadius: 12 }} resizeMode="cover" />
      ) : (
        <View style={{ width: 80, height: 80, borderRadius: 12, backgroundColor: c.bgSecondary, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 28 }}>🍔</Text>
        </View>
      )}
      <View style={{ flex: 1, marginLeft: 12, justifyContent: "space-between" }}>
        <View>
          <Text style={{ fontSize: 15, fontWeight: "bold", color: c.text, fontFamily: fonts.bold }} numberOfLines={1}>{item.name}</Text>
          {item.variation ? <Text style={{ fontSize: 11, color: c.textSecondary, marginTop: 2, fontFamily: fonts.regular }}>Variant: {item.variation}</Text> : null}
          {item.addons?.length > 0 ? <Text style={{ fontSize: 11, color: c.textSecondary, marginTop: 2, fontFamily: fonts.regular }}>+ {item.addons.join(", ")}</Text> : null}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <Text style={{ fontSize: 15, fontWeight: "bold", color: c.primary, fontFamily: fonts.bold }}>{CURRENCY_SYMBOL}{(item.price * item.quantity).toFixed(2)}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: c.bgSecondary, borderRadius: 8 }}>
            <TouchableOpacity style={{ paddingHorizontal: 12, paddingVertical: 6 }} onPress={() => { haptic.light(); item.quantity <= 1 ? handleRemove(item.id) : dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 })); }}>
              <Text style={{ fontSize: 15, fontWeight: "bold", color: c.text, fontFamily: fonts.bold }}>−</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 15, fontWeight: "bold", color: c.text, paddingHorizontal: 8, fontFamily: fonts.bold }}>{item.quantity}</Text>
            <TouchableOpacity style={{ paddingHorizontal: 12, paddingVertical: 6 }} onPress={() => { haptic.light(); dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 })); }}>
              <Text style={{ fontSize: 15, fontWeight: "bold", color: c.text, fontFamily: fonts.bold }}>+</Text>
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
      <SafeAreaView style={{ flex: 1, backgroundColor: c.bg, justifyContent: "center" }}>
        <EmptyState type="cart" actionLabel="Browse Menu" onAction={() => router.push("/(tabs)/menu")} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <View>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: c.text, fontFamily: fonts.extrabold }}>Your Cart</Text>
          <Text style={{ fontSize: 13, color: c.textSecondary, marginTop: 2, fontFamily: fonts.regular }}>{totalItems} item{totalItems !== 1 ? "s" : ""}</Text>
        </View>
        <TouchableOpacity onPress={handleClearCart}>
          <Text style={{ color: "#F44336", fontWeight: "600", fontSize: 13, fontFamily: fonts.semibold }}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <FlatList data={items} keyExtractor={(item) => item.id.toString()} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 180 }} showsVerticalScrollIndicator={false} renderItem={renderItem} />

      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: c.bg, borderTopWidth: 1, borderTopColor: c.border, paddingHorizontal: 20, paddingVertical: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
          <Text style={{ fontSize: 13, color: c.textSecondary, fontFamily: fonts.regular }}>Subtotal</Text>
          <Text style={{ fontSize: 13, color: c.text, fontWeight: "600", fontFamily: fonts.semibold }}>{CURRENCY_SYMBOL}{totalAmount.toFixed(2)}</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
          <Text style={{ fontSize: 13, color: c.textSecondary, fontFamily: fonts.regular }}>Delivery & Tax</Text>
          <Text style={{ fontSize: 13, color: c.textSecondary, fontFamily: fonts.regular }}>Calculated at checkout</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
          <Text style={{ fontSize: 17, fontWeight: "bold", color: c.text, fontFamily: fonts.bold }}>Total</Text>
          <Text style={{ fontSize: 17, fontWeight: "bold", color: c.primary, fontFamily: fonts.bold }}>{CURRENCY_SYMBOL}{totalAmount.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={{ borderRadius: 12, overflow: "hidden" }} onPress={() => router.push("/(app)/checkout")} activeOpacity={0.8}>
          <LinearGradient colors={c.gradient.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 16, alignItems: "center", borderRadius: 12 }}>
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 17, fontFamily: fonts.bold }}>Proceed to Checkout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
