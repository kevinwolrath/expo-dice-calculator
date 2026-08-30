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

export type PageImageMode = "center" | "tile";

export type PageTheme = {
  foreground: string | null;
  background: string | null;
  surface: string | null;
  imageUri: string | null;
  imageMode: PageImageMode;
};

export type PageThemeMap = Record<PageThemeId, PageTheme>;

export const defaultPageTheme = (): PageTheme => ({
  foreground: null,
  background: null,
  surface: null,
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
  if (typeof value.surface === "string") {
    theme.surface = normalizeHexColor(value.surface);
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
