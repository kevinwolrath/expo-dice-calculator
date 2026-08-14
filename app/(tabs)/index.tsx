import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  View as RNView,
  ScrollView,
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
import { useTranslation } from "react-i18next";

const today = () => new Date().toISOString().slice(0, 10);

const parseStoredDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatDisplayDate = (value: string) => {
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
};

const parseDisplayDate = (value: string) => {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null;
  }

  return `${year}-${month}-${day}`;
};

export default function JobsScreen() {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<DiceJob[]>([]);
  const [methods, setMethods] = useState<ProductionMethod[]>([]);
  const stock = useInventoryStore((s) => s.stock);
  const loadStock = useInventoryStore((s) => s.loadStock);

  const [jobName, setJobName] = useState("");
  const [description, setDescription] = useState("");
  const [jobDate, setJobDate] = useState(today());
  const [jobDateInput, setJobDateInput] = useState(formatDisplayDate(today()));
  const [colourCount, setColourCount] = useState("1");
  const [methodId, setMethodId] = useState<number | null>(null);
  const [stockId, setStockId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMethodPicker, setShowMethodPicker] = useState(false);

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
    setJobDateInput(formatDisplayDate(today()));
    setColourCount("1");
    setStockId(null);
    setShowDatePicker(false);
    setShowMethodPicker(false);
  };

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (event.type !== "set" || !date) return;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    setJobDate(`${year}-${month}-${day}`);
    setJobDateInput(`${day}/${month}/${year}`);
  };

  const handleCreate = async () => {
    if (!jobName.trim() || !methodId) {
      showMessage(t("jobs.missingTitle"), t("jobs.missingMessage"));
      return;
    }
    const count = Number(colourCount);
    if (!Number.isInteger(count) || count <= 0) {
      showMessage(t("jobs.invalidCountTitle"), t("jobs.invalidCountMessage"));
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
      showMessage(t("common.error"), t("jobs.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    if (Platform.OS === "web") {
      if (
        window.confirm(`${t("jobs.deleteTitle")} - ${t("jobs.deleteMessage")}`)
      ) {
        (async () => {
          await deleteDiceJob(id);
          await loadAll();
        })();
      }
      return;
    }

    Alert.alert(t("jobs.deleteTitle"), t("jobs.deleteMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
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
    t("jobs.unknownMethod");

  const selectedMethodLabel = methodId
    ? (methods.find((method) => method.production_method_id === methodId)
        ?.description ?? t("jobs.unknownMethod"))
    : t("jobs.selectProductionMethod");

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
            <Card>
              <FormField
                label={t("jobs.jobName")}
                value={jobName}
                onChangeText={setJobName}
                placeholder={t("jobs.jobNamePlaceholder")}
              />
              <FormField
                label={t("jobs.description")}
                value={description}
                onChangeText={setDescription}
                placeholder={t("jobs.descriptionPlaceholder")}
                multiline
              />
              {Platform.OS === "web" ? (
                <FormField
                  label={t("jobs.jobDate")}
                  value={jobDateInput}
                  onChangeText={(value) => {
                    setJobDateInput(value);
                    const parsed = parseDisplayDate(value);
                    if (parsed) setJobDate(parsed);
                  }}
                  placeholder={t("jobs.jobDatePlaceholder")}
                  keyboardType="number-pad"
                />
              ) : (
                <View style={styles.dateField}>
                  <Text style={styles.dateLabel}>{t("jobs.jobDate")}</Text>
                  <Pressable
                    onPress={() => setShowDatePicker(true)}
                    style={styles.dateButton}
                  >
                    <Text>{formatDisplayDate(jobDate)}</Text>
                  </Pressable>
                  {showDatePicker ? (
                    <DateTimePicker
                      value={parseStoredDate(jobDate)}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={handleDateChange}
                    />
                  ) : null}
                </View>
              )}
              <FormField
                label={t("jobs.colourCount")}
                value={colourCount}
                onChangeText={setColourCount}
                keyboardType="number-pad"
              />
              <View style={styles.selectField}>
                <Text style={styles.selectLabel}>
                  {t("jobs.productionMethod")}
                </Text>
                {methods.length === 0 ? (
                  <Text style={styles.selectHint}>
                    {t("jobs.addProductionMethodHint")}
                  </Text>
                ) : (
                  <>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setShowMethodPicker(true)}
                      style={styles.pickerContainer}
                    >
                      <Text
                        style={[
                          styles.pickerValue,
                          !methodId && styles.pickerPlaceholder,
                        ]}
                      >
                        {selectedMethodLabel}
                      </Text>
                      <Text style={styles.pickerChevron}>⌄</Text>
                    </Pressable>
                    <Modal
                      visible={showMethodPicker}
                      transparent
                      animationType="fade"
                      onRequestClose={() => setShowMethodPicker(false)}
                    >
                      <RNView style={styles.modalBackdrop}>
                        <Pressable
                          style={StyleSheet.absoluteFill}
                          onPress={() => setShowMethodPicker(false)}
                        />
                        <RNView style={styles.optionsSheet}>
                          <Text style={styles.optionsTitle}>
                            {t("jobs.productionMethod")}
                          </Text>
                          <ScrollView>
                            {methods.map((method) => {
                              const selected =
                                method.production_method_id === methodId;
                              return (
                                <Pressable
                                  key={method.production_method_id}
                                  onPress={() => {
                                    setMethodId(method.production_method_id);
                                    setShowMethodPicker(false);
                                  }}
                                  style={[
                                    styles.option,
                                    selected && styles.selectedOption,
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.optionLabel,
                                      selected && styles.selectedOptionLabel,
                                    ]}
                                  >
                                    {method.description ??
                                      method.production_method_id.toString()}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </ScrollView>
                        </RNView>
                      </RNView>
                    </Modal>
                  </>
                )}
              </View>
              <ChipSelect
                label={t("jobs.primaryMaterial")}
                options={stock.map((s) => ({
                  value: s.material_stock_id,
                  label: s.colour_name,
                }))}
                value={stockId}
                onChange={setStockId}
                emptyHint={t("jobs.addStockHint")}
              />
              <View style={styles.actionRow}>
                <PrimaryButton
                  title={saving ? t("common.saving") : t("jobs.addJob")}
                  onPress={handleCreate}
                  disabled={saving}
                />
                <PrimaryButton
                  title={t("common.cancel")}
                  onPress={resetForm}
                  disabled={saving}
                />
              </View>
            </Card>
            <Text style={styles.sectionLabel}>
              {t("jobs.jobCount", { count: jobs.length })}
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
              {formatDisplayDate(item.job_date)} •{" "}
              {methodLabel(item.production_method_id)} •{" "}
              {t("jobs.colourCountValue", { count: item.colour_count })}
            </Text>
            {item.description ? (
              <Text style={styles.itemDescription}>{item.description}</Text>
            ) : null}
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{t("jobs.empty")}</Text>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 8 },
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
  actionRow: { flexDirection: "row", gap: 10 },
  dateField: { marginBottom: 12 },
  dateLabel: { fontSize: 13, fontWeight: "600", marginBottom: 4, opacity: 0.7 },
  dateButton: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: "#999",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectField: { marginBottom: 12 },
  selectLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
    opacity: 0.7,
  },
  selectHint: { fontSize: 13, opacity: 0.5, fontStyle: "italic" },
  pickerContainer: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: "#999",
    borderRadius: 10,
    minHeight: 48,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerValue: { fontSize: 16 },
  pickerPlaceholder: { opacity: 0.5 },
  pickerChevron: { fontSize: 22, opacity: 0.6, marginTop: -6 },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  optionsSheet: {
    maxHeight: "70%",
    borderRadius: 12,
    padding: 8,
    backgroundColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e5ea",
  },
  optionsTitle: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: "700",
  },
  option: { paddingHorizontal: 12, paddingVertical: 13, borderRadius: 8 },
  selectedOption: { backgroundColor: "#2f95dc" },
  optionLabel: { fontSize: 16 },
  selectedOptionLabel: { color: "#fff", fontWeight: "600" },
});
