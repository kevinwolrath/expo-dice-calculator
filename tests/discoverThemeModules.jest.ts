import fs from "fs";
import path from "path";

import { assembleThemeModules } from "../assets/themes/assembleThemeModules";

const themesRoot = path.join(__dirname, "../assets/themes");

export const loadDiscoveredThemeModules = () => {
  const manifestEntries: Array<{ folder: string; value: unknown }> = [];
  const assetEntries: Array<{ folder: string; value: unknown }> = [];

  for (const entry of fs.readdirSync(themesRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
    const folder = entry.name;
    const manifestPath = path.join(themesRoot, folder, "theme.json");
    const assetsPath = path.join(themesRoot, folder, "assets.ts");
    if (fs.existsSync(manifestPath)) {
      manifestEntries.push({ folder, value: require(manifestPath) });
    }
    if (fs.existsSync(assetsPath)) {
      assetEntries.push({ folder, value: require(assetsPath) });
    }
  }

  return assembleThemeModules(manifestEntries, assetEntries);
};
