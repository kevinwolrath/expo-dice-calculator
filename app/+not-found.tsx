import { Link, Stack } from "expo-router";
import { StyleSheet } from "react-native";

import { Screen, Text, useThemeColors } from "@/components/Themed";
import { FontSize, Space } from "@/constants/theme";
import { useTranslation } from "react-i18next";

export default function NotFoundScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <>
      <Stack.Screen options={{ title: t("misc.notFoundTitle") }} />
      <Screen style={styles.container}>
        <Text style={styles.title}>{t("misc.notFoundMessage")}</Text>

        <Link href="/" style={styles.link}>
          <Text style={[styles.linkText, { color: colors.primary }]}>
            {t("misc.home")}
          </Text>
        </Link>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: Space[5],
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: FontSize.sm,
  },
});
