import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  TextInput,
  View as RNView,
  useWindowDimensions,
  type GestureResponderEvent,
} from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useTranslation } from "react-i18next";

import { Text, useThemeColors } from "@/components/Themed";
import { inputTypeface, useControlColors } from "@/components/ui/fieldControl";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { type Hsv, hexToHsv, hsvToHex, hueToHex } from "@/constants/colorPickerMath";
import { normalizeHexColor } from "@/constants/pageTheme";
import { FontSize, Radius, Space, Type } from "@/constants/theme";

const HANDLE_SIZE = 24;
const HUE_HEIGHT = 28;

type ColorPickerSheetProps = {
  visible: boolean;
  value: string;
  label?: string;
  onChange: (hex: string) => void;
  onClose: () => void;
};

/**
 * A touch-driven HSV colour picker (saturation/value square + hue strip),
 * built from react-native-svg gradients and a plain PanResponder — no extra
 * native dependency. This is the Android/iOS equivalent of the web-only
 * `<input type="color">` used in ColorField.
 */
export default function ColorPickerSheet({
  visible,
  value,
  label,
  onChange,
  onClose,
}: ColorPickerSheetProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const control = useControlColors();
  const { width: windowWidth } = useWindowDimensions();
  const size = Math.max(180, Math.min(280, windowWidth - 96));
  // A field like page-theme's foreground/background pair mounts two of these
  // sheets at once, each with its own <Svg>; suffixing gradient ids with a
  // per-instance id keeps them from colliding (same reason DieShape prefixes
  // its gradient ids with the die's own id).
  const uid = useId();
  const satGradId = `sv-sat-${uid}`;
  const valGradId = `sv-val-${uid}`;
  const hueGradId = `hue-strip-${uid}`;

  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value));
  const [hexDraft, setHexDraft] = useState(value);

  // Re-seed from the incoming value each time the sheet is opened.
  useEffect(() => {
    if (visible) {
      setHsv(hexToHsv(value));
      setHexDraft(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const applyHsv = useCallback(
    (next: Hsv) => {
      setHsv(next);
      const hex = hsvToHex(next.h, next.s, next.v);
      setHexDraft(hex);
      onChange(hex);
    },
    [onChange],
  );

  // PanResponder.create only runs once (it's stashed in a ref), so its
  // handlers close over whatever `hsv`/`applyHsv` existed on that first
  // render. Routing through refs that are reassigned every render keeps the
  // gesture handlers reading current state without recreating the responder.
  const hsvRef = useRef(hsv);
  hsvRef.current = hsv;
  const applyHsvRef = useRef(applyHsv);
  applyHsvRef.current = applyHsv;

  const handleSvTouch = useCallback(
    (evt: GestureResponderEvent) => {
      const { locationX, locationY } = evt.nativeEvent;
      const s = Math.max(0, Math.min(1, locationX / size));
      const v = 1 - Math.max(0, Math.min(1, locationY / size));
      applyHsvRef.current({ h: hsvRef.current.h, s, v });
    },
    [size],
  );
  const handleSvTouchRef = useRef(handleSvTouch);
  handleSvTouchRef.current = handleSvTouch;

  const handleHueTouch = useCallback(
    (evt: GestureResponderEvent) => {
      const { locationX } = evt.nativeEvent;
      const h = Math.max(0, Math.min(1, locationX / size)) * 360;
      applyHsvRef.current({
        h,
        s: hsvRef.current.s,
        v: hsvRef.current.v,
      });
    },
    [size],
  );
  const handleHueTouchRef = useRef(handleHueTouch);
  handleHueTouchRef.current = handleHueTouch;

  const svResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => handleSvTouchRef.current(evt),
      onPanResponderMove: (evt) => handleSvTouchRef.current(evt),
    }),
  ).current;

  const hueResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => handleHueTouchRef.current(evt),
      onPanResponderMove: (evt) => handleHueTouchRef.current(evt),
    }),
  ).current;

  const handleHexChange = (text: string) => {
    setHexDraft(text);
    const normalized = normalizeHexColor(text);
    if (normalized) applyHsv(hexToHsv(normalized));
  };

  const currentHex = hsvToHex(hsv.h, hsv.s, hsv.v);
  const hueHex = hueToHex(hsv.h);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <RNView style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <RNView
          style={[
            styles.sheet,
            { backgroundColor: control.fill, borderColor: control.border },
          ]}
        >
          <Text
            style={[Type.heading, styles.title, { color: control.text }]}
            numberOfLines={1}
          >
            {label ?? t("colorPicker.title")}
          </Text>

          <RNView
            style={[styles.svWrap, { width: size, height: size }]}
            {...svResponder.panHandlers}
          >
            <Svg width={size} height={size}>
              <Defs>
                <LinearGradient id={satGradId} x1="0" y1="0" x2="1" y2="0">
                  <Stop offset={0} stopColor="#ffffff" stopOpacity={1} />
                  <Stop offset={1} stopColor={hueHex} stopOpacity={1} />
                </LinearGradient>
                <LinearGradient id={valGradId} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset={0} stopColor="#000000" stopOpacity={0} />
                  <Stop offset={1} stopColor="#000000" stopOpacity={1} />
                </LinearGradient>
              </Defs>
              <Rect width={size} height={size} fill={`url(#${satGradId})`} />
              <Rect width={size} height={size} fill={`url(#${valGradId})`} />
            </Svg>
            <RNView
              pointerEvents="none"
              style={[
                styles.handle,
                {
                  left: hsv.s * size - HANDLE_SIZE / 2,
                  top: (1 - hsv.v) * size - HANDLE_SIZE / 2,
                  backgroundColor: currentHex,
                },
              ]}
            />
          </RNView>

          <RNView
            style={[styles.hueWrap, { width: size }]}
            {...hueResponder.panHandlers}
          >
            <Svg width={size} height={HUE_HEIGHT}>
              <Defs>
                <LinearGradient id={hueGradId} x1="0" y1="0" x2="1" y2="0">
                  <Stop offset={0} stopColor="#ff0000" />
                  <Stop offset={1 / 6} stopColor="#ffff00" />
                  <Stop offset={2 / 6} stopColor="#00ff00" />
                  <Stop offset={3 / 6} stopColor="#00ffff" />
                  <Stop offset={4 / 6} stopColor="#0000ff" />
                  <Stop offset={5 / 6} stopColor="#ff00ff" />
                  <Stop offset={1} stopColor="#ff0000" />
                </LinearGradient>
              </Defs>
              <Rect
                width={size}
                height={HUE_HEIGHT}
                rx={HUE_HEIGHT / 2}
                fill={`url(#${hueGradId})`}
              />
            </Svg>
            <RNView
              pointerEvents="none"
              style={[
                styles.hueHandle,
                {
                  left: (hsv.h / 360) * size - HANDLE_SIZE / 2,
                  backgroundColor: hueHex,
                },
              ]}
            />
          </RNView>

          <RNView style={styles.hexRow}>
            <RNView style={[styles.swatch, { backgroundColor: currentHex }]} />
            <TextInput
              value={hexDraft}
              onChangeText={handleHexChange}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="#rrggbb"
              placeholderTextColor={control.placeholder}
              style={[
                styles.hexInput,
                inputTypeface,
                {
                  color: control.text,
                  borderColor: control.border,
                  backgroundColor: control.fill,
                },
              ]}
            />
          </RNView>

          <PrimaryButton title={t("common.done")} onPress={onClose} />
        </RNView>
      </RNView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Space[6],
  },
  sheet: {
    width: "100%",
    maxWidth: 360,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Space[4],
    gap: Space[3],
    alignItems: "center",
  },
  title: {
    alignSelf: "flex-start",
  },
  svWrap: {
    borderRadius: Radius.md,
    overflow: "hidden",
  },
  handle: {
    position: "absolute",
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    borderWidth: 3,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  hueWrap: {
    height: HUE_HEIGHT,
  },
  hueHandle: {
    position: "absolute",
    top: (HUE_HEIGHT - HANDLE_SIZE) / 2,
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    borderWidth: 3,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  hexRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Space[2],
    alignSelf: "stretch",
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.15)",
  },
  hexInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Space[3],
    fontSize: FontSize.md,
  },
});
