const primary = "#2f95dc";
const destructive = "#d9534f";

/** Chrome colours that do not follow page themes or night view. */
export const HeaderColors = {
  background: primary,
  text: "#ffffff",
  icon: "#ffffff",
} as const;

export default {
  light: {
    text: "#000",
    background: "#fff",
    tint: primary,
    tabIconDefault: "#ccc",
    tabIconSelected: primary,
    card: "#f7f7f9",
    border: "#e5e5ea",
    inputBorder: "#c7c7cc",
    inputBackground: "#ffffff",
    muted: "#8e8e93",
    label: "#000000",
    primary,
    onPrimary: "#fff",
    destructive,
    overlay: "rgba(0, 0, 0, 0.35)",
  },
  dark: {
    text: "#fff",
    background: "#000",
    tint: "#fff",
    tabIconDefault: "#888",
    tabIconSelected: "#fff",
    card: "#000",
    border: "#fff",
    inputBorder: "#888",
    inputBackground: "#111",
    muted: "#aaa",
    label: "#fff",
    primary: "#fff",
    onPrimary: "#000",
    destructive: "#fff",
    overlay: "rgba(0, 0, 0, 0.72)",
  },
};
