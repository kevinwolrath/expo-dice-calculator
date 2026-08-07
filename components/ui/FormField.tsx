import { StyleSheet, TextInput, type TextInputProps } from "react-native";

import { Text, useThemeColor, View } from "@/components/Themed";

type FormFieldProps = TextInputProps & {
  label: string;
};

export default function FormField({
  label,
  style,
  multiline,
  ...props
}: FormFieldProps) {
  const borderColor = useThemeColor({}, "tabIconDefault");
  const color = useThemeColor({}, "text");

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={borderColor}
        multiline={multiline}
        style={[
          styles.input,
          { borderColor, color },
          multiline && styles.multiline,
          style,
        ]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 4, opacity: 0.7 },
  input: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  multiline: { minHeight: 80, textAlignVertical: "top" },
});
