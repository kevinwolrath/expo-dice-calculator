import type { ImageSourcePropType } from "react-native";

/**
 * Metro cannot glob `require()` image assets. Add a folder under
 * `assets/themes` with `theme.json` + `assets.ts`, then register it here.
 */
import manifest from "./tavern/theme.json";
import assets from "./tavern/assets";

export type ThemeManifest = {
  id: string;
  name: string;
  colors: Record<string, string>;
};

export type ThemeAssetMap = {
  background?: ImageSourcePropType;
  backgroundDark?: ImageSourcePropType;
  banner?: ImageSourcePropType;
  buttonPrimary?: ImageSourcePropType;
  buttonWood?: ImageSourcePropType;
  buttonOutline?: ImageSourcePropType;
  icons?: Record<string, ImageSourcePropType>;
};

export type ThemeModule = {
  manifest: ThemeManifest;
  assets: ThemeAssetMap;
};

export const themeModules: ThemeModule[] = [
  { manifest, assets },
];
