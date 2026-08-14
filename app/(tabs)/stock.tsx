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
import ChipSelect from "@/components/ui/ChipSelect";
import FormField from "@/components/ui/FormField";
import PrimaryButton from "@/components/ui/PrimaryButton";
import type { MaterialStock } from "@/db";
import useInventoryStore from "@/stores/useInventoryStore";
import { useTranslation } from "react-i18next";

export default function StockScreen() {
  const { t } = useTranslation();
  const items = useInventoryStore((s) => s.stock);
  const types = useInventoryStore((s) => s.types);
  const loading = useInventoryStore((s) => s.loading);
  const loadAll = useInventoryStore((s) => s.loadAll);
  const createStock = useInventoryStore((s) => s.createStock);
  const updateStock = useInventoryStore((s) => s.updateStock);
  const deleteStock = useInventoryStore((s) => s.deleteStock);

  const [colourName, setColourName] = useState("");
  const [materialTypeId, setMaterialTypeId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState("0");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleSave = async () => {
    if (!colourName.trim() || !materialTypeId) {
      showMessage(t("stock.missingTitle"), t("stock.missingMessage"));
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateStock(editingId, {
          colour_name: colourName.trim(),
          material_type_id: materialTypeId,
          quantity_in_stock: Number(quantity) || 0,
        });
      } else {
        await createStock({
          colour_name: colourName.trim(),
          material_type_id: materialTypeId!,
          quantity_in_stock: Number(quantity) || 0,
        });
      }
      setColourName("");
      setQuantity("0");
      setEditingId(null);
    } catch (e) {
      console.warn(e);
      showMessage(t("common.error"), t("stock.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: MaterialStock) => {
    setEditingId(item.material_stock_id);
    setColourName(item.colour_name);
    setMaterialTypeId(item.material_type_id);
    setQuantity(String(item.quantity_in_stock));
  };

  const handleCancel = () => {
    setColourName("");
    setMaterialTypeId(null);
    setQuantity("0");
    setEditingId(null);
  };

  const handleDelete = (id: number) => {
    if (Platform.OS === "web") {
      if (
        window.confirm(
          `${t("stock.deleteTitle")} - ${t("stock.deleteMessage")}`,
        )
      ) {
        (async () => {
          await deleteStock(id);
          await loadAll();
        })();
      }
      return;
    }

    Alert.alert(t("stock.deleteTitle"), t("stock.deleteMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          await deleteStock(id);
          await loadAll();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.material_stock_id)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <RNView style={{ marginBottom: 12 }}>
            <Card>
              <FormField
                label={t("stock.colourName")}
                value={colourName}
                onChangeText={setColourName}
              />
              <ChipSelect
                label={t("stock.materialType")}
                options={types.map((t) => ({
                  value: t.material_type_id,
                  label: t.description ?? String(t.material_type_id),
                }))}
                value={materialTypeId}
                onChange={setMaterialTypeId}
                emptyHint={t("stock.addMaterialTypesHint")}
              />
              <FormField
                label={t("stock.quantity")}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
              />
              <RNView style={styles.actionRow}>
                <PrimaryButton
                  title={
                    saving
                      ? t("common.saving")
                      : editingId
                        ? t("stock.save")
                        : t("stock.add")
                  }
                  onPress={handleSave}
                  disabled={saving}
                />
                <PrimaryButton
                  title={t("common.cancel")}
                  onPress={handleCancel}
                  disabled={saving}
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
                <Text style={{ fontWeight: "600" }}>{item.colour_name}</Text>
                <Text style={{ opacity: 0.7 }}>
                  {t("stock.inStock", { count: item.quantity_in_stock })}
                </Text>
              </RNView>
              <RNView style={{ flexDirection: "row", gap: 10 }}>
                <PrimaryButton
                  title={t("common.edit")}
                  onPress={() => handleEdit(item)}
                />
                <PrimaryButton
                  title={t("common.delete")}
                  variant="destructive"
                  onPress={() => handleDelete(item.material_stock_id)}
                />
              </RNView>
            </RNView>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", opacity: 0.6 }}>
            {t("stock.empty")}
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
