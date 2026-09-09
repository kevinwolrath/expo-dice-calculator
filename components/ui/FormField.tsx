import { type ReactNode } from "react";
import { StyleSheet, TextInput, type TextInputProps } from "react-native";

import { View, useThemeColors } from "@/components/Themed";
import FieldError from "@/components/ui/FieldError";
import FieldLabel from "@/components/ui/FieldLabel";
import { hexToRgba } from "@/constants/pageTheme";
import { FontSize, Radius, Space, Stroke, Touch } from "@/constants/theme";

type FormFieldProps = TextInputProps & {
  label: string;
  required?: boolean;
  error?: string;
  rightAccessory?: ReactNode;
};

export default function FormField({
  label,
  required,
  error,
  style,
  multiline,
  rightAccessory,
  ...props
}: FormFieldProps) {
  const colors = useThemeColors();
  const borderColor = error ? colors.destructive : colors.inputBorder;

  return (
    <View style={styles.container}>
      <FieldLabel label={label} required={required} />
      <View style={styles.inputRow}>
        <TextInput
          placeholderTextColor={colors.muted}
          multiline={multiline}
          style={[
            styles.input,
            { borderColor, color: colors.text, backgroundColor: hexToRgba(colors.background, 0.92) },
            multiline && styles.multiline,
            style,
          ]}
          {...props}
        />
        {rightAccessory}
      </View>
      <FieldError message={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Space[3] },
  inputRow: { flexDirection: "row", alignItems: "center", gap: Space[3] },
  input: {
    flex: 1,
    borderWidth: Stroke.input,
    borderRadius: Radius.md,
    paddingHorizontal: Space[3],
    paddingVertical: 10,
    fontSize: FontSize.md,
    minHeight: Touch.minHeight,
  },
  multiline: { minHeight: 80, textAlignVertical: "top" },
});
