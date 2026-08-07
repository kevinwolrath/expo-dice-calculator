import { StyleSheet } from "react-native";

import { View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";

export default function Card({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();

  return (
    <View
      lightColor="#f7f7f9"
      darkColor="#1c1c1e"
      style={[
        styles.card,
        { borderColor: colorScheme === "dark" ? "#333" : "#e5e5ea" },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 12,
  },
});
