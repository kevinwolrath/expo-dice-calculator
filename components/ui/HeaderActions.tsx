import { Link } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Platform, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { View, useChromeColors } from "@/components/Themed";
import PageThemeButton from "@/components/ui/PageThemeButton";
import ThemeToggle from "@/components/ui/ThemeToggle";
import type { PageThemeId } from "@/constants/pageTheme";
import { Space } from "@/constants/theme";

export default function HeaderActions({
  pageId,
  compact,
}: {
  pageId?: PageThemeId | null;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const chrome = useChromeColors();

  return (
    <View style={[styles.headerActions, compact && styles.compact]}>
      <ThemeToggle />
      {pageId ? <PageThemeButton pageId={pageId} /> : null}
      <Link href="/maintenance" asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("tabs.maintenance")}
          {...(Platform.OS === "web"
            ? { title: t("tabs.maintenance") }
            : null)}
        >
          {({ pressed }) => (
            <SymbolView
              name={{
                ios: "gearshape.fill",
                android: "settings",
                web: "settings",
              }}
              size={22}
              tintColor={chrome.icon}
              style={{ opacity: pressed ? 0.5 : 1 }}
            />
          )}
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Space[3],
    marginRight: 15,
  },
  compact: { marginRight: 0 },
});
