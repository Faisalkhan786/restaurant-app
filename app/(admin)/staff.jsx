import { useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, Alert,
  Modal, TextInput, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useGetDeliveryBoysQuery,
  useCreateStaffMutation,
} from "../../src/store/api/adminApi";
import { useTheme } from "../../src/hooks/useTheme";
import LoadingScreen from "../../src/components/common/LoadingScreen";
import ErrorScreen from "../../src/components/common/ErrorScreen";

// ==================== ADD STAFF MODAL ====================
function AddStaffModal({ visible, onClose, c }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("delivery_boy");
  const [createStaff, { isLoading }] = useCreateStaffMutation();

  const handleCreate = async () => {
    if (!name.trim()) { Alert.alert("Error", "Name is required"); return; }
    if (!email.trim()) { Alert.alert("Error", "Email is required"); return; }
    if (!password || password.length < 6) { Alert.alert("Error", "Password must be at least 6 characters"); return; }
    if (phone && !/^[0-9]{10,15}$/.test(phone)) { Alert.alert("Error", "Phone must be 10-15 digits"); return; }

    try {
      await createStaff({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        ...(phone && { phone }),
      }).unwrap();

      Alert.alert("Success", `${role === "admin" ? "Admin" : "Delivery Boy"} created successfully`);
      setName(""); setEmail(""); setPhone(""); setPassword(""); setRole("delivery_boy");
      onClose();
    } catch (err) {
      Alert.alert("Error", err?.data?.message || "Failed to create staff");
    }
  };

  const inputStyle = {
    borderWidth: 1, borderColor: c.borderInput, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 15,
    color: c.text, backgroundColor: c.inputBg, marginBottom: 12,
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: c.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: c.text }}>Add Staff</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 20, color: c.textSecondary }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Role Picker */}
          <Text style={{ fontSize: 13, fontWeight: "600", color: c.text, marginBottom: 8 }}>Role *</Text>
          <View style={{ flexDirection: "row", marginBottom: 16 }}>
            {[
              { key: "delivery_boy", label: "🏍️ Delivery Boy" },
              { key: "admin", label: "👨‍💼 Admin" },
            ].map((r) => (
              <TouchableOpacity
                key={r.key}
                style={{
                  flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center", marginHorizontal: 4,
                  backgroundColor: role === r.key ? c.primary : c.bgSecondary,
                }}
                onPress={() => setRole(r.key)}
              >
                <Text style={{ fontWeight: "600", fontSize: 14, color: role === r.key ? "#fff" : c.textMuted }}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ fontSize: 13, fontWeight: "600", color: c.text, marginBottom: 8 }}>Full Name *</Text>
          <TextInput style={inputStyle} placeholder="Enter name" placeholderTextColor={c.textSecondary} value={name} onChangeText={setName} autoCapitalize="words" />

          <Text style={{ fontSize: 13, fontWeight: "600", color: c.text, marginBottom: 8 }}>Email *</Text>
          <TextInput style={inputStyle} placeholder="Enter email" placeholderTextColor={c.textSecondary} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

          <Text style={{ fontSize: 13, fontWeight: "600", color: c.text, marginBottom: 8 }}>Phone (optional)</Text>
          <TextInput style={inputStyle} placeholder="10-15 digit phone" placeholderTextColor={c.textSecondary} value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={15} />

          <Text style={{ fontSize: 13, fontWeight: "600", color: c.text, marginBottom: 8 }}>Password *</Text>
          <TextInput style={inputStyle} placeholder="Min 6 characters" placeholderTextColor={c.textSecondary} value={password} onChangeText={setPassword} secureTextEntry />

          <TouchableOpacity
            style={{ paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: isLoading ? "#FDBA74" : c.primary, marginTop: 8 }}
            onPress={handleCreate}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>Create {role === "admin" ? "Admin" : "Delivery Boy"}</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ==================== MAIN SCREEN ====================
export default function StaffScreen() {
  const { c } = useTheme();
  const [showAdd, setShowAdd] = useState(false);
  const { data, isLoading, error, refetch } = useGetDeliveryBoysQuery();

  const staff = data?.data || [];

  if (isLoading) return <LoadingScreen message="Loading staff..." />;
  if (error) return <ErrorScreen message="Failed to load staff" onRetry={refetch} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <View>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: c.text }}>Staff</Text>
          <Text style={{ fontSize: 13, color: c.textSecondary, marginTop: 2 }}>{staff.length} delivery partner{staff.length !== 1 ? "s" : ""}</Text>
        </View>
        <TouchableOpacity
          style={{ backgroundColor: c.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 }}
          onPress={() => setShowAdd(true)}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>+ Add Staff</Text>
        </TouchableOpacity>
      </View>

      {/* Staff List */}
      <FlatList
        data={staff}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: boy }) => (
          <View style={{ backgroundColor: c.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: c.border }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {/* Avatar */}
              <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: c.primary, alignItems: "center", justifyContent: "center", marginRight: 14 }}>
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 20 }}>{boy.name?.[0]?.toUpperCase()}</Text>
              </View>

              {/* Info */}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: c.text }}>{boy.name}</Text>
                  <View style={{
                    width: 10, height: 10, borderRadius: 5, marginLeft: 8,
                    backgroundColor: boy.deliveryProfile?.is_available ? "#22C55E" : "#9CA3AF",
                  }} />
                </View>
                <Text style={{ fontSize: 13, color: c.textSecondary, marginTop: 2 }}>{boy.email}</Text>
                {boy.phone ? <Text style={{ fontSize: 13, color: c.textSecondary, marginTop: 1 }}>📞 {boy.phone}</Text> : null}
              </View>
            </View>

            {/* Stats */}
            <View style={{ flexDirection: "row", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.border }}>
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: c.text }}>{boy.total_deliveries || 0}</Text>
                <Text style={{ fontSize: 11, color: c.textSecondary, marginTop: 2 }}>Total Deliveries</Text>
              </View>
              <View style={{ width: 1, backgroundColor: c.border }} />
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: boy.active_orders > 0 ? "#F59E0B" : c.text }}>{boy.active_orders || 0}</Text>
                <Text style={{ fontSize: 11, color: c.textSecondary, marginTop: 2 }}>Active Orders</Text>
              </View>
              <View style={{ width: 1, backgroundColor: c.border }} />
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: boy.deliveryProfile?.is_available ? "#22C55E" : "#9CA3AF" }}>
                  {boy.deliveryProfile?.is_available ? "Online" : "Offline"}
                </Text>
                <Text style={{ fontSize: 11, color: c.textSecondary, marginTop: 2 }}>Status</Text>
              </View>
            </View>

            {/* Vehicle type */}
            {boy.deliveryProfile?.vehicle_type ? (
              <View style={{ marginTop: 8, alignSelf: "flex-start", backgroundColor: c.bgSecondary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ fontSize: 12, color: c.textMuted, textTransform: "capitalize" }}>🏍️ {boy.deliveryProfile.vehicle_type}</Text>
              </View>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>👥</Text>
            <Text style={{ fontSize: 17, fontWeight: "bold", color: c.text }}>No Staff Yet</Text>
            <Text style={{ color: c.textSecondary, marginTop: 4, textAlign: "center" }}>
              Add delivery partners to start assigning orders
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: c.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 16 }}
              onPress={() => setShowAdd(true)}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>+ Add Staff</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Add Staff Modal */}
      <AddStaffModal visible={showAdd} onClose={() => setShowAdd(false)} c={c} />
    </SafeAreaView>
  );
}
