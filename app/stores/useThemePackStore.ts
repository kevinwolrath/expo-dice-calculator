import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import {
  DEFAULT_THEME_PACK_ID,
  isThemePackId,
  type ThemePackId,
} from "@/constants/themePack";

const STORAGE_KEY = "theme-pack";

const readLocalStorage = (): ThemePackId | null => {
  try {
    if (typeof localStorage === "undefined") return null;
    const value = localStorage.getItem(STORAGE_KEY);
    return isThemePackId(value) ? value : null;
  } catch {
    return null;
  }
};

const writeLocalStorage = (packId: ThemePackId | null) => {
  try {
    if (typeof localStorage === "undefined") return;
    if (packId) localStorage.setItem(STORAGE_KEY, packId);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private-mode browsers may block localStorage.
  }
};

type ThemePackState = {
  packId: ThemePackId | null;
  hydrated: boolean;
  setPackId: (packId: ThemePackId | null) => Promise<void>;
  hydrate: () => Promise<void>;
};

const initialPack = readLocalStorage() ?? DEFAULT_THEME_PACK_ID;

export const useThemePackStore = create<ThemePackState>((set) => ({
  packId: initialPack,
  hydrated: false,
  setPackId: async (packId) => {
    const next = isThemePackId(packId) ? packId : null;
    writeLocalStorage(next);
    set({ packId: next });
    if (next) await AsyncStorage.setItem(STORAGE_KEY, next);
    else await AsyncStorage.removeItem(STORAGE_KEY);
  },
  hydrate: async () => {
    const fromLocal = readLocalStorage();
    if (fromLocal) {
      set({ packId: fromLocal, hydrated: true });
      return;
    }

    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const packId = isThemePackId(stored) ? stored : DEFAULT_THEME_PACK_ID;
    writeLocalStorage(packId);
    set({ packId, hydrated: true });
  },
}));

export default useThemePackStore;
