import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";

import { useThemeColors } from "@/components/Themed";
import { Radius, Space, Touch, Type } from "@/constants/theme";

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "destructive";
  style?: StyleProp<ViewStyle>;
};

export default function PrimaryButton({
  title,
  onPress,
  disabled,
  variant = "primary",
  style,
}: PrimaryButtonProps) {
  const colors = useThemeColors();
  const backgroundColor =
    variant === "destructive" ? colors.destructive : colors.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, opacity: disabled ? 0.5 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      <Text style={[Type.button, { color: colors.onPrimary }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 84,
    minHeight: Touch.minHeight,
    paddingHorizontal: Space[4],
    paddingVertical: Space[3],
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
