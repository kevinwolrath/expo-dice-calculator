import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet } from "react-native";

import EditScreenInfo from "@/components/EditScreenInfo";
import { Screen, Text, View } from "@/components/Themed";
import { FontSize } from "@/constants/theme";
import { useTranslation } from "react-i18next";

export default function ModalScreen() {
  const { t } = useTranslation();
  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>{t("misc.modalTitle")}</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <EditScreenInfo path="app/modal.tsx" />

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
