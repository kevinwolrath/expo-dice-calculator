import type { ImageSourcePropType } from "react-native";

import { themeModules, type ThemeAssetMap } from "@/assets/themes";
import { getThemePack, type ThemePackId } from "@/constants/themePack";

export type PackIconName = "notes" | "material" | "method" | "colour" | "dice";

export type ThemePackAssets = {
  background?: ImageSourcePropType;
  buttonPrimary?: ImageSourcePropType;
  buttonWood?: ImageSourcePropType;
  buttonOutline?: ImageSourcePropType;
  banner?: ImageSourcePropType;
  icons?: Partial<Record<PackIconName, ImageSourcePropType>>;
};

const assetsById = new Map(
  themeModules.map((module) => [module.manifest.id, module.assets]),
);

const asPackAssets = (assets: ThemeAssetMap): ThemePackAssets => ({
  background: assets.background,
  buttonPrimary: assets.buttonPrimary,
  buttonWood: assets.buttonWood,
  buttonOutline: assets.buttonOutline,
  banner: assets.banner,
  icons: assets.icons,
});

export const getThemePackAssets = (id: ThemePackId): ThemePackAssets => {
  const assets = assetsById.get(getThemePack(id).id);
  return assets ? asPackAssets(assets) : {};
};

export const packIcon = (
  assets: ThemePackAssets,
  name: PackIconName,
): ImageSourcePropType | undefined => assets.icons?.[name];
