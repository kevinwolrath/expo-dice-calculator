import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

import { showMessage } from "@/components/alert";
import EntityListItem from "@/components/ui/EntityListItem";
import FormActionRow from "@/components/ui/FormActionRow";
import FormField from "@/components/ui/FormField";
import ScreenList from "@/components/ui/ScreenList";
import SelectDropdown from "@/components/ui/SelectDropdown";
import type { ColourType } from "@/db";
import useInventoryStore from "@/stores/useInventoryStore";
import { useTranslation } from "react-i18next";

export default function ColourTypesScreen() {
  const { t } = useTranslation();
  const colourTypes = useInventoryStore((s) => s.colourTypes);
  const types = useInventoryStore((s) => s.types);
  const loading = useInventoryStore((s) => s.loading);
  const loadAll = useInventoryStore((s) => s.loadAll);
  const createColourType = useInventoryStore((s) => s.createColourType);
  const updateColourType = useInventoryStore((s) => s.updateColourType);
  const deleteColourType = useInventoryStore((s) => s.deleteColourType);

  const [description, setDescription] = useState("");
  const [materialTypeId, setMaterialTypeId] = useState<string | null>(null);
  const [typeEditingId, setTypeEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    description?: string;
    materialTypeId?: string;
  }>({});

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const materialTypeLabel = (id: string) =>
    types.find((type) => type.material_type_id === id)?.description ??
    String(id);

  const handleSaveType = async () => {
    const nextErrors: typeof errors = {};
    if (!description.trim()) nextErrors.description = t("common.required");
    if (!materialTypeId) nextErrors.materialTypeId = t("common.required");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !materialTypeId) return;
    try {
      if (typeEditingId) {
        await updateColourType(typeEditingId, {
          description: description.trim() || null,
          material_type_id: materialTypeId,
        });
      } else {
        const created = await createColourType({
          description: description.trim(),
          material_type_id: materialTypeId,
        });
        setTypeEditingId(created.colour_type_id);
      }
      setErrors({});
    } catch (e) {
      console.warn(e);
      showMessage(t("common.error"), t("colourTypes.saveError"));
    }
  };

  const handleEditType = (item: ColourType) => {
    setTypeEditingId(item.colour_type_id);
    setDescription(item.description ?? "");
    setMaterialTypeId(item.material_type_id);
    setErrors({});
  };

  const handleCancelType = () => {
    setDescription("");
    setMaterialTypeId(null);
    setTypeEditingId(null);
    setErrors({});
  };

  const handleDeleteType = (id: string) => {
    if (Platform.OS === "web") {
      if (
        window.confirm(
          `${t("colourTypes.deleteTitle")} - ${t("colourTypes.deleteMessage")}`,
        )
      ) {
        (async () => {
          await deleteColourType(id);
          if (typeEditingId === id) handleCancelType();
          await loadAll();
        })();
      }
      return;
    }

    Alert.alert(t("colourTypes.deleteTitle"), t("colourTypes.deleteMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          await deleteColourType(id);
          if (typeEditingId === id) handleCancelType();
          await loadAll();
        },
      },
    ]);
  };

  return (
    <ScreenList
      data={colourTypes}
      keyExtractor={(item) => String(item.colour_type_id)}
      countLabel={t("colourTypes.typeCount", { count: colourTypes.length })}
      emptyText={t("colourTypes.empty")}
      form={
        <>
          <FormField
            label={t("colourTypes.description")}
            required
            error={errors.description}
            value={description}
            onChangeText={(value) => {
              setDescription(value);
              setErrors((current) => ({ ...current, description: undefined }));
            }}
          />
          <SelectDropdown
            label={t("colourTypes.materialType")}
            placeholder={t("colourTypes.selectMaterialType")}
            required
            error={errors.materialTypeId}
            options={types.map((type) => ({
              value: type.material_type_id,
              label: type.description,
            }))}
            value={materialTypeId}
            onChange={(value) => {
              setMaterialTypeId(value);
              setErrors((current) => ({
                ...current,
                materialTypeId: undefined,
              }));
            }}
            emptyHint={t("colourTypes.addMaterialTypesHint")}
          />
          <FormActionRow
            addTitle={t("colourTypes.add")}
            onAdd={handleCancelType}
            saveTitle={t("colourTypes.save")}
            onSave={handleSaveType}
            onCancel={handleCancelType}
            saving={loading}
          />
        </>
      }
      renderItem={({ item }) => (
        <EntityListItem
          title={item.description ?? String(item.colour_type_id)}
          meta={materialTypeLabel(item.material_type_id)}
          onEdit={() => handleEditType(item)}
          onDelete={() => handleDeleteType(item.colour_type_id)}
        />
      )}
    />
  );
}
