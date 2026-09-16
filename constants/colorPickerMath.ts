/**
 * Small, self-contained HSV <-> hex helpers for the on-device colour picker
 * (ColorPickerSheet). Kept separate from the dice-resin colour math in
 * resinPour.ts — different concern (accurate colour-wheel picking vs.
 * appealing resin blends), so no reason to couple them.
 */

export type Hsv = { h: number; s: number; v: number };

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

export const hexToRgbTuple = (hex: string): [number, number, number] => {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  return [0, 2, 4].map(
    (start) => Number.parseInt(full.slice(start, start + 2), 16) || 0,
  ) as [number, number, number];
};

export const rgbToHex = (r: number, g: number, b: number): string =>
  `#${[r, g, b]
    .map((channel) =>
      Math.max(0, Math.min(255, Math.round(channel)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;

export const hexToHsv = (hex: string): Hsv => {
  const [r, g, b] = hexToRgbTuple(hex).map((channel) => channel / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const v = max;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, v };
};

export const hsvToHex = (h: number, s: number, v: number): string => {
  const hue = ((h % 360) + 360) % 360;
  const sat = clamp01(s);
  const val = clamp01(v);
  const c = val * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = val - c;
  let [r, g, b] = [0, 0, 0];
  if (hue < 60) [r, g, b] = [c, x, 0];
  else if (hue < 120) [r, g, b] = [x, c, 0];
  else if (hue < 180) [r, g, b] = [0, c, x];
  else if (hue < 240) [r, g, b] = [0, x, c];
  else if (hue < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
};

/** The fully-saturated, full-brightness colour at a given hue (0-360). */
export const hueToHex = (h: number): string => hsvToHex(h, 1, 1);
