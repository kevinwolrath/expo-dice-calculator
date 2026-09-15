/**
 * Theme packs are discovered from folders under `assets/themes`.
 * A pack is included when that folder contains both `theme.json` and `assets.ts`.
 * Add or remove a folder; do not edit a hardcoded pack list.
 */
import { loadDiscoveredThemeModules } from "./discoverThemeModules";

export type {
  ThemeAssetMap,
  ThemeManifest,
  ThemeModule,
  ThemePreviewAssets,
} from "./assembleThemeModules";

export const themeModules = loadDiscoveredThemeModules();
