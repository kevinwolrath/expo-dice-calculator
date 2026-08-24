import { StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { View } from "@/components/Themed";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { Space } from "@/constants/theme";

type FormActionRowProps = {
  saveTitle: string;
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
};

export default function FormActionRow({
  saveTitle,
  onSave,
  onCancel,
  saving = false,
}: FormActionRowProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.actionRow}>
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
  actionRow: { flexDirection: "row", gap: Space[3] },
});
