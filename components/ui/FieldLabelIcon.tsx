import { Image, StyleSheet, type ImageSourcePropType } from "react-native";

import { View } from "@/components/Themed";

/** Matches the cropped tavern label icons (~25px wide). */
export const FIELD_LABEL_ICON_SIZE = 25;
export const FIELD_LABEL_ICON_GAP = 16;

export default function FieldLabelIcon({
  source,
}: {
  source: ImageSourcePropType;
}) {
  return (
    <View
      collapsable={false}
      accessible={false}
      importantForAccessibility="no"
      style={styles.wrap}
    >
      <Image
        source={source}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: FIELD_LABEL_ICON_SIZE,
    height: FIELD_LABEL_ICON_SIZE,
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 0,
    flexShrink: 0,
  },
  image: {
    width: FIELD_LABEL_ICON_SIZE,
    height: FIELD_LABEL_ICON_SIZE,
  },
});
