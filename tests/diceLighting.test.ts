import { facetShadeOpacity } from "../constants/diceLighting";
import { shadeOverlayOpacity } from "../constants/diceFaceShading";
import { faceEdgeStrokeWidth } from "../constants/diceEffects";

test("facet lighting is weaker than the raw shade overlay", () => {
  expect(facetShadeOpacity(0.22)).toBeLessThan(shadeOverlayOpacity(0.22));
  expect(facetShadeOpacity(-0.28)).toBeLessThan(shadeOverlayOpacity(-0.28));
});

test("edge strokes stay thinner than the previous polygon outline", () => {
  expect(faceEdgeStrokeWidth(64)).toBeLessThan(1.4);
});
