import { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useGetAdminCategoriesQuery,
  useGetAdminItemsQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
} from "../../src/store/api/adminApi";
import { useTheme } from "../../src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { fonts } from "../../src/utils/fonts";
import { haptic } from "../../src/utils/haptics";
import { CURRENCY_SYMBOL } from "../../src/constants/config";
import ImagePickerBox from "../../src/components/common/ImagePickerBox";

export default function AdminItemFormScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { c, shadow } = useTheme();
  const isEdit = !!id;

  const { data: catData } = useGetAdminCategoriesQuery();
  const { data: itemsData } = useGetAdminItemsQuery({}, { skip: !isEdit });
  const [createItem, { isLoading: isCreating }] = useCreateItemMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation();
  const isLoading = isCreating || isUpdating;

  const categories = catData?.data || [];
  const existingItem = isEdit ? (itemsData?.data || []).find((i) => i.id === parseInt(id)) : null;

  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [variations, setVariations] = useState([]);
  const [addons, setAddons] = useState([]);
  const [imageUri, setImageUri] = useState(null);


  // Load existing item data
  useEffect(() => {
    if (existingItem) {
      setCategoryId(existingItem.category_id?.toString() || "");
      setName(existingItem.name || "");
      setDescription(existingItem.description || "");
      setPrice(existingItem.price?.toString() || "");
      setPrepTime(existingItem.prep_time?.toString() || "");
      setIsFeatured(existingItem.is_featured || false);
      setIsAvailable(existingItem.is_available !== false);
      setVariations(existingItem.variations?.map((v) => ({ name: v.name, price: v.price.toString() })) || []);
      setAddons(existingItem.addons?.map((a) => ({ name: a.name, price: a.price.toString() })) || []);
      if (existingItem.image_url) setImageUri(existingItem.image_url);
    }
  }, [existingItem]);

  const addVariation = () => setVariations([...variations, { name: "", price: "" }]);
  const removeVariation = (index) => setVariations(variations.filter((_, i) => i !== index));
  const updateVariation = (index, field, value) => {
    const updated = [...variations];
    updated[index][field] = value;
    setVariations(updated);
  };

  const addAddon = () => setAddons([...addons, { name: "", price: "" }]);
  const removeAddon = (index) => setAddons(addons.filter((_, i) => i !== index));
  const updateAddon = (index, field, value) => {
    const updated = [...addons];
    updated[index][field] = value;
    setAddons(updated);
  };

  const handleSave = async () => {
    if (!categoryId) { Alert.alert("Error", "Please select a category"); return; }
    if (!name.trim()) { Alert.alert("Error", "Item name is required"); return; }
    if (!price || parseFloat(price) <= 0) { Alert.alert("Error", "Valid price is required"); return; }

    // Validate variations
    const validVariations = variations.filter((v) => v.name.trim() && v.price);
    const validAddons = addons.filter((a) => a.name.trim() && a.price);

    const formData = new FormData();
    formData.append("category_id", parseInt(categoryId));
    formData.append("name", name.trim());
    formData.append("price", parseFloat(price));
    formData.append("is_available", isAvailable);
    formData.append("is_featured", isFeatured);
    if (description.trim()) formData.append("description", description.trim());
    if (prepTime) formData.append("prep_time", parseInt(prepTime));
    if (validVariations.length > 0) formData.append("variations", JSON.stringify(validVariations.map((v) => ({ name: v.name.trim(), price: parseFloat(v.price) }))));
    if (validAddons.length > 0) formData.append("addons", JSON.stringify(validAddons.map((a) => ({ name: a.name.trim(), price: parseFloat(a.price) }))));

    // Add image if picked from device (not a URL)
    if (imageUri && !imageUri.startsWith("http")) {
      const filename = imageUri.split("/").pop();
      const ext = filename.split(".").pop();
      formData.append("image", { uri: imageUri, name: filename, type: `image/${ext}` });
    }

    try {
      haptic.medium();
      if (isEdit) {
        await updateItem({ id: parseInt(id), body: formData }).unwrap();
      } else {
        await createItem(formData).unwrap();
      }
      haptic.success();
      router.back();
    } catch (err) {
      Alert.alert("Error", err?.data?.message || "Failed to save item");
    }
  };

  const inputStyle = {
    borderWidth: 1, borderColor: c.borderInput, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 15,
    color: c.text, backgroundColor: c.inputBg,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
          <TouchableOpacity
            style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: c.card, alignItems: "center", justifyContent: "center", ...shadow.sm }}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={22} color={c.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: c.text, fontFamily: fonts.bold, marginLeft: 12 }}>{isEdit ? "Edit Item" : "Add Item"}</Text>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {/* Image Picker */}
          <Text style={{ fontSize: 13, fontFamily: fonts.semibold, color: c.text, marginBottom: 8 }}>Item Photo</Text>
          <View style={{ marginBottom: 20 }}>
            <ImagePickerBox imageUri={imageUri} onImagePicked={setImageUri} height={180} label="Tap to add item photo" />
          </View>

          {/* Category Picker */}
          <Text style={{ fontSize: 13, fontWeight: "600", color: c.text, marginBottom: 8 }}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: categoryId === cat.id.toString() ? c.primary : c.bgSecondary }}
                onPress={() => setCategoryId(cat.id.toString())}
              >
                <Text style={{ fontSize: 13, fontWeight: "600", color: categoryId === cat.id.toString() ? "#fff" : c.textMuted }}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Name */}
          <Text style={{ fontSize: 13, fontWeight: "600", color: c.text, marginBottom: 8 }}>Name *</Text>
          <TextInput style={{ ...inputStyle, marginBottom: 16 }} placeholder="Item name" placeholderTextColor={c.textSecondary} value={name} onChangeText={setName} />

          {/* Description */}
          <Text style={{ fontSize: 13, fontWeight: "600", color: c.text, marginBottom: 8 }}>Description</Text>
          <TextInput style={{ ...inputStyle, marginBottom: 16, minHeight: 80, textAlignVertical: "top" }} placeholder="Item description" placeholderTextColor={c.textSecondary} value={description} onChangeText={setDescription} multiline />

          {/* Price & Prep Time */}
          <View style={{ flexDirection: "row", marginBottom: 16 }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: c.text, marginBottom: 8 }}>Price ({CURRENCY_SYMBOL}) *</Text>
              <TextInput style={inputStyle} placeholder="0.00" placeholderTextColor={c.textSecondary} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: c.text, marginBottom: 8 }}>Prep Time (min)</Text>
              <TextInput style={inputStyle} placeholder="e.g. 15" placeholderTextColor={c.textSecondary} value={prepTime} onChangeText={setPrepTime} keyboardType="number-pad" />
            </View>
          </View>

          {/* Toggles */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 14, color: c.text, marginRight: 8 }}>Available</Text>
              <Switch value={isAvailable} onValueChange={setIsAvailable} trackColor={{ false: "#E0E0E0", true: "#86EFAC" }} thumbColor={isAvailable ? "#22C55E" : "#9CA3AF"} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 14, color: c.text, marginRight: 8 }}>⭐ Featured</Text>
              <Switch value={isFeatured} onValueChange={setIsFeatured} trackColor={{ false: "#E0E0E0", true: "#FDE68A" }} thumbColor={isFeatured ? "#F59E0B" : "#9CA3AF"} />
            </View>
          </View>

          {/* Variations */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: c.text }}>Variations</Text>
              <TouchableOpacity onPress={addVariation}><Text style={{ color: c.primary, fontWeight: "bold" }}>+ Add</Text></TouchableOpacity>
            </View>
            {variations.map((v, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <TextInput
                  style={{ ...inputStyle, flex: 2, marginRight: 8 }}
                  placeholder="e.g. Large"
                  placeholderTextColor={c.textSecondary}
                  value={v.name}
                  onChangeText={(val) => updateVariation(i, "name", val)}
                />
                <TextInput
                  style={{ ...inputStyle, flex: 1, marginRight: 8 }}
                  placeholder={CURRENCY_SYMBOL}
                  placeholderTextColor={c.textSecondary}
                  value={v.price}
                  onChangeText={(val) => updateVariation(i, "price", val)}
                  keyboardType="decimal-pad"
                />
                <TouchableOpacity onPress={() => removeVariation(i)}>
                  <Text style={{ color: "#EF4444", fontSize: 20 }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Addons */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: c.text }}>Add-ons</Text>
              <TouchableOpacity onPress={addAddon}><Text style={{ color: c.primary, fontWeight: "bold" }}>+ Add</Text></TouchableOpacity>
            </View>
            {addons.map((a, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <TextInput
                  style={{ ...inputStyle, flex: 2, marginRight: 8 }}
                  placeholder="e.g. Extra Cheese"
                  placeholderTextColor={c.textSecondary}
                  value={a.name}
                  onChangeText={(val) => updateAddon(i, "name", val)}
                />
                <TextInput
                  style={{ ...inputStyle, flex: 1, marginRight: 8 }}
                  placeholder={CURRENCY_SYMBOL}
                  placeholderTextColor={c.textSecondary}
                  value={a.price}
                  onChangeText={(val) => updateAddon(i, "price", val)}
                  keyboardType="decimal-pad"
                />
                <TouchableOpacity onPress={() => removeAddon(i)}>
                  <Text style={{ color: "#EF4444", fontSize: 20 }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={{ paddingVertical: 16, borderRadius: 12, alignItems: "center", marginBottom: 32, backgroundColor: isLoading ? "#FDBA74" : c.primary }}
            onPress={handleSave}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 17 }}>{isEdit ? "Update Item" : "Add Item"}</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
