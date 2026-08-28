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
  type ListRenderItem,
} from "react-native";

import { Screen, Text, View } from "@/components/Themed";
import Card from "@/components/ui/Card";
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
};

export default function ScreenList<T>({
  data,
  keyExtractor,
  renderItem,
  form,
  countLabel,
  emptyText,
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

  return (
    <ScrollToFormContext.Provider value={scrollToForm}>
      <Screen>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Layout.keyboardOffset}
        >
          <FlatList
            ref={listRef}
            data={data}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              <View nativeID="entity-form" style={styles.header}>
                <Card>{form}</Card>
                <Text style={[Type.meta, styles.sectionLabel]}>
                  {countLabel}
                </Text>
              </View>
            }
            renderItem={renderItem}
            ListEmptyComponent={
              <Text style={[Type.meta, styles.emptyText]}>{emptyText}</Text>
            }
          />
        </KeyboardAvoidingView>
      </Screen>
    </ScrollToFormContext.Provider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listContent: {
    padding: Layout.screenGutter,
    paddingBottom: Layout.listBottom,
  },
  header: { marginBottom: Space[2] },
  sectionLabel: { opacity: 0.6, marginBottom: Space[2] },
  emptyText: { textAlign: "center", opacity: 0.6, marginTop: Space[6] },
});
