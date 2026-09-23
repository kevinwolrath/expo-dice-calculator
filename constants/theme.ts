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
  listBottom: 96,
  keyboardOffset: 100,
  scrim: "rgba(5, 12, 22, 0.78)",
  cardGap: 16,
  cardPadding: 16,
  cardRadius: 16,
  panelBorderWidth: 1,
  panelShadowOpacity: 0.28,
  panelShadowRadius: 6,
  panelShadowOffset: { width: 0, height: 2 },
  panelElevation: 2,
  labelGap: 10,
  controlHeight: 56,
  buttonHeight: 56,
  notesHeight: 100,
  listGutter: 16,
  headerSpacer: 96,
  rowGap: 16,
  actionGap: 12,
  /** Reserved for tablet/web; do not stretch forms past this. */
  contentMaxWidth: 720,
} as const;

export const Control = {
  borderWidth: 1,
  radius: 11,
  paddingX: 16,
  height: Layout.controlHeight,
  labelSize: 16,
  labelWeight: "600",
} as const;

export const Stroke = {
  hairline: StyleSheet.hairlineWidth,
  input: StyleSheet.hairlineWidth * 2,
  item: 2,
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
    fontSize: FontSize.sm,
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
