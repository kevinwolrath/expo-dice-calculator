import { StyleSheet } from "react-native";

import { Text } from "@/components/Themed";
import { useControlColors } from "@/components/ui/fieldControl";
import { Control, Layout, Type } from "@/constants/theme";

type FieldLabelProps = {
  label: string;
  required?: boolean;
};

export default function FieldLabel({ label, required }: FieldLabelProps) {
  const control = useControlColors();

  return (
    <Text
      style={[
        Type.label,
        styles.label,
        {
          color: control.label,
          fontSize: Control.labelSize,
          fontWeight: Control.labelWeight,
          marginBottom: Layout.labelGap,
          opacity: 1,
        },
      ]}
    >
      {label}
      {required ? (
        <Text style={{ color: control.required }}> *</Text>
      ) : null}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: Layout.labelGap },
});
