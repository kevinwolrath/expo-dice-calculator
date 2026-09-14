import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Platform } from "react-native";

import * as AlertHelper from "@/components/alert";
import { usePackSurface } from "@/components/usePackSurface";
import ChipSelect from "@/components/ui/ChipSelect";
import EntityListItem from "@/components/ui/EntityListItem";
import FormActionRow, { isFormDirty } from "@/components/ui/FormActionRow";
import FormField from "@/components/ui/FormField";
import { useFormFieldRefs } from "@/components/ui/fieldFocus";
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
  const { icon } = usePackSurface();
  const [methods, setMethods] = useState<ProductionMethod[]>([]);

  const { bind, focusError } = useFormFieldRefs<
    "description" | "colourCountRange"
  >();
  const [methodDescription, setMethodDescription] = useState("");
  const [minimumColourCount, setMinimumColourCount] = useState("");
  const [maximumColourCount, setMaximumColourCount] = useState("");
  const [methodEditingId, setMethodEditingId] = useState<string | null>(null);
  const [savingMethod, setSavingMethod] = useState(false);
  const materialTypes = useInventoryStore((s) => s.types);
  const loadAll = useInventoryStore((s) => s.loadAll);
  const [allowedMaterialIds, setAllowedMaterialIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<{
    description?: string;
    colourCountRange?: string;
  }>({});
  const emptyForm = {
    methodDescription: "",
    minimumColourCount: "",
    maximumColourCount: "",
    allowedMaterialIds: [] as string[],
  };
  const currentForm = {
    methodDescription,
    minimumColourCount,
    maximumColourCount,
    allowedMaterialIds,
  };
  const [cleanForm, setCleanForm] = useState(emptyForm);
  const formDirty = isFormDirty(currentForm, cleanForm);

  const load = useCallback(async () => {
    const mRows = await listProductionMethods();
    setMethods(mRows);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        await initDatabase();
        await load();
        await loadAll();
      })();
    }, [load, loadAll]),
  );

  const handleSaveMethod = async () => {
    if (!methodDescription.trim()) {
      const nextErrors = { description: t("common.required") };
      setErrors(nextErrors);
      focusError(nextErrors, ["description", "colourCountRange"]);
      return;
    }
    const minValue = minimumColourCount.trim()
      ? Number(minimumColourCount)
      : null;
    const maxValue = maximumColourCount.trim()
      ? Number(maximumColourCount)
      : null;
    if (minValue !== null && maxValue !== null && minValue > maxValue) {
      const nextErrors = {
        colourCountRange: t("productionMethods.colourCountRangeError"),
      };
      setErrors(nextErrors);
      focusError(nextErrors, ["description", "colourCountRange"]);
      return;
    }
    setErrors({});
    setSavingMethod(true);
    try {
      let productionMethodId = methodEditingId;
      if (methodEditingId) {
        await updateProductionMethod(methodEditingId, {
          description: methodDescription.trim(),
          minimum_colour_count: minValue,
          maximum_colour_count: maxValue,
        });
      } else {
        const created = await createProductionMethod({
          description: methodDescription.trim(),
          minimum_colour_count: minValue,
          maximum_colour_count: maxValue,
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
      setCleanForm(currentForm);
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
    setMinimumColourCount(
      method.minimum_colour_count != null
        ? String(method.minimum_colour_count)
        : "",
    );
    setMaximumColourCount(
      method.maximum_colour_count != null
        ? String(method.maximum_colour_count)
        : "",
    );
    const allowed = await listAllowedMaterialsForMethod(
      method.production_method_id,
    );
    setAllowedMaterialIds(allowed.map((item) => item.material_type_id));
    setErrors({});
    setCleanForm({
      methodDescription: method.description ?? "",
      minimumColourCount:
        method.minimum_colour_count != null
          ? String(method.minimum_colour_count)
          : "",
      maximumColourCount:
        method.maximum_colour_count != null
          ? String(method.maximum_colour_count)
          : "",
      allowedMaterialIds: allowed.map((item) => item.material_type_id),
    });
  };

  const handleCancelMethod = () => {
    setMethodDescription("");
    setMinimumColourCount("");
    setMaximumColourCount("");
    setMethodEditingId(null);
    setAllowedMaterialIds([]);
    setErrors({});
    setCleanForm(emptyForm);
  };

  const handleDeleteMethod = (id: string) => {
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
            focusRef={bind("description")}
            label={t("productionMethods.description")}
            icon={icon("method")}
            required
            error={errors.description}
            value={methodDescription}
            onChangeText={(value) => {
              setMethodDescription(value);
              setErrors({});
            }}
          />
          <FormField
            focusRef={bind("colourCountRange")}
            label={t("productionMethods.minimumColourCount")}
            icon={icon("colour")}
            error={errors.colourCountRange}
            value={minimumColourCount}
            onChangeText={(value) => {
              setMinimumColourCount(value);
              setErrors({});
            }}
            keyboardType="number-pad"
          />
          <FormField
            label={t("productionMethods.maximumColourCount")}
            icon={icon("colour")}
            error={errors.colourCountRange}
            value={maximumColourCount}
            onChangeText={(value) => {
              setMaximumColourCount(value);
              setErrors({});
            }}
            keyboardType="number-pad"
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
            dirty={formDirty}
          />
        </>
      }
      renderItem={({ item }) => (
        <EntityListItem
          title={item.description ?? String(item.production_method_id)}
          meta={
            item.minimum_colour_count != null ||
            item.maximum_colour_count != null
              ? t("productionMethods.colourCountRange", {
                  min: item.minimum_colour_count ?? "?",
                  max: item.maximum_colour_count ?? "?",
                })
              : undefined
          }
          onEdit={() => handleEditMethod(item)}
          onDelete={() => handleDeleteMethod(item.production_method_id)}
        />
      )}
    />
  );
}
