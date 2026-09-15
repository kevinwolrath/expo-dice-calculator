import {
  DEFAULT_THEME_PACK_ID,
  getThemePack,
  isThemePackId,
  listThemePacks,
  pageDefaultsForPack,
  themeColorsForPack,
  UNSTYLED_PACK_COLORS,
} from "../constants/themePack";
import { getThemePackAssets } from "../constants/themePackAssets";
import {
  NIGHT_BACKGROUND,
  NIGHT_FOREGROUND,
  resolvePageAppearance,
} from "../constants/pageTheme";

test("discovers theme packs from theme folders", () => {
  const packs = listThemePacks();
  const ids = packs.map((pack) => pack.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const pack of packs) {
    expect(isThemePackId(pack.id)).toBe(true);
    expect(getThemePack(pack.id)?.name).toBe(pack.name);
    const assets = getThemePackAssets(pack.id);
    expect(assets.background).toBeDefined();
    expect(assets.banner).toBeDefined();
    expect(assets.icons?.notes).toBeDefined();
    expect(assets.icons?.material).toBeDefined();
    expect(assets.icons?.method).toBeDefined();
    expect(assets.icons?.colour).toBeDefined();
    expect(assets.icons?.dice).toBeDefined();
    expect(assets.preview?.footerParchment).toBeDefined();
    expect(assets.preview?.diceIcon).toBeDefined();
    expect(assets.preview?.paletteIcon).toBeDefined();
  }
});

test("pack page defaults use the pack colours on every page", () => {
  const pack = listThemePacks()[0];
  if (!pack) {
    expect(pageDefaultsForPack(null, "dicejob")).toEqual({
      foreground: UNSTYLED_PACK_COLORS.text,
      background: UNSTYLED_PACK_COLORS.background,
    });
    return;
  }
  expect(pageDefaultsForPack(pack.id, "dicejob")).toEqual({
    foreground: pack.colors.text,
    background: pack.colors.background,
  });
  expect(pageDefaultsForPack(pack.id, "stock")).toEqual(
    pageDefaultsForPack(pack.id, "dicejob"),
  );
});

test("night view ignores pack defaults and page customisation", () => {
  const pack = listThemePacks()[0];
  const defaults = pack
    ? pageDefaultsForPack(pack.id, "dicejob")
    : pageDefaultsForPack(null, "dicejob");
  const resolved = resolvePageAppearance(
    "dicejob",
    {
      foreground: defaults.foreground,
      background: defaults.background,
      imageUri: "file://bg.png",
      imageMode: "cover",
    },
    "dark",
    defaults,
  );
  expect(resolved.foreground).toBe(NIGHT_FOREGROUND);
  expect(resolved.background).toBe(NIGHT_BACKGROUND);
  expect(resolved.imageUri).toBeNull();
});

test("unknown or missing pack ids fall back to no theme", () => {
  expect(DEFAULT_THEME_PACK_ID).toBeNull();
  expect(isThemePackId("neon")).toBe(false);
  expect(getThemePack("neon")).toBeNull();
  expect(getThemePack(null)).toBeNull();
  expect(getThemePackAssets("neon")).toEqual({});
  expect(getThemePackAssets(null)).toEqual({});
  expect(themeColorsForPack(null)).toEqual(UNSTYLED_PACK_COLORS);
  expect(pageDefaultsForPack(null, "dicejob")).toEqual({
    foreground: UNSTYLED_PACK_COLORS.text,
    background: UNSTYLED_PACK_COLORS.background,
  });
});

test("discovered packs expose their configured colours", () => {
  const unicorn = getThemePack("unicorn");
  if (unicorn) {
    expect(unicorn.colors.primary).toBe("#8E44D7");
    expect(unicorn.colors.wood).toBe("#A76B91");
  }
  const tavern = getThemePack("tavern");
  if (tavern) {
    expect(tavern.id).toBe("tavern");
  }
});
