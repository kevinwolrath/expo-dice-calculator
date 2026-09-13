import { CLUSTER, DICE, modalDiceScale } from "../constants/diceGeometry";

const box = (die: (typeof DICE)[number]) => ({
  id: die.id,
  left: die.left,
  top: die.top,
  right: die.left + die.size,
  bottom: die.top + die.size,
});

const overlaps = (
  a: ReturnType<typeof box>,
  b: ReturnType<typeof box>,
) =>
  a.left < b.right &&
  a.right > b.left &&
  a.top < b.bottom &&
  a.bottom > b.top;

test("preview dice keep the 2-3-2 arrangement without overlapping boxes", () => {
  expect(DICE.map((die) => die.id)).toEqual([
    "d20",
    "d12",
    "d10",
    "d8",
    "d6",
    "d4",
    "d100",
  ]);
  const boxes = DICE.map(box);
  for (let i = 0; i < boxes.length; i += 1) {
    for (let j = i + 1; j < boxes.length; j += 1) {
      expect(overlaps(boxes[i], boxes[j])).toBe(false);
    }
  }
});

test("the cluster is compact around the dice", () => {
  const right = Math.max(...DICE.map((die) => die.left + die.size));
  const bottom = Math.max(...DICE.map((die) => die.top + die.size));
  expect(CLUSTER.width - right).toBeLessThanOrEqual(8);
  expect(CLUSTER.height - bottom).toBeLessThanOrEqual(8);
  expect(CLUSTER.width).toBeLessThan(450);
  expect(CLUSTER.height).toBeLessThan(450);
});

test("narrow screens shrink the cluster instead of overflowing", () => {
  const desktop = modalDiceScale(1280, 900);
  const phone = modalDiceScale(390, 844);
  expect(phone).toBeLessThan(desktop);
  expect(phone * CLUSTER.width).toBeLessThanOrEqual(390 * 0.92);
});
