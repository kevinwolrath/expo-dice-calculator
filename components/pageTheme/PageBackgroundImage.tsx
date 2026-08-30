import { Image, Platform, StyleSheet, View } from "react-native";

import type { PageImageMode } from "@/constants/pageTheme";

export default function PageBackgroundImage({
  uri,
  mode,
}: {
  uri: string;
  mode: PageImageMode;
}) {
  if (Platform.OS === "web") {
    return (
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundImage: `url("${uri.replace(/"/g, "")}")`,
            backgroundRepeat: mode === "tile" ? "repeat" : "no-repeat",
            backgroundPosition: "center",
            backgroundSize: mode === "tile" ? "auto" : "auto",
          } as object,
        ]}
      />
    );
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image
        source={{ uri }}
        resizeMode={mode === "tile" ? "repeat" : "center"}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
