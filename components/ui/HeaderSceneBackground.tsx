import { Image, StyleSheet } from "react-native";

import { View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import { HeaderColors } from "@/constants/Colors";
import { getThemePack } from "@/constants/themePack";
import { getThemePackAssets } from "@/constants/themePackAssets";
import useThemePackStore from "@/stores/useThemePackStore";

/** Shared by tabs and stack so Jobs is not a special header. */
export const appHeaderStyleOptions = (chrome: { text: string }) => ({
  headerBackground: () => <HeaderSceneBackground />,
  headerStyle: { backgroundColor: "transparent" as const },
  headerBackgroundContainerStyle: { overflow: "hidden" as const },
  headerShadowVisible: false,
  headerTintColor: chrome.text,
  headerTitleStyle: { color: chrome.text },
});

/** Navigator header fill: pack scene image with a dark overlay, or night black. */
export default function HeaderSceneBackground() {
  const scheme = useColorScheme();
  const packId = useThemePackStore((state) => state.packId);
  const pack = getThemePack(packId);
  const assets = getThemePackAssets(packId);

  if (scheme === "dark" || !assets.background) {
    return (
      <View
        style={[
          styles.clip,
          {
            backgroundColor:
              scheme === "dark"
                ? "#000000"
                : pack?.colors.header ?? HeaderColors.background,
          },
        ]}
      />
    );
  }

  return (
    <View style={styles.clip}>
      <Image
        source={assets.background}
        resizeMode="cover"
        style={styles.image}
        accessibilityIgnoresInvertColors
      />
      <View
        pointerEvents="none"
        style={[
          styles.overlay,
          { backgroundColor: pack?.colors.overlay ?? "rgba(0, 0, 0, 0.35)" },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFill,
  },
});
