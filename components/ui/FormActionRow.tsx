import { StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { View } from "@/components/Themed";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { useScrollToForm } from "@/components/ui/ScreenList";
import { Space } from "@/constants/theme";

type FormActionRowProps = {
  addTitle: string;
  onAdd: () => void;
  saveTitle: string;
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
};

export default function FormActionRow({
  addTitle,
  onAdd,
  saveTitle,
  onSave,
  onCancel,
  saving = false,
}: FormActionRowProps) {
  const { t } = useTranslation();
  const scrollToForm = useScrollToForm();

  return (
    <View style={styles.actionRow}>
      <PrimaryButton
        title={addTitle}
        onPress={() => {
          onAdd();
          requestAnimationFrame(() => {
            scrollToForm();
          });
        }}
        disabled={saving}
      />
      <PrimaryButton
        title={saving ? t("common.saving") : saveTitle}
        onPress={onSave}
        disabled={saving}
      />
      <PrimaryButton
        title={t("common.cancel")}
        onPress={onCancel}
        disabled={saving}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: Space[3] },
});
