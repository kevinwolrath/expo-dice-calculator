import { forwardRef, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { useThemeColors } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import { FIELD_LABEL_ICON_GAP } from "@/components/ui/FieldLabelIcon";
import { Layout } from "@/constants/theme";

export function usePanelStyle() {
  const colors = useThemeColors();
  const isNight = useColorScheme() === "dark";

  return {
    backgroundColor: isNight ? "#000000" : colors.card,
    borderColor: isNight ? "rgba(255,255,255,0.35)" : "rgba(244, 199, 75, 0.28)",
    borderWidth: Layout.panelBorderWidth,
    borderRadius: Layout.cardRadius,
    padding: Layout.cardPadding,
    shadowColor: "#000000",
    shadowOffset: Layout.panelShadowOffset,
    shadowOpacity: isNight ? 0 : Layout.panelShadowOpacity,
    shadowRadius: Layout.panelShadowRadius,
    elevation: isNight ? 0 : Layout.panelElevation,
  };
}

const FieldPanel = forwardRef<
  View,
  {
    icon?: ReactNode;
    error?: boolean;
    children: ReactNode;
  }
>(function FieldPanel({ icon, error, children }, ref) {
  const colors = useThemeColors();
  const panelStyle = usePanelStyle();

  return (
    <View
      ref={ref}
      collapsable={false}
      style={[
        styles.panel,
        panelStyle,
        styles.fieldPadding,
        error ? { borderColor: colors.destructive } : null,
      ]}
    >
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <View style={styles.body}>{children}</View>
    </View>
  );
});

export default FieldPanel;

const styles = StyleSheet.create({
  panel: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: FIELD_LABEL_ICON_GAP,
    marginBottom: Layout.fieldGap,
  },
  fieldPadding: {
    padding: Layout.fieldPadding,
  },
  iconWrap: {
    marginTop: 2,
    flexGrow: 0,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, minWidth: 0 },
});
