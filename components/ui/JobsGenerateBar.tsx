import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text } from "react-native";

import { View } from "@/components/Themed";
import { usePackSurface } from "@/components/usePackSurface";
import { FontSize, Layout, Space } from "@/constants/theme";

type JobsGenerateBarProps = {
  generateTitle: string;
  previewTitle: string;
  onGenerate: () => void;
  onPreview?: () => void;
  generateDisabled?: boolean;
  previewDisabled?: boolean;
  hidePreview?: boolean;
};

const DAY = {
  generateTop: "#4AA3FF",
  generateBottom: "#1B6FE8",
  generateShadow: "#2D8CFF",
  label: "#F7F4EE",
  previewFill: "#1A2230",
  previewBorder: "rgba(220, 228, 238, 0.45)",
} as const;

const NIGHT = {
  generateTop: "#ffffff",
  generateBottom: "#e8e8e8",
  generateShadow: "#ffffff",
  label: "#000000",
  previewFill: "#000000",
  previewBorder: "#ffffff",
} as const;

export default function JobsGenerateBar({
  generateTitle,
  previewTitle,
  onGenerate,
  onPreview,
  generateDisabled,
  previewDisabled,
  hidePreview,
}: JobsGenerateBarProps) {
  const { isNight } = usePackSurface();
  const palette = isNight ? NIGHT : DAY;
  const previewLabel = isNight ? "#ffffff" : DAY.label;

  return (
    <View style={styles.row}>
      <View
        style={[
          hidePreview ? styles.generateWrapFull : styles.generateWrap,
          { shadowColor: palette.generateShadow },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          disabled={generateDisabled}
          onPress={onGenerate}
          style={({ pressed }) => [
            styles.generate,
            { backgroundColor: palette.generateBottom },
            generateDisabled && styles.generateDisabled,
            pressed && !generateDisabled && styles.pressed,
          ]}
        >
          <View
            pointerEvents="none"
            style={[
              styles.generateSheen,
              { backgroundColor: palette.generateTop },
            ]}
          />
          <SymbolView
            name={{
              ios: "wand.and.stars",
              android: "auto_fix_high",
              web: "auto_awesome",
            }}
            size={22}
            tintColor={palette.label}
          />
          <Text style={[styles.generateLabel, { color: palette.label }]}>
            {generateTitle}
          </Text>
        </Pressable>
      </View>
      {hidePreview ? null : (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !!previewDisabled }}
        disabled={previewDisabled}
        onPress={onPreview}
        style={({ pressed }) => [
          styles.preview,
          {
            backgroundColor: palette.previewFill,
            borderColor: palette.previewBorder,
          },
          previewDisabled && styles.previewDisabled,
          pressed && !previewDisabled && styles.pressed,
        ]}
      >
        <SymbolView
          name={{
            ios: "eye",
            android: "visibility",
            web: "visibility",
          }}
          size={18}
          tintColor={previewLabel}
        />
        <Text style={[styles.previewLabel, { color: previewLabel }]}>
          {previewTitle}
        </Text>
      </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
    width: "100%",
    gap: 10,
    marginTop: Space[1],
    marginBottom: Space[4],
  },
  generateWrap: {
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: 160,
    minWidth: 160,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
  generateWrapFull: {
    flex: 1,
    width: "100%",
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
  generate: {
    width: "100%",
    minHeight: Layout.buttonHeight,
    borderRadius: 12,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Space[2],
    paddingHorizontal: Space[4],
  },
  generateSheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "58%",
    opacity: 0.55,
  },
  generateDisabled: {
    opacity: 0.72,
  },
  previewDisabled: {
    opacity: 0.45,
  },
  generateLabel: {
    fontSize: FontSize.md,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  preview: {
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: 108,
    minWidth: 108,
    minHeight: Layout.buttonHeight,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Space[2],
    paddingHorizontal: Space[3],
  },
  previewLabel: {
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  pressed: { opacity: 0.88 },
});
