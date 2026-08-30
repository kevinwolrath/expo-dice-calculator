import {
  emptyPageThemeMap,
  parsePageThemeMap,
  normalizeHexColor,
  isPageThemeId,
  pageIdFromSegments,
} from "../constants/pageTheme";

describe("page theme helpers", () => {
  it("normalises 3-digit hex colours", () => {
    expect(normalizeHexColor("#abc")).toBe("#aabbcc");
    expect(normalizeHexColor("not-a-color")).toBeNull();
  });

  it("parses stored themes and ignores unknown pages", () => {
    const themes = parsePageThemeMap(
      JSON.stringify({
        dicejob: {
          foreground: "#111111",
          background: "#ffffff",
          surface: "#f0f0f0",
          imageUri: "file://bg.png",
          imageMode: "tile",
        },
        unknown: { foreground: "#000" },
      }),
    );
    expect(themes.dicejob.foreground).toBe("#111111");
    expect(themes.dicejob.surface).toBe("#f0f0f0");
    expect(themes.dicejob.imageMode).toBe("tile");
    expect(themes.stock).toEqual(emptyPageThemeMap().stock);
  });

  it("reads a page id from route segments", () => {
    expect(isPageThemeId("stock")).toBe(true);
    expect(pageIdFromSegments(["(tabs)", "colour-types"])).toBe("colour-types");
    expect(pageIdFromSegments(["page-theme"])).toBeNull();
  });
});
