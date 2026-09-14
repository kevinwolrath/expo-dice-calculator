import {
  createContext,
  useContext,
  useRef,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View as RNView,
  findNodeHandle,
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

export default function ScreenList<T>({
  data,
  keyExtractor,
  renderItem,
  form,
  countLabel,
  emptyText,
  hero,
}: ScreenListProps<T>): ReactElement {
  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<RNView>(null);

  const scrollToForm = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    if (Platform.OS === "web" && typeof document !== "undefined") {
      document
        .getElementById("entity-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollChildIntoView = (host: RNView | null) => {
    const content = contentRef.current;
    const scroll = scrollRef.current;
    if (!host || !content || !scroll) return;
    const node = findNodeHandle(content);
    if (node == null) return;
    host.measureLayout(
      node,
      (_x, y) => {
        scroll.scrollTo({ y: Math.max(0, y - 16), animated: true });
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
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            <RNView ref={contentRef} collapsable={false}>
            {hero ? <View style={styles.hero}>{hero}</View> : null}
            <View nativeID="entity-form" style={styles.form}>
              {form}
              <Text style={[Type.meta, styles.sectionLabel]}>{countLabel}</Text>
            </View>
            {data.length === 0 ? (
              <Text style={[Type.meta, styles.emptyText]}>{emptyText}</Text>
            ) : (
              data.map((item, index) => (
                <View key={keyExtractor(item)}>
                  {renderItem({
                    item,
                    index,
                    separators: {
                      highlight: () => {},
                      unhighlight: () => {},
                      updateProps: () => {},
                    },
                  })}
                </View>
              ))
            )}
            </RNView>
          </ScrollView>
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
