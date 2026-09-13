import { type ReactNode } from "react";
import { StyleSheet, Switch, type ImageSourcePropType } from "react-native";

import { Text, View, useThemeColors } from "@/components/Themed";
import FieldError from "@/components/ui/FieldError";
import FieldLabel from "@/components/ui/FieldLabel";
import FieldLabelIcon, {
  FIELD_LABEL_ICON_GAP,
} from "@/components/ui/FieldLabelIcon";
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
          <FieldLabelIcon source={icon} />
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
    alignItems: "flex-start",
    minHeight: 90,
    gap: FIELD_LABEL_ICON_GAP,
    marginBottom: Layout.cardGap,
  },
  iconWrap: {
    marginTop: 2,
    flexGrow: 0,
    flexShrink: 0,
  },
  middle: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 120,
  },
  lock: {
    alignSelf: "center",
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
