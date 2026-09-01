import { Link } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable } from "react-native";
import { useTranslation } from "react-i18next";

import { useColorScheme } from "@/components/useColorScheme";
import { HeaderColors } from "@/constants/Colors";
import type { PageThemeId } from "@/constants/pageTheme";

export default function PageThemeButton({ pageId }: { pageId: PageThemeId }) {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  if (colorScheme === "dark") {
    return null;
  }

  return (
    <Link
      href={{ pathname: "/page-theme", params: { page: pageId } }}
      asChild
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("pageTheme.title")}
        hitSlop={8}
      >
        {({ pressed }) => (
          <SymbolView
            name={{
              ios: "paintbrush.fill",
              android: "format_paint",
              web: "format_paint",
            }}
            size={22}
            tintColor={HeaderColors.icon}
            style={{ opacity: pressed ? 0.5 : 1 }}
          />
        )}
      </Pressable>
    </Link>
  );
}
