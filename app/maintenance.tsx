import { useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

import { confirm, showMessage } from "@/components/alert";
import { PageThemeScope } from "@/components/pageTheme/PageThemeScope";
import { Screen, Text, View } from "@/components/Themed";
import Card from "@/components/ui/Card";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { Layout, Space, Type } from "@/constants/theme";
import {
  BackupParseError,
  exportDatabaseJson,
  importDatabaseJson,
} from "@/db";
import { pickBackupJsonText, saveBackupJson } from "@/db/backupFile";
import useInventoryStore from "@/stores/useInventoryStore";
import { useTranslation } from "react-i18next";

export default function MaintenanceScreen() {
  const { t } = useTranslation();
  const loadAll = useInventoryStore((s) => s.loadAll);
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    setBusy(true);
    try {
      const json = await exportDatabaseJson();
      await saveBackupJson(json);
      showMessage(t("common.ok"), t("maintenance.exportSuccess"));
    } catch (error) {
      console.warn(error);
      showMessage(t("common.error"), t("maintenance.exportError"));
    } finally {
      setBusy(false);
    }
  };

  const handleImport = async () => {
    try {
      const json = await pickBackupJsonText();
      if (json === null) return;

      const confirmed = await confirm(
        t("maintenance.importConfirmTitle"),
        t("maintenance.importConfirmMessage"),
      );
      if (!confirmed) return;

      setBusy(true);
      await importDatabaseJson(json);
      await loadAll();
      showMessage(t("common.ok"), t("maintenance.importSuccess"));
    } catch (error) {
      console.warn(error);
      const message =
        error instanceof BackupParseError
          ? t("maintenance.invalidFile")
          : t("maintenance.importError");
      showMessage(t("common.error"), message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageThemeScope pageId="maintenance">
    <Screen>
      <View style={styles.content}>
        <Text style={Type.heading}>{t("maintenance.intro")}</Text>
        <Card>
          <View style={styles.actions}>
            <PrimaryButton
              title={t("maintenance.export")}
              onPress={() => void handleExport()}
              disabled={busy}
            />
            <PrimaryButton
              title={t("maintenance.import")}
              onPress={() => void handleImport()}
              disabled={busy}
              variant="destructive"
            />
            {busy ? <ActivityIndicator /> : null}
          </View>
        </Card>
      </View>
    </Screen>
    </PageThemeScope>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Layout.screenGutter,
    gap: Space[4],
  },
  actions: {
    gap: Space[3],
  },
});
