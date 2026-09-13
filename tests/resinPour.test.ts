import { colourFromName } from "../constants/colourFromName";
import {
  buildResinPour,
  mixHex,
  resinEdgeColour,
  resolveResinColours,
} from "../constants/resinPour";

test("resolves named resin colours to hex", () => {
  expect(resolveResinColours(["Purple", "Blue", "White"])).toEqual([
    colourFromName("Purple"),
    colourFromName("Blue"),
    colourFromName("White"),
  ]);
});

test("keeps hex colours and falls back when empty", () => {
  expect(resolveResinColours(["#112233"])).toEqual(["#112233"]);
  expect(resolveResinColours([])).toEqual(["#d9d9d9"]);
});

test("mixes two hex colours", () => {
  expect(mixHex("#000000", "#ffffff", 0.5)).toBe("#808080");
});

test("builds blended gradient stops instead of one stop per colour", () => {
  const pour = buildResinPour(["Purple", "Blue", "White"], 2);
  expect(pour.linear.stops.length).toBeGreaterThan(3);
  expect(pour.linear.stops.some((stop) => stop.offset > 0 && stop.offset < 1)).toBe(
    true,
  );
  expect(pour.radial.stops.at(-1)?.opacity).toBe(0);
});

test("varies pour direction by seed", () => {
  const a = buildResinPour(["Red", "Blue"], 0);
  const b = buildResinPour(["Red", "Blue"], 3);
  expect(a.linear.x2).not.toBe(b.linear.x2);
});

test("derives an edge colour from the pour", () => {
  expect(resinEdgeColour(["White"])).toMatch(/^#[0-9a-f]{6}$/i);
});
