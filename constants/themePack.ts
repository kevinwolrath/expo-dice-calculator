import { themeModules, type ThemeManifest } from "@/assets/themes";
import Colors, { HeaderColors } from "@/constants/Colors";
import type { PageThemeId } from "@/constants/pageTheme";
import {
  getUserThemeEntry,
  listUserThemeEntries,
} from "@/constants/userThemeRegistry";

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
  wood: string;
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
    wood: color(raw, ["wood"], "#8B5E3C"),
  };
};

export const themePackFromManifest = (
  manifest: ThemeManifest,
): ThemePack => ({
  id: manifest.id,
  name: manifest.name,
  colors: packColorsFromManifest(manifest),
});

const BUNDLED_PACKS: ThemePack[] = themeModules.map(({ manifest }) =>
  themePackFromManifest(manifest),
);

const bundledById = new Map(BUNDLED_PACKS.map((pack) => [pack.id, pack]));

/** First launch, or the stored pack folder is gone. */
export const DEFAULT_THEME_PACK_ID: ThemePackId = "dragon";

export const UNSTYLED_PACK_COLORS: ThemePackColors = {
  text: Colors.light.text,
  background: Colors.light.background,
  tint: Colors.light.tint,
  tabIconDefault: Colors.light.tabIconDefault,
  tabIconSelected: Colors.light.tabIconSelected,
  card: Colors.light.card,
  border: Colors.light.border,
  inputBorder: Colors.light.inputBorder,
  inputBackground: Colors.light.inputBackground,
  muted: Colors.light.muted,
  label: Colors.light.label,
  primary: Colors.light.primary,
  onPrimary: Colors.light.onPrimary,
  destructive: Colors.light.destructive,
  overlay: Colors.light.overlay,
  header: HeaderColors.background,
  tabBar: Colors.light.background,
  accent: Colors.light.tint,
  wood: Colors.light.card,
};

export const isBundledThemePackId = (value: unknown): value is ThemePackId =>
  typeof value === "string" && bundledById.has(value);

export const isUserThemePackId = (value: unknown): value is ThemePackId =>
  typeof value === "string" && Boolean(getUserThemeEntry(value));

export const isThemePackId = (value: unknown): value is ThemePackId =>
  isBundledThemePackId(value) || isUserThemePackId(value);

export const getThemePack = (id: ThemePackId | null | undefined): ThemePack | null => {
  if (!id) return null;
  return bundledById.get(id) ?? getUserThemeEntry(id)?.pack ?? null;
};

export const themeColorsForPack = (
  id: ThemePackId | null | undefined,
): ThemePackColors => getThemePack(id)?.colors ?? UNSTYLED_PACK_COLORS;

export const listThemePacks = (): ThemePack[] => {
  const userPacks = listUserThemeEntries().map((entry) => entry.pack);
  return [...BUNDLED_PACKS, ...userPacks];
};

export const pageDefaultsForPack = (
  packId: ThemePackId | null | undefined,
  _pageId: PageThemeId,
): ThemePackPageDefaults => {
  const colors = themeColorsForPack(packId);
  return { foreground: colors.text, background: colors.background };
};
