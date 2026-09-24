import {
  createContext,
  useContext,
  useRef,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View as RNView,
  type ListRenderItem,
} from "react-native";

import { Screen, Text, View } from "@/components/Themed";
import { FormScrollContext } from "@/components/ui/fieldFocus";
import { Layout, Space, Type } from "@/constants/theme";

const ScrollToFormContext = createContext<() => void>(() => {});

export const useScrollToForm = () => useContext(ScrollToFormContext);

type ScreenListProps<T> = {
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: ListRenderItem<T>;
  form: ReactNode;
  countLabel: string;
  emptyText: string;
  hero?: ReactNode;
};

/**
 * Returns the native node handle for a FlatList's scrollable *content* view
 * (not the outer clipping view — measuring against that would give a
 * position that shifts with the current scroll offset), so a field can
 * measureLayout against it (see fieldFocus.useFieldFocus) to compute a
 * scrollToOffset target. Defensive: these are instance methods on the
 * underlying ScrollView that aren't guaranteed on every platform/renderer
 * (react-native-web in particular), so we feature-detect rather than
 * assume they exist.
 */
type FlatListRef = {
  getNativeScrollRef?: () => unknown;
};

function readInnerViewNode(host: object): unknown {
  if (!("getInnerViewNode" in host)) return null;
  const method = host.getInnerViewNode;
  if (typeof method !== "function") return null;
  return method.call(host);
}

function getScrollContentNode(list: FlatListRef | null): unknown {
  if (!list) return null;
  const direct = readInnerViewNode(list);
  if (direct != null) return direct;
  if (typeof list.getNativeScrollRef !== "function") return null;
  const native = list.getNativeScrollRef();
  if (!native || typeof native !== "object") return null;
  return readInnerViewNode(native);
}

export default function ScreenList<T>({
  data,
  keyExtractor,
  renderItem,
  form,
  countLabel,
  emptyText,
  hero,
}: ScreenListProps<T>): ReactElement {
  const listRef = useRef<FlatList<T>>(null);

  const scrollToForm = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
    if (Platform.OS === "web" && typeof document !== "undefined") {
      document
        .getElementById("entity-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollChildIntoView = (host: RNView | null) => {
    if (!host) return;
    const contentNode = getScrollContentNode(listRef.current);
    if (contentNode == null) return;
    host.measureLayout(
      contentNode as Parameters<RNView["measureLayout"]>[0],
      (_x, y) => {
        listRef.current?.scrollToOffset({
          offset: Math.max(0, y - 16),
          animated: true,
        });
      },
      () => {},
    );
  };

  return (
    <ScrollToFormContext.Provider value={scrollToForm}>
      <FormScrollContext.Provider value={scrollChildIntoView}>
        <Screen>
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Layout.keyboardOffset}
          >
            <FlatList
              ref={listRef}
              style={styles.flex}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.content}
              data={data}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              initialNumToRender={12}
              maxToRenderPerBatch={12}
              windowSize={7}
              removeClippedSubviews={Platform.OS !== "web"}
              ListHeaderComponent={
                <>
                  {hero ? <View style={styles.hero}>{hero}</View> : null}
                  <View nativeID="entity-form" style={styles.form}>
                    {form}
                    <Text style={[Type.meta, styles.sectionLabel]}>
                      {countLabel}
                    </Text>
                  </View>
                </>
              }
              ListEmptyComponent={
                <Text style={[Type.meta, styles.emptyText]}>{emptyText}</Text>
              }
            />
          </KeyboardAvoidingView>
        </Screen>
      </FormScrollContext.Provider>
    </ScrollToFormContext.Provider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: Layout.listGutter,
    paddingBottom: Layout.listBottom,
    flexGrow: 1,
    width: "100%",
    maxWidth: Layout.contentMaxWidth,
    alignSelf: "center",
  },
  hero: {
    marginBottom: Space[4],
  },
  form: {
    marginBottom: Space[4],
  },
  sectionLabel: { opacity: 0.6, marginBottom: Space[4], marginTop: Space[2] },
  emptyText: { textAlign: "center", opacity: 0.6, marginTop: Space[6] },
});
