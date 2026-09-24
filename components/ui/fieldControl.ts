import { Platform, type TextStyle } from "react-native";

import { useThemeColors } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import { hexToRgba } from "@/constants/pageTheme";
import { Control, FontSize } from "@/constants/theme";

export type ControlColors = {
  fill: string;
  border: string;
  text: string;
  placeholder: string;
  label: string;
  focus: string;
  required: string;
  disabledFill: string;
  disabledText: string;
  disabledBorder: string;
  selectedFill: string;
};

const NIGHT_CONTROL: ControlColors = {
  fill: "#111111",
  border: "#888888",
  text: "#ffffff",
  placeholder: "#aaaaaa",
  label: "#ffffff",
  focus: "#ffffff",
  required: "#ffffff",
  disabledFill: "#0a0a0a",
  disabledText: "#cccccc",
  disabledBorder: "#555555",
  selectedFill: "rgba(255, 255, 255, 0.16)",
};

export const inputTypeface: TextStyle = {
  fontFamily: Platform.select({
    ios: undefined,
    android: "sans-serif",
    default: "system-ui",
  }),
  fontSize: FontSize.md,
  fontWeight: "400",
};

export function useControlColors(): ControlColors {
  const scheme = useColorScheme();
  const colors = useThemeColors();
  if (scheme === "dark") return NIGHT_CONTROL;

  return {
    fill: colors.inputBackground,
    border: colors.inputBorder,
    text: colors.text,
    placeholder: colors.muted,
    label: colors.label,
    focus: colors.primary,
    required: colors.destructive,
    disabledFill: colors.inputBackground,
    disabledText: colors.muted,
    disabledBorder: colors.inputBorder,
    selectedFill: hexToRgba(colors.primary, 0.18),
  };
}

export type ControlChromeStyle = {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  paddingHorizontal: number;
  minHeight: number;
  shadowColor?: string;
  shadowOpacity: number;
  shadowRadius?: number;
  shadowOffset?: { width: number; height: number };
  elevation: number;
};

export function controlStyle({
  colors,
  focused = false,
  disabled = false,
  error = false,
  errorColor,
}: {
  colors: ControlColors;
  focused?: boolean;
  disabled?: boolean;
  error?: boolean;
  errorColor?: string;
}): ControlChromeStyle {
  let borderColor = colors.border;
  if (error && errorColor) borderColor = errorColor;
  else if (focused) borderColor = colors.focus;
  else if (disabled) borderColor = colors.disabledBorder;

  return {
    backgroundColor: disabled ? colors.disabledFill : colors.fill,
    borderColor,
    borderWidth: Control.borderWidth,
    borderRadius: Control.radius,
    paddingHorizontal: Control.paddingX,
    minHeight: Control.height,
    ...(focused && !error
      ? {
          shadowColor: colors.focus,
          shadowOpacity: 0.38,
          shadowRadius: 5,
          shadowOffset: { width: 0, height: 0 },
          elevation: 2,
        }
      : { shadowOpacity: 0, elevation: 0 }),
  };
}
