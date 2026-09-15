import type { ImageSourcePropType } from "react-native";

export type ThemeManifest = {
  id: string;
  name: string;
  colors: Record<string, string>;
};

export type ThemePreviewAssets = {
  footerParchment: ImageSourcePropType;
  diceIcon: ImageSourcePropType;
  paletteIcon: ImageSourcePropType;
};

export type ThemeAssetMap = {
  background?: ImageSourcePropType;
  backgroundDark?: ImageSourcePropType;
  banner?: ImageSourcePropType;
  buttonPrimary?: ImageSourcePropType;
  buttonWood?: ImageSourcePropType;
  buttonOutline?: ImageSourcePropType;
  icons?: Record<string, ImageSourcePropType>;
  preview?: ThemePreviewAssets;
};

export type ThemeModule = {
  manifest: ThemeManifest;
  assets: ThemeAssetMap;
};

export const folderFromThemeKey = (key: string): string | null => {
  const match = key.match(/^\.\/([^./][^/]*)\/(?:theme\.json|assets\.ts)$/);
  return match?.[1] ?? null;
};

export const unwrapDefault = <T,>(mod: unknown): T | undefined => {
  if (mod == null || typeof mod !== "object") return undefined;
  if ("default" in mod && (mod as { default: T }).default != null) {
    return (mod as { default: T }).default;
  }
  return mod as T;
};

const isManifest = (value: unknown): value is ThemeManifest => {
  if (value == null || typeof value !== "object") return false;
  const colors = (value as ThemeManifest).colors;
  return typeof colors === "object" && colors != null;
};

export const assembleThemeModules = (
  manifestEntries: Array<{ folder: string; value: unknown }>,
  assetEntries: Array<{ folder: string; value: unknown }>,
): ThemeModule[] => {
  const assetsByFolder = new Map<string, ThemeAssetMap>();
  for (const entry of assetEntries) {
    const assets = unwrapDefault<ThemeAssetMap>(entry.value);
    if (assets) assetsByFolder.set(entry.folder, assets);
  }

  const modules: ThemeModule[] = [];
  for (const entry of [...manifestEntries].sort((a, b) =>
    a.folder.localeCompare(b.folder),
  )) {
    const assets = assetsByFolder.get(entry.folder);
    const manifest = unwrapDefault<ThemeManifest>(entry.value);
    if (!assets || !isManifest(manifest)) continue;
    modules.push({
      manifest: {
        id: entry.folder,
        name:
          typeof manifest.name === "string" && manifest.name.length > 0
            ? manifest.name
            : entry.folder,
        colors: manifest.colors,
      },
      assets,
    });
  }
  return modules;
};
