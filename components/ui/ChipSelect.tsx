import { Pressable, ScrollView, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { Text, View, useThemeColors } from "@/components/Themed";
import FieldError from "@/components/ui/FieldError";
import FieldLabel from "@/components/ui/FieldLabel";
import { FontSize, Radius, Space, Stroke, Type } from "@/constants/theme";

type ChipOption = { value: number; label: string };

type ChipSelectProps = {
  label: string;
  options: ChipOption[];
  emptyHint?: string;
  wrap?: boolean;
  required?: boolean;
  error?: string;
} & (
  | {
      multiple?: false;
      value: number | null;
      onChange: (value: number) => void;
    }
  | {
      multiple: true;
      value: number[];
      onChange: (value: number[]) => void;
    }
);

export default function ChipSelect(props: ChipSelectProps) {
  const { label, options, emptyHint, wrap, required, error } = props;
  const { t } = useTranslation();
  const colors = useThemeColors();
  const chips = (
    <>
      {options.map((option) => {
        const selected = props.multiple
          ? props.value.includes(option.value)
          : props.value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => {
              if (props.multiple) {
                props.onChange(
                  selected
                    ? props.value.filter((id) => id !== option.value)
                    : [...props.value, option.value],
                );
                return;
              }
              props.onChange(option.value);
            }}
            style={[
              styles.chip,
              wrap && styles.chipWrapped,
              { borderColor: colors.primary },
              selected && { backgroundColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.chipLabel,
                { color: selected ? colors.onPrimary : colors.primary },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </>
  );

  return (
    <View style={styles.container}>
      <FieldLabel label={label} required={required} />
      {options.length === 0 ? (
        <Text style={[Type.hint, styles.hint]}>
          {emptyHint ?? t("misc.noOptions")}
        </Text>
      ) : wrap ? (
        <View style={styles.wrapRow}>{chips}</View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {chips}
        </ScrollView>
      )}
      <FieldError message={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Space[3] },
  hint: { opacity: 0.5 },
  row: { flexDirection: "row" },
  wrapRow: { flexDirection: "row", flexWrap: "wrap" },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: Space[2],
    borderRadius: Radius.pill,
    borderWidth: Stroke.input,
    marginRight: Space[2],
  },
  chipWrapped: { marginBottom: Space[2] },
  chipLabel: { fontSize: FontSize.sm, fontWeight: "600" },
});
