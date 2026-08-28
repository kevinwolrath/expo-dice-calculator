/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.dev/develop/user-interface/color-themes/
 */
import { Text as DefaultText, View as DefaultView } from "react-native";

import { useColorScheme } from "./useColorScheme";

import Colors from "@/constants/Colors";

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText["props"];
export type ViewProps = ThemeProps & DefaultView["props"];

export function useThemeColors() {
  return Colors[useColorScheme()];
}

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) {
  const theme = useColorScheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
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
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );

  return (
    <DefaultView style={[{ flex: 1, backgroundColor }, style]} {...otherProps} />
  );
}
