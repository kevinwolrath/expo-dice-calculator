import { StyleSheet } from "react-native";

import { Text, useThemeColors } from "@/components/Themed";
import { Space, Type } from "@/constants/theme";

export default function FieldError({ message }: { message?: string }) {
  const colors = useThemeColors();
  if (!message) return null;

  return (
    <Text
      accessibilityLiveRegion="polite"
      style={[Type.meta, styles.error, { color: colors.destructive }]}
    >
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  error: { marginTop: Space[1] },
});
