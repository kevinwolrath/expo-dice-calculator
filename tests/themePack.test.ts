import {
  DEFAULT_THEME_PACK_ID,
  getThemePack,
  isThemePackId,
  listThemePacks,
  pageDefaultsForPack,
} from "../constants/themePack";
import { getThemePackAssets } from "../constants/themePackAssets";
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

test("rejects unknown pack ids and falls back to the default pack", () => {
  expect(isThemePackId("neon")).toBe(false);
  expect(getThemePack("neon").id).toBe(DEFAULT_THEME_PACK_ID);
});

test("registers tavern and unicorn with shared asset keys", () => {
  expect(listThemePacks().map((pack) => pack.id)).toEqual(["tavern", "unicorn"]);
  expect(isThemePackId("unicorn")).toBe(true);
  expect(DEFAULT_THEME_PACK_ID).toBe("tavern");

  expect(getThemePack("tavern").overlayPreviewQuote).toBe(false);
  expect(getThemePack("unicorn").overlayPreviewQuote).toBe(true);
  expect(getThemePack("unicorn").colors.primary).toBe("#8E44D7");
  expect(getThemePack("unicorn").colors.wood).toBe("#A76B91");

  for (const id of ["tavern", "unicorn"] as const) {
    const assets = getThemePackAssets(id);
    expect(assets.background).toBeDefined();
    expect(assets.banner).toBeDefined();
    expect(assets.icons?.notes).toBeDefined();
    expect(assets.icons?.material).toBeDefined();
    expect(assets.icons?.method).toBeDefined();
    expect(assets.icons?.colour).toBeDefined();
    expect(assets.icons?.dice).toBeDefined();
    expect(assets.preview?.footerParchment).toBeDefined();
    expect(assets.preview?.quoteCard).toBeDefined();
    expect(assets.preview?.diceIcon).toBeDefined();
    expect(assets.preview?.paletteIcon).toBeDefined();
  }
});
