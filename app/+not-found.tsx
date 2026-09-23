import { Stack, useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { Screen, Text } from "@/components/Themed";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { FontSize, Layout, Space } from "@/constants/theme";

export default function NotFoundScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: t("misc.notFoundTitle") }} />
      <Screen style={styles.container}>
        <Text style={styles.title}>{t("misc.notFoundMessage")}</Text>
        <PrimaryButton
          title={t("misc.home")}
          onPress={() => router.replace("/")}
        />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: Space[5],
    width: "100%",
    maxWidth: Layout.contentMaxWidth,
    alignSelf: "center",
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: "bold",
    marginBottom: Space[5],
    textAlign: "center",
  },
});
