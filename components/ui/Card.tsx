import { StyleSheet, View } from "react-native";

import { useThemeColors } from "@/components/Themed";
import { Radius, Space, Stroke } from "@/constants/theme";

export default function Card({ children }: { children: React.ReactNode }) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: Stroke.hairline,
    padding: Space[3],
    marginBottom: Space[3],
  },
});
