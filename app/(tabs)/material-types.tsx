import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  View as RNView,
  StyleSheet,
} from "react-native";

import { showMessage } from "@/components/alert";
import { Text } from "@/components/Themed";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import PrimaryButton from "@/components/ui/PrimaryButton";
import type { MaterialType } from "@/db";
import useInventoryStore from "@/stores/useInventoryStore";
import { useTranslation } from "react-i18next";

export default function MaterialTypesScreen() {
  const { t } = useTranslation();
  const types = useInventoryStore((s) => s.types);
  const loading = useInventoryStore((s) => s.loading);
  const loadAll = useInventoryStore((s) => s.loadAll);
  const createType = useInventoryStore((s) => s.createType);
  const updateType = useInventoryStore((s) => s.updateType);
  const deleteType = useInventoryStore((s) => s.deleteType);

  const [description, setDescription] = useState("");
  const [typeEditingId, setTypeEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleSaveType = async () => {
    if (!description.trim())
      return showMessage(
        t("materialTypes.missingTitle"),
        t("materialTypes.missingMessage"),
      );
    try {
      if (typeEditingId) {
        await updateType(typeEditingId, {
          description: description.trim() || null,
        });
      } else {
        await createType({ description: description.trim() });
      }
      setDescription("");
      setTypeEditingId(null);
    } catch (e) {
      console.warn(e);
      showMessage(t("common.error"), t("materialTypes.saveError"));
    }
  };

  const handleEditType = (t: MaterialType) => {
    setTypeEditingId(t.material_type_id);
    setDescription(t.description ?? "");
  };

  const handleCancelType = () => {
    setDescription("");
    setTypeEditingId(null);
  };

  const handleDeleteType = (id: number) => {
    if (Platform.OS === "web") {
      if (
        window.confirm(
          `${t("materialTypes.deleteTitle")} - ${t("materialTypes.deleteMessage")}`,
        )
      ) {
        (async () => {
          await deleteType(id);
          await loadAll();
        })();
      }
      return;
    }

    Alert.alert(
      t("materialTypes.deleteTitle"),
      t("materialTypes.deleteMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            await deleteType(id);
            await loadAll();
          },
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <FlatList
        data={types}
        keyExtractor={(i) => String(i.material_type_id)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <RNView style={{ marginBottom: 12 }}>
            <Card>
              <FormField
                label={t("materialTypes.description")}
                value={description}
                onChangeText={setDescription}
              />
              <RNView style={styles.actionRow}>
                <PrimaryButton
                  title={
                    loading
                      ? t("common.saving")
                      : typeEditingId
                        ? t("materialTypes.save")
                        : t("materialTypes.add")
                  }
                  onPress={handleSaveType}
                  disabled={loading}
                />
                <PrimaryButton
                  title={t("common.cancel")}
                  onPress={handleCancelType}
                  disabled={loading}
                />
              </RNView>
            </Card>
          </RNView>
        }
        renderItem={({ item }) => (
          <Card>
            <RNView
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <RNView>
                <Text style={{ fontWeight: "600" }}>{item.description}</Text>
              </RNView>
              <RNView style={{ flexDirection: "row", gap: 10 }}>
                <PrimaryButton
                  title={t("common.edit")}
                  onPress={() => handleEditType(item)}
                />
                <PrimaryButton
                  title={t("common.delete")}
                  variant="destructive"
                  onPress={() => handleDeleteType(item.material_type_id)}
                />
              </RNView>
            </RNView>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", opacity: 0.6 }}>
            {t("materialTypes.empty")}
          </Text>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  actionRow: { flexDirection: "row", gap: 10 },
});
