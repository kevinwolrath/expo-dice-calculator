import { shadeHex } from "@/constants/colourFromName";
import { mixHex, resolveResinColours } from "@/constants/resinPour";
import { createResinRng, seedFromKey } from "@/constants/resinRng";
import { catmullRomPath } from "@/constants/resinSwirl";

export type ResinBlob = {
  d: string;
  color: string;
  opacity: number;
};

export type ResinColourField = {
  dominant: string;
  palette: string[];
  pourColours: string[];
  blobs: ResinBlob[];
};

type Point = [number, number];

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const isDirtyPour = (method?: string | null): boolean =>
  /dirty\s*pour/i.test(method ?? "");

export const isResinMaterial = (material?: string | null): boolean =>
  !material || /resin/i.test(material);

const closedBlobPath = (
  cx: number,
  cy: number,
  radius: number,
  rng: () => number,
): string => {
  const steps = 6 + Math.floor(rng() * 3);
  const start = rng() * Math.PI * 2;
  const points: Point[] = [];
  for (let index = 0; index < steps; index += 1) {
    const t = index / steps;
    const wobble = 0.64 + rng() * 0.52;
    const angle = start + t * Math.PI * 2 + (rng() - 0.5) * 0.32;
    const stretch = 0.78 + rng() * 0.32;
    points.push([
      clamp(cx + Math.cos(angle) * radius * wobble, -22, 122),
      clamp(cy + Math.sin(angle) * radius * wobble * stretch, -22, 122),
    ]);
  }
  const looped = [...points, points[0], points[1]];
  const path = catmullRomPath(looped);
  return path ? `${path} Z` : "";
};

/**
 * One shared colour field per die. Dirty Pour uses broad overlapping blobs
 * so colour continues across faces instead of filling each polygon.
 */
export const buildResinColourField = (
  colours: string[],
  seed: number,
  productionMethod?: string | null,
): ResinColourField => {
  const palette = resolveResinColours(colours).slice(0, 3);
  const rng = createResinRng(seedFromKey(seed) ^ 0x2f17a9);
  const dominantIndex = seed % palette.length;
  const dominant = palette[dominantIndex];
  const others = palette.filter((_, index) => index !== dominantIndex);
  const blend = others[0] ? mixHex(dominant, others[0], 0.28) : dominant;
  const pourColours = [
    shadeHex(dominant, 0.1),
    dominant,
    blend,
    shadeHex(dominant, -0.1),
  ];

  if (!isDirtyPour(productionMethod) || others.length === 0) {
    return { dominant, palette, pourColours, blobs: [] };
  }

  const blobs: ResinBlob[] = [];
  others.forEach((color) => {
    const copies = 1 + (rng() > 0.38 ? 1 : 0);
    for (let copy = 0; copy < copies; copy += 1) {
      const d = closedBlobPath(
        18 + rng() * 64,
        16 + rng() * 66,
        24 + rng() * 28,
        rng,
      );
      if (!d) continue;
      blobs.push({
        d,
        color: copy === 0 ? color : mixHex(color, dominant, 0.22 + rng() * 0.2),
        opacity: 0.46 + rng() * 0.28,
      });
    }
  });

  const overlap = closedBlobPath(
    28 + rng() * 42,
    24 + rng() * 46,
    30 + rng() * 22,
    rng,
  );
  if (overlap && others[0]) {
    blobs.push({
      d: overlap,
      color: mixHex(others[0], others[1] ?? dominant, 0.45),
      opacity: 0.32 + rng() * 0.18,
    });
  }

  return {
    dominant,
    palette,
    pourColours,
    blobs: blobs.filter((blob) => blob.d.length > 0),
  };
};
