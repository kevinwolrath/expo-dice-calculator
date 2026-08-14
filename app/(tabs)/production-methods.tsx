import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  View as RNView,
  StyleSheet,
} from "react-native";

import * as AlertHelper from "@/components/alert";
import { Text } from "@/components/Themed";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import PrimaryButton from "@/components/ui/PrimaryButton";
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
    if (!methodDescription.trim())
      return AlertHelper.showMessage(
        t("productionMethods.missingTitle"),
        t("productionMethods.missingMessage"),
      );
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
      setMethodDescription("");
      setMethodEditingId(null);
      setAllowedMaterialIds([]);
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

  const handleEditMethod = async (m: ProductionMethod) => {
    setMethodEditingId(m.production_method_id);
    setMethodDescription(m.description ?? "");
    const allowed = await listAllowedMaterialsForMethod(m.production_method_id);
    setAllowedMaterialIds(allowed.map((item) => item.material_type_id));
  };

  const handleCancelMethod = () => {
    setMethodDescription("");
    setMethodEditingId(null);
    setAllowedMaterialIds([]);
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
            await load();
          },
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <FlatList
        data={methods}
        keyExtractor={(i) => String(i.production_method_id)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <RNView style={{ marginBottom: 12 }}>
            <Card>
              <FormField
                label={t("productionMethods.description")}
                value={methodDescription}
                onChangeText={setMethodDescription}
              />
              <Text style={styles.materialLabel}>
                {t("productionMethods.allowedMaterials")}
              </Text>
              <RNView style={styles.materialOptions}>
                {materialTypes.length === 0 ? (
                  <Text style={styles.emptyMaterialHint}>
                    {t("misc.noOptions")}
                  </Text>
                ) : (
                  materialTypes.map((materialType) => {
                    const selected = allowedMaterialIds.includes(
                      materialType.material_type_id,
                    );
                    return (
                      <Pressable
                        key={materialType.material_type_id}
                        onPress={() =>
                          setAllowedMaterialIds((current) =>
                            selected
                              ? current.filter(
                                  (id) => id !== materialType.material_type_id,
                                )
                              : [...current, materialType.material_type_id],
                          )
                        }
                        style={[styles.chip, selected && styles.chipSelected]}
                      >
                        <Text
                          style={[
                            styles.chipLabel,
                            selected && styles.chipLabelSelected,
                          ]}
                        >
                          {materialType.description}
                        </Text>
                      </Pressable>
                    );
                  })
                )}
              </RNView>
              <RNView style={styles.actionRow}>
                <PrimaryButton
                  title={
                    savingMethod
                      ? t("common.saving")
                      : methodEditingId
                        ? t("productionMethods.save")
                        : t("productionMethods.add")
                  }
                  onPress={handleSaveMethod}
                  disabled={savingMethod}
                />
                <PrimaryButton
                  title={t("common.cancel")}
                  onPress={handleCancelMethod}
                  disabled={savingMethod}
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
                <Text style={{ fontWeight: "600" }}>{item.description}</Text>
              </RNView>
              <RNView style={{ flexDirection: "row", gap: 10 }}>
                <PrimaryButton
                  title={t("common.edit")}
                  onPress={() => handleEditMethod(item)}
                />
                <PrimaryButton
                  title={t("common.delete")}
                  variant="destructive"
                  onPress={() => handleDeleteMethod(item.production_method_id)}
                />
              </RNView>
            </RNView>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", opacity: 0.6 }}>
            {t("productionMethods.empty")}
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
  materialLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    opacity: 0.7,
  },
  materialOptions: { flexDirection: "row", flexWrap: "wrap", marginBottom: 4 },
  emptyMaterialHint: { fontSize: 13, opacity: 0.5, fontStyle: "italic" },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: "#2f95dc",
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: { backgroundColor: "#2f95dc" },
  chipLabel: { color: "#2f95dc", fontSize: 14, fontWeight: "600" },
  chipLabelSelected: { color: "#fff" },
});
