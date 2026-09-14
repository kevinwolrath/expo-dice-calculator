import { useTranslation } from "react-i18next";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { usePackSurface } from "@/components/usePackSurface";
import { FontSize, Space } from "@/constants/theme";
import { getThemePack } from "@/constants/themePack";

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
  const { height } = useWindowDimensions();
  const compactArt = height < 750;
  const fallback = t("common.notSet");
  const { packId, assets } = usePackSurface();
  const preview = assets.preview;
  const overlayQuote = getThemePack(packId).overlayPreviewQuote;

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
          <View style={[styles.quote, compactArt && styles.quoteCompact]}>
            <Image
              source={preview.quoteCard}
              resizeMode="contain"
              style={StyleSheet.absoluteFill}
              accessible={false}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
            {overlayQuote ? (
              <View style={styles.quoteTextWrap} pointerEvents="none">
                <Text style={styles.quoteText}>{t("jobs.previewQuote")}</Text>
              </View>
            ) : null}
          </View>
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
    paddingLeft: 35,
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
    gap: 2,
  },
  diceIcon: {
    width: 20,
    height: 20,
  },
  quote: {
    width: "100%",
    height: 64,
  },
  quoteCompact: {
    height: 52,
  },
  quoteTextWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  quoteText: {
    color: "#2C160C",
    fontSize: 9,
    fontWeight: "700",
    lineHeight: 11,
    textAlign: "center",
  },
});
