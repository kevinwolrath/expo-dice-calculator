import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

const downloadOnWeb = (filename: string, contents: string) => {
  const blob = new Blob([contents], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export const backupFilename = (exportedAt = new Date()) => {
  const date = exportedAt.toISOString().slice(0, 10);
  return `dice-calculator-backup-${date}.json`;
};

export const saveBackupJson = async (
  contents: string,
  filename = backupFilename(),
): Promise<void> => {
  if (Platform.OS === "web") {
    downloadOnWeb(filename, contents);
    return;
  }

  const file = new File(Paths.cache, filename);
  file.create({ overwrite: true });
  file.write(contents);

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("sharingUnavailable");
  }

  await Sharing.shareAsync(file.uri, {
    mimeType: "application/json",
    UTI: "public.json",
    dialogTitle: filename,
  });
};

const readPickedAsset = async (
  asset: DocumentPicker.DocumentPickerAsset,
): Promise<string> => {
  if (asset.file) {
    return asset.file.text();
  }
  if (asset.base64) {
    const binary = atob(asset.base64);
    return decodeURIComponent(
      Array.from(binary, (char) =>
        `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`,
      ).join(""),
    );
  }

  const file = new File(asset.uri);
  return file.text();
};

export const pickBackupJsonText = async (): Promise<string | null> => {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["application/json", "text/json", "public.json"],
    copyToCacheDirectory: true,
    multiple: false,
    base64: false,
  });

  if (result.canceled) {
    return null;
  }

  const asset = result.assets[0];
  if (!asset) {
    return null;
  }

  return readPickedAsset(asset);
};
