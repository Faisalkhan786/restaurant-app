import { TouchableOpacity, Text, Image, View, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { fonts } from "../../utils/fonts";
import { haptic } from "../../utils/haptics";

export default function ImagePickerBox({ imageUri, onImagePicked, height = 150, label = "Tap to add photo" }) {
  const { c, shadow } = useTheme();

  const pickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/jpeg", "image/png", "image/webp"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        haptic.light();
        onImagePicked(result.assets[0].uri);
      }
    } catch (_) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  return (
    <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
      {imageUri ? (
        <View style={{ borderRadius: 16, overflow: "hidden", ...shadow.md }}>
          <Image source={{ uri: imageUri }} style={{ width: "100%", height, borderRadius: 16 }} resizeMode="cover" />
          <View style={{
            position: "absolute", bottom: 10, right: 10,
            backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 12, paddingVertical: 6,
            borderRadius: 8, flexDirection: "row", alignItems: "center",
          }}>
            <Ionicons name="camera" size={14} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, fontFamily: fonts.medium, marginLeft: 4 }}>Change</Text>
          </View>
        </View>
      ) : (
        <LinearGradient
          colors={[c.bgSecondary, c.border]}
          style={{
            width: "100%", height, borderRadius: 16, alignItems: "center", justifyContent: "center",
            borderWidth: 2, borderStyle: "dashed", borderColor: c.borderInput,
          }}
        >
          <Ionicons name="camera-outline" size={36} color={c.textSecondary} />
          <Text style={{ color: c.textSecondary, fontSize: 13, fontFamily: fonts.medium, marginTop: 8 }}>{label}</Text>
        </LinearGradient>
      )}
    </TouchableOpacity>
  );
}
