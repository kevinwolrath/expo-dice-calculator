/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.dev/develop/user-interface/color-themes/
 */
import { useContext } from "react";
import { Text as DefaultText, View as DefaultView } from "react-native";

import { useColorScheme } from "./useColorScheme";

import PageBackgroundImage from "@/components/pageTheme/PageBackgroundImage";
import { PageThemeContext } from "@/components/pageTheme/PageThemeScope";
import Colors from "@/constants/Colors";
import type { PageTheme } from "@/constants/pageTheme";
import usePageThemeStore from "@/stores/usePageThemeStore";

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText["props"];
export type ViewProps = ThemeProps & DefaultView["props"];

type ThemeColors = (typeof Colors)[keyof typeof Colors];

const applyPageTheme = (
  base: ThemeColors,
  pageTheme: PageTheme | undefined,
  scheme: keyof typeof Colors,
): ThemeColors => {
  if (!pageTheme) return base;
  const translucentCard =
    scheme === "dark" ? "rgba(28, 28, 30, 0.9)" : "rgba(247, 247, 249, 0.9)";
  return {
    ...base,
    text: pageTheme.foreground ?? base.text,
    background: pageTheme.background ?? base.background,
    card: pageTheme.surface ?? (pageTheme.imageUri ? translucentCard : base.card),
  };
};

export function useThemeColors() {
  const scheme = useColorScheme();
  const pageId = useContext(PageThemeContext);
  const pageTheme = usePageThemeStore((state) =>
    pageId ? state.themes[pageId] : undefined,
  );
  return applyPageTheme(Colors[scheme], pageTheme, scheme);
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
  const pageTheme = usePageThemeStore((state) =>
    pageId ? state.themes[pageId] : undefined,
  );
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );

  return (
    <DefaultView style={{ flex: 1, backgroundColor }}>
      {pageTheme?.imageUri ? (
        <PageBackgroundImage
          uri={pageTheme.imageUri}
          mode={pageTheme.imageMode}
        />
      ) : null}
      <DefaultView style={[{ flex: 1 }, style]} {...otherProps} />
    </DefaultView>
  );
}
