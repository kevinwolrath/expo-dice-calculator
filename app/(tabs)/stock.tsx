import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import { useTranslation } from "react-i18next";

import { showMessage } from "@/components/alert";
import { usePackSurface } from "@/components/usePackSurface";
import ColorField from "@/components/ui/ColorField";
import EntityListItem from "@/components/ui/EntityListItem";
import FormActionRow, { isFormDirty } from "@/components/ui/FormActionRow";
import FormField from "@/components/ui/FormField";
import ScreenList from "@/components/ui/ScreenList";
import SelectDropdown from "@/components/ui/SelectDropdown";
import { colourFromName } from "@/constants/colourFromName";
import type { MaterialStock } from "@/db";
import useInventoryStore from "@/stores/useInventoryStore";

export default function StockScreen() {
  const { t } = useTranslation();
  const { icon } = usePackSurface();
  const items = useInventoryStore((s) => s.stock);
  const types = useInventoryStore((s) => s.types);
  const colourTypes = useInventoryStore((s) => s.colourTypes);
  const colourTypeMaterials = useInventoryStore((s) => s.colourTypeMaterials);
  const colourBrands = useInventoryStore((s) => s.colourBrands);
  const loadAll = useInventoryStore((s) => s.loadAll);
  const createStock = useInventoryStore((s) => s.createStock);
  const updateStock = useInventoryStore((s) => s.updateStock);
  const deleteStock = useInventoryStore((s) => s.deleteStock);

  const [colourName, setColourName] = useState("");
  const [colour, setColour] = useState(colourFromName(""));
  const [colourManual, setColourManual] = useState(false);
  const [colourTypeId, setColourTypeId] = useState<string | null>(null);
  const [colourBrandId, setColourBrandId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("0");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{
    colourName?: string;
    colourTypeId?: string;
  }>({});

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const materialTypeLabel = (id: string) =>
    types.find((type) => type.material_type_id === id)?.description ??
    String(id);

  const colourTypeLabel = (id: string) => {
    const colourType = colourTypes.find((type) => type.colour_type_id === id);
    if (!colourType) return String(id);
    const materials = colourTypeMaterials
      .filter((row) => row.colour_type_id === id)
      .map((row) => materialTypeLabel(row.material_type_id));
    return materials.length > 0
      ? `${colourType.description} (${materials.join(", ")})`
      : colourType.description;
  };

  const colourBrandLabel = (id: string | null) => {
    if (!id) return null;
    return (
      colourBrands.find((brand) => brand.colour_brand_id === id)
        ?.colour_brand_name ?? String(id)
    );
  };

  const handleSave = async () => {
    const nextErrors: typeof errors = {};
    if (!colourName.trim()) nextErrors.colourName = t("common.required");
    if (!colourTypeId) nextErrors.colourTypeId = t("common.required");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !colourTypeId) {
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateStock(editingId, {
          colour_name: colourName.trim(),
          colour,
          colour_type_id: colourTypeId,
          colour_brand_id: colourBrandId,
          quantity_in_stock: Number(quantity) || 0,
        });
      } else {
        const created = await createStock({
          colour_name: colourName.trim(),
          colour,
          colour_type_id: colourTypeId,
          colour_brand_id: colourBrandId,
          quantity_in_stock: Number(quantity) || 0,
        });
        setEditingId(created.material_stock_id);
      }
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
    setColour(item.colour);
    setColourManual(true);
    setColourTypeId(item.colour_type_id);
    setColourBrandId(item.colour_brand_id);
    setQuantity(String(item.quantity_in_stock));
    setErrors({});
  };

  const emptyForm = {
    colourName: "",
    colour: colourFromName(""),
    colourTypeId: null,
    colourBrandId: null,
    quantity: "0",
  };
  const formDirty =
    editingId !== null ||
    isFormDirty(
      { colourName, colour, colourTypeId, colourBrandId, quantity },
      emptyForm,
    );

  const handleCancel = () => {
    setColourName("");
    setColour(colourFromName(""));
    setColourManual(false);
    setColourTypeId(null);
    setColourBrandId(null);
    setQuantity("0");
    setEditingId(null);
    setErrors({});
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === "web") {
      if (
        window.confirm(
          `${t("stock.deleteTitle")} - ${t("stock.deleteMessage")}`,
        )
      ) {
        (async () => {
          await deleteStock(id);
          if (editingId === id) handleCancel();
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
          if (editingId === id) handleCancel();
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
            icon={icon("colour")}
            required
            error={errors.colourName}
            value={colourName}
            onChangeText={(value) => {
              setColourName(value);
              if (!colourManual) setColour(colourFromName(value));
              setErrors((current) => ({ ...current, colourName: undefined }));
            }}
          />
          <ColorField
            label={t("stock.colour")}
            value={colour}
            fallback={colourFromName(colourName)}
            allowEmpty={false}
            onChange={(value) => {
              if (!value) return;
              setColour(value);
              setColourManual(true);
            }}
          />
          <SelectDropdown
            label={t("stock.colourType")}
            icon={icon("colour")}
            placeholder={t("stock.selectColourType")}
            required
            error={errors.colourTypeId}
            options={colourTypes.map((type) => ({
              value: type.colour_type_id,
              label: colourTypeLabel(type.colour_type_id),
            }))}
            value={colourTypeId}
            onChange={(value) => {
              setColourTypeId(value);
              setErrors((current) => ({
                ...current,
                colourTypeId: undefined,
              }));
            }}
            emptyHint={t("stock.addColourTypesHint")}
          />
          <SelectDropdown
            label={t("stock.colourBrand")}
            icon={icon("colour")}
            placeholder={t("stock.selectColourBrand")}
            options={colourBrands.map((brand) => ({
              value: brand.colour_brand_id,
              label: brand.colour_brand_name,
            }))}
            value={colourBrandId}
            onChange={setColourBrandId}
            emptyHint={t("stock.addColourBrandsHint")}
          />
          <FormField
            label={t("stock.quantity")}
            icon={icon("material")}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
          />
          <FormActionRow
            addTitle={t("stock.add")}
            onAdd={handleCancel}
            saveTitle={t("stock.save")}
            onSave={handleSave}
            onCancel={handleCancel}
            saving={saving}
            dirty={formDirty}
          />
        </>
      }
      renderItem={({ item }) => {
        const brand = colourBrandLabel(item.colour_brand_id);
        return (
          <EntityListItem
            title={item.colour_name}
            meta={`${colourTypeLabel(item.colour_type_id)}${
              brand ? ` • ${brand}` : ""
            } • ${t("stock.inStock", { count: item.quantity_in_stock })}`}
            onEdit={() => handleEdit(item)}
            onDelete={() => handleDelete(item.material_stock_id)}
          />
        );
      }}
    />
  );
}
