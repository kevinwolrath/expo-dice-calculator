import { colourFromName, shadeHex } from "@/constants/colourFromName";

export type ResinStop = {
  offset: number;
  color: string;
  opacity?: number;
};

export type ResinPour = {
  linear: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    stops: ResinStop[];
  };
  radial: {
    cx: number;
    cy: number;
    r: number;
    stops: ResinStop[];
  };
};

const FALLBACK = "#d9d9d9";

const parseRgb = (hex: string): [number, number, number] => {
  const value = colourFromName(hex).replace("#", "");
  return [0, 2, 4].map((start) =>
    Number.parseInt(value.slice(start, start + 2), 16),
  ) as [number, number, number];
};

export const mixHex = (a: string, b: string, amount: number): string => {
  const t = Math.max(0, Math.min(1, amount));
  const from = parseRgb(a);
  const to = parseRgb(b);
  return `#${from
    .map((channel, index) => {
      const next = Math.round(channel + (to[index] - channel) * t);
      return Math.max(0, Math.min(255, next)).toString(16).padStart(2, "0");
    })
    .join("")}`;
};

export const resolveResinColours = (colours: string[]): string[] => {
  const hexes = colours
    .map((colour) => colourFromName(colour))
    .filter((hex) => /^#[0-9a-f]{6}$/i.test(hex));
  return hexes.length > 0 ? hexes : [FALLBACK];
};

const linearStops = (hexes: string[]): ResinStop[] => {
  if (hexes.length === 1) {
    const colour = hexes[0];
    return [
      { offset: 0, color: shadeHex(colour, 0.14) },
      { offset: 0.48, color: colour },
      { offset: 1, color: shadeHex(colour, -0.12) },
    ];
  }

  const last = hexes.length - 1;
  const stops: ResinStop[] = [];
  hexes.forEach((colour, index) => {
    const start = index / last;
    stops.push({ offset: start, color: colour });
    if (index >= last) return;
    const mid = (index + 0.5) / last;
    stops.push({
      offset: mid,
      color: mixHex(colour, hexes[index + 1], 0.5),
    });
  });
  return stops;
};

/** Shared pour across a 0–100 viewBox. `seed` rotates the swirl per die. */
export const buildResinPour = (colours: string[], seed = 0): ResinPour => {
  const hexes = resolveResinColours(colours);
  const angle = ((seed * 0.6180339887 + 0.14) % 1) * Math.PI;
  const dx = Math.cos(angle) * 48;
  const dy = Math.sin(angle) * 48;
  const bloom = hexes[Math.min(1, hexes.length - 1)];

  return {
    linear: {
      x1: 50 - dx,
      y1: 50 - dy,
      x2: 50 + dx,
      y2: 50 + dy,
      stops: linearStops(hexes),
    },
    radial: {
      cx: 30 + ((seed * 13) % 28),
      cy: 26 + ((seed * 19) % 24),
      r: 38 + ((seed * 7) % 14),
      stops: [
        { offset: 0, color: bloom, opacity: hexes.length > 1 ? 0.42 : 0.18 },
        { offset: 0.55, color: bloom, opacity: hexes.length > 1 ? 0.16 : 0.06 },
        { offset: 1, color: bloom, opacity: 0 },
      ],
    },
  };
};

export const resinEdgeColour = (colours: string[]): string => {
  const hexes = resolveResinColours(colours);
  const mixed = hexes.reduce((current, colour) => mixHex(current, colour, 0.5));
  return shadeHex(mixed, -0.32);
};
