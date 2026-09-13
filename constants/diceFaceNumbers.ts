import { colourFromName } from "@/constants/colourFromName";
import { type Point, polygonCentroid } from "@/constants/diceGeometry";

export type { Point };

export type FaceNumberLayout = {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fill: string;
};

const NUMBER_LIGHT = "#f4f0e6";

const DIE_FACE_NUMERALS: Record<string, string[]> = {
  d4: ["4", "3", "2"],
  d6: ["6", "5", "1"],
  d8: ["8", "6", "3", "1"],
  d10: ["0", "8", "6", "4", "2"],
  d12: ["12", "8", "4", "11", "7", "3"],
  d20: ["20", "14", "8", "2", "19", "13", "7", "1", "18", "12"],
  d100: ["00", "90", "70", "50", "30"],
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export { polygonCentroid };

export const polygonBounds = (points: Point[]) => {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  };
};

export const fontSizeForFace = (points: Point[], text: string): number => {
  const { width, height } = polygonBounds(points);
  const factor = text.length > 1 ? 0.36 : 0.44;
  return clamp(Math.min(width, height) * factor, 6, 20);
};

export const hexLuminance = (hex: string): number => {
  const value = colourFromName(hex).replace("#", "");
  const channel = (start: number) => {
    const raw = Number.parseInt(value.slice(start, start + 2), 16) / 255;
    return raw <= 0.03928 ? raw / 12.92 : ((raw + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
};

export const contrastNumberFill = (
  _faceHex: string,
  manualColour?: string | null,
): string => {
  if (manualColour && manualColour.trim()) {
    return colourFromName(manualColour);
  }
  return NUMBER_LIGHT;
};

export const numeralsForDie = (
  dieId: string,
  faceCount: number,
  primary: string,
): string[] => {
  const preset = [...(DIE_FACE_NUMERALS[dieId] ?? [primary])];
  preset[0] = primary;
  return preset.slice(0, faceCount);
};

/** Place numerals on faces nearest the die centre. Primary numeral first. */
export const layoutDieFaceNumbers = (
  dieId: string,
  faces: Point[][],
  primary: string,
  faceHex: (index: number) => string,
  manualColour?: string | null,
): FaceNumberLayout[] => {
  const labels = numeralsForDie(dieId, faces.length, primary);
  const ranked = faces
    .map((face, index) => {
      const [cx, cy] = polygonCentroid(face);
      const dist = (cx - 50) ** 2 + (cy - 48) ** 2;
      return { face, index, dist };
    })
    .sort((left, right) => left.dist - right.dist);

  return ranked.flatMap((item, rank) => {
    const text = labels[rank];
    if (!text) return [];
    const fontSize = fontSizeForFace(item.face, text);
    if (fontSize < 5.5) return [];
    const [cx, cy] = polygonCentroid(item.face);
    const fill = contrastNumberFill(faceHex(item.index), manualColour);
    return [
      {
        text,
        x: cx,
        y: cy + fontSize * 0.34,
        fontSize,
        fill,
      },
    ];
  });
};
