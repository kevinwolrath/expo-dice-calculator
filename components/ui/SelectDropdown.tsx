import { type ReactNode, useCallback, useRef, useState, type Ref } from "react";
import {
  Modal,
  Pressable,
  View as RNView,
  ScrollView,
  StyleSheet,
  type ImageSourcePropType,
} from "react-native";

import { Text, View, useThemeColors } from "@/components/Themed";
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
import { FontSize, Radius, Space, Type } from "@/constants/theme";

export type SelectOption = { value: string; label: string };

type SelectDropdownProps = {
  label: string;
  placeholder: string;
  options: SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  emptyHint?: string;
  disabled?: boolean;
  rightAccessory?: ReactNode;
  icon?: ImageSourcePropType;
  embedded?: boolean;
  focusRef?: Ref<FieldFocusable>;
};

export default function SelectDropdown({
  label,
  placeholder,
  options,
  value,
  onChange,
  required,
  error,
  emptyHint,
  disabled,
  rightAccessory,
  icon,
  embedded,
  focusRef,
}: SelectDropdownProps) {
  const colors = useThemeColors();
  const control = useControlColors();
  const [open, setOpen] = useState(false);
  const hostRef = useRef<RNView>(null);
  const activate = useCallback(() => {
    if (disabled) return;
    setOpen(true);
  }, [disabled]);
  useFieldFocus(focusRef, hostRef, activate);
  const selected = options.find((option) => option.value === value);

  const picker = options.length === 0 ? (
    <Text style={[Type.hint, styles.hint]}>{emptyHint}</Text>
  ) : (
    <>
      <View style={styles.pickerRow}>
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={() => setOpen(true)}
          style={[
            styles.picker,
            controlStyle({
              colors: control,
              focused: open,
              disabled: Boolean(disabled),
              error: Boolean(error),
              errorColor: colors.destructive,
            }),
          ]}
        >
          <Text
            style={[
              styles.inputText,
              inputTypeface,
              embedded && styles.inputTextLarge,
              {
                color: disabled
                  ? control.disabledText
                  : selected
                    ? control.text
                    : control.placeholder,
              },
            ]}
            numberOfLines={2}
          >
            {selected ? selected.label : placeholder}
          </Text>
          <Text
            style={[
              styles.chevron,
              {
                color: disabled ? control.disabledText : control.text,
              },
            ]}
          >
            ▾
          </Text>
        </Pressable>
        {!embedded ? rightAccessory : null}
      </View>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <RNView
          style={[styles.backdrop, { backgroundColor: colors.overlay }]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setOpen(false)}
          />
          <RNView
            style={[
              styles.sheet,
              {
                backgroundColor: control.fill,
                borderColor: control.border,
              },
            ]}
          >
            <Text
              style={[
                styles.title,
                inputTypeface,
                { color: control.text, fontWeight: "700" },
              ]}
            >
              {placeholder}
            </Text>
            <ScrollView>
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    style={[
                      styles.option,
                      isSelected && {
                        backgroundColor: control.selectedFill,
                        borderColor: control.focus,
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionLabel,
                        inputTypeface,
                        { color: control.text },
                        isSelected && styles.selectedLabel,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </RNView>
        </RNView>
      </Modal>
    </>
  );

  if (embedded) {
    return (
      <RNView ref={hostRef} collapsable={false}>
        {picker}
      </RNView>
    );
  }

  return (
    <FieldPanel
      ref={hostRef}
      icon={icon ? <FieldLabelIcon source={icon} /> : undefined}
      error={Boolean(error)}
    >
      <FieldLabel label={label} required={required} />
      {picker}
      <FieldError message={error} />
    </FieldPanel>
  );
}

const styles = StyleSheet.create({
  hint: { opacity: 0.5 },
  pickerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: Space[3],
  },
  picker: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 180,
    minWidth: 160,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputText: {
    fontSize: FontSize.md,
    flexGrow: 1,
    flexShrink: 1,
    paddingRight: Space[2],
  },
  inputTextLarge: { fontSize: FontSize.lg, fontWeight: "600" },
  chevron: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 20,
  },
  backdrop: {
    flex: 1,
    justifyContent: "center",
    padding: Space[6],
  },
  sheet: {
    maxHeight: "70%",
    borderRadius: Radius.lg,
    padding: Space[2],
    borderWidth: 1,
  },
  title: {
    paddingHorizontal: Space[3],
    paddingVertical: 10,
    fontSize: FontSize.md,
    fontWeight: "700",
  },
  option: {
    paddingHorizontal: Space[3],
    paddingVertical: 13,
    borderRadius: Radius.sm,
  },
  optionLabel: { fontSize: FontSize.md },
  selectedLabel: { fontWeight: "600" },
});
