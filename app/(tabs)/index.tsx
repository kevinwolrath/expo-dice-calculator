import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
} from "react-native";

import { showMessage } from "@/components/alert";
import { Text, View } from "@/components/Themed";
import Card from "@/components/ui/Card";
import ChipSelect from "@/components/ui/ChipSelect";
import FormField from "@/components/ui/FormField";
import PrimaryButton from "@/components/ui/PrimaryButton";
import type { MaterialStock } from "@/db";
import {
    createDiceJob,
    deleteDiceJob,
    initDatabase,
    listDiceJobs,
    listProductionMethods,
    type DiceJob,
    type ProductionMethod,
} from "@/db";
import useInventoryStore from "@/stores/useInventoryStore";

const today = () => new Date().toISOString().slice(0, 10);

export default function JobsScreen() {
  const [jobs, setJobs] = useState<DiceJob[]>([]);
  const [methods, setMethods] = useState<ProductionMethod[]>([]);
  const stock = useInventoryStore((s) => s.stock);
  const loadStock = useInventoryStore((s) => s.loadStock);

  const [jobName, setJobName] = useState("");
  const [description, setDescription] = useState("");
  const [jobDate, setJobDate] = useState(today());
  const [colourCount, setColourCount] = useState("1");
  const [methodId, setMethodId] = useState<number | null>(null);
  const [stockId, setStockId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const loadAll = useCallback(async () => {
    const [jobRows, methodRows, stockRows] = await Promise.all([
      listDiceJobs(),
      listProductionMethods(),
      // material stock is managed by the inventory store
      (async () => {
        await loadStock();
        return [] as MaterialStock[];
      })(),
    ]);
    setJobs(jobRows);
    setMethods(methodRows);
    // stock is read from the inventory store
    // keep methodId defaulting logic
    setMethodId(
      (current) => current ?? methodRows[0]?.production_method_id ?? null,
    );
  }, [loadStock]);

  useEffect(() => {
    (async () => {
      try {
        await initDatabase();
        await loadAll();
      } catch (e) {
        console.warn("Failed to initialise jobs screen", e);
      }
    })();
  }, [loadAll]);

  const resetForm = () => {
    setJobName("");
    setDescription("");
    setJobDate(today());
    setColourCount("1");
    setStockId(null);
  };

  const handleCreate = async () => {
    if (!jobName.trim() || !methodId) {
      showMessage(
        "Missing info",
        "Job name and production method are required.",
      );
      return;
    }
    const count = Number(colourCount);
    if (!Number.isInteger(count) || count <= 0) {
      showMessage(
        "Invalid colour count",
        "Colour count must be a positive whole number.",
      );
      return;
    }
    setSaving(true);
    try {
      await createDiceJob({
        job_name: jobName.trim(),
        description: description.trim() || null,
        job_date: jobDate,
        colour_count: count,
        production_method_id: methodId,
        primary_material_stock_id: stockId,
      });
      resetForm();
      await loadAll();
    } catch (e) {
      console.warn("Failed to create job", e);
      showMessage("Error", "Could not save the job.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    if (Platform.OS === "web") {
      if (
        window.confirm("Delete job - are you sure you want to delete this job?")
      ) {
        (async () => {
          await deleteDiceJob(id);
          await loadAll();
        })();
      }
      return;
    }

    Alert.alert("Delete job", "Are you sure you want to delete this job?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDiceJob(id);
          await loadAll();
        },
      },
    ]);
  };

  const methodLabel = (id: number) =>
    methods.find((m) => m.production_method_id === id)?.description ??
    "Unknown";

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <FlatList
        data={jobs}
        keyExtractor={(item) => String(item.dice_job_id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Dice Jobs</Text>
            <Card>
              <FormField
                label="Job name"
                value={jobName}
                onChangeText={setJobName}
                placeholder="e.g. Red/Blue Swirl Batch"
              />
              <FormField
                label="Description"
                value={description}
                onChangeText={setDescription}
                placeholder="Optional notes"
                multiline
              />
              <FormField
                label="Job date (YYYY-MM-DD)"
                value={jobDate}
                onChangeText={setJobDate}
              />
              <FormField
                label="Colour count"
                value={colourCount}
                onChangeText={setColourCount}
                keyboardType="number-pad"
              />
              <ChipSelect
                label="Production method"
                options={methods.map((m) => ({
                  value: m.production_method_id,
                  label: m.description ?? m.production_method_id.toString(),
                }))}
                value={methodId}
                onChange={setMethodId}
                emptyHint="Add a production method in Setup first"
              />
              <ChipSelect
                label="Primary material (optional)"
                options={stock.map((s) => ({
                  value: s.material_stock_id,
                  label: s.colour_name,
                }))}
                value={stockId}
                onChange={setStockId}
                emptyHint="Add material stock in the Stock tab first"
              />
              <PrimaryButton
                title={saving ? "Saving..." : "Add job"}
                onPress={handleCreate}
                disabled={saving}
              />
            </Card>
            <Text style={styles.sectionLabel}>
              {jobs.length} job{jobs.length === 1 ? "" : "s"}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card>
            <View style={styles.rowBetween}>
              <Text style={styles.itemTitle}>{item.job_name}</Text>
              <Pressable
                onPress={() => handleDelete(item.dice_job_id)}
                hitSlop={8}
              >
                <SymbolView
                  name={{ ios: "trash", android: "delete", web: "delete" }}
                  size={20}
                  tintColor="#d9534f"
                />
              </Pressable>
            </View>
            <Text style={styles.itemMeta}>
              {item.job_date} • {methodLabel(item.production_method_id)} •{" "}
              {item.colour_count} colour{item.colour_count === 1 ? "" : "s"}
            </Text>
            {item.description ? (
              <Text style={styles.itemDescription}>{item.description}</Text>
            ) : null}
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No jobs yet. Add your first one above.
          </Text>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 8 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 12 },
  sectionLabel: { fontSize: 13, opacity: 0.6, marginBottom: 8 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    flexShrink: 1,
    paddingRight: 12,
  },
  itemMeta: { fontSize: 13, opacity: 0.6, marginTop: 4 },
  itemDescription: { fontSize: 14, marginTop: 6 },
  emptyText: { textAlign: "center", opacity: 0.6, marginTop: 24 },
});
