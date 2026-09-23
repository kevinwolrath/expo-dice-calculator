import { getScrollContentNode } from "../components/ui/screenListScroll";

test("getScrollContentNode uses the list inner view when present", () => {
  const inner = { kind: "content" };
  const list = {
    getInnerViewNode: () => inner,
  };
  expect(getScrollContentNode(list)).toBe(inner);
});

test("getScrollContentNode falls back to the native scroll ref", () => {
  const inner = { kind: "native-content" };
  const list = {
    getNativeScrollRef: () => ({
      getInnerViewNode: () => inner,
    }),
  };
  expect(getScrollContentNode(list)).toBe(inner);
});

test("getScrollContentNode returns null without a list or inner node", () => {
  expect(getScrollContentNode(null)).toBeNull();
  expect(getScrollContentNode({})).toBeNull();
});
