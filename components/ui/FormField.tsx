import { type ReactNode, useCallback, useRef, useState, type Ref } from "react";
import {
  Platform,
  StyleSheet,
  TextInput,
  View,
  type ImageSourcePropType,
  type TextInputProps,
} from "react-native";

import { useThemeColors } from "@/components/Themed";
import FieldError from "@/components/ui/FieldError";
import FieldLabel from "@/components/ui/FieldLabel";
import FieldLabelIcon from "@/components/ui/FieldLabelIcon";
import FieldPanel from "@/components/ui/FieldPanel";
import {
  controlStyle,
  inputTypeface,
  useControlColors,
} from "@/components/ui/fieldControl";
import {
  useFieldFocus,
  type FieldFocusable,
} from "@/components/ui/fieldFocus";
import { FontSize, Layout } from "@/constants/theme";

type FormFieldProps = TextInputProps & {
  label: string;
  required?: boolean;
  error?: string;
  rightAccessory?: ReactNode;
  icon?: ImageSourcePropType;
  embedded?: boolean;
  /** Small numeric value. Does not stretch across the row. */
  compact?: boolean;
  focusRef?: Ref<FieldFocusable>;
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
  compact,
  editable = true,
  onFocus,
  onBlur,
  focusRef,
  ...props
}: FormFieldProps) {
  const colors = useThemeColors();
  const control = useControlColors();
  const [focused, setFocused] = useState(false);
  const disabled = editable === false;
  const hostRef = useRef<View>(null);
  const inputRef = useRef<TextInput>(null);
  const activate = useCallback(() => {
    inputRef.current?.focus();
    if (Platform.OS !== "web") return;
    const host = hostRef.current as unknown as ParentNode | null;
    const field = host?.querySelector?.("input, textarea");
    if (field instanceof HTMLElement) field.focus();
  }, []);
  useFieldFocus(focusRef, hostRef, activate);

  const input = (
    <View style={styles.inputRow}>
      <TextInput
        ref={inputRef}
        {...props}
        inputMode={
          props.inputMode ??
          (props.keyboardType === "number-pad" || props.keyboardType === "numeric"
            ? "numeric"
            : undefined)
        }
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
          compact ? styles.inputCompact : styles.input,
          inputTypeface,
          embedded && !compact && styles.inputTextLarge,
          controlStyle({
            colors: control,
            focused,
            disabled,
            error: Boolean(error),
            errorColor: colors.destructive,
          }),
          {
            color: disabled ? control.disabledText : control.text,
            paddingVertical: compact ? 6 : 8,
          },
          multiline && styles.multiline,
          style,
        ]}
      />
      {!embedded ? rightAccessory : null}
    </View>
  );

  if (embedded) {
    return (
      <View ref={hostRef} collapsable={false}>
        {input}
      </View>
    );
  }

  return (
    <FieldPanel
      ref={hostRef}
      icon={icon ? <FieldLabelIcon source={icon} /> : undefined}
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
  inputCompact: {
    alignSelf: "flex-start",
    width: Layout.numericFieldWidth,
    maxWidth: "100%",
    fontSize: FontSize.md,
  },
  inputTextLarge: { fontSize: FontSize.lg, fontWeight: "600" },
  multiline: {
    minHeight: Layout.notesHeight,
    textAlignVertical: "top",
  },
});
