import JSZip from "jszip";

import {
  collapseZipRoot,
  missingRequiredThemeFiles,
  REQUIRED_THEME_FILES,
  themeFolderIdFromName,
} from "../constants/themePackFiles";
import { parseThemeZip, ThemeZipError } from "../services/themeZip";

test("turns a display name into a folder id", () => {
  expect(themeFolderIdFromName("Crystal Tavern")).toBe("crystal-tavern");
  expect(themeFolderIdFromName("  ")).toBe("");
});

test("reports missing required theme files", () => {
  expect(missingRequiredThemeFiles(["theme.json", "background.jpg"])).toEqual(
    REQUIRED_THEME_FILES.filter(
      (name) => name !== "theme.json" && name !== "background.jpg",
    ),
  );
});

test("collapses a single zip root folder", () => {
  const map = collapseZipRoot([
    "Pack/theme.json",
    "Pack/background.jpg",
    "__MACOSX/Pack/._theme.json",
    "Pack/assets.ts",
  ]);
  expect(map.get("theme.json")).toBe("Pack/theme.json");
  expect(map.has("assets.ts")).toBe(false);
});

test("rejects a zip that is missing required files", async () => {
  const zip = new JSZip();
  zip.file("theme.json", JSON.stringify({ name: "Test", colors: { text: "#fff" } }));
  const data = await zip.generateAsync({ type: "arraybuffer" });
  await expect(parseThemeZip(data)).rejects.toBeInstanceOf(ThemeZipError);
});

test("parses a complete theme zip", async () => {
  const zip = new JSZip();
  zip.file(
    "Demo/theme.json",
    JSON.stringify({ name: "Demo", colors: { primary: "#123456" } }),
  );
  for (const name of REQUIRED_THEME_FILES) {
    if (name === "theme.json") continue;
    zip.file(`Demo/${name}`, "x");
  }
  const parsed = await parseThemeZip(await zip.generateAsync({ type: "arraybuffer" }));
  expect(parsed.manifest.name).toBe("Demo");
  expect(parsed.files.map((file) => file.name).sort()).toEqual(
    [...REQUIRED_THEME_FILES].sort(),
  );
});
