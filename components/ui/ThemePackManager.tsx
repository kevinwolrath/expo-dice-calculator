import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { confirm, showMessage } from "@/components/alert";
import { Screen, Text, View } from "@/components/Themed";
import { FORM_ACTION_MIN_WIDTH } from "@/components/ui/formActionLayout";
import PrimaryButton, { ActionButtonRow } from "@/components/ui/PrimaryButton";
import { useControlColors, inputTypeface } from "@/components/ui/fieldControl";
import { Control, FontSize, Layout, Space, Type } from "@/constants/theme";
import {
  isBundledThemePackId,
  isUserThemePackId,
} from "@/constants/themePack";
import { themeFolderIdFromName } from "@/constants/themePackFiles";
import { pickThemeZipBytes } from "@/services/pickThemeZip";
import { parseThemeZip, ThemeZipError } from "@/services/themeZip";
import type { ParsedThemeZip } from "@/constants/userThemeAssets";
import useThemePackStore from "@/stores/useThemePackStore";
import {
  ThemeInstallError,
  useUserThemeCatalogStore,
} from "@/stores/useUserThemeCatalogStore";

export default function ThemePackManager() {
  const { t } = useTranslation();
  const control = useControlColors();
  const insets = useSafeAreaInsets();
  const packId = useThemePackStore((state) => state.packId);
  const setPackId = useThemePackStore((state) => state.setPackId);
  const installParsedZip = useUserThemeCatalogStore((state) => state.installParsedZip);
  const remove = useUserThemeCatalogStore((state) => state.remove);
  useUserThemeCatalogStore((state) => state.revision);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<ParsedThemeZip | null>(null);
  const [name, setName] = useState("");
  const [askOverwrite, setAskOverwrite] = useState(false);

  const canDelete = Boolean(packId && isUserThemePackId(packId));

  const describeError = (error: unknown) => {
    if (error instanceof ThemeZipError && error.message === "missingFiles") {
      return t("pageTheme.themeMissingFiles", {
        files: error.missing.join(", "),
      });
    }
    if (error instanceof ThemeZipError && error.message === "invalidManifest") {
      return t("pageTheme.themeInvalidManifest");
    }
    if (error instanceof ThemeInstallError) {
      if (error.message === "invalidName") return t("pageTheme.themeInvalidName");
      if (error.message === "idTaken") return t("pageTheme.themeIdTaken");
      if (error.message === "bundled") return t("pageTheme.themeCannotDeleteBundled");
    }
    return t("pageTheme.themeImportError");
  };

  const closeNameModal = () => {
    setPending(null);
    setName("");
    setAskOverwrite(false);
  };

  const saveTheme = async (overwrite: boolean) => {
    if (!pending) return;
    setBusy(true);
    try {
      const id = await installParsedZip(pending, name, overwrite);
      await setPackId(id);
      closeNameModal();
    } catch (error) {
      if (error instanceof ThemeInstallError && error.message === "exists") {
        setAskOverwrite(true);
        return;
      }
      console.warn(error);
      showMessage(t("common.error"), describeError(error));
    } finally {
      setBusy(false);
    }
  };

  const handlePick = async () => {
    setBusy(true);
    try {
      const bytes = await pickThemeZipBytes();
      if (!bytes) return;
      const parsed = await parseThemeZip(bytes);
      setPending(parsed);
      setName(parsed.manifest.name.trim());
    } catch (error) {
      console.warn(error);
      showMessage(t("common.error"), describeError(error));
    } finally {
      setBusy(false);
    }
  };

  const handleInstall = async () => {
    if (!pending) return;
    const folderId = themeFolderIdFromName(name);
    if (!folderId) {
      showMessage(t("common.error"), t("pageTheme.themeInvalidName"));
      return;
    }
    if (isBundledThemePackId(folderId)) {
      showMessage(t("common.error"), t("pageTheme.themeIdTaken"));
      return;
    }
    if (isUserThemePackId(folderId)) {
      setAskOverwrite(true);
      return;
    }
    void saveTheme(false);
  };

  const handleDelete = async () => {
    if (!packId || !isUserThemePackId(packId)) return;
    const confirmed = await confirm(
      t("pageTheme.themeDeleteTitle"),
      t("pageTheme.themeDeleteMessage"),
    );
    if (!confirmed) return;
    setBusy(true);
    try {
      const deleting = packId;
      await setPackId(null);
      await remove(deleting);
    } catch (error) {
      console.warn(error);
      showMessage(t("common.error"), describeError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <PrimaryButton
        title={t("pageTheme.addThemeZip")}
        onPress={() => void handlePick()}
        disabled={busy}
      />
      <PrimaryButton
        title={t("pageTheme.deleteTheme")}
        onPress={() => void handleDelete()}
        variant="destructive"
        disabled={busy || !canDelete}
      />
      <Modal
        visible={pending !== null}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeNameModal}
      >
        <Screen
          style={[
            styles.modalScreen,
            {
              paddingTop: Math.max(insets.top, Space[4]),
              paddingBottom: Math.max(insets.bottom, Space[4]),
            },
          ]}
        >
          <KeyboardAvoidingView
            style={styles.modalBody}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <Text style={Type.screenTitle}>
              {askOverwrite
                ? t("pageTheme.themeOverwriteTitle")
                : t("pageTheme.saveTheme")}
            </Text>
            {askOverwrite ? (
              <Text style={Type.body}>{t("pageTheme.themeOverwriteMessage")}</Text>
            ) : (
              <>
                <Text style={Type.label}>{t("pageTheme.themeName")}</Text>
                <TextInput
                  value={name}
                  onChangeText={(value) => {
                    setAskOverwrite(false);
                    setName(value);
                  }}
                  autoFocus
                  placeholder={t("pageTheme.themeNamePlaceholder")}
                  placeholderTextColor={control.placeholder}
                  style={[
                    styles.input,
                    inputTypeface,
                    {
                      backgroundColor: control.fill,
                      borderColor: control.border,
                      color: control.text,
                    },
                  ]}
                />
              </>
            )}
            <ActionButtonRow>
              {askOverwrite ? (
                <PrimaryButton
                  title={t("pageTheme.overwriteTheme")}
                  onPress={() => void saveTheme(true)}
                  disabled={busy}
                  style={styles.modalButton}
                />
              ) : (
                <PrimaryButton
                  title={t("pageTheme.saveTheme")}
                  onPress={() => void handleInstall()}
                  disabled={busy}
                  style={styles.modalButton}
                />
              )}
              <PrimaryButton
                title={t("common.cancel")}
                variant="cancel"
                onPress={
                  askOverwrite ? () => setAskOverwrite(false) : closeNameModal
                }
                disabled={busy}
                style={styles.modalButton}
              />
            </ActionButtonRow>
          </KeyboardAvoidingView>
        </Screen>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Space[3],
  },
  modalScreen: {
    paddingHorizontal: Layout.screenGutter,
  },
  modalBody: {
    flex: 1,
    gap: Space[3],
  },
  input: {
    minHeight: 44,
    borderWidth: Control.borderWidth,
    borderRadius: Control.radius,
    paddingHorizontal: Control.paddingX,
    fontSize: FontSize.md,
  },
  modalButton: {
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: FORM_ACTION_MIN_WIDTH,
    minWidth: FORM_ACTION_MIN_WIDTH,
  },
});
