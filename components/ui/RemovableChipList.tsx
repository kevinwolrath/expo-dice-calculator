import { Pressable, StyleSheet } from "react-native";

import { Text, View, useThemeColors } from "@/components/Themed";
import FieldLabel from "@/components/ui/FieldLabel";
import { FontSize, Radius, Space, Stroke, Type } from "@/constants/theme";

type ChipItem = { value: string; label: string };

export default function RemovableChipList({
  label,
  items,
  onRemove,
  emptyText,
}: {
  label?: string;
  items: ChipItem[];
  onRemove: (value: string) => void;
  emptyText?: string;
}) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      {label ? <FieldLabel label={label} /> : null}
      {items.length === 0 ? (
        emptyText ? (
          <Text style={[Type.hint, styles.hint]}>{emptyText}</Text>
        ) : null
      ) : (
        <View style={styles.wrapRow}>
          {items.map((item) => (
            <Pressable
              key={item.value}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              onPress={() => onRemove(item.value)}
              style={[
                styles.chip,
                { borderColor: colors.primary, backgroundColor: colors.card },
              ]}
            >
              <Text style={[styles.chipLabel, { color: colors.primary }]}>
                {item.label}
              </Text>
              <Text style={[styles.remove, { color: colors.destructive }]}>
                ×
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Space[3] },
  hint: { opacity: 0.5 },
  wrapRow: { flexDirection: "row", flexWrap: "wrap" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: Space[2],
    borderRadius: Radius.pill,
    borderWidth: Stroke.input,
    marginRight: Space[2],
    marginBottom: Space[2],
    gap: Space[2],
  },
  chipLabel: { fontSize: FontSize.sm, fontWeight: "600" },
  remove: { fontSize: FontSize.md, fontWeight: "700", lineHeight: 18 },
});
