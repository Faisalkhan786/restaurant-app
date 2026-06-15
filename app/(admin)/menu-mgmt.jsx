import { useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, Alert, TextInput,
  Modal, ActivityIndicator, Switch, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  useGetAdminCategoriesQuery,
  useGetAdminItemsQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useToggleItemAvailabilityMutation,
  useDeleteItemMutation,
} from "../../src/store/api/adminApi";
import { useTheme } from "../../src/hooks/useTheme";
import { CURRENCY_SYMBOL } from "../../src/constants/config";
import LoadingScreen from "../../src/components/common/LoadingScreen";
import ErrorScreen from "../../src/components/common/ErrorScreen";
import ImagePickerBox from "../../src/components/common/ImagePickerBox";

// ==================== CATEGORY MODAL ====================
function CategoryModal({ visible, onClose, category, c }) {
  const [name, setName] = useState(category?.name || "");
  const [sortOrder, setSortOrder] = useState(category?.sort_order?.toString() || "0");
  const [imageUri, setImageUri] = useState(category?.image_url || null);
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const isEdit = !!category;
  const isLoading = isCreating || isUpdating;

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert("Error", "Category name is required"); return; }
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("sort_order", parseInt(sortOrder) || 0);

      if (imageUri && !imageUri.startsWith("http")) {
        const filename = imageUri.split("/").pop();
        const ext = filename.split(".").pop();
        formData.append("image", { uri: imageUri, name: filename, type: `image/${ext}` });
      }

      if (isEdit) {
        await updateCategory({ id: category.id, ...Object.fromEntries([["name", name.trim()], ["sort_order", parseInt(sortOrder) || 0]]) }).unwrap();
      } else {
        await createCategory(formData).unwrap();
      }
      onClose();
    } catch (err) {
      Alert.alert("Error", err?.data?.message || "Failed to save category");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: c.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: c.text, marginBottom: 20 }}>
            {isEdit ? "Edit Category" : "Add Category"}
          </Text>

          <Text style={{ fontSize: 13, fontWeight: "600", color: c.text, marginBottom: 8 }}>Category Image</Text>
          <View style={{ marginBottom: 16 }}>
            <ImagePickerBox imageUri={imageUri} onImagePicked={setImageUri} height={120} label="Tap to add category photo" />
          </View>

          <Text style={{ fontSize: 13, fontWeight: "600", color: c.text, marginBottom: 8 }}>Name *</Text>
          <TextInput
            style={{ borderWidth: 1, borderColor: c.borderInput, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: c.text, backgroundColor: c.inputBg, marginBottom: 16 }}
            placeholder="Category name"
            placeholderTextColor={c.textSecondary}
            value={name}
            onChangeText={setName}
          />

          <Text style={{ fontSize: 13, fontWeight: "600", color: c.text, marginBottom: 8 }}>Sort Order</Text>
          <TextInput
            style={{ borderWidth: 1, borderColor: c.borderInput, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: c.text, backgroundColor: c.inputBg, marginBottom: 24 }}
            placeholder="0"
            placeholderTextColor={c.textSecondary}
            value={sortOrder}
            onChangeText={setSortOrder}
            keyboardType="number-pad"
          />

          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity style={{ flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: c.bgSecondary, marginRight: 8 }} onPress={onClose}>
              <Text style={{ fontWeight: "bold", color: c.text, fontSize: 15 }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: isLoading ? "#FDBA74" : c.primary, marginLeft: 8 }}
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 15 }}>Save</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ==================== MAIN SCREEN ====================
export default function MenuManagementScreen() {
  const router = useRouter();
  const { c } = useTheme();
  const [activeTab, setActiveTab] = useState("categories"); // "categories" | "items"
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categoryModal, setCategoryModal] = useState({ visible: false, category: null });

  const { data: catData, isLoading: catLoading, error: catError, refetch: catRefetch } = useGetAdminCategoriesQuery();
  const { data: itemData, isLoading: itemLoading, error: itemError, refetch: itemRefetch } = useGetAdminItemsQuery(
    selectedCategoryId ? { category_id: selectedCategoryId } : {}
  );
  const [deleteCategory] = useDeleteCategoryMutation();
  const [toggleAvailability] = useToggleItemAvailabilityMutation();
  const [deleteItem] = useDeleteItemMutation();

  const categories = catData?.data || [];
  const items = itemData?.data || [];

  const handleDeleteCategory = (id, name) => {
    Alert.alert("Delete Category", `Delete "${name}"? All items in this category will also be deleted.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try { await deleteCategory(id).unwrap(); } catch (err) { Alert.alert("Error", err?.data?.message || "Failed to delete"); }
        },
      },
    ]);
  };

  const handleToggleItem = async (id) => {
    try { await toggleAvailability(id).unwrap(); } catch (err) { Alert.alert("Error", err?.data?.message || "Failed to toggle"); }
  };

  const handleDeleteItem = (id, name) => {
    Alert.alert("Delete Item", `Delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try { await deleteItem(id).unwrap(); } catch (err) { Alert.alert("Error", err?.data?.message || "Failed to delete"); }
        },
      },
    ]);
  };

  if (catLoading) return <LoadingScreen message="Loading menu..." />;
  if (catError) return <ErrorScreen message="Failed to load menu" onRetry={catRefetch} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: "bold", color: c.text }}>Menu Management</Text>
      </View>

      {/* Tab Switcher */}
      <View style={{ flexDirection: "row", paddingHorizontal: 20, marginTop: 8, marginBottom: 12 }}>
        {["categories", "items"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center", backgroundColor: activeTab === tab ? c.primary : c.bgSecondary, marginHorizontal: 4 }}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={{ fontWeight: "600", fontSize: 14, color: activeTab === tab ? "#fff" : c.textMuted, textTransform: "capitalize" }}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ==================== CATEGORIES TAB ==================== */}
      {activeTab === "categories" ? (
        <>
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
            renderItem={({ item }) => (
              <View style={{ backgroundColor: c.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: c.border }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: "bold", color: c.text }}>{item.name}</Text>
                    <Text style={{ fontSize: 12, color: c.textSecondary, marginTop: 4 }}>Sort: {item.sort_order} • {item.is_active ? "Active" : "Inactive"}</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                      style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: c.bgSecondary, marginRight: 8 }}
                      onPress={() => setCategoryModal({ visible: true, category: item })}
                    >
                      <Text style={{ fontSize: 13, fontWeight: "600", color: c.primary }}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: "#FEE2E2" }}
                      onPress={() => handleDeleteCategory(item.id, item.name)}
                    >
                      <Text style={{ fontSize: 13, fontWeight: "600", color: "#EF4444" }}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={{ alignItems: "center", paddingVertical: 48 }}>
                <Text style={{ fontSize: 36, marginBottom: 12 }}>📂</Text>
                <Text style={{ color: c.textSecondary, fontSize: 15 }}>No categories yet</Text>
              </View>
            }
          />
          {/* Add Category FAB */}
          <TouchableOpacity
            style={{ position: "absolute", bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: c.primary, alignItems: "center", justifyContent: "center", elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }}
            onPress={() => setCategoryModal({ visible: true, category: null })}
          >
            <Text style={{ color: "#fff", fontSize: 28, fontWeight: "bold" }}>+</Text>
          </TouchableOpacity>
          <CategoryModal
            visible={categoryModal.visible}
            category={categoryModal.category}
            c={c}
            onClose={() => setCategoryModal({ visible: false, category: null })}
          />
        </>
      ) : (
        /* ==================== ITEMS TAB ==================== */
        <>
          {/* Category Filter */}
          <View style={{ marginBottom: 8 }}>
            <FlatList
              data={[{ id: null, name: "All" }, ...categories]}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              keyExtractor={(item) => (item.id || "all").toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderRadius: 20, backgroundColor: selectedCategoryId === item.id ? c.primary : c.bgSecondary }}
                  onPress={() => setSelectedCategoryId(item.id)}
                >
                  <Text style={{ fontSize: 13, fontWeight: "600", color: selectedCategoryId === item.id ? "#fff" : c.textMuted }}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {itemLoading ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator size="large" color={c.primary} />
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
              renderItem={({ item }) => (
                <View style={{ backgroundColor: c.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: c.border }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={{ fontSize: 15, fontWeight: "bold", color: c.text }}>{item.name}</Text>
                      <Text style={{ fontSize: 13, color: c.primary, fontWeight: "bold", marginTop: 4 }}>{CURRENCY_SYMBOL}{item.price}</Text>
                      {item.description ? <Text style={{ fontSize: 12, color: c.textSecondary, marginTop: 4 }} numberOfLines={1}>{item.description}</Text> : null}
                      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                        {item.is_featured ? <View style={{ backgroundColor: "#FDE68A", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginRight: 8 }}><Text style={{ fontSize: 10, fontWeight: "bold" }}>⭐ Featured</Text></View> : null}
                        {item.prep_time ? <Text style={{ fontSize: 11, color: c.textSecondary }}>⏱️ {item.prep_time}m</Text> : null}
                      </View>
                    </View>
                    <View style={{ alignItems: "center" }}>
                      <Switch
                        value={item.is_available}
                        onValueChange={() => handleToggleItem(item.id)}
                        trackColor={{ false: "#E0E0E0", true: "#86EFAC" }}
                        thumbColor={item.is_available ? "#22C55E" : "#9CA3AF"}
                      />
                      <Text style={{ fontSize: 10, color: item.is_available ? "#22C55E" : "#EF4444", marginTop: 2 }}>
                        {item.is_available ? "Available" : "Unavailable"}
                      </Text>
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={{ flexDirection: "row", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.border }}>
                    <TouchableOpacity
                      style={{ flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center", backgroundColor: c.bgSecondary, marginRight: 8 }}
                      onPress={() => router.push(`/(app)/admin-item-form?id=${item.id}`)}
                    >
                      <Text style={{ fontSize: 13, fontWeight: "600", color: c.primary }}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center", backgroundColor: "#FEE2E2", marginLeft: 8 }}
                      onPress={() => handleDeleteItem(item.id, item.name)}
                    >
                      <Text style={{ fontSize: 13, fontWeight: "600", color: "#EF4444" }}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={{ alignItems: "center", paddingVertical: 48 }}>
                  <Text style={{ fontSize: 36, marginBottom: 12 }}>🍔</Text>
                  <Text style={{ color: c.textSecondary, fontSize: 15 }}>No items found</Text>
                </View>
              }
            />
          )}

          {/* Add Item FAB */}
          <TouchableOpacity
            style={{ position: "absolute", bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: c.primary, alignItems: "center", justifyContent: "center", elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }}
            onPress={() => router.push("/(app)/admin-item-form")}
          >
            <Text style={{ color: "#fff", fontSize: 28, fontWeight: "bold" }}>+</Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}
