import { shadeHex } from "@/constants/colourFromName";
import { faceStrokeWidth } from "@/constants/diceFaceShading";
import { mixHex } from "@/constants/resinPour";
import { isResinMaterial } from "@/constants/resinPattern";

export const POLISH_HIGHLIGHT = {
  cx: 28,
  cy: 20,
  r: 22,
  stops: [
    { offset: 0, color: "#ffffff", opacity: 0.34 },
    { offset: 0.45, color: "#ffffff", opacity: 0.1 },
    { offset: 1, color: "#ffffff", opacity: 0 },
  ],
} as const;

export const EDGE_STROKE_OPACITY = 0.34;

export const polishStrength = (material?: string | null) =>
  isResinMaterial(material) ? 1 : 0.62;

export const resinFaceEdgeColour = (base: string): string =>
  mixHex(shadeHex(base, -0.12), base, 0.35);

export const faceEdgeStrokeWidth = (size: number) =>
  faceStrokeWidth(size) * 0.55;

export const litEdgeStrokeWidth = (size: number) =>
  faceStrokeWidth(size) * 0.42;

export const litHighlightOpacity = 0.11;

export const oppositeShadeOpacity = 0.1;
