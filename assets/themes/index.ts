import type { ImageSourcePropType } from "react-native";

/**
 * Metro cannot glob `require()` image assets. Add a folder under
 * `assets/themes` with `theme.json` + `assets.ts`, then register it here.
 */
import tavernManifest from "./tavern/theme.json";
import tavernAssets from "./tavern/assets";
import unicornManifest from "./unicorn/theme.json";
import unicornAssets from "./unicorn/assets";

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

export const themeModules: ThemeModule[] = [
  { manifest: tavernManifest, assets: tavernAssets },
  { manifest: unicornManifest, assets: unicornAssets },
];
