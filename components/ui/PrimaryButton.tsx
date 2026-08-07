import { Pressable, StyleSheet, Text } from "react-native";

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "destructive";
};

export default function PrimaryButton({
  title,
  onPress,
  disabled,
  variant = "primary",
}: PrimaryButtonProps) {
  const backgroundColor = variant === "destructive" ? "#d9534f" : "#2f95dc";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, opacity: disabled ? 0.5 : pressed ? 0.8 : 1 },
      ]}
    >
      <Text style={styles.label}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
