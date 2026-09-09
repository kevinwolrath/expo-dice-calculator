import { StyleSheet } from "react-native";
import Svg, { Polygon, Text as SvgText } from "react-native-svg";

import { View, useThemeColors } from "@/components/Themed";
import { colourFromName, shadeHex } from "@/constants/colourFromName";
import { hexToRgba } from "@/constants/pageTheme";
import { Space } from "@/constants/theme";

type Point = [number, number];

const pt = (x: number, y: number): Point => [x, y];

const pointsAttr = (points: Point[]) =>
  points.map((point) => point.join(",")).join(" ");

const polar = (
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
): Point => {
  const angle = (angleDeg * Math.PI) / 180;
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
};

const pentagon = (
  cx: number,
  cy: number,
  radius: number,
  startDeg: number,
): Point[] =>
  [0, 1, 2, 3, 4].map((index) =>
    polar(cx, cy, radius, startDeg + index * 72),
  );

const d4 = (): Point[][] => {
  const a = pt(50, 14);
  const b = pt(14, 86);
  const c = pt(86, 86);
  const g = pt(50, 60);
  return [
    [a, b, g],
    [a, c, g],
    [b, c, g],
  ];
};

const d6 = (): Point[][] => {
  const top = pt(50, 18);
  const tl = pt(20, 36);
  const tr = pt(80, 36);
  const mid = pt(50, 54);
  const bl = pt(20, 72);
  const br = pt(80, 72);
  const bot = pt(50, 90);
  return [
    [top, tr, mid, tl],
    [tl, mid, bot, bl],
    [tr, br, bot, mid],
  ];
};

const d8 = (): Point[][] => {
  const top = pt(50, 10);
  const left = pt(14, 50);
  const right = pt(86, 50);
  const bottom = pt(50, 90);
  const mid = pt(50, 50);
  return [
    [top, left, mid],
    [top, right, mid],
    [bottom, left, mid],
    [bottom, right, mid],
  ];
};

const d10 = (): Point[][] => {
  const top = pt(50, 8);
  const ul = pt(24, 36);
  const ur = pt(76, 36);
  const fl = pt(16, 52);
  const fr = pt(84, 52);
  const mid = pt(50, 50);
  const ll = pt(32, 74);
  const lr = pt(68, 74);
  const bot = pt(50, 94);
  return [
    [top, ul, mid, ur],
    [ul, fl, mid],
    [ur, fr, mid],
    [fl, ll, bot, mid],
    [fr, lr, bot, mid],
  ];
};

const d12 = (): Point[][] => {
  const cx = 50;
  const cy = 52;
  const inner = pentagon(cx, cy, 18, -90);
  const ring = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) =>
    polar(cx, cy, index % 2 === 0 ? 44 : 32, -90 + index * 36),
  );
  const around = [0, 1, 2, 3, 4].map((index) => {
    const next = (index + 1) % 5;
    return [
      inner[index],
      ring[index * 2],
      ring[index * 2 + 1],
      ring[(index * 2 + 2) % 10],
      inner[next],
    ];
  });
  return [inner, ...around];
};

const d20 = (): Point[][] => {
  const cx = 50;
  const cy = 52;
  const radius = 44;
  const hex = [0, 1, 2, 3, 4, 5].map((index) =>
    polar(cx, cy, radius, -90 + index * 60),
  );
  const inner = [0, 2, 4].map((index) =>
    polar(cx, cy, radius * 0.36, -90 + index * 60),
  );
  return [
    [inner[0], inner[1], inner[2]],
    [inner[0], inner[1], hex[1]],
    [inner[1], inner[2], hex[3]],
    [inner[2], inner[0], hex[5]],
    [inner[0], hex[0], hex[1]],
    [inner[0], hex[0], hex[5]],
    [inner[1], hex[1], hex[2]],
    [inner[1], hex[2], hex[3]],
    [inner[2], hex[3], hex[4]],
    [inner[2], hex[4], hex[5]],
  ];
};

const CLUSTER = {
  width: 300,
  height: 268,
} as const;

const DICE: {
  id: string;
  numeral: string;
  faces: Point[][];
  colourOffset: number;
  left: number;
  top: number;
  size: number;
  rotate: string;
  zIndex: number;
}[] = [
  {
    id: "d20",
    numeral: "20",
    faces: d20(),
    colourOffset: 0,
    left: 6,
    top: 2,
    size: 112,
    rotate: "-16deg",
    zIndex: 2,
  },
  {
    id: "d6",
    numeral: "6",
    faces: d6(),
    colourOffset: 1,
    left: 168,
    top: 6,
    size: 86,
    rotate: "12deg",
    zIndex: 3,
  },
  {
    id: "d12",
    numeral: "12",
    faces: d12(),
    colourOffset: 5,
    left: 188,
    top: 86,
    size: 98,
    rotate: "-8deg",
    zIndex: 2,
  },
  {
    id: "d100",
    numeral: "00",
    faces: d10(),
    colourOffset: 4,
    left: 8,
    top: 138,
    size: 92,
    rotate: "14deg",
    zIndex: 3,
  },
  {
    id: "d8",
    numeral: "8",
    faces: d8(),
    colourOffset: 2,
    left: 102,
    top: 152,
    size: 90,
    rotate: "-6deg",
    zIndex: 4,
  },
  {
    id: "d10",
    numeral: "0",
    faces: d10(),
    colourOffset: 3,
    left: 176,
    top: 154,
    size: 90,
    rotate: "10deg",
    zIndex: 3,
  },
  {
    id: "d4",
    numeral: "4",
    faces: d4(),
    colourOffset: 0,
    left: 104,
    top: 78,
    size: 80,
    rotate: "4deg",
    zIndex: 6,
  },
];

const shadeForFace = (index: number, count: number) =>
  0.1 - (index / Math.max(count - 1, 1)) * 0.22;

function DieShape({
  faces,
  fills,
  colourOffset,
  numeral,
  numberFill,
  stroke,
  size,
}: {
  faces: Point[][];
  fills: string[];
  colourOffset: number;
  numeral: string;
  numberFill: string;
  stroke: string;
  size: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {faces.map((face, index) => (
        <Polygon
          key={index}
          points={pointsAttr(face)}
          fill={shadeHex(
            fills[(index + colourOffset) % fills.length],
            shadeForFace(index, faces.length),
          )}
          stroke={stroke}
          strokeWidth={1.75}
          strokeLinejoin="round"
        />
      ))}
      <SvgText
        x="50"
        y="56"
        fill={numberFill}
        fontSize={numeral.length > 1 ? "16" : "20"}
        fontWeight="700"
        textAnchor="middle"
      >
        {numeral}
      </SvgText>
    </Svg>
  );
}

export default function DicePreview({
  colours,
  numberColourName,
  stroke,
  variant = "background",
}: {
  colours: string[];
  numberColourName?: string | null;
  stroke: string;
  variant?: "background" | "modal";
}) {
  const colors = useThemeColors();
  const fills = colours.length > 0 ? colours : ["#d9d9d9"];
  const numberFill = numberColourName
    ? colourFromName(numberColourName)
    : stroke;
  const isBackground = variant === "background";
  const diceStroke = isBackground ? hexToRgba(stroke, 0.28) : stroke;

  const cluster = (
    <View style={styles.cluster}>
      {DICE.map((die) => (
        <View
          key={die.id}
          style={[
            styles.die,
            {
              left: die.left,
              top: die.top,
              zIndex: die.zIndex,
              transform: [{ rotate: die.rotate }],
              ...(isBackground
                ? { shadowOpacity: 0.06, elevation: 0 }
                : null),
            },
          ]}
        >
          <DieShape
            faces={die.faces}
            fills={fills}
            colourOffset={die.colourOffset}
            numeral={die.numeral}
            numberFill={numberFill}
            stroke={diceStroke}
            size={die.size}
          />
        </View>
      ))}
    </View>
  );

  if (!isBackground) {
    return (
      <View
        accessibilityLabel="Complete dice set colour preview"
        style={styles.modalWrap}
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
      <View
        style={[
          styles.oval,
          {
            backgroundColor: hexToRgba(colors.background, 0.12),
            borderColor: hexToRgba(colors.text, 0.06),
          },
        ]}
      >
        {cluster}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  float: {
    width: "100%",
    alignItems: "center",
    paddingTop: Space[2],
  },
  modalWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Space[2],
  },
  oval: {
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: Space[3],
    paddingHorizontal: Space[2],
    opacity: 0.18,
  },
  cluster: {
    width: CLUSTER.width,
    height: CLUSTER.height,
    position: "relative",
  },
  die: {
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 3,
  },
});
