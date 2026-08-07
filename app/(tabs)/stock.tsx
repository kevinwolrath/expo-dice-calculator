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

export default function StockScreen() {
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
      showMessage(
        "Missing data",
        "Colour name and material type are required.",
      );
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
      showMessage("Error", "Could not save stock item.");
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

  const handleDelete = (id: number) => {
    if (Platform.OS === "web") {
      // window.confirm returns true if user confirms
      if (window.confirm("Delete item - are you sure?")) {
        (async () => {
          await deleteStock(id);
          await loadAll();
        })();
      }
      return;
    }

    Alert.alert("Delete item", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
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
            <Text style={styles.title}>Material Stock</Text>
            <Card>
              <FormField
                label="Colour name"
                value={colourName}
                onChangeText={setColourName}
              />
              <ChipSelect
                label="Material type"
                options={types.map((t) => ({
                  value: t.material_type_id,
                  label: t.description ?? String(t.material_type_id),
                }))}
                value={materialTypeId}
                onChange={setMaterialTypeId}
                emptyHint="Add material types in Material Types"
              />
              <FormField
                label="Quantity"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
              />
              <PrimaryButton
                title={
                  saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Add stock"
                }
                onPress={handleSave}
                disabled={saving}
              />
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
                  {item.quantity_in_stock} in stock
                </Text>
              </RNView>
              <RNView style={{ flexDirection: "row", gap: 10 }}>
                <PrimaryButton title="Edit" onPress={() => handleEdit(item)} />
                <PrimaryButton
                  title="Delete"
                  variant="destructive"
                  onPress={() => handleDelete(item.material_stock_id)}
                />
              </RNView>
            </RNView>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", opacity: 0.6 }}>
            No stock items yet.
          </Text>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 12 },
});
