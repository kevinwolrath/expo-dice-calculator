import { useTranslation } from "react-i18next";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { FontSize, Space } from "@/constants/theme";

const parchment = require("../../assets/themes/tavern/preview_footer_parchment.png");
const quoteCard = require("../../assets/themes/tavern/preview_quote_card.png");
const iconPalette = require("../../assets/themes/tavern/preview_icon_palette.png");
const iconDice = require("../../assets/themes/tavern/preview_icon_dice.png");

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

  return (
    <ImageBackground
      source={parchment}
      resizeMode="stretch"
      style={styles.footer}
      imageStyle={styles.parchment}
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.row}>
        <View style={styles.settings}>
          <View style={styles.headingRow}>
            <Image
              source={iconPalette}
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
            source={iconDice}
            resizeMode="contain"
            style={styles.diceIcon}
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
          <Image
            source={quoteCard}
            resizeMode="contain"
            style={[styles.quote, compactArt && styles.quoteCompact]}
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
});
