import { SymbolView } from "expo-symbols";
import { Pressable } from "react-native";
import { useTranslation } from "react-i18next";

import { useThemeColors } from "@/components/Themed";
import useAppearanceStore from "@/stores/useAppearanceStore";

export default function ThemeToggle() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const colorScheme = useAppearanceStore((state) => state.colorScheme);
  const toggleColorScheme = useAppearanceStore(
    (state) => state.toggleColorScheme,
  );
  const isDark = colorScheme === "dark";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        isDark ? t("appearance.useLight") : t("appearance.useDark")
      }
      onPress={toggleColorScheme}
      hitSlop={8}
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
    >
      <SymbolView
        name={
          isDark
            ? { ios: "sun.max.fill", android: "light_mode", web: "light_mode" }
            : { ios: "moon.fill", android: "dark_mode", web: "dark_mode" }
        }
        size={22}
        tintColor={colors.text}
      />
    </Pressable>
  );
}
