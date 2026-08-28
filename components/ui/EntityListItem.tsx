import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { Text, View, useThemeColors } from "@/components/Themed";
import Card from "@/components/ui/Card";
import { useScrollToForm } from "@/components/ui/ScreenList";
import { FontSize, Space, Type } from "@/constants/theme";

type EntityListItemProps = {
  title: string;
  meta?: string;
  description?: string | null;
  onEdit: () => void;
  onDelete?: () => void;
};

export default function EntityListItem({
  title,
  meta,
  description,
  onEdit,
  onDelete,
}: EntityListItemProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const scrollToForm = useScrollToForm();

  return (
    <Card>
      <View style={styles.rowBetween}>
        <Text style={[Type.heading, styles.itemTitle]}>{title}</Text>
        <View style={styles.itemActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("common.edit")}
            onPress={() => {
              onEdit();
              requestAnimationFrame(() => {
                scrollToForm();
              });
            }}
            hitSlop={8}
          >
            <SymbolView
              name={{ ios: "pencil", android: "edit", web: "edit" }}
              size={20}
              tintColor={colors.text}
            />
          </Pressable>
          {onDelete ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("common.delete")}
              onPress={onDelete}
              hitSlop={8}
            >
              <SymbolView
                name={{ ios: "trash", android: "delete", web: "delete" }}
                size={20}
                tintColor={colors.destructive}
              />
            </Pressable>
          ) : null}
        </View>
      </View>
      {meta ? <Text style={[Type.meta, styles.itemMeta]}>{meta}</Text> : null}
      {description ? (
        <Text style={styles.itemDescription}>{description}</Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemActions: { flexDirection: "row", gap: Space[4] },
  itemTitle: {
    flexShrink: 1,
    paddingRight: Space[3],
  },
  itemMeta: { opacity: 0.6, marginTop: Space[1] },
  itemDescription: { fontSize: FontSize.sm, marginTop: 6 },
});
