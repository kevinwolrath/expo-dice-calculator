export const clampResinOpacity = (value: number | undefined): number => {
  if (typeof value !== "number" || Number.isNaN(value)) return 1;
  return Math.max(0, Math.min(1, value));
};

export type ResinLayerOpacities = {
  fill: number;
  bloom: number;
  vein: number;
  shade: number;
  edge: number;
  highlight: number;
};

/** Map solid..translucent resin without hiding edges, lighting, or numerals. */
export const resinLayerOpacities = (
  opacity: number | undefined,
): ResinLayerOpacities => {
  const solid = clampResinOpacity(opacity);
  const ghost = 1 - solid;
  return {
    fill: 0.18 + solid * 0.82,
    bloom: 0.1 + solid * 0.9,
    vein: 0.42 + solid * 0.58,
    shade: 0.7 + solid * 0.3,
    edge: 0.72 + ghost * 0.16,
    highlight: 0.2 + ghost * 0.12,
  };
};
