import { useSelector } from "react-redux";

// Dark mode color palette
const colors = {
  light: {
    bg: "#FFFFFF",
    bgSecondary: "#F5F5F5",
    card: "#FFFFFF",
    text: "#1A1A2E",
    textSecondary: "#9E9E9E",
    textMuted: "#424242",
    border: "#F0F0F0",
    borderInput: "#D1D5DB",
    inputBg: "#F5F5F5",
    primary: "#FF6B35",
    primaryLight: "#FFF7ED",
    tabBar: "#FFFFFF",
    tabBarBorder: "#F0F0F0",
    statusBar: "dark",
  },
  dark: {
    bg: "#0F0F1A",
    bgSecondary: "#1A1A2E",
    card: "#1A1A2E",
    text: "#F5F5F5",
    textSecondary: "#9E9E9E",
    textMuted: "#BDBDBD",
    border: "#2A2A3E",
    borderInput: "#3A3A4E",
    inputBg: "#1A1A2E",
    primary: "#FF6B35",
    primaryLight: "#2A1A10",
    tabBar: "#0F0F1A",
    tabBarBorder: "#1A1A2E",
    statusBar: "light",
  },
};

export const useTheme = () => {
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";
  const c = colors[mode];

  return { isDark, mode, c };
};
