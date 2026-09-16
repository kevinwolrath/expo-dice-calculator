import type { ImageSourcePropType } from "react-native";

import type { ThemeAssetMap, ThemeManifest } from "@/assets/themes/assembleThemeModules";
import type { ThemePackAssets } from "@/constants/themePackAssets";

export type ThemeZipFile = {
  name: string;
  bytes: Uint8Array;
};

export type ParsedThemeZip = {
  manifest: ThemeManifest;
  files: ThemeZipFile[];
};

export const uriSource = (uri: string): ImageSourcePropType => ({ uri });

export const themeAssetsFromFileUris = (
  uris: Record<string, string>,
): ThemeAssetMap => ({
  background: uris["background.jpg"]
    ? uriSource(uris["background.jpg"])
    : undefined,
  banner: uris["banner.jpg"] ? uriSource(uris["banner.jpg"]) : undefined,
  icons: {
    notes: uriSource(uris["icon_notes.png"] ?? ""),
    material: uriSource(uris["icon_material.png"] ?? ""),
    method: uriSource(uris["icon_method.png"] ?? ""),
    colour: uriSource(uris["icon_colour.png"] ?? ""),
    dice: uriSource(uris["icon_dice.png"] ?? ""),
  },
  preview: {
    footerParchment: uriSource(uris["preview_footer_parchment.png"] ?? ""),
    diceIcon: uriSource(uris["preview_icon_dice.png"] ?? ""),
    paletteIcon: uriSource(uris["preview_icon_palette.png"] ?? ""),
  },
});

export const asPackAssets = (assets: ThemeAssetMap): ThemePackAssets => ({
  background: assets.background,
  buttonPrimary: assets.buttonPrimary,
  buttonWood: assets.buttonWood,
  buttonOutline: assets.buttonOutline,
  banner: assets.banner,
  icons: assets.icons,
  preview: assets.preview,
});
