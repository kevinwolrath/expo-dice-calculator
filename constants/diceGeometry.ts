export type Point = [number, number];

export type PreviewDie = {
  id: string;
  numeral: string;
  faces: Point[][];
  colourOffset: number;
  left: number;
  top: number;
  size: number;
  rotate: string;
  zIndex: number;
};

/** Horizontal gap between neighbouring die boxes in the preview cluster. */
const PREVIEW_GAP_X = 26;
const PREVIEW_GAP_Y = 20;

export const pt = (x: number, y: number): Point => [x, y];

export const pointsAttr = (points: Point[]) =>
  points.map((point) => point.join(",")).join(" ");

export const polygonCentroid = (points: Point[]): Point => {
  const count = points.length || 1;
  return [
    points.reduce((sum, [x]) => sum + x, 0) / count,
    points.reduce((sum, [, y]) => sum + y, 0) / count,
  ];
};

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

export const DICE: PreviewDie[] = [
  {
    id: "d20",
    numeral: "20",
    faces: d20(),
    colourOffset: 0,
    left: 61,
    top: 0,
    size: 138,
    rotate: "-14deg",
    zIndex: 2,
  },
  {
    id: "d12",
    numeral: "12",
    faces: d12(),
    colourOffset: 5,
    left: 61 + 138 + PREVIEW_GAP_X,
    top: 3,
    size: 134,
    rotate: "10deg",
    zIndex: 2,
  },
  {
    id: "d10",
    numeral: "0",
    faces: d10(),
    colourOffset: 3,
    left: 6,
    top: 138 + PREVIEW_GAP_Y,
    size: 118,
    rotate: "12deg",
    zIndex: 3,
  },
  {
    id: "d8",
    numeral: "8",
    faces: d8(),
    colourOffset: 2,
    left: 6 + 118 + PREVIEW_GAP_X,
    top: 138 + PREVIEW_GAP_Y - 4,
    size: 122,
    rotate: "-6deg",
    zIndex: 4,
  },
  {
    id: "d6",
    numeral: "6",
    faces: d6(),
    colourOffset: 1,
    left: 6 + 118 + PREVIEW_GAP_X + 122 + PREVIEW_GAP_X,
    top: 138 + PREVIEW_GAP_Y + 2,
    size: 116,
    rotate: "14deg",
    zIndex: 3,
  },
  {
    id: "d4",
    numeral: "4",
    faces: d4(),
    colourOffset: 0,
    left: 84,
    top: 138 + PREVIEW_GAP_Y - 4 + 122 + PREVIEW_GAP_Y,
    size: 112,
    rotate: "4deg",
    zIndex: 5,
  },
  {
    id: "d100",
    numeral: "00",
    faces: d10(),
    colourOffset: 4,
    left: 84 + 112 + PREVIEW_GAP_X,
    top: 138 + PREVIEW_GAP_Y - 4 + 122 + PREVIEW_GAP_Y - 2,
    size: 112,
    rotate: "-10deg",
    zIndex: 3,
  },
];

export const CLUSTER = {
  width: Math.max(...DICE.map((die) => die.left + die.size)) + 6,
  height: Math.max(...DICE.map((die) => die.top + die.size)) + 6,
} as const;

/** Fit the compact cluster into the modal; shrink on narrow/short screens. */
export const modalDiceScale = (width: number, height: number) => {
  const innerWidth = Math.min(width * 0.92, 560) - 40;
  const widthScale = innerWidth / CLUSTER.width;
  const chrome = height < 750 ? 390 : height < 1000 ? 430 : 470;
  const availableHeight = Math.max(
    200,
    Math.min(height * 0.56, height * 0.92 - chrome),
  );
  return Math.min(widthScale, availableHeight / CLUSTER.height);
};

export const facesByDepth = (faces: Point[][]) =>
  faces
    .map((face, index) => {
      const [cx, cy] = polygonCentroid(face);
      return { face, index, cx, cy };
    })
    .sort((left, right) => left.cy - right.cy || left.cx - right.cx);
