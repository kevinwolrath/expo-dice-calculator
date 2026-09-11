import { type ReactNode } from "react";
import { StyleSheet } from "react-native";

import { View, useThemeColors } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
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

export default function FieldPanel({
  icon,
  error,
  children,
}: {
  icon?: ReactNode;
  error?: boolean;
  children: ReactNode;
}) {
  const colors = useThemeColors();
  const panelStyle = usePanelStyle();

  return (
    <View
      style={[
        styles.panel,
        panelStyle,
        error ? { borderColor: colors.destructive } : null,
      ]}
    >
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: Layout.cardGap,
  },
  iconWrap: {
    width: 32,
    height: 32,
    marginTop: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, minWidth: 0 },
});
