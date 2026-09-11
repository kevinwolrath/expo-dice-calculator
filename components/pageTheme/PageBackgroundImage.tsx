import {
  Image,
  Platform,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from "react-native";

import type { PageImageMode } from "@/constants/pageTheme";

const resizeModeFor = (mode: PageImageMode) => {
  if (mode === "tile") return "repeat" as const;
  if (mode === "cover") return "cover" as const;
  return "center" as const;
};

const webUrlFromSource = (source: ImageSourcePropType): string | null => {
  if (typeof source === "string") return source;
  if (typeof source === "number") return null;
  if (Array.isArray(source)) {
    const first = source[0];
    return first ? webUrlFromSource(first) : null;
  }
  if (source && typeof source === "object" && "uri" in source && source.uri) {
    return source.uri;
  }
  return null;
};

export default function PageBackgroundImage({
  source,
  mode,
}: {
  source: ImageSourcePropType;
  mode: PageImageMode;
}) {
  if (Platform.OS === "web") {
    const uri = webUrlFromSource(source);
    if (uri) {
      return (
        <View
          pointerEvents="none"
          style={[
            styles.fill,
            {
              backgroundImage: `url("${uri.replace(/"/g, "")}")`,
              backgroundRepeat: mode === "tile" ? "repeat" : "no-repeat",
              backgroundPosition: "center",
              backgroundSize: mode === "cover" ? "cover" : "auto",
            } as object,
          ]}
        />
      );
    }
  }

  return (
    <View pointerEvents="none" style={styles.fill}>
      <Image
        source={source}
        resizeMode={resizeModeFor(mode)}
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
