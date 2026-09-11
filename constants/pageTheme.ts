export const PAGE_THEME_IDS = [
  "dicejob",
  "stock",
  "material-types",
  "colour-types",
  "production-methods",
  "dice-number-colours",
  "maintenance",
] as const;

export type PageThemeId = (typeof PAGE_THEME_IDS)[number];

export type PageImageMode = "center" | "tile" | "cover";

export type PageTheme = {
  foreground: string | null;
  background: string | null;
  imageUri: string | null;
  imageMode: PageImageMode;
};

export type PageThemeMap = Record<PageThemeId, PageTheme>;

export const NIGHT_FOREGROUND = "#ffffff";
export const NIGHT_BACKGROUND = "#000000";

/** Last-resort day colours when no pack defaults are passed. Every page uses the same pair. */
const SHARED_PAGE_FALLBACK = {
  foreground: "#ffffff",
  background: "#111111",
};

export const PAGE_DEFAULT_COLORS: Record<
  PageThemeId,
  { foreground: string; background: string }
> = {
  dicejob: SHARED_PAGE_FALLBACK,
  stock: SHARED_PAGE_FALLBACK,
  "material-types": SHARED_PAGE_FALLBACK,
  "colour-types": SHARED_PAGE_FALLBACK,
  "production-methods": SHARED_PAGE_FALLBACK,
  "dice-number-colours": SHARED_PAGE_FALLBACK,
  maintenance: SHARED_PAGE_FALLBACK,
};

export type ResolvedPageAppearance = {
  foreground: string;
  background: string;
  imageUri: string | null;
  imageMode: PageImageMode;
};

export const resolvePageAppearance = (
  pageId: PageThemeId | null,
  theme: PageTheme | undefined,
  scheme: "light" | "dark",
  packDefaults?: { foreground: string; background: string },
): ResolvedPageAppearance => {
  if (scheme === "dark") {
    return {
      foreground: NIGHT_FOREGROUND,
      background: NIGHT_BACKGROUND,
      imageUri: null,
      imageMode: "center",
    };
  }

  const defaults =
    packDefaults ??
    (pageId
      ? PAGE_DEFAULT_COLORS[pageId]
      : { foreground: "#000000", background: "#ffffff" });

  return {
    foreground: theme?.foreground ?? defaults.foreground,
    background: theme?.background ?? defaults.background,
    imageUri: theme?.imageUri ?? null,
    imageMode: theme?.imageMode ?? "center",
  };
};

export const defaultPageTheme = (): PageTheme => ({
  foreground: null,
  background: null,
  imageUri: null,
  imageMode: "center",
});

export const emptyPageThemeMap = (): PageThemeMap => {
  const themes = {} as PageThemeMap;
  for (const id of PAGE_THEME_IDS) {
    themes[id] = defaultPageTheme();
  }
  return themes;
};

export const isPageThemeId = (value: unknown): value is PageThemeId =>
  typeof value === "string" &&
  (PAGE_THEME_IDS as readonly string[]).includes(value);

export const pageIdFromSegments = (segments: string[]): PageThemeId | null => {
  for (let index = segments.length - 1; index >= 0; index -= 1) {
    const segment = segments[index];
    if (segment && isPageThemeId(segment)) return segment;
  }
  return null;
};

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const isHexColor = (value: string): boolean => HEX_COLOR.test(value);

export const normalizeHexColor = (value: string): string | null => {
  const trimmed = value.trim();
  if (!isHexColor(trimmed)) return null;
  if (trimmed.length === 4) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return trimmed.toLowerCase();
};

export const hexToRgba = (hex: string, alpha: number): string => {
  const normalized = normalizeHexColor(hex);
  if (!normalized) return `rgba(255, 255, 255, ${alpha})`;
  const value = normalized.slice(1);
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/** List/form cards stay readable while the page background or image shows through. */
export const CARD_TINT_ALPHA = 0.72;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseTheme = (value: unknown): PageTheme => {
  const theme = defaultPageTheme();
  if (!isRecord(value)) return theme;

  if (typeof value.foreground === "string") {
    theme.foreground = normalizeHexColor(value.foreground);
  }
  if (typeof value.background === "string") {
    theme.background = normalizeHexColor(value.background);
  }
  if (typeof value.imageUri === "string" && value.imageUri.length > 0) {
    theme.imageUri = value.imageUri;
  }
  if (value.imageMode === "center" || value.imageMode === "tile") {
    theme.imageMode = value.imageMode;
  }
  return theme;
};

export const parsePageThemeMap = (text: string | null): PageThemeMap => {
  const themes = emptyPageThemeMap();
  if (!text) return themes;

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return themes;
  }

  if (!isRecord(parsed)) return themes;

  for (const id of PAGE_THEME_IDS) {
    if (id in parsed) {
      themes[id] = parseTheme(parsed[id]);
    }
  }
  return themes;
};
