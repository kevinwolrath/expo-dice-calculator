import { StyleSheet } from "react-native";

import { Text, useThemeColors } from "@/components/Themed";
import { Space, Type } from "@/constants/theme";

type FieldLabelProps = {
  label: string;
  required?: boolean;
};

export default function FieldLabel({ label, required }: FieldLabelProps) {
  const colors = useThemeColors();

  return (
    <Text style={[Type.label, styles.label]}>
      {label}
      {required ? (
        <Text style={{ color: colors.destructive }}> *</Text>
      ) : null}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: Space[1], opacity: 0.7 },
});
