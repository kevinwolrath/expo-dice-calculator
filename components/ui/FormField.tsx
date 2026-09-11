import { type ReactNode, useState } from "react";
import {
  Image,
  StyleSheet,
  TextInput,
  type ImageSourcePropType,
  type TextInputProps,
} from "react-native";

import { View, useThemeColors } from "@/components/Themed";
import FieldError from "@/components/ui/FieldError";
import FieldLabel from "@/components/ui/FieldLabel";
import FieldPanel from "@/components/ui/FieldPanel";
import {
  controlStyle,
  inputTypeface,
  useControlColors,
} from "@/components/ui/fieldControl";
import { FontSize, Layout } from "@/constants/theme";

type FormFieldProps = TextInputProps & {
  label: string;
  required?: boolean;
  error?: string;
  rightAccessory?: ReactNode;
  icon?: ImageSourcePropType;
  embedded?: boolean;
};

export default function FormField({
  label,
  required,
  error,
  style,
  multiline,
  rightAccessory,
  icon,
  embedded,
  editable = true,
  onFocus,
  onBlur,
  ...props
}: FormFieldProps) {
  const colors = useThemeColors();
  const control = useControlColors();
  const [focused, setFocused] = useState(false);
  const disabled = editable === false;

  const input = (
    <View style={styles.inputRow}>
      <TextInput
        {...props}
        placeholderTextColor={control.placeholder}
        multiline={multiline}
        editable={editable}
        underlineColorAndroid="transparent"
        selectionColor={control.focus}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          styles.input,
          inputTypeface,
          embedded && styles.inputTextLarge,
          controlStyle({
            colors: control,
            focused,
            disabled,
            error: Boolean(error),
            errorColor: colors.destructive,
          }),
          {
            color: disabled ? control.disabledText : control.text,
            paddingVertical: 10,
          },
          multiline && styles.multiline,
          style,
        ]}
      />
      {!embedded ? rightAccessory : null}
    </View>
  );

  if (embedded) {
    return input;
  }

  return (
    <FieldPanel
      icon={
        icon ? (
          <Image
            source={icon}
            style={styles.icon}
            accessibilityIgnoresInvertColors
          />
        ) : undefined
      }
      error={Boolean(error)}
    >
      <FieldLabel label={label} required={required} />
      {input}
      <FieldError message={error} />
    </FieldPanel>
  );
}

const styles = StyleSheet.create({
  inputRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  input: {
    flex: 1,
    fontSize: FontSize.md,
  },
  inputTextLarge: { fontSize: FontSize.lg, fontWeight: "600" },
  multiline: {
    minHeight: Layout.notesHeight,
    textAlignVertical: "top",
  },
  icon: { width: 32, height: 32 },
});
