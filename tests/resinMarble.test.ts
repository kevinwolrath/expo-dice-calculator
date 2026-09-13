import { colourFromName } from "../constants/colourFromName";
import { buildResinMarble, splitMarbleColours } from "../constants/resinMarble";

test("splits a dominant base from up to three secondary colours", () => {
  expect(splitMarbleColours(["Purple", "Blue", "White", "Gold"])).toEqual({
    base: colourFromName("Purple"),
    secondaries: [
      colourFromName("Blue"),
      colourFromName("White"),
      colourFromName("Gold"),
    ],
  });
});

test("marble veins are stable for a seed", () => {
  const colours = ["Purple", "Blue", "White"];
  expect(buildResinMarble(colours, 21)).toEqual(buildResinMarble(colours, 21));
});

test("different seeds change vein paths", () => {
  const colours = ["Purple", "Blue"];
  expect(buildResinMarble(colours, 1).veins[0]?.d).not.toBe(
    buildResinMarble(colours, 4).veins[0]?.d,
  );
});

test("veins stay thinner than a pour ribbon", () => {
  const veins = buildResinMarble(["Red", "White", "Blue"], 8).veins;
  expect(veins.length).toBeGreaterThan(0);
  expect(Math.max(...veins.map((vein) => vein.width))).toBeLessThan(6);
});
