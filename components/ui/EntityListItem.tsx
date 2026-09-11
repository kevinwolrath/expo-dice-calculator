import { SymbolView } from "expo-symbols";
import { Platform, Pressable, StyleSheet } from "react-native";
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

  const handleEdit = () => {
    onEdit();
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
              onPress={(event) => {
                event.stopPropagation();
                onDelete();
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

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: {
    flexShrink: 1,
    paddingRight: Space[3],
  },
  itemMeta: { opacity: 0.6, marginTop: Space[1] },
  itemDescription: { fontSize: FontSize.sm, marginTop: 6 },
});
