import {
  DEFAULT_THEME_PACK_ID,
  getThemePack,
  isThemePackId,
  listThemePacks,
  pageDefaultsForPack,
} from "../constants/themePack";
import {
  NIGHT_BACKGROUND,
  NIGHT_FOREGROUND,
  resolvePageAppearance,
} from "../constants/pageTheme";

test("loads theme packs from the themes folder", () => {
  const packs = listThemePacks();
  expect(packs.length).toBeGreaterThan(0);
  const pack = packs[0]!;
  expect(isThemePackId(pack.id)).toBe(true);
  expect(getThemePack(pack.id).name).toBe(pack.name);
  expect(DEFAULT_THEME_PACK_ID).toBe(pack.id);
});

test("pack page defaults use the pack colours on every page", () => {
  const pack = listThemePacks()[0]!;
  expect(pageDefaultsForPack(pack.id, "dicejob")).toEqual({
    foreground: pack.colors.text,
    background: pack.colors.background,
  });
  expect(pageDefaultsForPack(pack.id, "stock")).toEqual(
    pageDefaultsForPack(pack.id, "dicejob"),
  );
});

test("night view ignores pack defaults and page customisation", () => {
  const pack = listThemePacks()[0]!;
  const resolved = resolvePageAppearance(
    "dicejob",
    {
      foreground: pack.colors.text,
      background: pack.colors.background,
      imageUri: "file://bg.png",
      imageMode: "cover",
    },
    "dark",
    pageDefaultsForPack(pack.id, "dicejob"),
  );
  expect(resolved.foreground).toBe(NIGHT_FOREGROUND);
  expect(resolved.background).toBe(NIGHT_BACKGROUND);
  expect(resolved.imageUri).toBeNull();
});

test("rejects unknown pack ids", () => {
  expect(isThemePackId("neon")).toBe(false);
});
