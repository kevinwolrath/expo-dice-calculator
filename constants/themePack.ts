import { themeModules, type ThemeManifest } from "@/assets/themes";
import type { PageThemeId } from "@/constants/pageTheme";

export type ThemePackId = string;

export type ThemePackColors = {
  text: string;
  background: string;
  tint: string;
  tabIconDefault: string;
  tabIconSelected: string;
  card: string;
  border: string;
  inputBorder: string;
  inputBackground: string;
  muted: string;
  label: string;
  primary: string;
  onPrimary: string;
  destructive: string;
  overlay: string;
  header: string;
  tabBar: string;
  accent: string;
};

export type ThemePackPageDefaults = {
  foreground: string;
  background: string;
};

export type ThemePack = {
  id: ThemePackId;
  name: string;
  colors: ThemePackColors;
};

const color = (raw: Record<string, string>, keys: string[], fallback: string) => {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return fallback;
};

const packColorsFromManifest = (manifest: ThemeManifest): ThemePackColors => {
  const raw = manifest.colors;
  const text = color(raw, ["text"], "#ffffff");
  const primary = color(raw, ["primary"], "#ffffff");
  const background = color(raw, ["primaryDark", "background", "header"], "#000000");
  return {
    text,
    background,
    tint: primary,
    tabIconDefault: color(raw, ["textMuted", "muted"], text),
    tabIconSelected: primary,
    card: color(raw, ["card", "panel"], "#171B22"),
    border: color(raw, ["border", "gold", "accent"], primary),
    inputBorder: color(raw, ["inputBorder"], "rgba(210, 218, 230, 0.55)"),
    inputBackground: color(raw, ["inputBackground"], "#262930"),
    muted: color(raw, ["placeholder", "textMuted", "muted"], "#AEB4BE"),
    label: color(raw, ["label", "parchment", "text"], text),
    primary,
    onPrimary: color(raw, ["onPrimary"], "#ffffff"),
    destructive: color(raw, ["destructive"], "#C45C52"),
    overlay: color(raw, ["overlay"], "rgba(5, 12, 22, 0.78)"),
    header: color(raw, ["header", "primaryDark"], background),
    tabBar: color(raw, ["tabBar", "header", "primaryDark"], background),
    accent: color(raw, ["accent", "gold", "primary"], primary),
  };
};

const PACKS: ThemePack[] = themeModules.map(({ manifest }) => ({
  id: manifest.id,
  name: manifest.name,
  colors: packColorsFromManifest(manifest),
}));

if (PACKS.length === 0) {
  throw new Error("No theme packs registered in assets/themes");
}

const defaultPack = PACKS[0]!;

export const DEFAULT_THEME_PACK_ID: ThemePackId = defaultPack.id;

const packById = new Map(PACKS.map((pack) => [pack.id, pack]));

export const isThemePackId = (value: unknown): value is ThemePackId =>
  typeof value === "string" && packById.has(value);

export const getThemePack = (id: ThemePackId): ThemePack =>
  packById.get(id) ?? defaultPack;

export const listThemePacks = (): ThemePack[] => PACKS;

export const pageDefaultsForPack = (
  packId: ThemePackId,
  _pageId: PageThemeId,
): ThemePackPageDefaults => {
  const { colors } = getThemePack(packId);
  return { foreground: colors.text, background: colors.background };
};
