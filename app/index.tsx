import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

import { Text, Screen } from "@/components/Themed";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { Space, Type } from "@/constants/theme";
import { initDatabase } from "@/db";
import { useTranslation } from "react-i18next";

export default function StartupScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadDatabase = async () => {
      setError(false);
      try {
        await initDatabase();
        if (!cancelled) router.replace("/(tabs)/dicejob");
      } catch (databaseError) {
        console.warn("Failed to initialise database", databaseError);
        if (!cancelled) setError(true);
      }
    };

    void loadDatabase();

    return () => {
      cancelled = true;
    };
  }, [retryCount, router]);

  return (
    <Screen style={styles.container}>
      {error ? (
        <>
          <Text style={[Type.screenTitle, styles.title]}>
            {t("startup.errorTitle")}
          </Text>
          <Text style={styles.message}>{t("startup.errorMessage")}</Text>
          <PrimaryButton
            title={t("startup.retry")}
            onPress={() => setRetryCount((count) => count + 1)}
          />
        </>
      ) : (
        <>
          <Text style={[Type.screenTitle, styles.title]}>
            {t("startup.loadingTitle")}
          </Text>
          <ActivityIndicator size="large" />
          <Text style={styles.message}>{t("startup.loadingMessage")}</Text>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: Space[6],
  },
  title: {
    marginBottom: Space[4],
  },
  message: {
    marginTop: Space[4],
    marginBottom: Space[5],
    textAlign: "center",
    opacity: 0.7,
  },
});
