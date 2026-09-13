import { StyleSheet } from "react-native";

import { hexToRgba } from "@/constants/pageTheme";
import { Space } from "@/constants/theme";

export const previewClusterScale = (
  isBackground: boolean,
  modalScale: number,
) => (isBackground ? 0.72 : modalScale);

export const previewStroke = (stroke: string, isBackground: boolean) =>
  isBackground ? hexToRgba(stroke, 0.28) : stroke;

export const previewBackdrop = (colors: { background: string; text: string }) => ({
  backgroundColor: hexToRgba(colors.background, 0.12),
  borderColor: hexToRgba(colors.text, 0.06),
});

export const previewStyles = StyleSheet.create({
  float: {
    width: "100%",
    alignItems: "center",
    paddingTop: Space[2],
  },
  modalWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  oval: {
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: Space[3],
    paddingHorizontal: Space[2],
    opacity: 0.18,
  },
  cluster: {
    position: "relative",
  },
  die: {
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 2,
  },
});
