import { colourFromName } from "../constants/colourFromName";
import {
  buildResinColourField,
  isDirtyPour,
} from "../constants/resinPattern";

test("detects dirty pour from the production method label", () => {
  expect(isDirtyPour("Dirty Pour")).toBe(true);
  expect(isDirtyPour("dirty pour")).toBe(true);
  expect(isDirtyPour("Petri")).toBe(false);
});

test("dirty pour blobs are stable for a seed", () => {
  const colours = ["Purple", "Blue", "White"];
  expect(buildResinColourField(colours, 21, "Dirty Pour")).toEqual(
    buildResinColourField(colours, 21, "Dirty Pour"),
  );
});

test("dirty pour uses all three colours in one shared field", () => {
  const field = buildResinColourField(
    ["Purple", "Blue", "White"],
    7,
    "Dirty Pour",
  );
  expect(field.palette).toEqual([
    colourFromName("Purple"),
    colourFromName("Blue"),
    colourFromName("White"),
  ]);
  expect(field.blobs.length).toBeGreaterThan(1);
  expect(field.blobs.every((blob) => blob.d.includes("Z"))).toBe(true);
});

test("different seeds change blob placement", () => {
  const colours = ["Red", "Blue", "White"];
  expect(buildResinColourField(colours, 1, "Dirty Pour").blobs[0]?.d).not.toBe(
    buildResinColourField(colours, 4, "Dirty Pour").blobs[0]?.d,
  );
});

test("skips dirty-pour blobs for other methods", () => {
  expect(
    buildResinColourField(["Red", "Blue", "White"], 3, "Petri").blobs,
  ).toEqual([]);
});
