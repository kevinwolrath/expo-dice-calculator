import { Directory, File, Paths } from "expo-file-system";
import { Platform } from "react-native";

import type { ThemeManifest } from "@/assets/themes/assembleThemeModules";
import { REQUIRED_THEME_FILES } from "@/constants/themePackFiles";
import type { ThemePackAssets } from "@/constants/themePackAssets";
import {
  asPackAssets,
  themeAssetsFromFileUris,
  type ThemeZipFile,
} from "@/constants/userThemeAssets";

export type InstalledUserTheme = {
  id: string;
  name: string;
  manifest: ThemeManifest;
  assets: ThemePackAssets;
};

const encoder = new TextEncoder();

const packDir = (id: string) => new Directory(Paths.document, "user-themes", id);

const writeNative = async (
  id: string,
  files: ThemeZipFile[],
): Promise<Record<string, string>> => {
  const root = new Directory(Paths.document, "user-themes");
  if (!root.exists) {
    root.create();
  }
  const folder = packDir(id);
  if (folder.exists) {
    folder.delete();
  }
  folder.create();

  const uris: Record<string, string> = {};
  for (const file of files) {
    const dest = new File(folder, file.name);
    dest.create({ overwrite: true });
    dest.write(file.bytes);
    uris[file.name] = dest.uri;
  }
  return uris;
};

const readNative = async (): Promise<InstalledUserTheme[]> => {
  const root = new Directory(Paths.document, "user-themes");
  if (!root.exists) return [];

  const installed: InstalledUserTheme[] = [];
  for (const item of root.list()) {
    if (!(item instanceof Directory)) continue;
    const id = item.name;
    const manifestFile = new File(item, "theme.json");
    if (!manifestFile.exists) continue;
    try {
      const manifest = JSON.parse(await manifestFile.text()) as ThemeManifest;
      if (!manifest?.colors) continue;
      const uris: Record<string, string> = {};
      let complete = true;
      for (const name of REQUIRED_THEME_FILES) {
        const file = new File(item, name);
        if (!file.exists) {
          complete = false;
          break;
        }
        uris[name] = file.uri;
      }
      if (!complete) continue;
      installed.push({
        id,
        name: manifest.name || id,
        manifest: { ...manifest, id, name: manifest.name || id },
        assets: asPackAssets(themeAssetsFromFileUris(uris)),
      });
    } catch {
      // Skip unreadable packs.
    }
  }
  return installed.sort((a, b) => a.name.localeCompare(b.name));
};

const deleteNative = async (id: string): Promise<void> => {
  const folder = packDir(id);
  if (folder.exists) {
    folder.delete();
  }
};

const DB_NAME = "dice-user-themes";
const DB_VERSION = 1;
const META_STORE = "meta";
const FILE_STORE = "files";

type WebMeta = {
  id: string;
  name: string;
  manifest: ThemeManifest;
};

const openWebDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(FILE_STORE)) {
        db.createObjectStore(FILE_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const idbRequest = <T,>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const fileKey = (id: string, name: string) => `${id}/${name}`;

const writeWeb = async (
  id: string,
  name: string,
  manifest: ThemeManifest,
  files: ThemeZipFile[],
): Promise<Record<string, string>> => {
  const db = await openWebDb();
  const tx = db.transaction([META_STORE, FILE_STORE], "readwrite");
  const meta = tx.objectStore(META_STORE);
  const store = tx.objectStore(FILE_STORE);
  await idbRequest(meta.put({ id, name, manifest } satisfies WebMeta));
  const uris: Record<string, string> = {};
  for (const file of files) {
    const blob = new Blob([file.bytes.slice()]);
    await idbRequest(store.put(blob, fileKey(id, file.name)));
    uris[file.name] = URL.createObjectURL(blob);
  }
  db.close();
  return uris;
};

const readWeb = async (): Promise<InstalledUserTheme[]> => {
  if (typeof indexedDB === "undefined") return [];
  const db = await openWebDb();
  const tx = db.transaction([META_STORE, FILE_STORE], "readonly");
  const metas = (await idbRequest(
    tx.objectStore(META_STORE).getAll(),
  )) as WebMeta[];
  const store = tx.objectStore(FILE_STORE);
  const installed: InstalledUserTheme[] = [];
  for (const meta of metas) {
    const uris: Record<string, string> = {};
    let complete = true;
    for (const name of REQUIRED_THEME_FILES) {
      const blob = (await idbRequest(
        store.get(fileKey(meta.id, name)),
      )) as Blob | undefined;
      if (!blob) {
        complete = false;
        break;
      }
      uris[name] = URL.createObjectURL(blob);
    }
    if (!complete) continue;
    installed.push({
      id: meta.id,
      name: meta.name,
      manifest: { ...meta.manifest, id: meta.id, name: meta.name },
      assets: asPackAssets(themeAssetsFromFileUris(uris)),
    });
  }
  db.close();
  return installed.sort((a, b) => a.name.localeCompare(b.name));
};

const deleteWeb = async (id: string): Promise<void> => {
  const db = await openWebDb();
  const tx = db.transaction([META_STORE, FILE_STORE], "readwrite");
  await idbRequest(tx.objectStore(META_STORE).delete(id));
  const store = tx.objectStore(FILE_STORE);
  for (const name of REQUIRED_THEME_FILES) {
    await idbRequest(store.delete(fileKey(id, name)));
  }
  db.close();
};

const rewriteManifestBytes = (
  files: ThemeZipFile[],
  manifest: ThemeManifest,
): ThemeZipFile[] => {
  const json = encoder.encode(`${JSON.stringify(manifest, null, 2)}\n`);
  return files.map((file) =>
    file.name === "theme.json" ? { ...file, bytes: json } : file,
  );
};

export const writeUserTheme = async (
  id: string,
  name: string,
  manifest: ThemeManifest,
  files: ThemeZipFile[],
): Promise<InstalledUserTheme> => {
  const storedManifest = { ...manifest, id, name };
  const storedFiles = rewriteManifestBytes(files, storedManifest);
  const uris =
    Platform.OS === "web"
      ? await writeWeb(id, name, storedManifest, storedFiles)
      : await writeNative(id, storedFiles);
  return {
    id,
    name,
    manifest: storedManifest,
    assets: asPackAssets(themeAssetsFromFileUris(uris)),
  };
};

export const readInstalledUserThemes = async (): Promise<InstalledUserTheme[]> => {
  if (Platform.OS === "web") return readWeb();
  return readNative();
};

export const deleteUserTheme = async (id: string): Promise<void> => {
  if (Platform.OS === "web") {
    await deleteWeb(id);
    return;
  }
  await deleteNative(id);
};
