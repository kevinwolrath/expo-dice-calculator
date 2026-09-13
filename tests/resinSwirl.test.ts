import { colourFromName } from "../constants/colourFromName";
import {
  buildResinSwirls,
  createResinRng,
  seedFromKey,
} from "../constants/resinSwirl";

test("seedFromKey is stable", () => {
  expect(seedFromKey("d20:purple-blue")).toBe(seedFromKey("d20:purple-blue"));
  expect(seedFromKey("d20:purple-blue")).not.toBe(seedFromKey("d12:purple-blue"));
});

test("rng is deterministic for a seed", () => {
  const a = createResinRng(42);
  const b = createResinRng(42);
  expect([a(), a(), a()]).toEqual([b(), b(), b()]);
});

test("same swirl seed produces the same ribbons", () => {
  const colours = ["Purple", "Blue", "White"];
  expect(buildResinSwirls(colours, 17)).toEqual(buildResinSwirls(colours, 17));
});

test("different seeds change the swirl layout", () => {
  const colours = ["Purple", "Blue"];
  expect(buildResinSwirls(colours, 1)[0]?.d).not.toBe(
    buildResinSwirls(colours, 2)[0]?.d,
  );
});

test("swirls use the supplied colours", () => {
  const purple = colourFromName("Purple");
  const blue = colourFromName("Blue");
  const ribbons = buildResinSwirls(["Purple", "Blue"], 9);
  const used = new Set(ribbons.map((ribbon) => ribbon.color));
  expect([...used].some((color) => color === purple || color === blue)).toBe(
    true,
  );
  expect(ribbons.length).toBeGreaterThanOrEqual(3);
});
