import { colourFromName } from "../constants/colourFromName";
import {
  DEFAULT_GLITTER_COLOUR,
  MAX_GLITTER_SPECKLES,
  buildResinGlitter,
} from "../constants/resinGlitter";

test("glitter is stable for a seed", () => {
  expect(buildResinGlitter(11, "Gold")).toEqual(buildResinGlitter(11, "Gold"));
});

test("different seeds change glitter placement", () => {
  expect(buildResinGlitter(1)[0]?.cx).not.toBe(buildResinGlitter(2)[0]?.cx);
});

test("limits particle count and varies size", () => {
  const flakes = buildResinGlitter(4, DEFAULT_GLITTER_COLOUR, 40);
  expect(flakes.length).toBe(MAX_GLITTER_SPECKLES);
  const radii = new Set(flakes.map((flake) => flake.r.toFixed(2)));
  expect(radii.size).toBeGreaterThan(1);
});

test("uses the configured glitter colour", () => {
  const gold = colourFromName("Gold");
  const flakes = buildResinGlitter(9, "Gold");
  expect(flakes.some((flake) => flake.color === gold)).toBe(true);
});
