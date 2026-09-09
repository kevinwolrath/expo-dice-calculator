import { type ReactNode, useState } from "react";
import {
    Modal,
    Pressable,
    View as RNView,
    ScrollView,
    StyleSheet,
} from "react-native";

import { Text, View, useThemeColors } from "@/components/Themed";
import FieldError from "@/components/ui/FieldError";
import FieldLabel from "@/components/ui/FieldLabel";
import { hexToRgba } from "@/constants/pageTheme";
import {
    FontSize,
    Radius,
    Space,
    Stroke,
    Touch,
    Type,
} from "@/constants/theme";

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
}: SelectDropdownProps) {
  const colors = useThemeColors();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View style={styles.container}>
      <FieldLabel label={label} required={required} />
      {options.length === 0 ? (
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
                {
                  borderColor: error ? colors.destructive : colors.inputBorder,
                  backgroundColor: hexToRgba(colors.background, 0.92),
                  opacity: disabled ? 0.5 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.value,
                  { color: colors.text },
                  !selected && styles.placeholder,
                ]}
              >
                {selected ? selected.label : placeholder}
              </Text>
              <Text style={[styles.chevron, { color: colors.text }]}>⌄</Text>
            </Pressable>
            {rightAccessory}
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
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.title, { color: colors.text }]}>
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
                          isSelected && { backgroundColor: colors.primary },
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionLabel,
                            { color: colors.text },
                            isSelected && styles.selectedLabel,
                            isSelected && { color: colors.onPrimary },
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
      )}
      <FieldError message={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Space[3] },
  hint: { opacity: 0.5 },
  pickerRow: { flexDirection: "row", alignItems: "center", gap: Space[3] },
  picker: {
    flex: 1,
    borderWidth: Stroke.input,
    borderRadius: Radius.md,
    minHeight: Touch.minHeight,
    paddingHorizontal: Space[3],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  value: { fontSize: FontSize.md, flex: 1, paddingRight: Space[2] },
  placeholder: { opacity: 0.5 },
  chevron: { fontSize: 22, opacity: 0.6, marginTop: -6 },
  backdrop: {
    flex: 1,
    justifyContent: "center",
    padding: Space[6],
  },
  sheet: {
    maxHeight: "70%",
    borderRadius: Radius.lg,
    padding: Space[2],
    borderWidth: Stroke.hairline,
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
