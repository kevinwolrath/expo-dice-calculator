import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { usePanelStyle } from "@/components/ui/FieldPanel";
import { Layout } from "@/constants/theme";

export default function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const panelStyle = usePanelStyle();

  return (
    <View style={[styles.card, panelStyle, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Layout.cardGap,
  },
});
