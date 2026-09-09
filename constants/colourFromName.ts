const NAMED_COLOURS: Record<string, string> = {
  black: "#1a1a1a",
  blanco: "#f4f4f4",
  white: "#f4f4f4",
  grey: "#8a8a8a",
  gray: "#8a8a8a",
  silver: "#c0c0c0",
  gold: "#d4af37",
  golden: "#d4af37",
  copper: "#b87333",
  bronze: "#cd7f32",
  red: "#c0392b",
  crimson: "#9b1b30",
  scarlet: "#d32f2f",
  burgundy: "#6d1a2c",
  sangria: "#7b1e3a",
  cayenne: "#c23a2b",
  orange: "#e67e22",
  coral: "#ff7f50",
  peach: "#ffcba4",
  yellow: "#f1c40f",
  lime: "#8bc34a",
  green: "#2e7d32",
  teal: "#008080",
  aqua: "#4dd0e1",
  aquamarine: "#7fffd4",
  cyan: "#00bcd4",
  blue: "#2471a3",
  navy: "#1a365d",
  sapphire: "#0f52ba",
  indigo: "#3f51b5",
  violet: "#7b1fa2",
  purple: "#8e44ad",
  magenta: "#c2185b",
  fuchsia: "#d81b60",
  pink: "#e91e63",
  blush: "#de98a0",
  lilac: "#c8a2c8",
  orchid: "#da70d6",
  brown: "#6d4c41",
  tan: "#d2b48c",
  beige: "#d9c6a5",
  cream: "#fffdd0",
  ivory: "#fffff0",
};

const TOKEN_COLOURS: { token: string; hex: string }[] = Object.entries(
  NAMED_COLOURS,
)
  .map(([token, hex]) => ({ token, hex }))
  .sort((a, b) => b.token.length - a.token.length);

const hslToHex = (h: number, s: number, l: number) => {
  const sat = s / 100;
  const light = l / 100;
  const a = sat * Math.min(light, 1 - light);
  const channel = (n: number) => {
    const k = (n + h / 30) % 12;
    const colour = light - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * colour)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
};

const hashToHue = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash % 360;
};

export const colourFromName = (name: string): string => {
  const key = name.trim().toLowerCase();
  if (!key) return "#9e9e9e";
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(key)) {
    return key.length === 4
      ? `#${key[1]}${key[1]}${key[2]}${key[2]}${key[3]}${key[3]}`
      : key;
  }
  if (NAMED_COLOURS[key]) return NAMED_COLOURS[key];
  const match = TOKEN_COLOURS.find((item) => key.includes(item.token));
  if (match) return match.hex;
  return hslToHex(hashToHue(key), 58, 46);
};

export const shadeHex = (hex: string, amount: number): string => {
  const value = hex.replace("#", "");
  const channels = [0, 2, 4].map((start) =>
    Number.parseInt(value.slice(start, start + 2), 16),
  );
  return `#${channels
    .map((channel) => {
      const next = Math.round(channel * (1 + amount));
      return Math.max(0, Math.min(255, next)).toString(16).padStart(2, "0");
    })
    .join("")}`;
};
