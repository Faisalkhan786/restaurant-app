import { View, Text } from "react-native";

const BaseToast = ({ text1, text2, bgColor, icon }) => (
  <View
    className={`${bgColor} mx-4 mt-2 px-4 py-3 rounded-xl flex-row items-center shadow-lg`}
    style={{ elevation: 6 }}
  >
    <Text className="text-lg mr-3">{icon}</Text>
    <View className="flex-1">
      <Text className="text-white font-bold text-sm">{text1}</Text>
      {text2 ? (
        <Text className="text-white text-xs mt-0.5 opacity-90">{text2}</Text>
      ) : null}
    </View>
  </View>
);

export const toastConfig = {
  success: (props) => (
    <BaseToast {...props} bgColor="bg-green-600" icon="✅" />
  ),
  error: (props) => (
    <BaseToast {...props} bgColor="bg-red-500" icon="❌" />
  ),
  info: (props) => (
    <BaseToast {...props} bgColor="bg-blue-500" icon="ℹ️" />
  ),
  cart: (props) => (
    <BaseToast {...props} bgColor="bg-primary" icon="🛒" />
  ),
};
