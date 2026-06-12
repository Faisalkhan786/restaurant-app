import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { useSelector } from "react-redux";

function CartIcon({ color }) {
  const { totalItems } = useSelector((state) => state.cart);

  return (
    <View>
      <Text style={{ color, fontSize: 20 }}>🛒</Text>
      {totalItems > 0 ? (
        <View
          className="absolute -top-1 -right-2 bg-primary rounded-full min-w-[18px] h-[18px] items-center justify-center"
        >
          <Text className="text-white text-[10px] font-bold">
            {totalItems > 99 ? "99+" : totalItems}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF6B35",
        tabBarInactiveTintColor: "#9E9E9E",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#F0F0F0",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🍽️</Text>,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color }) => <CartIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
