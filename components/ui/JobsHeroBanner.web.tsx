import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type LayoutChangeEvent,
  type TextStyle,
} from "react-native";

import {
  BANNER_ASPECT_RATIO,
  SIGN_INSET,
} from "@/components/ui/jobsHeroBannerLayout";

const TITLE_FONT =
  'Georgia, "Palatino Linotype", Palatino, "Times New Roman", serif';

const titleShadow = [
  "-1px -1px 0 #1A0C04",
  "1px -1px 0 #1A0C04",
  "-1px 1px 0 #1A0C04",
  "1px 1px 0 #1A0C04",
  "0 1px 0 #1A0C04",
  "0 2px 3px rgba(12, 6, 2, 0.88)",
  "0 0 10px rgba(244, 199, 75, 0.28)",
].join(", ");

const subtitleShadow =
  "0 1px 2px rgba(12, 6, 2, 0.9), 0 0 6px rgba(12, 6, 2, 0.45)";

type JobsHeroBannerProps = {
  source: ImageSourcePropType;
};

export default function JobsHeroBanner({ source }: JobsHeroBannerProps) {
  const { t } = useTranslation();
  const [signWidth, setSignWidth] = useState(0);
  const titleSize = signWidth
    ? Math.min(44, Math.max(22, signWidth * 0.081))
    : 29;
  const subtitleSize = Math.min(16, Math.max(9, titleSize * 0.36));

  const onSignLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    if (Math.abs(nextWidth - signWidth) < 1) return;
    setSignWidth(nextWidth);
  };

  const titleStyle = {
    fontFamily: TITLE_FONT,
    fontWeight: "700",
    width: "100%" as const,
    maxWidth: "100%" as const,
    fontSize: titleSize,
    lineHeight: titleSize * 1.1,
    color: "#F6EAD3",
    textAlign: "center",
    textShadow: titleShadow,
    userSelect: "text",
  } as TextStyle;

  const subtitleStyle = {
    fontFamily: TITLE_FONT,
    fontWeight: "600",
    width: "100%",
    fontSize: subtitleSize,
    lineHeight: subtitleSize * 1.2,
    color: "#F6EAD3",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: subtitleSize * 0.16,
    marginTop: subtitleSize * 0.2,
    textShadow: subtitleShadow,
    userSelect: "text",
  } as TextStyle;

  return (
    <View style={styles.banner}>
      <ImageBackground
        source={source}
        resizeMode="cover"
        style={styles.bannerFill}
        imageStyle={
          {
            width: "100%",
            height: "100%",
            objectPosition: "center 46%",
          } as never
        }
        accessibilityIgnoresInvertColors
        importantForAccessibility="no"
      >
        <View
          style={styles.sign}
          pointerEvents="box-none"
          onLayout={onSignLayout}
        >
          <Text selectable accessibilityRole="header" style={titleStyle}>
            {t("jobs.heroTitle")}
          </Text>
          <Text selectable style={subtitleStyle}>
            {t("jobs.heroTagline")}
          </Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: "100%",
    aspectRatio: BANNER_ASPECT_RATIO,
    minHeight: 136,
    borderRadius: 12,
    overflow: "hidden",
  },
  bannerFill: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  sign: {
    position: "absolute",
    left: SIGN_INSET.left,
    right: SIGN_INSET.right,
    top: SIGN_INSET.top,
    bottom: SIGN_INSET.bottom,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
});
