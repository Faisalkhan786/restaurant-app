import { Redirect } from "expo-router";
import { useSelector } from "react-redux";

export default function Index() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    if (user?.role === "admin") {
      return <Redirect href="/(admin)/dashboard" />;
    }
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}
