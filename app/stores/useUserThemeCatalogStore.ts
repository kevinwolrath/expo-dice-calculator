import { create } from "zustand";

import { isBundledThemePackId, themePackFromManifest } from "@/constants/themePack";
import { themeFolderIdFromName } from "@/constants/themePackFiles";
import { setUserThemeEntries } from "@/constants/userThemeRegistry";
import {
  deleteUserTheme,
  readInstalledUserThemes,
  writeUserTheme,
} from "@/services/userThemeStorage";
import type { ParsedThemeZip } from "@/constants/userThemeAssets";

export class ThemeInstallError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ThemeInstallError";
  }
}

const syncRegistry = async () => {
  const installed = await readInstalledUserThemes();
  setUserThemeEntries(
    installed.map((theme) => ({
      pack: themePackFromManifest(theme.manifest),
      assets: theme.assets,
    })),
  );
};

type UserThemeCatalogState = {
  revision: number;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  installParsedZip: (
    parsed: ParsedThemeZip,
    displayName: string,
    overwrite: boolean,
  ) => Promise<string>;
  remove: (id: string) => Promise<void>;
};

export const useUserThemeCatalogStore = create<UserThemeCatalogState>((set, get) => ({
  revision: 0,
  hydrated: false,
  hydrate: async () => {
    await syncRegistry();
    set({ hydrated: true, revision: get().revision + 1 });
  },
  installParsedZip: async (parsed, displayName, overwrite) => {
    const name = displayName.trim();
    const id = themeFolderIdFromName(name);
    if (!id) {
      throw new ThemeInstallError("invalidName");
    }
    if (isBundledThemePackId(id)) {
      throw new ThemeInstallError("idTaken");
    }
    const existing = (await readInstalledUserThemes()).some((theme) => theme.id === id);
    if (existing && !overwrite) {
      throw new ThemeInstallError("exists");
    }
    await writeUserTheme(id, name, { ...parsed.manifest, id, name }, parsed.files);
    await syncRegistry();
    set({ revision: get().revision + 1 });
    return id;
  },
  remove: async (id) => {
    if (isBundledThemePackId(id)) {
      throw new ThemeInstallError("bundled");
    }
    await deleteUserTheme(id);
    await syncRegistry();
    set({ revision: get().revision + 1 });
  },
}));
