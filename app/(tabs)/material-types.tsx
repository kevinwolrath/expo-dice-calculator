import { useCallback, useEffect, useState } from "react";
import { Alert, Platform, type ListRenderItem } from "react-native";

import { showMessage } from "@/components/alert";
import { usePackSurface } from "@/components/usePackSurface";
import EntityListItem from "@/components/ui/EntityListItem";
import FormActions from "@/components/ui/FormActions";
import { isFormDirty } from "@/components/ui/formDirty";
import FormField from "@/components/ui/FormField";
import { useFormFieldRefs } from "@/components/ui/fieldFocus";
import ScreenList from "@/components/ui/ScreenList";
import type { MaterialType } from "@/db";
import useInventoryStore from "@/stores/useInventoryStore";
import { useTranslation } from "react-i18next";

export default function MaterialTypesScreen() {
  const { t } = useTranslation();
  const { icon } = usePackSurface();
  const types = useInventoryStore((s) => s.types);
  const loading = useInventoryStore((s) => s.loading);
  const loadAll = useInventoryStore((s) => s.loadAll);
  const createType = useInventoryStore((s) => s.createType);
  const updateType = useInventoryStore((s) => s.updateType);
  const deleteType = useInventoryStore((s) => s.deleteType);

  const { bind, focusError } = useFormFieldRefs<"description">();
  const [description, setDescription] = useState("");
  const [typeEditingId, setTypeEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ description?: string }>({});
  const emptyForm = { description: "" };
  const [cleanForm, setCleanForm] = useState(emptyForm);
  const formDirty = isFormDirty({ description }, cleanForm);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleSaveType = async () => {
    if (!description.trim()) {
      const nextErrors = { description: t("common.required") };
      setErrors(nextErrors);
      focusError(nextErrors, ["description"]);
      return;
    }
    setErrors({});
    try {
      if (typeEditingId) {
        await updateType(typeEditingId, {
          description: description.trim() || null,
        });
      } else {
        const created = await createType({ description: description.trim() });
        setTypeEditingId(created.material_type_id);
      }
      setCleanForm({ description });
      setErrors({});
    } catch (e) {
      console.warn(e);
      showMessage(t("common.error"), t("materialTypes.saveError"));
    }
  };

  const applyEditType = (item: MaterialType) => {
    setTypeEditingId(item.material_type_id);
    setDescription(item.description ?? "");
    setErrors({});
    setCleanForm({ description: item.description ?? "" });
  };

  const handleEditType = useCallback(
    (id: string) => {
      const item = types.find((row) => row.material_type_id === id);
      if (item) applyEditType(item);
    },
    [types],
  );

  const handleCancelType = () => {
    setDescription("");
    setTypeEditingId(null);
    setErrors({});
    setCleanForm(emptyForm);
  };

  const handleDeleteType = useCallback(
    (id: string) => {
      if (Platform.OS === "web") {
        if (
          window.confirm(
            `${t("materialTypes.deleteTitle")} - ${t("materialTypes.deleteMessage")}`,
          )
        ) {
          (async () => {
            await deleteType(id);
            if (typeEditingId === id) handleCancelType();
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
              if (typeEditingId === id) handleCancelType();
              await loadAll();
            },
          },
        ],
      );
    },
    [t, typeEditingId, deleteType, loadAll],
  );

  const renderItem: ListRenderItem<MaterialType> = useCallback(
    ({ item }) => (
      <EntityListItem
        id={item.material_type_id}
        title={item.description ?? String(item.material_type_id)}
        onEdit={handleEditType}
        onDelete={handleDeleteType}
      />
    ),
    [handleEditType, handleDeleteType],
  );

  return (
    <ScreenList
      data={types}
      keyExtractor={(item) => String(item.material_type_id)}
      countLabel={t("materialTypes.typeCount", { count: types.length })}
      emptyText={t("materialTypes.empty")}
      form={
        <>
          <FormField
            focusRef={bind("description")}
            label={t("materialTypes.description")}
            icon={icon("material")}
            required
            error={errors.description}
            value={description}
            onChangeText={(value) => {
              setDescription(value);
              setErrors({});
            }}
          />
          <FormActions
            onAdd={handleCancelType}
            onSave={handleSaveType}
            onCancel={handleCancelType}
            saving={loading}
            dirty={formDirty}
          />
        </>
      }
      renderItem={renderItem}
    />
  );
}
