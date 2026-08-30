import { Link, Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";

import { Screen, Text, View } from "@/components/Themed";
import PrimaryButton from "@/components/ui/PrimaryButton";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Space, Type } from "@/constants/theme";
import { initDatabase } from "@/db";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const headerShown = useClientOnlyValue(false, true);
  const [databaseReady, setDatabaseReady] = useState(false);
  const [databaseError, setDatabaseError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadDatabase = async () => {
      setDatabaseError(false);
      try {
        await initDatabase();
        if (!cancelled) setDatabaseReady(true);
      } catch (error) {
        console.warn("Failed to initialise database before tabs", error);
        if (!cancelled) setDatabaseError(true);
      }
    };

    void loadDatabase();

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  if (!databaseReady) {
    return (
      <Screen style={styles.loadingContainer}>
        {databaseError ? (
          <>
            <Text style={[Type.screenTitle, styles.loadingTitle]}>
              {t("startup.errorTitle")}
            </Text>
            <Text style={styles.loadingMessage}>
              {t("startup.errorMessage")}
            </Text>
            <PrimaryButton
              title={t("startup.retry")}
              onPress={() => {
                setDatabaseReady(false);
                setRetryCount((count) => count + 1);
              }}
            />
          </>
        ) : (
          <>
            <Text style={[Type.screenTitle, styles.loadingTitle]}>
              {t("startup.loadingTitle")}
            </Text>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingMessage}>
              {t("startup.loadingMessage")}
            </Text>
          </>
        )}
      </Screen>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown,
        headerRight: () => (
          <View style={styles.headerActions}>
            <ThemeToggle />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="dicejob"
        options={{
          title: t("tabs.jobs"),
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "square.stack.3d.up.fill",
                android: "layers",
                web: "layers",
              }}
              tintColor={color}
              size={24}
            />
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              <ThemeToggle />
              <Link href="/modal" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <SymbolView
                      name={{ ios: "info.circle", android: "info", web: "info" }}
                      size={22}
                      tintColor={Colors[colorScheme].text}
                      style={{ opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="stock"
        options={{
          title: t("tabs.stock"),
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: "cube.box", android: "inventory", web: "inventory" }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="material-types"
        options={{
          title: t("tabs.materialTypes"),
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "cube.box.fill",
                android: "category",
                web: "category",
              }}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="colour-types"
        options={{
          title: t("tabs.colourTypes"),
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "drop.fill",
                android: "format_color_fill",
                web: "format_color_fill",
              }}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="production-methods"
        options={{
          title: t("tabs.productionMethods"),
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: "wrench.fill", android: "build", web: "build" }}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="dice-number-colours"
        options={{
          title: t("tabs.diceNumberColours"),
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "paintpalette.fill",
                android: "palette",
                web: "palette",
              }}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Space[3],
    marginRight: 15,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: Space[6],
  },
  loadingTitle: {
    marginBottom: Space[4],
  },
  loadingMessage: {
    marginTop: Space[4],
    marginBottom: Space[5],
    textAlign: "center",
    opacity: 0.7,
  },
});
