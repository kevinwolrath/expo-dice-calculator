import { colourFromName } from "../constants/colourFromName";
import {
  contrastNumberFill,
  fontSizeForFace,
  hexLuminance,
  layoutDieFaceNumbers,
  numeralsForDie,
  polygonCentroid,
} from "../constants/diceFaceNumbers";

test("centres a polygon at its average vertex", () => {
  expect(polygonCentroid([[0, 0], [10, 0], [10, 10], [0, 10]])).toEqual([5, 5]);
});

test("scales font size with the face and digit count", () => {
  const large = [
    [20, 20],
    [70, 20],
    [70, 70],
    [20, 70],
  ] as [number, number][];
  const small = [
    [40, 40],
    [55, 40],
    [55, 55],
    [40, 55],
  ] as [number, number][];
  expect(fontSizeForFace(large, "6")).toBeGreaterThan(fontSizeForFace(small, "6"));
  expect(fontSizeForFace(large, "6")).toBeGreaterThan(fontSizeForFace(large, "20"));
});

test("defaults to ivory numbers when no number colour is set", () => {
  expect(contrastNumberFill("#f4f4f4")).toBe("#f4f0e6");
  expect(contrastNumberFill("#1a1a1a")).toBe("#f4f0e6");
  expect(hexLuminance("#ffffff")).toBeGreaterThan(hexLuminance("#000000"));
});

test("uses the number colour field as a solid fill", () => {
  expect(contrastNumberFill("#000000", "Gold")).toBe(colourFromName("Gold"));
});

test("puts the primary numeral on the most central face", () => {
  const faces = [
    [[10, 10], [30, 10], [20, 28]],
    [[40, 38], [60, 38], [50, 58]],
    [[70, 10], [90, 10], [80, 28]],
  ] as [number, number][][];
  const layout = layoutDieFaceNumbers("d8", faces, "8", () => "#2471a3");
  expect(layout[0]?.text).toBe("8");
  expect(layout[0]?.x).toBeCloseTo(50, 0);
});

test("keeps a stable numeral list per die", () => {
  expect(numeralsForDie("d20", 10, "20")[0]).toBe("20");
  expect(numeralsForDie("d20", 10, "20")).toHaveLength(10);
});
