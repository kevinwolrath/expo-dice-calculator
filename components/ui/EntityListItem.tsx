import { SymbolView } from "expo-symbols";
import { memo } from "react";
import { Platform, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { Text, View, useThemeColors } from "@/components/Themed";
import Card from "@/components/ui/Card";
import { useScrollToForm } from "@/components/ui/ScreenList";
import { FontSize, Space, Type } from "@/constants/theme";

type EntityListItemProps = {
  /**
   * Identifies the row for the onEdit/onDelete callbacks below. Passing the
   * id (rather than a pre-bound `() => handleEdit(item)` closure) lets the
   * parent screen keep those callbacks referentially stable across renders,
   * which is what allows `memo` on this component to actually skip work.
   */
  id: string;
  title: string;
  meta?: string;
  description?: string | null;
  onEdit: (id: string) => void;
  onDelete?: (id: string) => void;
};

function EntityListItem({
  id,
  title,
  meta,
  description,
  onEdit,
  onDelete,
}: EntityListItemProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const scrollToForm = useScrollToForm();

  const handleEdit = () => {
    onEdit(id);
    requestAnimationFrame(() => {
      scrollToForm();
    });
  };

  return (
    <Pressable
      accessibilityRole={Platform.OS === "web" ? "none" : "button"}
      accessibilityLabel={t("common.edit")}
      onPress={handleEdit}
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
    >
      <Card>
        <View style={styles.rowBetween}>
          <Text style={[Type.heading, styles.itemTitle]}>{title}</Text>
          {onDelete ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("common.delete")}
              {...(Platform.OS === "web" ? { title: t("common.delete") } : null)}
              style={styles.deleteButton}
              onPress={(event) => {
                event.stopPropagation();
                onDelete(id);
              }}
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
        {meta ? <Text style={[Type.meta, styles.itemMeta]}>{meta}</Text> : null}
        {description ? (
          <Text style={styles.itemDescription}>{description}</Text>
        ) : null}
      </Card>
    </Pressable>
  );
}

export default memo(EntityListItem);

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: Space[2],
  },
  itemTitle: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 160,
    paddingRight: Space[3],
  },
  deleteButton: {
    flexShrink: 0,
  },
  itemMeta: { opacity: 0.6, marginTop: Space[1] },
  itemDescription: { fontSize: FontSize.sm, marginTop: 6 },
});
