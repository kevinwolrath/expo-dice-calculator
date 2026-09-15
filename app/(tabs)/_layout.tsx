import { Link, Tabs, useSegments } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text as RNText,
  type ColorValue,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Screen, Text, useChromeColors } from "@/components/Themed";
import { PageThemeScope } from "@/components/pageTheme/PageThemeScope";
import HeaderActions from "@/components/ui/HeaderActions";
import { appHeaderStyleOptions } from "@/components/ui/HeaderSceneBackground";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useColorScheme } from "@/components/useColorScheme";
import { pageIdFromSegments } from "@/constants/pageTheme";
import { Space, Type } from "@/constants/theme";
import { getThemePack } from "@/constants/themePack";
import { initDatabase } from "@/db";
import useThemePackStore from "@/stores/useThemePackStore";
import { useTranslation } from "react-i18next";

const TAB_BAR_BODY = 72;
const ICON_SIZE = 22;

function TabBarLabel({
  title,
  color,
  focused,
}: {
  title: string;
  color: ColorValue;
  focused: boolean;
}) {
  return (
    <RNText
      numberOfLines={2}
      ellipsizeMode="clip"
      style={StyleSheet.flatten([
        styles.tabLabel,
        { color, fontWeight: focused ? "700" : "500" },
      ])}
    >
      {title}
    </RNText>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isNight = colorScheme === "dark";
  const { t } = useTranslation();
  const headerShown = useClientOnlyValue(false, true);
  const segments = useSegments();
  const pageId = pageIdFromSegments(segments);
  const chrome = useChromeColors();
  const packId = useThemePackStore((state) => state.packId);
  const pack = getThemePack(packId);
  const insets = useSafeAreaInsets();
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
    <PageThemeScope pageId={pageId}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: isNight ? "#ffffff" : pack.colors.primary,
          tabBarInactiveTintColor: isNight
            ? "#aaaaaa"
            : pack.colors.tabIconDefault,
          tabBarStyle: {
            backgroundColor: isNight ? "#000000" : pack.colors.tabBar,
            borderTopColor: isNight
              ? "rgba(255,255,255,0.25)"
              : pack.colors.border,
            borderTopWidth: 1,
            height: TAB_BAR_BODY + insets.bottom,
            paddingTop: 6,
            paddingBottom: Math.max(insets.bottom, 6),
            elevation: 12,
          },
          tabBarItemStyle: {
            paddingHorizontal: 2,
          },
          tabBarLabelStyle: {
            marginTop: 2,
          },
          headerShown,
          ...appHeaderStyleOptions(chrome),
          headerRight: () => <HeaderActions pageId={pageId} />,
        }}
      >
        <Tabs.Screen
          name="dicejob"
          options={{
            title: t("tabs.jobs"),
            tabBarLabel: ({ color, focused }) => (
              <TabBarLabel
                title={t("tabs.jobs")}
                color={color}
                focused={focused}
              />
            ),
            tabBarIcon: ({ color }) => (
              <SymbolView
                name={{
                  ios: "square.stack.3d.up.fill",
                  android: "layers",
                  web: "layers",
                }}
                tintColor={color}
                size={ICON_SIZE}
              />
            ),
            headerRight: () => (
              <HeaderActions
                pageId="dicejob"
                extra={
                  <Link href="/modal" asChild>
                    <Pressable>
                      {({ pressed }) => (
                        <SymbolView
                          name={{
                            ios: "info.circle",
                            android: "info",
                            web: "info",
                          }}
                          size={22}
                          tintColor={chrome.icon}
                          style={{ opacity: pressed ? 0.5 : 1 }}
                        />
                      )}
                    </Pressable>
                  </Link>
                }
              />
            ),
          }}
        />
        <Tabs.Screen
          name="stock"
          options={{
            title: t("tabs.stock"),
            tabBarLabel: ({ color, focused }) => (
              <TabBarLabel
                title={t("tabs.stock")}
                color={color}
                focused={focused}
              />
            ),
            tabBarIcon: ({ color }) => (
              <SymbolView
                name={{
                  ios: "cube.box",
                  android: "inventory",
                  web: "inventory",
                }}
                tintColor={color}
                size={ICON_SIZE}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="material-types"
          options={{
            title: t("tabs.materialTypes"),
            tabBarLabel: ({ color, focused }) => (
              <TabBarLabel
                title={t("tabs.materialTypes")}
                color={color}
                focused={focused}
              />
            ),
            tabBarIcon: ({ color }) => (
              <SymbolView
                name={{
                  ios: "cube.box.fill",
                  android: "category",
                  web: "category",
                }}
                tintColor={color}
                size={ICON_SIZE}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="colour-types"
          options={{
            title: t("tabs.colourTypes"),
            tabBarLabel: ({ color, focused }) => (
              <TabBarLabel
                title={t("tabs.colourTypes")}
                color={color}
                focused={focused}
              />
            ),
            tabBarIcon: ({ color }) => (
              <SymbolView
                name={{
                  ios: "drop.fill",
                  android: "format_color_fill",
                  web: "format_color_fill",
                }}
                tintColor={color}
                size={ICON_SIZE}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="production-methods"
          options={{
            title: t("tabs.productionMethods"),
            tabBarLabel: ({ color, focused }) => (
              <TabBarLabel
                title={t("tabs.productionMethods")}
                color={color}
                focused={focused}
              />
            ),
            tabBarIcon: ({ color }) => (
              <SymbolView
                name={{
                  ios: "wrench.fill",
                  android: "build",
                  web: "build",
                }}
                tintColor={color}
                size={ICON_SIZE}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="dice-number-colours"
          options={{
            title: t("tabs.diceNumberColours"),
            tabBarLabel: ({ color, focused }) => (
              <TabBarLabel
                title={t("tabs.diceNumberColours")}
                color={color}
                focused={focused}
              />
            ),
            tabBarIcon: ({ color }) => (
              <SymbolView
                name={{
                  ios: "paintpalette.fill",
                  android: "palette",
                  web: "palette",
                }}
                tintColor={color}
                size={ICON_SIZE}
              />
            ),
          }}
        />
      </Tabs>
    </PageThemeScope>
  );
}

const styles = StyleSheet.create({
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
  tabLabel: {
    fontSize: 11,
    lineHeight: 13,
    textAlign: "center",
    marginTop: 2,
    width: "100%",
    paddingHorizontal: 2,
  },
});
