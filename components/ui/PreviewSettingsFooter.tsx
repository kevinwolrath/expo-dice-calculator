import { useTranslation } from "react-i18next";
import { Image, ImageBackground, StyleSheet, Text, View } from "react-native";

import { usePackSurface } from "@/components/usePackSurface";
import { FontSize, Space } from "@/constants/theme";

type PreviewSettingsFooterProps = {
  colourCount: string;
  numberColour: string | null;
  material: string | null;
  method: string | null;
};

export default function PreviewSettingsFooter({
  colourCount,
  numberColour,
  material,
  method,
}: PreviewSettingsFooterProps) {
  const { t } = useTranslation();
  const fallback = t("common.notSet");
  const { assets } = usePackSurface();
  const preview = assets.preview;

  if (!preview) {
    return null;
  }

  return (
    <ImageBackground
      source={preview.footerParchment}
      resizeMode="stretch"
      style={styles.footer}
      imageStyle={styles.parchment}
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.row}>
        <View style={styles.settings}>
          <View style={styles.headingRow}>
            <Image
              source={preview.paletteIcon}
              resizeMode="contain"
              style={styles.paletteIcon}
              accessible={false}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
            <Text style={styles.heading}>{t("jobs.currentSettings")}</Text>
          </View>
          <Text style={styles.line}>
            {t("jobs.previewColours")}:{" "}
            <Text style={styles.value}>{colourCount.trim() || fallback}</Text>
          </Text>
          <Text style={styles.line}>
            {t("jobs.previewNumbers")}:{" "}
            <Text style={styles.value}>{numberColour ?? fallback}</Text>
          </Text>
          <Text style={styles.line}>
            {t("jobs.previewMaterial")}:{" "}
            <Text style={styles.value}>{material ?? fallback}</Text>
          </Text>
          <Text style={styles.line}>
            {t("jobs.previewMethod")}:{" "}
            <Text style={styles.value}>{method ?? fallback}</Text>
          </Text>
        </View>
        <View style={styles.art} pointerEvents="none">
          <Image
            source={preview.diceIcon}
            resizeMode="contain"
            style={styles.diceIcon}
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  footer: {
    width: "100%",
    height: 132,
    minHeight: 120,
    maxHeight: 145,
    overflow: "hidden",
  },
  parchment: {
    borderRadius: 12,
  },
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 80,
    paddingRight: 16,
    paddingVertical: 10,
    gap: Space[2],
  },
  settings: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "66%",
    minWidth: 0,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Space[2],
    marginBottom: 4,
  },
  paletteIcon: {
    width: 24,
    height: 24,
  },
  heading: {
    flexShrink: 1,
    color: "#3B2414",
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  line: {
    paddingLeft: 52,
    color: "#3B2414",
    fontSize: FontSize.sm,
    fontWeight: "600",
    lineHeight: 17,
  },
  value: {
    color: "#2C160C",
    fontWeight: "700",
  },
  art: {
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: "28%",
    maxWidth: 108,
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  diceIcon: {
    width: 20,
    height: 20,
  },
});
