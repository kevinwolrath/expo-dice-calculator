import { buildResinGlitter } from "@/constants/resinGlitter";
import { buildResinMarble } from "@/constants/resinMarble";
import {
  buildResinColourField,
  isDirtyPour,
} from "@/constants/resinPattern";
import { buildResinPour, mixHex, resinEdgeColour } from "@/constants/resinPour";

export const buildDieResin = (
  colours: string[],
  seed: number,
  glitterColour?: string | null,
  productionMethod?: string | null,
) => {
  const field = buildResinColourField(colours, seed, productionMethod);
  const dirty = isDirtyPour(productionMethod);
  const marble = buildResinMarble(colours, seed);
  const pour = buildResinPour(
    dirty
      ? field.pourColours
      : [
          marble.base,
          ...marble.secondaries.map((colour) =>
            mixHex(marble.base, colour, 0.78),
          ),
        ],
    seed,
  );
  return {
    marble,
    pour,
    field,
    dirty,
    edge: resinEdgeColour([field.dominant, ...field.palette]),
    glitter: glitterColour ? buildResinGlitter(seed, glitterColour) : [],
  };
};
