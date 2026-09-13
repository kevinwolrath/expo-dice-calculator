import { type Point } from "@/constants/diceGeometry";
import {
  faceLight,
  shadeForFace,
  shadeOverlayOpacity,
} from "@/constants/diceFaceShading";

export { faceLight, shadeForFace } from "@/constants/diceFaceShading";

/** One virtual light from the upper-left, in the 0–100 die viewBox. */
export const DIE_LIGHT_FIELD = {
  x1: 14,
  y1: 6,
  x2: 92,
  y2: 96,
  stops: [
    { offset: 0, color: "#ffffff", opacity: 0.24 },
    { offset: 0.4, color: "#ffffff", opacity: 0.05 },
    { offset: 0.58, color: "#000000", opacity: 0.04 },
    { offset: 1, color: "#000000", opacity: 0.2 },
  ],
} as const;

/** Per-face depth: lighter toward the lit corner of that polygon. */
export const FACE_DEPTH_GRADIENT = {
  x1: "0%",
  y1: "0%",
  x2: "100%",
  y2: "100%",
  stops: [
    { offset: 0, color: "#ffffff", opacity: 0.14 },
    { offset: 0.42, color: "#ffffff", opacity: 0 },
    { offset: 1, color: "#000000", opacity: 0.16 },
  ],
} as const;

export const lightFieldOpacity = 0.85;

export const faceDepthOpacity = 0.7;

/** Keep facet shading weak so it multiplies over resin instead of replacing it. */
export const facetShadeOpacity = (shade: number): number =>
  shadeOverlayOpacity(shade) * 0.38;

export const isLitFace = (face: Point[]): boolean => faceLight(face) > 0.12;

export const isShadedFace = (face: Point[]): boolean => faceLight(face) < -0.08;
