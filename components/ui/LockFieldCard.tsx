import { type ReactNode } from "react";
import { Image, StyleSheet, Switch, type ImageSourcePropType } from "react-native";

import { Text, View, useThemeColors } from "@/components/Themed";
import FieldError from "@/components/ui/FieldError";
import FieldLabel from "@/components/ui/FieldLabel";
import { usePanelStyle } from "@/components/ui/FieldPanel";
import { useControlColors } from "@/components/ui/fieldControl";
import { FontSize, Layout, Space } from "@/constants/theme";

type LockFieldCardProps = {
  icon?: ImageSourcePropType;
  label: string;
  required?: boolean;
  error?: string;
  locked: boolean;
  onLockedChange: (locked: boolean) => void;
  lockLabel: string;
  lockAccessibilityLabel: string;
  children: ReactNode;
};

export default function LockFieldCard({
  icon,
  label,
  required,
  error,
  locked,
  onLockedChange,
  lockLabel,
  lockAccessibilityLabel,
  children,
}: LockFieldCardProps) {
  const colors = useThemeColors();
  const control = useControlColors();
  const panelStyle = usePanelStyle();

  return (
    <View
      style={[
        styles.card,
        panelStyle,
        error ? { borderColor: colors.destructive } : null,
      ]}
    >
      {icon ? (
        <View style={styles.iconWrap}>
          <Image
            source={icon}
            style={styles.icon}
            accessibilityIgnoresInvertColors
          />
        </View>
      ) : null}
      <View style={styles.middle}>
        <FieldLabel label={label} required={required} />
        {children}
        <FieldError message={error} />
      </View>
      <View style={styles.lock}>
        <Text style={[styles.lockLabel, { color: control.label }]}>
          {lockLabel}
        </Text>
        <Switch
          value={locked}
          onValueChange={onLockedChange}
          trackColor={{ false: colors.inputBorder, true: colors.primary }}
          thumbColor={colors.onPrimary}
          accessibilityLabel={lockAccessibilityLabel}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 90,
    gap: 12,
    marginBottom: Layout.cardGap,
  },
  iconWrap: {
    width: 32,
    height: 32,
    flexGrow: 0,
    flexShrink: 1,
    minWidth: 0,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.78,
  },
  icon: {
    width: 32,
    height: 32,
  },
  middle: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 120,
  },
  lock: {
    flexGrow: 0,
    flexShrink: 0,
    minWidth: 72,
    alignItems: "center",
    justifyContent: "center",
    gap: Space[1],
    paddingLeft: Space[2],
  },
  lockLabel: {
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
});
