import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import FieldError from "@/components/ui/FieldError";
import FieldLabel from "@/components/ui/FieldLabel";
import FieldPanel from "@/components/ui/FieldPanel";
import { inputTypeface, useControlColors } from "@/components/ui/fieldControl";
import { Control, FontSize, Space, Type } from "@/constants/theme";

type ChipOption = { value: string; label: string };

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
      value: string | null;
      onChange: (value: string) => void;
    }
  | {
      multiple: true;
      value: string[];
      onChange: (value: string[]) => void;
    }
);

export default function ChipSelect(props: ChipSelectProps) {
  const { label, options, emptyHint, wrap, required, error } = props;
  const { t } = useTranslation();
  const control = useControlColors();
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
              {
                backgroundColor: selected
                  ? control.selectedFill
                  : control.fill,
                borderColor: selected ? control.focus : control.border,
                borderWidth: Control.borderWidth,
                borderRadius: Control.radius,
                paddingHorizontal: Control.paddingX,
              },
            ]}
          >
            <Text
              style={[
                styles.chipLabel,
                inputTypeface,
                {
                  color: control.text,
                  fontWeight: selected ? "600" : "400",
                },
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
    <FieldPanel error={Boolean(error)}>
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
    </FieldPanel>
  );
}

const styles = StyleSheet.create({
  hint: { opacity: 0.5 },
  row: { flexDirection: "row" },
  wrapRow: { flexDirection: "row", flexWrap: "wrap" },
  chip: {
    minHeight: 44,
    justifyContent: "center",
    marginRight: Space[2],
    paddingVertical: Space[2],
  },
  chipWrapped: { marginBottom: Space[2] },
  chipLabel: { fontSize: FontSize.sm },
});
