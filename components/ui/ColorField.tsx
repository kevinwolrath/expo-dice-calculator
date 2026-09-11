import { createElement, useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Text, useThemeColors } from "@/components/Themed";
import FieldLabel from "@/components/ui/FieldLabel";
import FieldPanel from "@/components/ui/FieldPanel";
import {
  controlStyle,
  inputTypeface,
  useControlColors,
} from "@/components/ui/fieldControl";
import { normalizeHexColor } from "@/constants/pageTheme";
import { Control, FontSize, Space } from "@/constants/theme";

type ColorFieldProps = {
  label: string;
  value: string | null;
  fallback: string;
  onChange: (value: string | null) => void;
  allowEmpty?: boolean;
};

export default function ColorField({
  label,
  value,
  fallback,
  onChange,
  allowEmpty = true,
}: ColorFieldProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const control = useControlColors();
  const [draft, setDraft] = useState(value ?? "");
  const [focused, setFocused] = useState(false);
  const preview = normalizeHexColor(draft) ?? fallback;

  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);

  const commit = (next: string) => {
    setDraft(next);
    if (!next.trim()) {
      if (allowEmpty) {
        onChange(null);
        return;
      }
      setDraft(fallback);
      onChange(fallback);
      return;
    }
    const hex = normalizeHexColor(next);
    if (hex) onChange(hex);
  };

  return (
    <FieldPanel>
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
                width: Control.height,
                height: Control.height,
                padding: 0,
                border: `${Control.borderWidth}px solid ${control.border}`,
                borderRadius: Control.radius,
                background: "transparent",
                cursor: "pointer",
              },
            })
          : (
            <View
              style={[
                styles.swatch,
                {
                  backgroundColor: preview,
                  borderColor: control.border,
                  width: Control.height,
                  height: Control.height,
                  borderRadius: Control.radius,
                  borderWidth: Control.borderWidth,
                },
              ]}
            />
          )}
        <TextInput
          value={draft}
          placeholder={fallback}
          placeholderTextColor={control.placeholder}
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={commit}
          underlineColorAndroid="transparent"
          selectionColor={control.focus}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.input,
            inputTypeface,
            controlStyle({ colors: control, focused }),
            { color: control.text, paddingVertical: 10 },
          ]}
        />
        {allowEmpty && value ? (
          <Pressable onPress={() => commit("")} hitSlop={8}>
            <Text style={{ color: colors.primary }}>{t("common.delete")}</Text>
          </Pressable>
        ) : null}
      </View>
    </FieldPanel>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Space[2],
  },
  swatch: {},
  input: {
    flex: 1,
    fontSize: FontSize.md,
  },
});
