import { colourFromName, shadeHex } from "@/constants/colourFromName";
import { mixHex } from "@/constants/resinPour";
import { createResinRng, seedFromKey } from "@/constants/resinRng";

export type ResinGlitterSpeckle = {
  cx: number;
  cy: number;
  r: number;
  color: string;
  opacity: number;
};

export const DEFAULT_GLITTER_COLOUR = "#eee6c8";
export const MAX_GLITTER_SPECKLES = 14;

/** Seeded glitter flakes in a 0–100 viewBox. Clip to the die separately. */
export const buildResinGlitter = (
  seed: number,
  colour: string = DEFAULT_GLITTER_COLOUR,
  count = MAX_GLITTER_SPECKLES,
): ResinGlitterSpeckle[] => {
  const rng = createResinRng(seedFromKey(seed) ^ 0x91c7e2);
  const hex = colourFromName(colour);
  const flakes = [hex, mixHex(hex, "#ffffff", 0.42), shadeHex(hex, 0.18)];
  const total = Math.max(0, Math.min(MAX_GLITTER_SPECKLES, Math.round(count)));
  return Array.from({ length: total }, () => ({
    cx: 12 + rng() * 76,
    cy: 14 + rng() * 72,
    r: 0.42 + rng() * 0.78,
    color: flakes[Math.floor(rng() * flakes.length)],
    opacity: 0.26 + rng() * 0.48,
  }));
};
