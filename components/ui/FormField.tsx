import { StyleSheet, TextInput, type TextInputProps } from "react-native";

import { View, useThemeColors } from "@/components/Themed";
import FieldError from "@/components/ui/FieldError";
import FieldLabel from "@/components/ui/FieldLabel";
import { FontSize, Radius, Space, Stroke, Touch } from "@/constants/theme";

type FormFieldProps = TextInputProps & {
  label: string;
  required?: boolean;
  error?: string;
};

export default function FormField({
  label,
  required,
  error,
  style,
  multiline,
  ...props
}: FormFieldProps) {
  const colors = useThemeColors();
  const borderColor = error ? colors.destructive : colors.inputBorder;

  return (
    <View style={styles.container}>
      <FieldLabel label={label} required={required} />
      <TextInput
        placeholderTextColor={colors.muted}
        multiline={multiline}
        style={[
          styles.input,
          { borderColor, color: colors.text },
          multiline && styles.multiline,
          style,
        ]}
        {...props}
      />
      <FieldError message={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Space[3] },
  input: {
    borderWidth: Stroke.input,
    borderRadius: Radius.md,
    paddingHorizontal: Space[3],
    paddingVertical: 10,
    fontSize: FontSize.md,
    minHeight: Touch.minHeight,
  },
  multiline: { minHeight: 80, textAlignVertical: "top" },
});
