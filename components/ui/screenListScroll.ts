export type ScrollListRef = {
  getNativeScrollRef?: () => unknown;
  getInnerViewNode?: () => unknown;
};

function innerViewNode(host: unknown): unknown {
  if (!host || typeof host !== "object") return null;
  const node = host as { getInnerViewNode?: () => unknown };
  if (typeof node.getInnerViewNode === "function") {
    return node.getInnerViewNode();
  }
  return null;
}

/**
 * Native node handle for a FlatList's scrollable *content* view (not the
 * outer clipping view). Field focus uses this with measureLayout.
 */
export function getScrollContentNode(list: ScrollListRef | null): unknown {
  if (!list) return null;
  const direct = innerViewNode(list);
  if (direct != null) return direct;
  const native =
    typeof list.getNativeScrollRef === "function"
      ? list.getNativeScrollRef()
      : null;
  return innerViewNode(native);
}
