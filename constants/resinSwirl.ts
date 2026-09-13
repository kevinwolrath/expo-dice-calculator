import { shadeHex } from "@/constants/colourFromName";
import { mixHex, resolveResinColours } from "@/constants/resinPour";
import { createResinRng, seedFromKey } from "@/constants/resinRng";

export { createResinRng, seedFromKey } from "@/constants/resinRng";

export type ResinSwirlRibbon = {
  d: string;
  color: string;
  width: number;
  opacity: number;
};

type Point = [number, number];

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const swirlPalette = (colours: string[]): string[] => {
  const hexes = resolveResinColours(colours).slice(0, 4);
  if (hexes.length === 1) {
    return [
      shadeHex(hexes[0], 0.16),
      hexes[0],
      shadeHex(hexes[0], -0.14),
    ];
  }
  const extras = hexes.slice(0, -1).map((colour, index) =>
    mixHex(colour, hexes[index + 1], 0.35),
  );
  return [...hexes, ...extras];
};

export const catmullRomPath = (points: Point[]): string => {
  if (points.length < 2) return "";
  const at = (index: number) =>
    points[clamp(index, 0, points.length - 1)];
  let path = `M ${at(0)[0].toFixed(2)} ${at(0)[1].toFixed(2)}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = at(index - 1);
    const p1 = at(index);
    const p2 = at(index + 1);
    const p3 = at(index + 2);
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    path += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return path;
};

const spiralPoints = (
  rng: () => number,
  turns: number,
  radius: number,
): Point[] => {
  const originX = 38 + rng() * 24;
  const originY = 36 + rng() * 28;
  const start = rng() * Math.PI * 2;
  const count = 8 + Math.floor(rng() * 4);
  const points: Point[] = [];
  for (let index = 0; index <= count; index += 1) {
    const t = index / count;
    const wobble = (rng() - 0.5) * 10;
    const angle = start + t * turns * Math.PI * 2 + (rng() - 0.5) * 0.45;
    const stretch = radius * (0.22 + t * 0.82) + wobble;
    points.push([
      clamp(originX + Math.cos(angle) * stretch, -8, 108),
      clamp(originY + Math.sin(angle) * stretch * (0.78 + rng() * 0.4), -8, 108),
    ]);
  }
  return points;
};

const veinPoints = (rng: () => number): Point[] => {
  const startAngle = rng() * Math.PI * 2;
  const length = 70 + rng() * 36;
  const steps = 6 + Math.floor(rng() * 3);
  const originX = 50 + Math.cos(startAngle + Math.PI) * 18;
  const originY = 50 + Math.sin(startAngle + Math.PI) * 18;
  const points: Point[] = [];
  for (let index = 0; index <= steps; index += 1) {
    const t = index / steps;
    const bend = Math.sin(t * Math.PI * (1.2 + rng())) * (14 + rng() * 16);
    const nx = -Math.sin(startAngle);
    const ny = Math.cos(startAngle);
    points.push([
      clamp(originX + Math.cos(startAngle) * length * t + nx * bend, -10, 110),
      clamp(originY + Math.sin(startAngle) * length * t + ny * bend, -10, 110),
    ]);
  }
  return points;
};

/** Deterministic pour ribbons in a 0–100 viewBox, shared across all faces. */
export const buildResinSwirls = (
  colours: string[],
  seed: number,
): ResinSwirlRibbon[] => {
  const rng = createResinRng(seedFromKey(seed));
  const palette = swirlPalette(colours);
  const ribbonCount = Math.min(7, Math.max(3, palette.length + 1));
  return Array.from({ length: ribbonCount }, (_, index) => {
    const colour = palette[index % palette.length];
    const spiral = index % 2 === 0;
    const points = spiral
      ? spiralPoints(rng, 1.15 + rng() * 0.7, 22 + rng() * 18)
      : veinPoints(rng);
    return {
      d: catmullRomPath(points),
      color: colour,
      width: 9 + rng() * 13,
      opacity: 0.38 + rng() * 0.34,
    };
  }).filter((ribbon) => ribbon.d.length > 0);
};
