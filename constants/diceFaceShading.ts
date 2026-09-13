import { type Point, polygonCentroid } from "@/constants/diceGeometry";

const FACE_SHADE_LIGHT = 0.22;
const FACE_SHADE_DARK = -0.28;
const ADJACENT_CONTRAST = 0.045;

/** Screen-space lighting: up is lighter, down/right is darker. SVG y grows downward. */
export const faceLight = (face: Point[]): number => {
  const [cx, cy] = polygonCentroid(face);
  const up = (50 - cy) / 50;
  const right = (cx - 50) / 50;
  return Math.max(-1, Math.min(1, up * 0.72 - right * 0.28));
};

export const shadeForFace = (face: Point[], index: number): number => {
  const t = (faceLight(face) + 1) / 2;
  const adjacent = index % 2 === 0 ? ADJACENT_CONTRAST : -ADJACENT_CONTRAST;
  return FACE_SHADE_DARK + t * (FACE_SHADE_LIGHT - FACE_SHADE_DARK) + adjacent;
};

export const insetTowardUpperLeft = (face: Point[], amount: number): Point[] => {
  const [cx, cy] = polygonCentroid(face);
  const hx = cx - 3.5;
  const hy = cy - 4.5;
  return face.map(([x, y]) => [
    x + (hx - x) * amount,
    y + (hy - y) * amount,
  ]);
};

export const faceStrokeWidth = (size: number) => {
  const screenPx = Math.max(0.85, Math.min(1.35, size * 0.02));
  return (screenPx / Math.max(size, 1)) * 100;
};

export const shadeOverlayOpacity = (shade: number) =>
  shade >= 0 ? shade * 0.4 : Math.abs(shade) * 0.48;
