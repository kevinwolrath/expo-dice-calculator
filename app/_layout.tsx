import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useChromeColors } from "@/components/Themed";
import HeaderActions from "@/components/ui/HeaderActions";
import { appHeaderStyleOptions } from "@/components/ui/HeaderSceneBackground";
import { useColorScheme } from "@/components/useColorScheme";
import i18n from "@/constants/i18n";
import useAppearanceStore from "@/stores/useAppearanceStore";
import usePageThemeStore from "@/stores/usePageThemeStore";
import useThemePackStore from "@/stores/useThemePackStore";
import { useUserThemeCatalogStore } from "@/stores/useUserThemeCatalogStore";
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
    void (async () => {
      await useUserThemeCatalogStore.getState().hydrate();
      await useThemePackStore.getState().hydrate();
    })();
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
  const chrome = useChromeColors();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          ...appHeaderStyleOptions(chrome),
          headerRight: () => <HeaderActions />,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="maintenance"
          options={{
            title: t("tabs.maintenance"),
            headerRight: () => <HeaderActions pageId="maintenance" />,
          }}
        />
        <Stack.Screen
          name="page-theme"
          options={{ title: t("pageTheme.title") }}
        />
      </Stack>
    </ThemeProvider>
  );
}

