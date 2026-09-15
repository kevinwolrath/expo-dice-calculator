import {
  assembleThemeModules,
  folderFromThemeKey,
  type ThemeModule,
} from "./assembleThemeModules";

type ContextModule = {
  keys(): string[];
  (id: string): unknown;
};

/**
 * Metro `require.context` includes a pack when its folder contains
 * `theme.json` and `assets.ts`. Image requires stay static inside each pack.
 */
export const loadDiscoveredThemeModules = (): ThemeModule[] => {
  const manifestFiles = require.context(
    "./",
    true,
    /^\.\/[^./][^/]*\/theme\.json$/,
  ) as ContextModule;
  const assetFiles = require.context(
    "./",
    true,
    /^\.\/[^./][^/]*\/assets\.ts$/,
  ) as ContextModule;

  const manifestEntries = manifestFiles.keys().flatMap((key) => {
    const folder = folderFromThemeKey(key);
    return folder ? [{ folder, value: manifestFiles(key) }] : [];
  });
  const assetEntries = assetFiles.keys().flatMap((key) => {
    const folder = folderFromThemeKey(key);
    return folder ? [{ folder, value: assetFiles(key) }] : [];
  });

  return assembleThemeModules(manifestEntries, assetEntries);
};
