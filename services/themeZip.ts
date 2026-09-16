import JSZip from "jszip";

import type { ThemeManifest } from "@/assets/themes/assembleThemeModules";
import {
  collapseZipRoot,
  missingRequiredThemeFiles,
  THEME_MANIFEST_FILE,
} from "@/constants/themePackFiles";
import type { ParsedThemeZip, ThemeZipFile } from "@/constants/userThemeAssets";

export class ThemeZipError extends Error {
  missing: string[];

  constructor(message: string, missing: string[] = []) {
    super(message);
    this.name = "ThemeZipError";
    this.missing = missing;
  }
}

const textDecoder = new TextDecoder();

const parseManifest = (bytes: Uint8Array): ThemeManifest => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(textDecoder.decode(bytes)) as unknown;
  } catch {
    throw new ThemeZipError("invalidManifest");
  }
  if (parsed == null || typeof parsed !== "object") {
    throw new ThemeZipError("invalidManifest");
  }
  const colors = (parsed as ThemeManifest).colors;
  if (colors == null || typeof colors !== "object") {
    throw new ThemeZipError("invalidManifest");
  }
  const name =
    typeof (parsed as ThemeManifest).name === "string"
      ? (parsed as ThemeManifest).name
      : "";
  return {
    id: "",
    name,
    colors,
  };
};

export const parseThemeZip = async (data: ArrayBuffer): Promise<ParsedThemeZip> => {
  const zip = await JSZip.loadAsync(data);
  const originalPaths = Object.keys(zip.files);
  const collapsed = collapseZipRoot(originalPaths);
  const missing = missingRequiredThemeFiles(collapsed.keys());
  if (missing.length > 0) {
    throw new ThemeZipError("missingFiles", missing);
  }

  const files: ThemeZipFile[] = [];
  for (const [name, original] of collapsed) {
    const entry = zip.file(original) ?? zip.file(name);
    if (!entry || entry.dir) continue;
    const bytes = await entry.async("uint8array");
    files.push({ name, bytes });
  }

  const manifestFile = files.find((file) => file.name === THEME_MANIFEST_FILE);
  if (!manifestFile) {
    throw new ThemeZipError("missingFiles", [THEME_MANIFEST_FILE]);
  }

  return {
    manifest: parseManifest(manifestFile.bytes),
    files,
  };
};
