import { Pressable, ScrollView, StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";

type ChipOption = { value: number; label: string };

type ChipSelectProps = {
  label: string;
  options: ChipOption[];
  value: number | null;
  onChange: (value: number) => void;
  emptyHint?: string;
};

export default function ChipSelect({
  label,
  options,
  value,
  onChange,
  emptyHint,
}: ChipSelectProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {options.length === 0 ? (
        <Text style={styles.hint}>{emptyHint ?? "No options yet"}</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <Pressable
                key={option.value}
                onPress={() => onChange(option.value)}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    selected && styles.chipLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6, opacity: 0.7 },
  hint: { fontSize: 13, opacity: 0.5, fontStyle: "italic" },
  row: { flexDirection: "row" },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: "#2f95dc",
    marginRight: 8,
  },
  chipSelected: { backgroundColor: "#2f95dc" },
  chipLabel: { color: "#2f95dc", fontSize: 14, fontWeight: "600" },
  chipLabelSelected: { color: "#fff" },
});
