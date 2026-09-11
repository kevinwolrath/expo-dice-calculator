import {
  emptyPageThemeMap,
  parsePageThemeMap,
  normalizeHexColor,
  hexToRgba,
  isPageThemeId,
  pageIdFromSegments,
  resolvePageAppearance,
  NIGHT_BACKGROUND,
  NIGHT_FOREGROUND,
} from "../constants/pageTheme";

describe("page theme helpers", () => {
  it("normalises 3-digit hex colours", () => {
    expect(normalizeHexColor("#abc")).toBe("#aabbcc");
    expect(normalizeHexColor("not-a-color")).toBeNull();
  });

  it("converts hex colours to a translucent rgba tint", () => {
    expect(hexToRgba("#abc", 0.5)).toBe("rgba(170, 187, 204, 0.5)");
  });

  it("parses stored themes and ignores unknown pages", () => {
    const themes = parsePageThemeMap(
      JSON.stringify({
        dicejob: {
          foreground: "#111111",
          background: "#ffffff",
          imageUri: "file://bg.png",
          imageMode: "tile",
        },
        unknown: { foreground: "#000" },
      }),
    );
    expect(themes.dicejob.foreground).toBe("#111111");
    expect(themes.dicejob.imageMode).toBe("tile");
    expect(themes.stock).toEqual(emptyPageThemeMap().stock);
  });

  it("reads a page id from route segments", () => {
    expect(isPageThemeId("stock")).toBe(true);
    expect(pageIdFromSegments(["(tabs)", "colour-types"])).toBe("colour-types");
    expect(pageIdFromSegments(["page-theme"])).toBeNull();
  });

  it("uses pack colours for every page in day view when pack defaults are provided", () => {
    const defaults = { foreground: "#f6ead3", background: "#0b1f3a" };
    const jobs = resolvePageAppearance("dicejob", undefined, "light", defaults);
    const stock = resolvePageAppearance("stock", undefined, "light", defaults);
    expect(jobs.background).toBe(defaults.background);
    expect(stock.background).toBe(defaults.background);
    expect(jobs.foreground).toBe(defaults.foreground);
  });

  it("uses the same fallback colours for every page", () => {
    const jobs = resolvePageAppearance("dicejob", undefined, "light");
    const stock = resolvePageAppearance("stock", undefined, "light");
    const maintenance = resolvePageAppearance("maintenance", undefined, "light");
    expect(stock).toEqual(jobs);
    expect(maintenance).toEqual(jobs);
  });

  it("lets custom colours override the page defaults in day view", () => {
    const resolved = resolvePageAppearance(
      "dicejob",
      {
        foreground: "#111111",
        background: "#eeeeee",
        imageUri: "file://bg.png",
        imageMode: "center",
      },
      "light",
    );
    expect(resolved.foreground).toBe("#111111");
    expect(resolved.background).toBe("#eeeeee");
    expect(resolved.imageUri).toBe("file://bg.png");
  });

  it("uses black and white in night view and ignores customisation", () => {
    const resolved = resolvePageAppearance(
      "stock",
      {
        foreground: "#111111",
        background: "#eeeeee",
        imageUri: "file://bg.png",
        imageMode: "tile",
      },
      "dark",
    );
    expect(resolved.foreground).toBe(NIGHT_FOREGROUND);
    expect(resolved.background).toBe(NIGHT_BACKGROUND);
    expect(resolved.imageUri).toBeNull();
  });
});
