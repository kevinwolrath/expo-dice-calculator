import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

import { showMessage } from "@/components/alert";
import EntityListItem from "@/components/ui/EntityListItem";
import FormActionRow from "@/components/ui/FormActionRow";
import FormField from "@/components/ui/FormField";
import ScreenList from "@/components/ui/ScreenList";
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
  const [errors, setErrors] = useState<{ description?: string }>({});

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleSaveType = async () => {
    if (!description.trim()) {
      setErrors({ description: t("common.required") });
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
      setErrors({});
    } catch (e) {
      console.warn(e);
      showMessage(t("common.error"), t("materialTypes.saveError"));
    }
  };

  const handleEditType = (item: MaterialType) => {
    setTypeEditingId(item.material_type_id);
    setDescription(item.description ?? "");
    setErrors({});
  };

  const handleCancelType = () => {
    setDescription("");
    setTypeEditingId(null);
    setErrors({});
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
  };

  return (
    <ScreenList
      data={types}
      keyExtractor={(item) => String(item.material_type_id)}
      countLabel={t("materialTypes.typeCount", { count: types.length })}
      emptyText={t("materialTypes.empty")}
      form={
        <>
          <FormField
            label={t("materialTypes.description")}
            required
            error={errors.description}
            value={description}
            onChangeText={(value) => {
              setDescription(value);
              setErrors({});
            }}
          />
          <FormActionRow
            addTitle={t("materialTypes.add")}
            onAdd={handleCancelType}
            saveTitle={t("materialTypes.save")}
            onSave={handleSaveType}
            onCancel={handleCancelType}
            saving={loading}
          />
        </>
      }
      renderItem={({ item }) => (
        <EntityListItem
          title={item.description ?? String(item.material_type_id)}
          onEdit={() => handleEditType(item)}
          onDelete={() => handleDeleteType(item.material_type_id)}
        />
      )}
    />
  );
}
