/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.dev/develop/user-interface/color-themes/
 */
import { useContext } from "react";
import { StyleSheet, Text as DefaultText, View as DefaultView } from "react-native";

import { useColorScheme } from "./useColorScheme";

import PageBackgroundImage from "@/components/pageTheme/PageBackgroundImage";
import { PageThemeContext } from "@/components/pageTheme/PageThemeScope";
import Colors, { HeaderColors } from "@/constants/Colors";
import {
  resolvePageAppearance,
} from "@/constants/pageTheme";
import { Layout } from "@/constants/theme";
import { getThemePack, pageDefaultsForPack } from "@/constants/themePack";
import { getThemePackAssets } from "@/constants/themePackAssets";
import usePageThemeStore from "@/stores/usePageThemeStore";
import useThemePackStore from "@/stores/useThemePackStore";

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText["props"];
export type ViewProps = ThemeProps & DefaultView["props"];

type ThemeColors = (typeof Colors)[keyof typeof Colors];

const packToThemeColors = (
  packId: string | null,
): ThemeColors => {
  const pack = getThemePack(packId);
  if (!pack) return Colors.light;
  const colors = pack.colors;
  return {
    text: colors.text,
    background: colors.background,
    tint: colors.tint,
    tabIconDefault: colors.tabIconDefault,
    tabIconSelected: colors.tabIconSelected,
    card: colors.card,
    border: colors.border,
    inputBorder: colors.inputBorder,
    inputBackground: colors.inputBackground,
    muted: colors.muted,
    label: colors.label,
    primary: colors.primary,
    onPrimary: colors.onPrimary,
    destructive: colors.destructive,
    overlay: colors.overlay,
  };
};

const applyPageTheme = (
  base: ThemeColors,
  appearance: ReturnType<typeof resolvePageAppearance>,
  scheme: "light" | "dark",
): ThemeColors => {
  if (scheme === "dark") {
    return {
      ...base,
      text: appearance.foreground,
      background: appearance.background,
    };
  }
  return {
    ...base,
    text: appearance.foreground,
    background: appearance.background,
  };
};

export function useThemeColors() {
  const scheme = useColorScheme();
  const pageId = useContext(PageThemeContext);
  const packId = useThemePackStore((state) => state.packId);
  const pageTheme = usePageThemeStore((state) =>
    pageId ? state.themes[pageId] : undefined,
  );
  const packDefaults = pageId
    ? pageDefaultsForPack(packId, pageId)
    : {
        foreground: packToThemeColors(packId).text,
        background: packToThemeColors(packId).background,
      };
  const appearance = resolvePageAppearance(
    pageId,
    pageTheme,
    scheme,
    scheme === "dark" ? undefined : packDefaults,
  );
  const base = scheme === "dark" ? Colors.dark : packToThemeColors(packId);
  return applyPageTheme(base, appearance, scheme);
}

export function useChromeColors() {
  const scheme = useColorScheme();
  const packId = useThemePackStore((state) => state.packId);
  if (scheme === "dark") {
    return { background: "#000000", text: "#ffffff", icon: "#ffffff" };
  }
  const pack = getThemePack(packId);
  if (!pack) {
    return {
      background: HeaderColors.background,
      text: HeaderColors.text,
      icon: HeaderColors.icon,
    };
  }
  return {
    background: pack.colors.header,
    text: pack.colors.text,
    icon: pack.colors.text,
  };
}

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) {
  const theme = useColorScheme();
  const colorFromProps = props[theme];
  const colors = useThemeColors();

  if (colorFromProps) {
    return colorFromProps;
  }
  return colors[colorName];
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const themedBackground = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );
  const applyBackground = lightColor != null || darkColor != null;

  return (
    <DefaultView
      style={[applyBackground ? { backgroundColor: themedBackground } : null, style]}
      {...otherProps}
    />
  );
}

/** Full-screen surface with the theme background. Nested layout views stay transparent. */
export function Screen(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const pageId = useContext(PageThemeContext);
  const scheme = useColorScheme();
  const packId = useThemePackStore((state) => state.packId);
  const pageTheme = usePageThemeStore((state) =>
    pageId ? state.themes[pageId] : undefined,
  );
  const packDefaults = pageId
    ? pageDefaultsForPack(packId, pageId)
    : {
        foreground: packToThemeColors(packId).text,
        background: packToThemeColors(packId).background,
      };
  const appearance = resolvePageAppearance(
    pageId,
    pageTheme,
    scheme,
    scheme === "dark" ? undefined : packDefaults,
  );
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );
const packBackground =
    scheme === "light" && !appearance.imageUri && !pageTheme?.background
      ? getThemePackAssets(packId).background
      : undefined
  const hasSceneArt = Boolean(appearance.imageUri || packBackground);
  const pack = getThemePack(packId);

  return (
    <DefaultView style={{ flex: 1, backgroundColor }}>
      {appearance.imageUri ? (
        <PageBackgroundImage
          source={{ uri: appearance.imageUri }}
          mode={appearance.imageMode}
        />
      ) : packBackground ? (
        <PageBackgroundImage source={packBackground} mode="cover" />
      ) : null}
      {hasSceneArt && scheme === "light" ? (
        <DefaultView
          pointerEvents="none"
          style={[
            styles.backdrop,
            {
              backgroundColor:
                pack?.colors.overlay || Layout.scrim,
            },
          ]}
        />
      ) : null}
      <DefaultView style={[styles.foreground, style]} {...otherProps} />
    </DefaultView>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
  },
  foreground: {
    flex: 1,
    zIndex: 1,
    position: "relative",
  },
});
