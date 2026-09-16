import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import { Platform } from "react-native";

export const pickThemeZipBytes = async (): Promise<ArrayBuffer | null> => {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["application/zip", "application/x-zip-compressed"],
    copyToCacheDirectory: true,
    multiple: false,
    base64: false,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset) return null;

  if (asset.file) {
    return asset.file.arrayBuffer();
  }

  if (Platform.OS === "web") {
    const response = await fetch(asset.uri);
    return response.arrayBuffer();
  }

  const file = new File(asset.uri);
  return file.arrayBuffer();
};
