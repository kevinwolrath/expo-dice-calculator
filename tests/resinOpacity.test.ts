import {
  clampResinOpacity,
  resinLayerOpacities,
} from "../constants/resinOpacity";

test("defaults and clamps resin opacity", () => {
  expect(clampResinOpacity(undefined)).toBe(1);
  expect(clampResinOpacity(1)).toBe(1);
  expect(clampResinOpacity(0)).toBe(0);
  expect(clampResinOpacity(1.4)).toBe(1);
  expect(clampResinOpacity(-2)).toBe(0);
});

test("solid resin keeps a full colour fill", () => {
  expect(resinLayerOpacities(1).fill).toBe(1);
});

test("translucent resin thins the fill but keeps edges and shading", () => {
  const solid = resinLayerOpacities(1);
  const ghost = resinLayerOpacities(0.35);
  expect(ghost.fill).toBeLessThan(solid.fill);
  expect(ghost.fill).toBeGreaterThan(0.15);
  expect(ghost.edge).toBeGreaterThanOrEqual(solid.edge);
  expect(ghost.shade).toBeGreaterThan(0.5);
  expect(ghost.highlight).toBeGreaterThan(0);
});
