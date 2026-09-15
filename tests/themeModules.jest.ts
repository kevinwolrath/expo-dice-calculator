export type {
  ThemeAssetMap,
  ThemeManifest,
  ThemeModule,
  ThemePreviewAssets,
} from "../assets/themes/assembleThemeModules";

import { loadDiscoveredThemeModules } from "./discoverThemeModules.jest";

export const themeModules = loadDiscoveredThemeModules();
