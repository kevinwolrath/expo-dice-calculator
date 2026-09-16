export const THEME_MANIFEST_FILE = "theme.json";

export const REQUIRED_THEME_FILES = [
  THEME_MANIFEST_FILE,
  "background.jpg",
  "banner.jpg",
  "icon_notes.png",
  "icon_material.png",
  "icon_method.png",
  "icon_colour.png",
  "icon_dice.png",
  "preview_footer_parchment.png",
  "preview_icon_dice.png",
  "preview_icon_palette.png",
] as const;

export type RequiredThemeFile = (typeof REQUIRED_THEME_FILES)[number];

export const themeFolderIdFromName = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const ignoreZipPath = (path: string): boolean => {
  const normalized = path.replace(/\\/g, "/").replace(/^\.\//, "");
  if (!normalized || normalized.endsWith("/")) return true;
  if (
    normalized.startsWith("__MACOSX/") ||
    normalized.includes("/__MACOSX/")
  ) {
    return true;
  }
  const base = normalized.split("/").pop() ?? "";
  if (base.startsWith(".")) return true;
  if (base === "assets.ts") return true;
  return false;
};

export const collapseZipRoot = (paths: string[]): Map<string, string> => {
  const usable = paths.filter((path) => !ignoreZipPath(path));
  const normalized = usable.map((path) =>
    path.replace(/\\/g, "/").replace(/^\.\//, ""),
  );
  const prefixOf = (path: string) => {
    const slash = path.indexOf("/");
    return slash === -1 ? "" : path.slice(0, slash + 1);
  };
  const prefixes = new Set(normalized.map(prefixOf));
  const sharedRoot =
    prefixes.size === 1 ? [...prefixes][0]! : "";
  const map = new Map<string, string>();
  for (const path of normalized) {
    const relative =
      sharedRoot && path.startsWith(sharedRoot)
        ? path.slice(sharedRoot.length)
        : path;
    if (!relative || relative.includes("/")) continue;
    map.set(relative, path);
  }
  return map;
};

export const missingRequiredThemeFiles = (present: Iterable<string>): string[] => {
  const set = new Set(
    [...present].map((name) => name.replace(/\\/g, "/").split("/").pop() ?? name),
  );
  return REQUIRED_THEME_FILES.filter((name) => !set.has(name));
};
