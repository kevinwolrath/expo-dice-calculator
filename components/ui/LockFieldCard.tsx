import { type ReactNode, useState } from "react";
import { StyleSheet, Switch, type ImageSourcePropType, type LayoutChangeEvent } from "react-native";

import { Text, View, useThemeColors } from "@/components/Themed";
import FieldError from "@/components/ui/FieldError";
import FieldLabel from "@/components/ui/FieldLabel";
import FieldLabelIcon, {
  FIELD_LABEL_ICON_GAP,
} from "@/components/ui/FieldLabelIcon";
import { usePanelStyle } from "@/components/ui/FieldPanel";
import { useControlColors } from "@/components/ui/fieldControl";
import { shouldStackLockField } from "@/components/ui/lockFieldLayout";
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
  const [width, setWidth] = useState(0);
  const stacked = shouldStackLockField(width);

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.card,
        stacked && styles.cardStacked,
        panelStyle,
        styles.fieldPadding,
        error ? { borderColor: colors.destructive } : null,
      ]}
    >
      {icon ? (
        <View style={styles.iconWrap}>
          <FieldLabelIcon source={icon} />
        </View>
      ) : null}
      <View style={[styles.middle, stacked && styles.middleStacked]}>
        <FieldLabel label={label} required={required} />
        {children}
        <FieldError message={error} />
      </View>
      <View style={[styles.lock, stacked && styles.lockStacked]}>
        <Text style={[styles.lockLabel, { color: control.label }]}>
          {lockLabel}
        </Text>
        <Switch
          value={locked}
          onValueChange={onLockedChange}
          trackColor={{ false: colors.inputBorder, true: colors.primary }}
          thumbColor={colors.onPrimary}
          accessibilityLabel={lockAccessibilityLabel}
          accessibilityRole="switch"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: FIELD_LABEL_ICON_GAP,
    marginBottom: Layout.fieldGap,
  },
  fieldPadding: {
    padding: Layout.fieldPadding,
  },
  cardStacked: {
    flexDirection: "column",
    flexWrap: "nowrap",
    alignItems: "stretch",
  },
  iconWrap: {
    marginTop: 2,
    flexGrow: 0,
    flexShrink: 0,
  },
  middle: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 180,
    minWidth: 160,
  },
  middleStacked: {
    flexBasis: "100%",
    width: "100%",
    minWidth: 0,
  },
  lock: {
    alignSelf: "center",
    flexGrow: 0,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: Space[1],
    paddingLeft: Space[2],
  },
  lockStacked: {
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 0,
    paddingTop: Space[2],
  },
  lockLabel: {
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
});
