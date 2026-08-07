import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  View as RNView,
  StyleSheet,
} from "react-native";

import { showMessage } from "@/components/alert";
import { Text } from "@/components/Themed";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import PrimaryButton from "@/components/ui/PrimaryButton";
import type { MaterialType } from "@/db";
import useInventoryStore from "@/stores/useInventoryStore";

export default function MaterialTypesScreen() {
  const types = useInventoryStore((s) => s.types);
  const loading = useInventoryStore((s) => s.loading);
  const loadAll = useInventoryStore((s) => s.loadAll);
  const createType = useInventoryStore((s) => s.createType);
  const updateType = useInventoryStore((s) => s.updateType);
  const deleteType = useInventoryStore((s) => s.deleteType);

  const [description, setDescription] = useState("");
  const [typeEditingId, setTypeEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleSaveType = async () => {
    if (!description.trim())
      return showMessage("Missing", "Type description is required");
    try {
      if (typeEditingId) {
        await updateType(typeEditingId, {
          description: description.trim() || null,
        });
      } else {
        await createType({ description: description.trim() });
      }
      setDescription("");
      setTypeEditingId(null);
    } catch (e) {
      console.warn(e);
      showMessage("Error", "Could not save material type.");
    }
  };

  const handleEditType = (t: MaterialType) => {
    setTypeEditingId(t.material_type_id);
    setDescription(t.description ?? "");
  };

  const handleDeleteType = (id: number) => {
    if (Platform.OS === "web") {
      if (window.confirm("Delete type - are you sure?")) {
        (async () => {
          await deleteType(id);
          await loadAll();
        })();
      }
      return;
    }

    Alert.alert("Delete type", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteType(id);
          await loadAll();
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
        data={types}
        keyExtractor={(i) => String(i.material_type_id)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <RNView style={{ marginBottom: 12 }}>
            <Text style={styles.title}>Material Types</Text>
            <Card>
              <FormField
                label="Description"
                value={description}
                onChangeText={setDescription}
              />
              <PrimaryButton
                title={
                  loading
                    ? "Saving..."
                    : typeEditingId
                      ? "Save type"
                      : "Add type"
                }
                onPress={handleSaveType}
                disabled={loading}
              />
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
                  title="Edit"
                  onPress={() => handleEditType(item)}
                />
                <PrimaryButton
                  title="Delete"
                  variant="destructive"
                  onPress={() => handleDeleteType(item.material_type_id)}
                />
              </RNView>
            </RNView>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", opacity: 0.6 }}>
            No types yet.
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
});
