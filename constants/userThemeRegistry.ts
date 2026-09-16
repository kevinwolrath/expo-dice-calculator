import type { ThemePack } from "@/constants/themePack";
import type { ThemePackAssets } from "@/constants/themePackAssets";

export type UserThemeEntry = {
  pack: ThemePack;
  assets: ThemePackAssets;
};

let userEntries: UserThemeEntry[] = [];

export const setUserThemeEntries = (entries: UserThemeEntry[]) => {
  userEntries = entries;
};

export const listUserThemeEntries = (): UserThemeEntry[] => userEntries;

export const getUserThemeEntry = (id: string): UserThemeEntry | undefined =>
  userEntries.find((entry) => entry.pack.id === id);
