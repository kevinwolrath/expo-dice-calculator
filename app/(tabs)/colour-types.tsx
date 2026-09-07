import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

import { showMessage } from "@/components/alert";
import ChipSelect from "@/components/ui/ChipSelect";
import EntityListItem from "@/components/ui/EntityListItem";
import FormActionRow, { isFormDirty } from "@/components/ui/FormActionRow";
import FormField from "@/components/ui/FormField";
import ScreenList from "@/components/ui/ScreenList";
import type { ColourType } from "@/db";
import useInventoryStore from "@/stores/useInventoryStore";
import { useTranslation } from "react-i18next";

export default function ColourTypesScreen() {
  const { t } = useTranslation();
  const colourTypes = useInventoryStore((s) => s.colourTypes);
  const colourTypeMaterials = useInventoryStore((s) => s.colourTypeMaterials);
  const types = useInventoryStore((s) => s.types);
  const loading = useInventoryStore((s) => s.loading);
  const loadAll = useInventoryStore((s) => s.loadAll);
  const createColourType = useInventoryStore((s) => s.createColourType);
  const updateColourType = useInventoryStore((s) => s.updateColourType);
  const deleteColourType = useInventoryStore((s) => s.deleteColourType);

  const [description, setDescription] = useState("");
  const [allowedMaterialIds, setAllowedMaterialIds] = useState<string[]>([]);
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

  const materialsForColourType = (colourTypeId: string) =>
    colourTypeMaterials
      .filter((row) => row.colour_type_id === colourTypeId)
      .map((row) => row.material_type_id);

  const handleSaveType = async () => {
    const nextErrors: typeof errors = {};
    if (!description.trim()) nextErrors.description = t("common.required");
    if (allowedMaterialIds.length === 0) {
      nextErrors.materialTypeId = t("common.required");
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    try {
      if (typeEditingId) {
        await updateColourType(typeEditingId, {
          description: description.trim() || null,
          material_type_ids: allowedMaterialIds,
        });
      } else {
        const created = await createColourType({
          description: description.trim(),
          material_type_ids: allowedMaterialIds,
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
    setAllowedMaterialIds(materialsForColourType(item.colour_type_id));
    setErrors({});
  };

  const emptyForm = {
    description: "",
    allowedMaterialIds: [] as string[],
  };
  const formDirty =
    typeEditingId !== null ||
    isFormDirty({ description, allowedMaterialIds }, emptyForm);

  const handleCancelType = () => {
    setDescription("");
    setAllowedMaterialIds([]);
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
          <ChipSelect
            multiple
            wrap
            required
            label={t("colourTypes.allowedMaterials")}
            error={errors.materialTypeId}
            options={types.map((type) => ({
              value: type.material_type_id,
              label: type.description,
            }))}
            value={allowedMaterialIds}
            onChange={(value) => {
              setAllowedMaterialIds(value);
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
            dirty={formDirty}
          />
        </>
      }
      renderItem={({ item }) => (
        <EntityListItem
          title={item.description ?? String(item.colour_type_id)}
          meta={materialsForColourType(item.colour_type_id)
            .map(materialTypeLabel)
            .join(", ")}
          onEdit={() => handleEditType(item)}
          onDelete={() => handleDeleteType(item.colour_type_id)}
        />
      )}
    />
  );
}
