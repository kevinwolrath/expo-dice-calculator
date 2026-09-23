import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { StyleSheet, type LayoutChangeEvent } from "react-native";
import { useTranslation } from "react-i18next";

import { View } from "@/components/Themed";
import PrimaryButton from "@/components/ui/PrimaryButton";
import {
  FORM_ACTION_MIN_WIDTH,
  shouldStackFormActions,
} from "@/components/ui/formActionLayout";
import { useScrollToForm } from "@/components/ui/ScreenList";
import { usePackSurface } from "@/components/usePackSurface";
import { Layout } from "@/constants/theme";
import { themeColorsForPack } from "@/constants/themePack";

type FormActionsProps = {
  onAdd?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  saving?: boolean;
  dirty?: boolean;
  showAdd?: boolean;
  showSave?: boolean;
  showCancel?: boolean;
};

export default function FormActions({
  onAdd,
  onSave,
  onCancel,
  saving = false,
  dirty = false,
  showAdd = true,
  showSave = true,
  showCancel = true,
}: FormActionsProps) {
  const { t } = useTranslation();
  const { isNight, packId } = usePackSurface();
  const pack = themeColorsForPack(packId);
  const scrollToForm = useScrollToForm();
  const [width, setWidth] = useState(0);
  const stacked = shouldStackFormActions(width);
  const addTint = isNight ? "#FFFFFF" : pack.text;
  const saveTint = isNight ? "#000000" : pack.onPrimary;
  const cancelTint = isNight ? "#FFFFFF" : pack.text;

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const buttonStyle = stacked ? styles.stackedButton : styles.rowButton;

  return (
    <View onLayout={onLayout} style={[styles.row, stacked && styles.stacked]}>
      {showAdd && onAdd ? (
        <PrimaryButton
          title={t("common.add")}
          variant="secondary"
          style={buttonStyle}
          disabled={saving || dirty}
          icon={
            <SymbolView
              name={{ ios: "plus", android: "add", web: "add" }}
              size={18}
              tintColor={addTint}
            />
          }
          onPress={() => {
            onAdd();
            requestAnimationFrame(() => {
              scrollToForm();
            });
          }}
        />
      ) : null}
      {showSave && onSave ? (
        <PrimaryButton
          title={saving ? t("common.saving") : t("common.save")}
          variant="primary"
          style={buttonStyle}
          disabled={saving}
          icon={
            <SymbolView
              name={{
                ios: "checkmark",
                android: "save",
                web: "save",
              }}
              size={18}
              tintColor={saveTint}
            />
          }
          onPress={onSave}
        />
      ) : null}
      {showCancel && onCancel ? (
        <PrimaryButton
          title={t("common.cancel")}
          variant="cancel"
          style={buttonStyle}
          disabled={saving}
          icon={
            <SymbolView
              name={{ ios: "xmark", android: "close", web: "close" }}
              size={18}
              tintColor={cancelTint}
            />
          }
          onPress={onCancel}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
    gap: Layout.actionGap,
    marginTop: Layout.cardGap,
  },
  stacked: {
    flexDirection: "column",
  },
  rowButton: {
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: FORM_ACTION_MIN_WIDTH,
    minWidth: FORM_ACTION_MIN_WIDTH,
  },
  stackedButton: {
    width: "100%",
    minWidth: "100%",
  },
});
