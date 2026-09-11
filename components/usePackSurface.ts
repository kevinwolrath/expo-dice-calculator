import { useColorScheme } from "@/components/useColorScheme";
import {
  getThemePackAssets,
  packIcon,
  type PackIconName,
} from "@/constants/themePackAssets";
import useThemePackStore from "@/stores/useThemePackStore";

export function usePackSurface() {
  const scheme = useColorScheme();
  const packId = useThemePackStore((state) => state.packId);
  const assets = getThemePackAssets(packId);
  const isNight = scheme === "dark";
  return {
    packId,
    assets,
    isNight,
    icon: (name: PackIconName) =>
      isNight ? undefined : packIcon(assets, name),
  };
}
