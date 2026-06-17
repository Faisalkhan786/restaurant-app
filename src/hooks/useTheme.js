import { useSelector } from "react-redux";
import { Platform } from "react-native";

const colors = {
  light: {
    bg: "#FAFAFA",
    bgSecondary: "#F0F0F5",
    card: "#FFFFFF",
    text: "#1A1A2E",
    textSecondary: "#8E8E9A",
    textMuted: "#5A5A6E",
    border: "#EBEBF0",
    borderInput: "#D4D4DE",
    inputBg: "#F5F5FA",
    primary: "#4F46E5",
    primaryDark: "#4338CA",
    primaryLight: "#EEF2FF",
    secondary: "#818CF8",
    tabBar: "#FFFFFF",
    tabBarBorder: "#EBEBF0",
    statusBar: "dark",
    shadow: "#000",
    gradient: {
      primary: ["#4F46E5", "#6366F1"],
      dark: ["#1A1A2E", "#2D2D44"],
      card: ["#FFFFFF", "#F8F8FC"],
      accent: ["#4F46E5", "#818CF8"],
    },
  },
  dark: {
    bg: "#0D0D1A",
    bgSecondary: "#161625",
    card: "#1C1C30",
    text: "#F0F0F5",
    textSecondary: "#7A7A8E",
    textMuted: "#B0B0C0",
    border: "#252540",
    borderInput: "#35354E",
    inputBg: "#1A1A2E",
    primary: "#818CF8",
    primaryDark: "#6366F1",
    primaryLight: "#1E1B4B",
    secondary: "#A5B4FC",
    tabBar: "#0D0D1A",
    tabBarBorder: "#1A1A2E",
    statusBar: "light",
    shadow: "#000",
    gradient: {
      primary: ["#818CF8", "#6366F1"],
      dark: ["#0D0D1A", "#161625"],
      card: ["#1C1C30", "#22223A"],
      accent: ["#818CF8", "#A5B4FC"],
    },
  },
};

// Reusable shadow styles
const shadowLight = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    ...Platform.select({ android: { elevation: 2 } }),
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    ...Platform.select({ android: { elevation: 4 } }),
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    ...Platform.select({ android: { elevation: 8 } }),
  },
};

const shadowDark = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    ...Platform.select({ android: { elevation: 2 } }),
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    ...Platform.select({ android: { elevation: 4 } }),
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    ...Platform.select({ android: { elevation: 8 } }),
  },
};

export const useTheme = () => {
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";
  const c = colors[mode];
  const shadow = isDark ? shadowDark : shadowLight;

  return { isDark, mode, c, shadow };
};
