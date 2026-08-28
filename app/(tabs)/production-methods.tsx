import { useCallback, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

import * as AlertHelper from "@/components/alert";
import ChipSelect from "@/components/ui/ChipSelect";
import EntityListItem from "@/components/ui/EntityListItem";
import FormActionRow from "@/components/ui/FormActionRow";
import FormField from "@/components/ui/FormField";
import ScreenList from "@/components/ui/ScreenList";
import {
  addAllowedMaterial,
  createProductionMethod,
  deleteProductionMethod,
  initDatabase,
  listAllowedMaterialsForMethod,
  listProductionMethods,
  removeAllowedMaterial,
  updateProductionMethod,
  type ProductionMethod,
} from "@/db";
import useInventoryStore from "@/stores/useInventoryStore";
import { useTranslation } from "react-i18next";

export default function ProductionMethodsScreen() {
  const { t } = useTranslation();
  const [methods, setMethods] = useState<ProductionMethod[]>([]);

  const [methodDescription, setMethodDescription] = useState("");
  const [methodEditingId, setMethodEditingId] = useState<number | null>(null);
  const [savingMethod, setSavingMethod] = useState(false);
  const materialTypes = useInventoryStore((s) => s.types);
  const loadAll = useInventoryStore((s) => s.loadAll);
  const [allowedMaterialIds, setAllowedMaterialIds] = useState<number[]>([]);
  const [errors, setErrors] = useState<{ description?: string }>({});

  const load = useCallback(async () => {
    const mRows = await listProductionMethods();
    setMethods(mRows);
  }, []);

  useEffect(() => {
    (async () => {
      await initDatabase();
      await load();
      await loadAll();
    })();
  }, [load, loadAll]);

  const handleSaveMethod = async () => {
    if (!methodDescription.trim()) {
      setErrors({ description: t("common.required") });
      return;
    }
    setErrors({});
    setSavingMethod(true);
    try {
      let productionMethodId = methodEditingId;
      if (methodEditingId) {
        await updateProductionMethod(methodEditingId, {
          description: methodDescription.trim(),
        });
      } else {
        const created = await createProductionMethod({
          description: methodDescription.trim(),
        });
        productionMethodId = created.production_method_id;
      }

      if (productionMethodId) {
        const currentAllowed =
          await listAllowedMaterialsForMethod(productionMethodId);
        const currentIds = currentAllowed.map((item) => item.material_type_id);
        await Promise.all([
          ...currentIds
            .filter((id) => !allowedMaterialIds.includes(id))
            .map((id) => removeAllowedMaterial(productionMethodId!, id)),
          ...allowedMaterialIds
            .filter((id) => !currentIds.includes(id))
            .map((id) => addAllowedMaterial(productionMethodId!, id)),
        ]);
      }
      setMethodEditingId(productionMethodId);
      setErrors({});
      await load();
    } catch (e) {
      console.warn(e);
      AlertHelper.showMessage(
        t("common.error"),
        t("productionMethods.saveError"),
      );
    } finally {
      setSavingMethod(false);
    }
  };

  const handleEditMethod = async (method: ProductionMethod) => {
    setMethodEditingId(method.production_method_id);
    setMethodDescription(method.description ?? "");
    const allowed = await listAllowedMaterialsForMethod(
      method.production_method_id,
    );
    setAllowedMaterialIds(allowed.map((item) => item.material_type_id));
    setErrors({});
  };

  const handleCancelMethod = () => {
    setMethodDescription("");
    setMethodEditingId(null);
    setAllowedMaterialIds([]);
    setErrors({});
  };

  const handleDeleteMethod = (id: number) => {
    if (Platform.OS === "web") {
      if (
        window.confirm(
          `${t("productionMethods.deleteTitle")} - ${t("productionMethods.deleteMessage")}`,
        )
      ) {
        (async () => {
          await deleteProductionMethod(id);
          if (methodEditingId === id) handleCancelMethod();
          await load();
        })();
      }
      return;
    }

    Alert.alert(
      t("productionMethods.deleteTitle"),
      t("productionMethods.deleteMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            await deleteProductionMethod(id);
            if (methodEditingId === id) handleCancelMethod();
            await load();
          },
        },
      ],
    );
  };

  return (
    <ScreenList
      data={methods}
      keyExtractor={(item) => String(item.production_method_id)}
      countLabel={t("productionMethods.methodCount", { count: methods.length })}
      emptyText={t("productionMethods.empty")}
      form={
        <>
          <FormField
            label={t("productionMethods.description")}
            required
            error={errors.description}
            value={methodDescription}
            onChangeText={(value) => {
              setMethodDescription(value);
              setErrors({});
            }}
          />
          <ChipSelect
            multiple
            wrap
            label={t("productionMethods.allowedMaterials")}
            options={materialTypes.map((materialType) => ({
              value: materialType.material_type_id,
              label:
                materialType.description ??
                String(materialType.material_type_id),
            }))}
            value={allowedMaterialIds}
            onChange={setAllowedMaterialIds}
          />
          <FormActionRow
            addTitle={t("productionMethods.add")}
            onAdd={handleCancelMethod}
            saveTitle={t("productionMethods.save")}
            onSave={handleSaveMethod}
            onCancel={handleCancelMethod}
            saving={savingMethod}
          />
        </>
      }
      renderItem={({ item }) => (
        <EntityListItem
          title={item.description ?? String(item.production_method_id)}
          onEdit={() => handleEditMethod(item)}
          onDelete={() => handleDeleteMethod(item.production_method_id)}
        />
      )}
    />
  );
}
