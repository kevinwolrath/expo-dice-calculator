import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

import { showMessage } from "@/components/alert";
import EntityListItem from "@/components/ui/EntityListItem";
import FormActionRow from "@/components/ui/FormActionRow";
import FormField from "@/components/ui/FormField";
import ScreenList from "@/components/ui/ScreenList";
import SelectDropdown from "@/components/ui/SelectDropdown";
import type { MaterialStock } from "@/db";
import useInventoryStore from "@/stores/useInventoryStore";
import { useTranslation } from "react-i18next";

export default function StockScreen() {
  const { t } = useTranslation();
  const items = useInventoryStore((s) => s.stock);
  const types = useInventoryStore((s) => s.types);
  const loadAll = useInventoryStore((s) => s.loadAll);
  const createStock = useInventoryStore((s) => s.createStock);
  const updateStock = useInventoryStore((s) => s.updateStock);
  const deleteStock = useInventoryStore((s) => s.deleteStock);

  const [colourName, setColourName] = useState("");
  const [materialTypeId, setMaterialTypeId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState("0");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{
    colourName?: string;
    materialTypeId?: string;
  }>({});

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const typeLabel = (id: number) =>
    types.find((type) => type.material_type_id === id)?.description ??
    String(id);

  const handleSave = async () => {
    const nextErrors: typeof errors = {};
    if (!colourName.trim()) nextErrors.colourName = t("common.required");
    if (!materialTypeId) nextErrors.materialTypeId = t("common.required");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !materialTypeId) return;

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
          material_type_id: materialTypeId,
          quantity_in_stock: Number(quantity) || 0,
        });
      }
      setColourName("");
      setQuantity("0");
      setMaterialTypeId(null);
      setEditingId(null);
      setErrors({});
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
    setErrors({});
  };

  const handleCancel = () => {
    setColourName("");
    setMaterialTypeId(null);
    setQuantity("0");
    setEditingId(null);
    setErrors({});
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
    <ScreenList
      data={items}
      keyExtractor={(item) => String(item.material_stock_id)}
      countLabel={t("stock.itemCount", { count: items.length })}
      emptyText={t("stock.empty")}
      form={
        <>
          <FormField
            label={t("stock.colourName")}
            required
            error={errors.colourName}
            value={colourName}
            onChangeText={(value) => {
              setColourName(value);
              setErrors((current) => ({ ...current, colourName: undefined }));
            }}
          />
          <SelectDropdown
            label={t("stock.materialType")}
            placeholder={t("stock.selectMaterialType")}
            required
            error={errors.materialTypeId}
            options={types.map((type) => ({
              value: type.material_type_id,
              label: type.description ?? String(type.material_type_id),
            }))}
            value={materialTypeId}
            onChange={(value) => {
              setMaterialTypeId(value);
              setErrors((current) => ({
                ...current,
                materialTypeId: undefined,
              }));
            }}
            emptyHint={t("stock.addMaterialTypesHint")}
          />
          <FormField
            label={t("stock.quantity")}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
          />
          <FormActionRow
            saveTitle={editingId ? t("stock.save") : t("stock.add")}
            onSave={handleSave}
            onCancel={handleCancel}
            saving={saving}
          />
        </>
      }
      renderItem={({ item }) => (
        <EntityListItem
          title={item.colour_name}
          meta={`${typeLabel(item.material_type_id)} • ${t("stock.inStock", { count: item.quantity_in_stock })}`}
          onEdit={() => handleEdit(item)}
          onDelete={() => handleDelete(item.material_stock_id)}
        />
      )}
    />
  );
}
