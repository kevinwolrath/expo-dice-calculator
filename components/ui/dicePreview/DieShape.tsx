import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Path,
  Polygon,
  RadialGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";

import {
  EDGE_STROKE_OPACITY,
  faceEdgeStrokeWidth,
  litEdgeStrokeWidth,
  litHighlightOpacity,
  oppositeShadeOpacity,
  POLISH_HIGHLIGHT,
  polishStrength,
  resinFaceEdgeColour,
} from "@/constants/diceEffects";
import { layoutDieFaceNumbers } from "@/constants/diceFaceNumbers";
import { insetTowardUpperLeft } from "@/constants/diceFaceShading";
import {
  DIE_LIGHT_FIELD,
  FACE_DEPTH_GRADIENT,
  faceDepthOpacity,
  facetShadeOpacity,
  isLitFace,
  isShadedFace,
  lightFieldOpacity,
  shadeForFace,
} from "@/constants/diceLighting";
import {
  type Point,
  facesByDepth,
  pointsAttr,
} from "@/constants/diceGeometry";
import { buildDieResin } from "@/constants/resinEffects";
import { resinLayerOpacities } from "@/constants/resinOpacity";

type DieShapeProps = {
  dieId: string;
  faces: Point[][];
  colours: string[];
  seed: number;
  numeral: string;
  numberColourName?: string | null;
  size: number;
  opacity: number;
  glitterColour?: string | null;
  productionMethod?: string | null;
  material?: string | null;
};

export default function DieShape({
  dieId,
  faces,
  colours,
  seed,
  numeral,
  numberColourName,
  size,
  opacity,
  glitterColour,
  productionMethod,
  material,
}: DieShapeProps) {
  const strokeWidth = faceEdgeStrokeWidth(size);
  const litStroke = litEdgeStrokeWidth(size);
  const layers = resinLayerOpacities(opacity);
  const polish = polishStrength(material);
  const { marble, pour, field, dirty, glitter } = buildDieResin(
    colours,
    seed,
    glitterColour,
    productionMethod,
  );
  const edge = resinFaceEdgeColour(field.dominant);
  const linearId = `${dieId}-resin-linear`;
  const radialId = `${dieId}-resin-radial`;
  const lightId = `${dieId}-light-field`;
  const depthId = `${dieId}-face-depth`;
  const polishId = `${dieId}-polish`;
  const clipId = `${dieId}-body`;
  const numbers = layoutDieFaceNumbers(
    dieId,
    faces,
    numeral,
    () => marble.base,
    numberColourName,
  );
  const depthOrder = facesByDepth(faces);

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient
          id={linearId}
          x1={pour.linear.x1}
          y1={pour.linear.y1}
          x2={pour.linear.x2}
          y2={pour.linear.y2}
          gradientUnits="userSpaceOnUse"
        >
          {pour.linear.stops.map((stop) => (
            <Stop
              key={`linear-${stop.offset}-${stop.color}`}
              offset={`${Math.round(stop.offset * 1000) / 10}%`}
              stopColor={stop.color}
              stopOpacity={stop.opacity ?? 1}
            />
          ))}
        </LinearGradient>
        <RadialGradient
          id={radialId}
          cx={pour.radial.cx}
          cy={pour.radial.cy}
          r={pour.radial.r}
          gradientUnits="userSpaceOnUse"
        >
          {pour.radial.stops.map((stop) => (
            <Stop
              key={`radial-${stop.offset}`}
              offset={`${Math.round(stop.offset * 1000) / 10}%`}
              stopColor={stop.color}
              stopOpacity={stop.opacity ?? 1}
            />
          ))}
        </RadialGradient>
        <LinearGradient
          id={lightId}
          x1={DIE_LIGHT_FIELD.x1}
          y1={DIE_LIGHT_FIELD.y1}
          x2={DIE_LIGHT_FIELD.x2}
          y2={DIE_LIGHT_FIELD.y2}
          gradientUnits="userSpaceOnUse"
        >
          {DIE_LIGHT_FIELD.stops.map((stop) => (
            <Stop
              key={`light-${stop.offset}`}
              offset={`${Math.round(stop.offset * 1000) / 10}%`}
              stopColor={stop.color}
              stopOpacity={stop.opacity}
            />
          ))}
        </LinearGradient>
        <LinearGradient
          id={depthId}
          x1={FACE_DEPTH_GRADIENT.x1}
          y1={FACE_DEPTH_GRADIENT.y1}
          x2={FACE_DEPTH_GRADIENT.x2}
          y2={FACE_DEPTH_GRADIENT.y2}
        >
          {FACE_DEPTH_GRADIENT.stops.map((stop) => (
            <Stop
              key={`depth-${stop.offset}`}
              offset={`${Math.round(stop.offset * 1000) / 10}%`}
              stopColor={stop.color}
              stopOpacity={stop.opacity}
            />
          ))}
        </LinearGradient>
        <RadialGradient
          id={polishId}
          cx={POLISH_HIGHLIGHT.cx}
          cy={POLISH_HIGHLIGHT.cy}
          r={POLISH_HIGHLIGHT.r}
          gradientUnits="userSpaceOnUse"
        >
          {POLISH_HIGHLIGHT.stops.map((stop) => (
            <Stop
              key={`polish-${stop.offset}`}
              offset={`${Math.round(stop.offset * 1000) / 10}%`}
              stopColor={stop.color}
              stopOpacity={stop.opacity * polish}
            />
          ))}
        </RadialGradient>
        <ClipPath id={clipId}>
          {faces.map((face, index) => (
            <Polygon key={`clip-${index}`} points={pointsAttr(face)} />
          ))}
        </ClipPath>
      </Defs>
      {depthOrder.map(({ face, index }) => {
        const points = pointsAttr(face);
        return (
          <G key={`base-${index}`}>
            <Polygon
              points={points}
              fill={`url(#${linearId})`}
              fillOpacity={layers.fill}
            />
            <Polygon
              points={points}
              fill={`url(#${radialId})`}
              fillOpacity={layers.bloom}
            />
          </G>
        );
      })}
      <G clipPath={`url(#${clipId})`}>
        {field.blobs.map((blob, index) => (
          <Path
            key={`blob-${index}`}
            d={blob.d}
            fill={blob.color}
            fillOpacity={blob.opacity * layers.fill}
            strokeWidth={0}
          />
        ))}
        {!dirty
          ? marble.veins.map((vein, index) => (
              <Path
                key={`marble-${index}`}
                d={vein.d}
                fill="none"
                stroke={vein.color}
                strokeWidth={vein.width}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity={vein.opacity * layers.vein}
              />
            ))
          : null}
        {glitter.map((flake, index) => (
          <Circle
            key={`glitter-${index}`}
            cx={flake.cx}
            cy={flake.cy}
            r={flake.r}
            fill={flake.color}
            fillOpacity={flake.opacity}
          />
        ))}
        {depthOrder.map(({ face, index }) => (
          <Polygon
            key={`light-${index}`}
            points={pointsAttr(face)}
            fill={`url(#${lightId})`}
            fillOpacity={lightFieldOpacity * layers.shade}
            strokeWidth={0}
          />
        ))}
      </G>
      {depthOrder.map(({ face, index }) => {
        const shade = shadeForFace(face, index);
        const points = pointsAttr(face);
        const lit = isLitFace(face);
        const shaded = isShadedFace(face);

        return (
          <G key={`shade-${index}`}>
            <Polygon
              points={points}
              fill={`url(#${depthId})`}
              fillOpacity={faceDepthOpacity * layers.shade}
              strokeWidth={0}
            />
            <Polygon
              points={points}
              fill={shade >= 0 ? "#ffffff" : "#000000"}
              fillOpacity={facetShadeOpacity(shade) * layers.shade}
              strokeWidth={0}
            />
            {lit ? (
              <Polygon
                points={pointsAttr(insetTowardUpperLeft(face, 0.55))}
                fill="#ffffff"
                fillOpacity={litHighlightOpacity * layers.highlight * polish}
                strokeWidth={0}
              />
            ) : null}
            {shaded ? (
              <Polygon
                points={pointsAttr(insetTowardUpperLeft(face, -0.12))}
                fill="#000000"
                fillOpacity={oppositeShadeOpacity * layers.shade}
                strokeWidth={0}
              />
            ) : null}
            <Polygon
              points={points}
              fill="none"
              stroke={edge}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
              strokeOpacity={EDGE_STROKE_OPACITY * layers.edge}
            />
            {lit ? (
              <Polygon
                points={pointsAttr(insetTowardUpperLeft(face, 0.08))}
                fill="none"
                stroke="#ffffff"
                strokeWidth={litStroke}
                strokeLinejoin="round"
                strokeOpacity={0.28 * polish * layers.highlight}
              />
            ) : null}
          </G>
        );
      })}
      <G clipPath={`url(#${clipId})`}>
        {depthOrder.map(({ face, index }) => (
          <Polygon
            key={`polish-${index}`}
            points={pointsAttr(face)}
            fill={`url(#${polishId})`}
            fillOpacity={layers.highlight}
            strokeWidth={0}
          />
        ))}
      </G>
      {numbers.map((glyph, index) => (
        <SvgText
          key={`num-${index}-${glyph.text}`}
          x={glyph.x}
          y={glyph.y}
          textAnchor="middle"
          fontSize={glyph.fontSize}
          fontWeight="700"
          fill={glyph.fill}
        >
          {glyph.text}
        </SvgText>
      ))}
    </Svg>
  );
}
