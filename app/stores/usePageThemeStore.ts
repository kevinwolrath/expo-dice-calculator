import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import {
  defaultPageTheme,
  emptyPageThemeMap,
  parsePageThemeMap,
  type PageTheme,
  type PageThemeId,
  type PageThemeMap,
} from "@/constants/pageTheme";

const STORAGE_KEY = "page-themes";

const readLocalStorage = (): PageThemeMap | null => {
  try {
    if (typeof localStorage === "undefined") return null;
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return null;
    return parsePageThemeMap(value);
  } catch {
    return null;
  }
};

const writeLocalStorage = (themes: PageThemeMap) => {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
    }
  } catch {
    // Private-mode browsers may block localStorage.
  }
};

const persist = async (themes: PageThemeMap) => {
  writeLocalStorage(themes);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
};

type PageThemeState = {
  themes: PageThemeMap;
  hydrated: boolean;
  setPageTheme: (
    pageId: PageThemeId,
    patch: Partial<PageTheme>,
  ) => Promise<void>;
  resetPageTheme: (pageId: PageThemeId) => Promise<void>;
  hydrate: () => Promise<void>;
};

const initialThemes = readLocalStorage() ?? emptyPageThemeMap();

export const usePageThemeStore = create<PageThemeState>((set, get) => ({
  themes: initialThemes,
  hydrated: false,
  setPageTheme: async (pageId, patch) => {
    const themes = {
      ...get().themes,
      [pageId]: { ...get().themes[pageId], ...patch },
    };
    set({ themes });
    await persist(themes);
  },
  resetPageTheme: async (pageId) => {
    const themes = {
      ...get().themes,
      [pageId]: defaultPageTheme(),
    };
    set({ themes });
    await persist(themes);
  },
  hydrate: async () => {
    const fromLocal = readLocalStorage();
    if (fromLocal) {
      set({ themes: fromLocal, hydrated: true });
      return;
    }

    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const themes = parsePageThemeMap(stored);
    writeLocalStorage(themes);
    set({ themes, hydrated: true });
  },
}));

export default usePageThemeStore;
