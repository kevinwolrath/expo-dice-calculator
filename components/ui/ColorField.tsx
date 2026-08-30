import { createElement, useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Text, useThemeColors } from "@/components/Themed";
import FieldLabel from "@/components/ui/FieldLabel";
import { normalizeHexColor } from "@/constants/pageTheme";
import { FontSize, Radius, Space, Stroke, Touch } from "@/constants/theme";

type ColorFieldProps = {
  label: string;
  value: string | null;
  fallback: string;
  onChange: (value: string | null) => void;
};

export default function ColorField({
  label,
  value,
  fallback,
  onChange,
}: ColorFieldProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [draft, setDraft] = useState(value ?? "");
  const preview = normalizeHexColor(draft) ?? fallback;

  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);

  const commit = (next: string) => {
    setDraft(next);
    if (!next.trim()) {
      onChange(null);
      return;
    }
    const hex = normalizeHexColor(next);
    if (hex) onChange(hex);
  };

  return (
    <View style={styles.container}>
      <FieldLabel label={label} />
      <View style={styles.row}>
        {Platform.OS === "web"
          ? createElement("input", {
              type: "color",
              value: preview,
              onChange: (event: { target: { value: string } }) => {
                commit(event.target.value);
              },
              style: {
                width: 44,
                height: 44,
                padding: 0,
                border: "none",
                background: "transparent",
                cursor: "pointer",
              },
            })
          : (
            <View
              style={[
                styles.swatch,
                { backgroundColor: preview, borderColor: colors.inputBorder },
              ]}
            />
          )}
        <TextInput
          value={draft}
          placeholder={fallback}
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={commit}
          style={[
            styles.input,
            { borderColor: colors.inputBorder, color: colors.text },
          ]}
        />
        {value ? (
          <Pressable onPress={() => commit("")} hitSlop={8}>
            <Text style={{ color: colors.primary }}>{t("common.delete")}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Space[3] },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Space[2],
  },
  swatch: {
    width: Touch.minHeight,
    height: Touch.minHeight,
    borderRadius: Radius.md,
    borderWidth: Stroke.input,
  },
  input: {
    flex: 1,
    borderWidth: Stroke.input,
    borderRadius: Radius.md,
    paddingHorizontal: Space[3],
    minHeight: Touch.minHeight,
    fontSize: FontSize.md,
  },
});
