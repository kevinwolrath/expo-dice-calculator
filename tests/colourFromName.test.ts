import { colourFromName, shadeHex } from "../constants/colourFromName";

test("maps common colour names", () => {
  expect(colourFromName("Red")).toBe("#c0392b");
  expect(colourFromName("Baja Blue")).toBe("#2471a3");
  expect(colourFromName("Gold")).toBe("#d4af37");
});

test("accepts hex values", () => {
  expect(colourFromName("#abc")).toBe("#aabbcc");
  expect(colourFromName("#112233")).toBe("#112233");
});

test("hashes unknown names to a stable colour", () => {
  expect(colourFromName("Hoity Toity")).toBe(colourFromName("Hoity Toity"));
  expect(colourFromName("Hoity Toity")).not.toBe(colourFromName("Pretentious"));
});

test("shades a hex colour", () => {
  expect(shadeHex("#808080", 0)).toBe("#808080");
  expect(shadeHex("#808080", -0.5)).toBe("#404040");
});
