import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export type ColorScheme = "light" | "dark";

const STORAGE_KEY = "appearance-color-scheme";

const isColorScheme = (value: string | null): value is ColorScheme =>
  value === "light" || value === "dark";

const readLocalStorage = (): ColorScheme | null => {
  try {
    if (typeof localStorage === "undefined") return null;
    const value = localStorage.getItem(STORAGE_KEY);
    return isColorScheme(value) ? value : null;
  } catch {
    return null;
  }
};

const writeLocalStorage = (colorScheme: ColorScheme) => {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, colorScheme);
    }
  } catch {
    // Private-mode browsers may block localStorage.
  }
};

const applyBodyBackground = (colorScheme: ColorScheme) => {
  if (typeof document !== "undefined") {
    document.body.style.backgroundColor =
      colorScheme === "dark" ? "#000" : "#fff";
  }
};

type AppearanceState = {
  colorScheme: ColorScheme;
  hydrated: boolean;
  setColorScheme: (colorScheme: ColorScheme) => Promise<void>;
  toggleColorScheme: () => Promise<void>;
  hydrate: () => Promise<void>;
};

const initialScheme = readLocalStorage() ?? "light";
applyBodyBackground(initialScheme);

export const useAppearanceStore = create<AppearanceState>((set, get) => ({
  colorScheme: initialScheme,
  hydrated: false,
  setColorScheme: async (colorScheme) => {
    writeLocalStorage(colorScheme);
    applyBodyBackground(colorScheme);
    set({ colorScheme });
    await AsyncStorage.setItem(STORAGE_KEY, colorScheme);
  },
  toggleColorScheme: async () => {
    await get().setColorScheme(
      get().colorScheme === "dark" ? "light" : "dark",
    );
  },
  hydrate: async () => {
    const fromLocal = readLocalStorage();
    if (fromLocal) {
      applyBodyBackground(fromLocal);
      set({ colorScheme: fromLocal, hydrated: true });
      return;
    }

    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const colorScheme = isColorScheme(stored) ? stored : "light";
    writeLocalStorage(colorScheme);
    applyBodyBackground(colorScheme);
    set({ colorScheme, hydrated: true });
  },
}));

export default useAppearanceStore;
