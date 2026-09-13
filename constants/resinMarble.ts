import { shadeHex } from "@/constants/colourFromName";
import { mixHex, resolveResinColours } from "@/constants/resinPour";
import { catmullRomPath } from "@/constants/resinSwirl";
import { createResinRng, seedFromKey } from "@/constants/resinRng";

export type ResinMarbleVein = {
  d: string;
  color: string;
  width: number;
  opacity: number;
};

export type ResinMarble = {
  base: string;
  secondaries: string[];
  veins: ResinMarbleVein[];
};

type Point = [number, number];

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const splitMarbleColours = (
  colours: string[],
): { base: string; secondaries: string[] } => {
  const hexes = resolveResinColours(colours);
  return {
    base: hexes[0],
    secondaries: hexes.slice(1, 4),
  };
};

const wanderVein = (rng: () => number, long: boolean): Point[] => {
  const angle = rng() * Math.PI * 2;
  const length = long ? 78 + rng() * 28 : 42 + rng() * 28;
  const steps = long ? 8 : 5 + Math.floor(rng() * 3);
  const originX = 50 + Math.cos(angle + Math.PI) * (12 + rng() * 22);
  const originY = 50 + Math.sin(angle + Math.PI) * (12 + rng() * 22);
  const freq = 1.1 + rng() * 1.6;
  const amp = 7 + rng() * 11;
  const points: Point[] = [];
  for (let index = 0; index <= steps; index += 1) {
    const t = index / steps;
    const nx = -Math.sin(angle);
    const ny = Math.cos(angle);
    const bend = Math.sin(t * Math.PI * freq) * amp + (rng() - 0.5) * 4;
    points.push([
      clamp(originX + Math.cos(angle) * length * t + nx * bend, -12, 112),
      clamp(originY + Math.sin(angle) * length * t + ny * bend, -12, 112),
    ]);
  }
  return points;
};

/** Seeded marble veins over a dominant base colour. Shared 0–100 viewBox. */
export const buildResinMarble = (
  colours: string[],
  seed: number,
): ResinMarble => {
  const { base, secondaries } = splitMarbleColours(colours);
  const rng = createResinRng(seedFromKey(seed) ^ 0x51ed);
  const veinColours =
    secondaries.length > 0
      ? secondaries
      : [shadeHex(base, 0.12), shadeHex(base, -0.1)];

  const veins: ResinMarbleVein[] = [];
  veinColours.forEach((colour, colourIndex) => {
    const copies = 1 + (colourIndex === 0 ? 1 : 0) + (rng() > 0.55 ? 1 : 0);
    for (let copy = 0; copy < copies; copy += 1) {
      const hairline = rng() > 0.62;
      veins.push({
        d: catmullRomPath(wanderVein(rng, !hairline && rng() > 0.35)),
        color:
          copy === 0 ? colour : mixHex(colour, base, 0.28 + rng() * 0.22),
        width: hairline ? 1.1 + rng() * 1.4 : 2.2 + rng() * 2.6,
        opacity: hairline ? 0.22 + rng() * 0.14 : 0.28 + rng() * 0.18,
      });
    }
  });

  return {
    base,
    secondaries: veinColours,
    veins: veins.filter((vein) => vein.d.length > 0),
  };
};
