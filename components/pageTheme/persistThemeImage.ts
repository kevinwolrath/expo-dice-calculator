import { Directory, File, Paths } from "expo-file-system";
import { Platform } from "react-native";

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Could not read image"));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const extensionFor = (uri: string, mimeType?: string | null) => {
  if (mimeType?.includes("png")) return ".png";
  if (mimeType?.includes("webp")) return ".webp";
  if (mimeType?.includes("gif")) return ".gif";
  const match = uri.match(/\.(png|jpe?g|webp|gif)(\?|$)/i);
  if (match) return `.${match[1].toLowerCase().replace("jpg", "jpeg")}`;
  return ".jpg";
};

export const persistThemeImage = async (
  pageId: string,
  uri: string,
  options?: { base64?: string | null; mimeType?: string | null },
): Promise<string> => {
  if (options?.base64) {
    const mime = options.mimeType || "image/jpeg";
    return `data:${mime};base64,${options.base64}`;
  }

  if (uri.startsWith("data:")) {
    return uri;
  }

  if (Platform.OS === "web") {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blobToDataUrl(blob);
  }

  const folder = new Directory(Paths.document, "page-themes");
  if (!folder.exists) {
    folder.create();
  }

  const dest = new File(folder, `${pageId}${extensionFor(uri, options?.mimeType)}`);
  if (dest.exists) {
    dest.delete();
  }

  const source = new File(uri);
  await source.copy(dest);
  return dest.uri;
};
