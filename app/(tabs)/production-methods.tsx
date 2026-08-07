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

export default function ProductionMethodsScreen() {
  const [methods, setMethods] = useState<ProductionMethod[]>([]);

  const [methodDescription, setMethodDescription] = useState("");
  const [methodEditingId, setMethodEditingId] = useState<number | null>(null);
  const [savingMethod, setSavingMethod] = useState(false);
  const materialTypes = useInventoryStore((s) => s.types);
  const loadAll = useInventoryStore((s) => s.loadAll);
  const [managingMethodId, setManagingMethodId] = useState<number | null>(null);
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

  useEffect(() => {
    if (!managingMethodId) return;
    (async () => {
      const allowed = await listAllowedMaterialsForMethod(managingMethodId);
      setAllowedMaterialIds(allowed.map((a) => a.material_type_id));
    })();
  }, [managingMethodId]);

  const handleSaveMethod = async () => {
    if (!methodDescription.trim())
      return AlertHelper.showMessage(
        "Missing",
        "Method description is required",
      );
    setSavingMethod(true);
    try {
      if (methodEditingId) {
        await updateProductionMethod(methodEditingId, {
          description: methodDescription.trim(),
        });
      } else {
        await createProductionMethod({ description: methodDescription.trim() });
      }
      setMethodDescription("");
      setMethodEditingId(null);
      await load();
    } catch (e) {
      console.warn(e);
      AlertHelper.showMessage("Error", "Could not save production method.");
    } finally {
      setSavingMethod(false);
    }
  };

  const handleEditMethod = (m: ProductionMethod) => {
    setMethodEditingId(m.production_method_id);
    setMethodDescription(m.description ?? "");
  };

  const handleManageMaterials = (m: ProductionMethod) => {
    setManagingMethodId(m.production_method_id);
  };

  const toggleAllowed = async (materialTypeId: number) => {
    if (!managingMethodId) return;
    const isAllowed = allowedMaterialIds.includes(materialTypeId);
    if (isAllowed) {
      await removeAllowedMaterial(managingMethodId, materialTypeId);
      setAllowedMaterialIds((s) => s.filter((id) => id !== materialTypeId));
    } else {
      await addAllowedMaterial(managingMethodId, materialTypeId);
      setAllowedMaterialIds((s) => [...s, materialTypeId]);
    }
  };

  const handleDeleteMethod = (id: number) => {
    if (Platform.OS === "web") {
      if (window.confirm("Delete method - are you sure?")) {
        (async () => {
          await deleteProductionMethod(id);
          await load();
        })();
      }
      return;
    }

    Alert.alert("Delete method", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteProductionMethod(id);
          await load();
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
        data={methods}
        keyExtractor={(i) => String(i.production_method_id)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <RNView style={{ marginBottom: 12 }}>
            <Text style={styles.title}>Production Methods</Text>
            <Card>
              <FormField
                label="Description"
                value={methodDescription}
                onChangeText={setMethodDescription}
              />
              <PrimaryButton
                title={
                  savingMethod
                    ? "Saving..."
                    : methodEditingId
                      ? "Save method"
                      : "Add method"
                }
                onPress={handleSaveMethod}
                disabled={savingMethod}
              />
            </Card>
            {managingMethodId ? (
              <Card>
                <Text style={{ fontWeight: "700" }}>
                  Allowed material types
                </Text>
                <RNView
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    marginTop: 8,
                  }}
                >
                  {materialTypes.map((t) => {
                    const selected = allowedMaterialIds.includes(
                      t.material_type_id,
                    );
                    return (
                      <Pressable
                        key={t.material_type_id}
                        onPress={() => toggleAllowed(t.material_type_id)}
                        style={[styles.chip, selected && styles.chipSelected]}
                      >
                        <Text
                          style={[
                            styles.chipLabel,
                            selected && styles.chipLabelSelected,
                          ]}
                        >
                          {t.description}
                        </Text>
                      </Pressable>
                    );
                  })}
                </RNView>
                <PrimaryButton
                  title="Done"
                  onPress={() => setManagingMethodId(null)}
                />
              </Card>
            ) : null}
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
                  title="Edit"
                  onPress={() => handleEditMethod(item)}
                />
                <PrimaryButton
                  title="Materials"
                  onPress={() => handleManageMaterials(item)}
                />
                <PrimaryButton
                  title="Delete"
                  variant="destructive"
                  onPress={() => handleDeleteMethod(item.production_method_id)}
                />
              </RNView>
            </RNView>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", opacity: 0.6 }}>
            No methods yet.
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
