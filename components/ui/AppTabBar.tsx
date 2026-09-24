import { use, useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { BottomTabBarHeightCallbackContext } from "expo-router/build/react-navigation/bottom-tabs/utils/BottomTabBarHeightCallbackContext";
import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs/types";

/**
 * Equal-width tabs when every label fits that way. Otherwise keep each label
 * at its natural width, and scroll the strip only when that row is wider
 * than the bar. Labels stay one line and are never squeezed into a partial word.
 */
export default function AppTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const onHeightChange = use(BottomTabBarHeightCallbackContext);
  const scrollRef = useRef<ScrollView>(null);
  const naturalWidths = useRef<Record<string, number>>({});
  const itemOffsets = useRef<Record<string, number>>({});
  const [barWidth, setBarWidth] = useState(0);
  const [naturalSum, setNaturalSum] = useState(0);
  const [widest, setWidest] = useState(0);
  const [measured, setMeasured] = useState(false);

  const focusedOptions = descriptors[state.routes[state.index].key].options;
  const titles = state.routes
    .map((route) => descriptors[route.key].options.title ?? route.name)
    .join("\n");

  useEffect(() => {
    naturalWidths.current = {};
    setNaturalSum(0);
    setWidest(0);
    setMeasured(false);
  }, [titles]);

  const routeCount = state.routes.length;
  const fitsEqual =
    measured && barWidth > 0 && widest > 0 && widest * routeCount <= barWidth;
  const fitsNatural =
    measured && barWidth > 0 && naturalSum > 0 && naturalSum <= barWidth;
  const scrollable = !fitsNatural;
  const spread = fitsEqual;

  useEffect(() => {
    if (!scrollable) return;
    const route = state.routes[state.index];
    const x = itemOffsets.current[route.key];
    if (x == null) return;
    scrollRef.current?.scrollTo({ x: Math.max(0, x - 8), animated: true });
  }, [scrollable, state.index, state.routes]);

  const recordNaturalWidth = (key: string, width: number) => {
    if (spread) return;
    if (naturalWidths.current[key] === width) return;
    naturalWidths.current[key] = width;
    if (Object.keys(naturalWidths.current).length < state.routes.length) return;
    const widths = Object.values(naturalWidths.current);
    const sum = widths.reduce((total, value) => total + value, 0);
    setWidest(Math.max(...widths));
    setNaturalSum(sum);
    setMeasured(true);
  };

  return (
    <View
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setBarWidth(width);
        onHeightChange?.(height);
      }}
      style={[styles.bar, plainTabBarStyle(focusedOptions.tabBarStyle)]}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        scrollEnabled={scrollable}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={
          scrollable
            ? styles.scrollContent
            : spread
              ? styles.fillContent
              : styles.distributeContent
        }
      >
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const color = focused
            ? options.tabBarActiveTintColor
            : options.tabBarInactiveTintColor;
          const label =
            typeof options.tabBarLabel === "function"
              ? options.tabBarLabel({
                  focused,
                  color: color ?? "#000",
                  position: "below-icon",
                  children: options.title ?? route.name,
                })
              : (options.title ?? route.name);

          const labelText = options.title ?? route.name;
          // Match the stock bar: iOS does not expose role "tab" reliably, so
          // the name carries position. Other platforms use tab + selected.
          const accessibilityLabel =
            options.tabBarAccessibilityLabel ??
            (Platform.OS === "ios"
              ? `${labelText}, tab, ${index + 1} of ${routeCount}`
              : undefined);

          return (
            <Pressable
              key={route.key}
              accessibilityRole={Platform.OS === "ios" ? "button" : "tab"}
              accessibilityState={{ selected: focused }}
              aria-selected={focused}
              accessibilityLabel={accessibilityLabel}
              accessibilityLargeContentTitle={labelText}
              accessibilityShowsLargeContentViewer
              onPress={() => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              }}
              onLayout={(event) => {
                const { x, width } = event.nativeEvent.layout;
                itemOffsets.current[route.key] = x;
                recordNaturalWidth(route.key, width);
              }}
              style={[
                styles.item,
                spread
                  ? { width: barWidth / routeCount }
                  : styles.itemNatural,
              ]}
            >
              {options.tabBarIcon?.({
                focused,
                color: color ?? "#000",
                size: 22,
              })}
              {label}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function plainTabBarStyle(style: unknown): ViewStyle {
  if (!style || typeof style !== "object" || Array.isArray(style)) return {};
  const read = (key: string) =>
    Object.entries(style).find(([name]) => name === key)?.[1];
  const color = (key: string) => {
    const value = read(key);
    return typeof value === "string" ? value : undefined;
  };
  const number = (key: string) => {
    const value = read(key);
    return typeof value === "number" ? value : undefined;
  };
  return {
    backgroundColor: color("backgroundColor"),
    borderTopColor: color("borderTopColor"),
    borderTopWidth: number("borderTopWidth"),
    height: number("height"),
    paddingTop: number("paddingTop"),
    paddingBottom: number("paddingBottom"),
    elevation: number("elevation"),
  };
}

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: 1,
  },
  fillContent: {
    flexGrow: 1,
  },
  distributeContent: {
    flexGrow: 1,
    justifyContent: "space-evenly",
  },
  scrollContent: {
    flexGrow: 0,
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    minHeight: 56,
  },
  itemNatural: {
    flexGrow: 0,
    flexShrink: 0,
  },
});
