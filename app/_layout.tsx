import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import "react-native-reanimated";

import { View } from "@/components/Themed";
import PageThemeButton from "@/components/ui/PageThemeButton";
import { useColorScheme } from "@/components/useColorScheme";
import i18n from "@/constants/i18n";
import { Space } from "@/constants/theme";
import useAppearanceStore from "@/stores/useAppearanceStore";
import usePageThemeStore from "@/stores/usePageThemeStore";
import { I18nextProvider, useTranslation } from "react-i18next";

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary
} from "expo-router";

export const unstable_settings = {
  // Start at the database bootstrap route before showing data screens.
  initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    void useAppearanceStore.getState().hydrate();
    void usePageThemeStore.getState().hydrate();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <RootLayoutNav />
    </I18nextProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="maintenance"
          options={{
            title: t("tabs.maintenance"),
            headerRight: () => (
              <View style={styles.headerRight}>
                <PageThemeButton pageId="maintenance" />
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="page-theme"
          options={{ title: t("pageTheme.title") }}
        />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    marginRight: 15,
    marginLeft: Space[3],
  },
});
