import { StyleSheet } from "react-native";

/** 4pt spacing scale used across screens and controls. */
export const Space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 10,
  lg: 12,
  pill: 20,
} as const;

export const FontSize = {
  xs: 13,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 22,
  xxl: 24,
} as const;

export const Touch = {
  minHeight: 44,
} as const;

export const Layout = {
  screenGutter: Space[4],
  listBottom: Space[8],
  keyboardOffset: 100,
} as const;

export const Stroke = {
  hairline: StyleSheet.hairlineWidth,
  input: StyleSheet.hairlineWidth * 2,
} as const;

export const Type = StyleSheet.create({
  screenTitle: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    textAlign: "center",
  },
  heading: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  body: {
    fontSize: FontSize.md,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
  meta: {
    fontSize: FontSize.xs,
  },
  hint: {
    fontSize: FontSize.xs,
    fontStyle: "italic",
  },
  button: {
    fontSize: FontSize.md,
    fontWeight: "600",
    textAlign: "center",
  },
});
