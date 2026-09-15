import { memo, useMemo } from "react";
import { useWindowDimensions } from "react-native";

import { View, useThemeColors } from "@/components/Themed";
import DieShape from "@/components/ui/dicePreview/DieShape";
import { CLUSTER, DICE, modalDiceScale } from "@/constants/diceGeometry";
import {
  previewBackdrop,
  previewClusterScale,
  previewStyles as styles,
} from "@/constants/dicePreviewTheme";
import { DEFAULT_GLITTER_COLOUR } from "@/constants/resinGlitter";
import { seedFromKey } from "@/constants/resinRng";

// Stable fallback reference so `fills` below doesn't create a new array
// literal (and defeat DieShape's memoization) on every render when
// `colours` is empty.
const FALLBACK_FILLS: string[] = ["#d9d9d9"];

function DicePreview({
  colours,
  numberColourName,
  stroke: _stroke,
  variant = "modal",
  opacity = 1,
  glitter = false,
  glitterColour,
  productionMethod,
  material,
}: {
  colours: string[];
  numberColourName?: string | null;
  stroke: string;
  variant?: "background" | "modal";
  /** 1 = solid resin; lower values approximate translucent resin. */
  opacity?: number;
  glitter?: boolean;
  glitterColour?: string | null;
  productionMethod?: string | null;
  material?: string | null;
}) {
  const colors = useThemeColors();
  const layout = useWindowDimensions();
  const fills = useMemo(
    () => (colours.length > 0 ? colours : FALLBACK_FILLS),
    [colours],
  );
  const isBackground = variant === "background";
  const scale = previewClusterScale(
    isBackground,
    modalDiceScale(layout.width, layout.height),
  );

  const cluster = (
    <View
      style={[
        styles.cluster,
        { width: CLUSTER.width * scale, height: CLUSTER.height * scale },
      ]}
    >
      {DICE.map((die) => (
        <View
          key={die.id}
          style={[
            styles.die,
            {
              left: die.left * scale,
              top: die.top * scale,
              zIndex: die.zIndex,
              transform: [{ rotate: die.rotate }],
              ...(isBackground
                ? { shadowOpacity: 0.06, elevation: 0 }
                : null),
            },
          ]}
        >
          <DieShape
            dieId={die.id}
            faces={die.faces}
            colours={fills}
            seed={seedFromKey(
              `${die.id}:${die.colourOffset}:${fills.join("|")}:${productionMethod ?? ""}`,
            )}
            numeral={die.numeral}
            numberColourName={numberColourName}
            size={Math.round(die.size * scale)}
            opacity={opacity}
            glitterColour={
              glitter ? glitterColour || DEFAULT_GLITTER_COLOUR : null
            }
            productionMethod={productionMethod}
            material={material}
          />
        </View>
      ))}
    </View>
  );

  if (!isBackground) {
    return (
      <View
        accessibilityLabel="Complete dice set colour preview"
        style={[
          styles.modalWrap,
          { height: Math.round(CLUSTER.height * scale) },
        ]}
      >
        {cluster}
      </View>
    );
  }

  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={styles.float}
    >
      <View style={[styles.oval, previewBackdrop(colors)]}>{cluster}</View>
    </View>
  );
}

export default memo(DicePreview);
