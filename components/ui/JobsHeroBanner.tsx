import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ImageBackground,
  Platform,
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

const TITLE_COLOR = "#F6EAD3";
const TITLE_OUTLINE = "#1A0C04";
const TITLE_GOLD = "rgba(244, 199, 75, 0.4)";

type JobsHeroBannerProps = {
  source: ImageSourcePropType;
};

const titleFont = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia",
});

export default function JobsHeroBanner({ source }: JobsHeroBannerProps) {
  const { t } = useTranslation();
  const [signWidth, setSignWidth] = useState(0);
  const titleSize = signWidth
    ? Math.round(Math.min(44, Math.max(22, signWidth * 0.081)))
    : 29;
  const subtitleSize = Math.round(Math.min(16, Math.max(9, titleSize * 0.36)));

  const onSignLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    if (Math.abs(nextWidth - signWidth) < 1) return;
    setSignWidth(nextWidth);
  };

  const title = t("jobs.heroTitle");
  const subtitle = t("jobs.heroTagline");

  return (
    <View style={styles.banner}>
      <ImageBackground
        source={source}
        resizeMode="cover"
        style={styles.bannerFill}
        imageStyle={styles.bannerImage}
        accessibilityIgnoresInvertColors
        importantForAccessibility="no"
      >
        <View
          style={styles.sign}
          pointerEvents="box-none"
          onLayout={onSignLayout}
        >
          <OutlinedTitle fontSize={titleSize}>{title}</OutlinedTitle>
          <Text
            selectable
            style={[
              styles.subtitle,
              {
                fontSize: subtitleSize,
                letterSpacing: Math.max(1, subtitleSize * 0.16),
              },
            ]}
          >
            {subtitle}
          </Text>
        </View>
      </ImageBackground>
    </View>
  );
}

function OutlinedTitle({
  children,
  fontSize,
}: {
  children: string;
  fontSize: number;
}) {
  const fill: TextStyle = {
    ...styles.title,
    fontSize,
    lineHeight: Math.round(fontSize * 1.1),
  };

  return (
    <View style={styles.titleStack}>
      <Text
        accessible={false}
        importantForAccessibility="no"
        style={[
          fill,
          styles.titleGhost,
          { color: TITLE_OUTLINE, textShadowColor: TITLE_OUTLINE },
        ]}
      >
        {children}
      </Text>
      <Text
        accessible={false}
        importantForAccessibility="no"
        style={[
          fill,
          styles.titleGhost,
          {
            color: TITLE_GOLD,
            top: 1,
            left: 0,
            textShadowColor: TITLE_GOLD,
            textShadowRadius: 8,
          },
        ]}
      >
        {children}
      </Text>
      <Text
        selectable
        accessibilityRole="header"
        style={[fill, { color: TITLE_COLOR }]}
      >
        {children}
      </Text>
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
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
  titleStack: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontFamily: titleFont,
    fontWeight: "700",
    textAlign: "center",
    width: "100%",
  },
  titleGhost: {
    position: "absolute",
    top: 2,
    left: 1,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontFamily: titleFont,
    fontWeight: "600",
    color: TITLE_COLOR,
    textAlign: "center",
    textTransform: "uppercase",
    marginTop: 2,
    width: "100%",
    textShadowColor: "rgba(12, 6, 2, 0.85)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
