import { type ReactNode } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { View } from "@/components/Themed";
import { usePackSurface } from "@/components/usePackSurface";
import { FontSize, Layout, Space } from "@/constants/theme";
import { themeColorsForPack, type ThemePackColors } from "@/constants/themePack";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "cancel"
  | "destructive"
  | "ghost"
  | "outline"
  | "wood";

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
  icon?: ReactNode;
  compact?: boolean;
  accessibilityLabel?: string;
};

const dayPalette = (colors: ThemePackColors) => ({
  primaryBg: colors.primary,
  primaryText: colors.onPrimary,
  secondaryBg: colors.wood,
  secondaryText: colors.text,
  cancelBg: colors.card,
  cancelBorder: colors.border,
  cancelText: colors.text,
  destructiveBg: colors.destructive,
  destructiveText: colors.onPrimary,
});

const NIGHT = {
  primaryBg: "#FFFFFF",
  primaryText: "#000000",
  secondaryBg: "#111111",
  secondaryText: "#FFFFFF",
  cancelBg: "#000000",
  cancelBorder: "#FFFFFF",
  cancelText: "#FFFFFF",
  destructiveBg: "#000000",
  destructiveText: "#FFFFFF",
} as const;

const resolveTone = (
  variant: ButtonVariant,
  isNight: boolean,
  colors: ThemePackColors,
) => {
  const palette = isNight ? NIGHT : dayPalette(colors);
  const mapped = variant === "wood" || variant === "outline" ? "secondary" : variant;

  if (mapped === "primary") {
    return {
      backgroundColor: palette.primaryBg,
      color: palette.primaryText,
      borderColor: "transparent",
      borderWidth: 0,
    };
  }
  if (mapped === "secondary") {
    return {
      backgroundColor: palette.secondaryBg,
      color: palette.secondaryText,
      borderColor: "transparent",
      borderWidth: 0,
    };
  }
  if (mapped === "cancel" || mapped === "ghost") {
    return {
      backgroundColor: palette.cancelBg,
      color: palette.cancelText,
      borderColor: palette.cancelBorder,
      borderWidth: 1,
    };
  }
  return {
    backgroundColor: palette.destructiveBg,
    color: palette.destructiveText,
    borderColor: isNight ? "#FFFFFF" : "transparent",
    borderWidth: isNight ? 1 : 0,
  };
};

export default function PrimaryButton({
  title,
  onPress,
  disabled,
  variant = "primary",
  style,
  icon,
  compact,
  accessibilityLabel,
}: PrimaryButtonProps) {
  const { isNight, packId } = usePackSurface();
  const tone = resolveTone(variant, isNight, themeColorsForPack(packId));
  const label = accessibilityLabel ?? title;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      onPress={onPress}
      disabled={disabled}
      {...(Platform.OS === "web" ? { title: label } : null)}
      style={({ pressed }) => [
        styles.button,
        compact && styles.compact,
        {
          backgroundColor: tone.backgroundColor,
          borderColor: tone.borderColor,
          borderWidth: tone.borderWidth,
        },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {icon}
      <Text style={[styles.label, { color: tone.color }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 84,
    minHeight: Layout.buttonHeight,
    borderRadius: 12,
    paddingHorizontal: Space[3],
    paddingVertical: Space[2],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Space[2],
    flexShrink: 0,
  },
  compact: {
    minWidth: 54,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: "700",
    textAlign: "center",
    flexShrink: 1,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.45,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
    gap: Layout.actionGap,
    marginTop: Layout.cardGap,
  },
});

export function ActionButtonRow({ children }: { children: ReactNode }) {
  return <View style={styles.actionRow}>{children}</View>;
}
