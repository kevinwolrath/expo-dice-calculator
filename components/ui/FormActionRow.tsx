import { StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import PrimaryButton, { ActionButtonRow } from "@/components/ui/PrimaryButton";
import { useScrollToForm } from "@/components/ui/ScreenList";

export const isFormDirty = (current: unknown, clean: unknown) =>
  JSON.stringify(current) !== JSON.stringify(clean);

type FormActionRowProps = {
  addTitle: string;
  onAdd: () => void;
  saveTitle: string;
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
  dirty?: boolean;
};

export default function FormActionRow({
  addTitle,
  onAdd,
  saveTitle,
  onSave,
  onCancel,
  saving = false,
  dirty = false,
}: FormActionRowProps) {
  const { t } = useTranslation();
  const scrollToForm = useScrollToForm();

  return (
    <ActionButtonRow>
      <PrimaryButton
        title={addTitle}
        variant="secondary"
        style={styles.flexButton}
        onPress={() => {
          onAdd();
          requestAnimationFrame(() => {
            scrollToForm();
          });
        }}
        disabled={saving || dirty}
      />
      <PrimaryButton
        title={saving ? t("common.saving") : saveTitle}
        variant="primary"
        style={styles.flexButton}
        onPress={onSave}
        disabled={saving}
      />
      <PrimaryButton
        title={t("common.cancel")}
        variant="cancel"
        style={styles.flexButton}
        onPress={onCancel}
        disabled={saving}
      />
    </ActionButtonRow>
  );
}

const styles = StyleSheet.create({
  flexButton: { flex: 1, minWidth: 0 },
});
