import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  View as RNView,
  ScrollView,
  StyleSheet,
} from "react-native";

import { confirm, showMessage } from "@/components/alert";
import { Text, View, useThemeColors } from "@/components/Themed";
import EntityListItem from "@/components/ui/EntityListItem";
import FieldError from "@/components/ui/FieldError";
import FieldLabel from "@/components/ui/FieldLabel";
import FormActionRow from "@/components/ui/FormActionRow";
import FormField from "@/components/ui/FormField";
import PrimaryButton from "@/components/ui/PrimaryButton";
import ScreenList from "@/components/ui/ScreenList";
import SelectDropdown from "@/components/ui/SelectDropdown";
import {
  FontSize,
  Radius,
  Space,
  Stroke,
  Touch,
  Type,
} from "@/constants/theme";
import {
  createDiceJob,
  deleteDiceJob,
  initDatabase,
  listAllAllowedMaterials,
  listAllDiceJobColours,
  listAllowedMaterialsForMethod,
  listDiceJobColours,
  listDiceJobNumberColours,
  listDiceJobs,
  listProductionMethods,
  pickRandomCompatibleMethodId,
  pickRandomDistinctStock,
  replaceDiceJobColours,
  updateDiceJob,
  type DiceJob,
  type DiceJobColour,
  type DiceJobNumberColour,
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
  const colors = useThemeColors();
  const [jobs, setJobs] = useState<DiceJob[]>([]);
  const [methods, setMethods] = useState<ProductionMethod[]>([]);
  const [numberColours, setNumberColours] = useState<DiceJobNumberColour[]>([]);
  const stock = useInventoryStore((s) => s.stock);
  const loadStock = useInventoryStore((s) => s.loadStock);

  const [jobName, setJobName] = useState("");
  const [description, setDescription] = useState("");
  const [jobDate, setJobDate] = useState(today());
  const [jobDateInput, setJobDateInput] = useState(formatDisplayDate(today()));
  const [colourCount, setColourCount] = useState("");
  const [jobColourStockIds, setJobColourStockIds] = useState<number[]>([]);
  const [allJobColours, setAllJobColours] = useState<DiceJobColour[]>([]);
  const [methodId, setMethodId] = useState<number | null>(null);
  const [allowedTypeIds, setAllowedTypeIds] = useState<number[] | null>(null);
  const [numberColourId, setNumberColourId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showJobColourPicker, setShowJobColourPicker] = useState(false);
  const [editingColourIndex, setEditingColourIndex] = useState<number | null>(
    null,
  );
  const [errors, setErrors] = useState<{
    jobName?: string;
    jobDate?: string;
    colourCount?: string;
    methodId?: string;
    numberColourId?: string;
  }>({});

  const loadAll = useCallback(async () => {
    const [jobRows, methodRows, numberColourRows, colourRows] =
      await Promise.all([
        listDiceJobs(),
        listProductionMethods(),
        listDiceJobNumberColours(),
        listAllDiceJobColours(),
        loadStock(),
      ]);
    setJobs(jobRows);
    setMethods(methodRows);
    setNumberColours(numberColourRows);
    setAllJobColours(colourRows);
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

  useEffect(() => {
    let cancelled = false;
    if (!methodId) {
      setAllowedTypeIds(null);
      return;
    }
    void listAllowedMaterialsForMethod(methodId).then((rows) => {
      if (!cancelled) {
        setAllowedTypeIds(rows.map((row) => row.material_type_id));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [methodId]);

  const resetForm = () => {
    setJobName("");
    setDescription("");
    setJobDate(today());
    setJobDateInput(formatDisplayDate(today()));
    setColourCount("");
    setJobColourStockIds([]);
    setMethodId(null);
    setNumberColourId(null);
    setEditingId(null);
    setShowDatePicker(false);
    setShowJobColourPicker(false);
    setEditingColourIndex(null);
    setErrors({});
  };

  const handleEdit = (job: DiceJob) => {
    setEditingId(job.dice_job_id);
    setJobName(job.job_name);
    setDescription(job.description ?? "");
    setJobDate(job.job_date);
    setJobDateInput(formatDisplayDate(job.job_date));
    setColourCount(String(job.colour_count));
    setMethodId(job.production_method_id);
    setNumberColourId(job.dice_job_number_colour_id);
    setErrors({});
    void listDiceJobColours(job.dice_job_id).then((colours) => {
      setJobColourStockIds(colours.map((colour) => colour.material_stock_id));
    });
  };

  const parseColourCount = (value = colourCount) => {
    const count = Number(value);
    if (!Number.isInteger(count) || count <= 0) return null;
    return count;
  };

  const confirmRegenerate = (message: string) =>
    confirm(t("jobs.regenerateColoursTitle"), message, {
      confirm: t("common.yes"),
      cancel: t("common.no"),
    });

  const handleGenerateColours = async (options?: {
    replace?: boolean;
    count?: number;
    methodId?: number | null;
  }) => {
    const count = options?.count ?? parseColourCount();
    if (count === null) {
      setErrors((current) => ({
        ...current,
        colourCount: t("jobs.invalidCountMessage"),
      }));
      return;
    }

    const existingIds = options?.replace ? [] : jobColourStockIds;
    if (!options?.replace && existingIds.length > count) {
      const shouldRegenerate = await confirmRegenerate(
        t("jobs.regenerateColoursOnCount"),
      );
      if (!shouldRegenerate) return;
      await handleGenerateColours({ ...options, replace: true, count });
      return;
    }
    const missing = count - existingIds.length;
    if (missing <= 0) {
      showMessage(t("jobs.invalidCountTitle"), t("jobs.coloursAlreadyFilled"));
      return;
    }

    if (methods.length === 0) {
      showMessage(t("common.error"), t("jobs.noProductionMethods"));
      return;
    }

    const allowedRows = await listAllAllowedMaterials();
    const allowedByMethodId = new Map<number, number[]>();
    for (const row of allowedRows) {
      const current = allowedByMethodId.get(row.production_method_id) ?? [];
      current.push(row.material_type_id);
      allowedByMethodId.set(row.production_method_id, current);
    }

    let selectedMethodId =
      options?.methodId !== undefined ? options.methodId : methodId;
    if (!selectedMethodId) {
      selectedMethodId = pickRandomCompatibleMethodId(
        methods.map((method) => method.production_method_id),
        allowedByMethodId,
        stock,
        existingIds,
        missing,
      );
      if (!selectedMethodId) {
        showMessage(t("common.error"), t("jobs.noCompatibleStock"));
        return;
      }
      setMethodId(selectedMethodId);
      setErrors((current) => ({ ...current, methodId: undefined }));
    }

    const allowedTypeIdsForMethod =
      allowedByMethodId.get(selectedMethodId) ??
      (await listAllowedMaterialsForMethod(selectedMethodId)).map(
        (row) => row.material_type_id,
      );

    if (allowedTypeIdsForMethod.length === 0) {
      showMessage(t("common.error"), t("jobs.noCompatibleStock"));
      return;
    }

    const compatibleExistingIds = existingIds.filter((id) => {
      const item = stock.find((row) => row.material_stock_id === id);
      return item
        ? allowedTypeIdsForMethod.includes(item.material_type_id)
        : false;
    });
    if (compatibleExistingIds.length !== existingIds.length) {
      setJobColourStockIds(compatibleExistingIds);
    }

    const remaining = count - compatibleExistingIds.length;
    if (remaining <= 0) {
      showMessage(t("jobs.invalidCountTitle"), t("jobs.coloursAlreadyFilled"));
      return;
    }

    const picked = pickRandomDistinctStock(
      stock,
      remaining,
      allowedTypeIdsForMethod,
      compatibleExistingIds,
    );
    if (picked.length === 0) {
      showMessage(t("common.error"), t("jobs.noCompatibleStock"));
      return;
    }

    const nextIds = [
      ...compatibleExistingIds,
      ...picked.map((item) => item.material_stock_id),
    ];
    setJobColourStockIds(nextIds);
    setErrors((current) => ({ ...current, colourCount: undefined }));
    if (nextIds.length < count) {
      showMessage(
        t("jobs.invalidCountTitle"),
        t("jobs.notEnoughColours", {
          count,
          available: nextIds.length,
        }),
      );
    }
  };

  const handleColourCountBlur = async () => {
    const count = parseColourCount();
    if (count === null || jobColourStockIds.length === 0) return;
    if (count >= jobColourStockIds.length) return;

    const shouldRegenerate = await confirmRegenerate(
      t("jobs.regenerateColoursOnCount"),
    );
    if (!shouldRegenerate) return;
    await handleGenerateColours({ replace: true, count });
  };

  const handleProductionMethodChange = async (value: number) => {
    if (value === methodId) return;
    setMethodId(value);
    setErrors((current) => ({ ...current, methodId: undefined }));

    if (jobColourStockIds.length === 0) return;

    const shouldRegenerate = await confirmRegenerate(
      t("jobs.regenerateColoursOnMethod"),
    );
    if (!shouldRegenerate) return;
    await handleGenerateColours({ replace: true, methodId: value });
  };

  const applyJobColourStockIds = (ids: number[]) => {
    setJobColourStockIds(ids);
  };

  const handleEditJobColour = (index: number) => {
    setEditingColourIndex(index);
    setShowJobColourPicker(true);
  };

  const handleSelectJobColour = (materialStockId: number) => {
    if (editingColourIndex === null) return;
    applyJobColourStockIds(
      jobColourStockIds.map((id, index) =>
        index === editingColourIndex ? materialStockId : id,
      ),
    );
    setShowJobColourPicker(false);
    setEditingColourIndex(null);
  };

  const handleDeleteJobColour = async (index: number) => {
    const confirmed = await confirm(
      t("jobs.deleteColourTitle"),
      t("jobs.deleteColourMessage"),
    );
    if (!confirmed) return;
    applyJobColourStockIds(
      jobColourStockIds.filter((_, colourIndex) => colourIndex !== index),
    );
  };

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (event.type !== "set" || !date) return;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    setJobDate(`${year}-${month}-${day}`);
    setJobDateInput(`${day}/${month}/${year}`);
    setErrors((current) => ({ ...current, jobDate: undefined }));
  };

  const handleCreate = async () => {
    const nextErrors: typeof errors = {};
    if (!jobName.trim()) nextErrors.jobName = t("common.required");
    if (Platform.OS === "web") {
      if (!parseDisplayDate(jobDateInput)) {
        nextErrors.jobDate = t("jobs.invalidDate");
      }
    } else if (!jobDate) {
      nextErrors.jobDate = t("common.required");
    }
    const count = parseColourCount();
    if (count === null) {
      nextErrors.colourCount = t("jobs.invalidCountMessage");
    } else if (jobColourStockIds.length !== count) {
      nextErrors.colourCount = t("jobs.generateColoursRequired");
    }
    if (!methodId) nextErrors.methodId = t("common.required");
    if (!numberColourId) nextErrors.numberColourId = t("common.required");
    setErrors(nextErrors);
    if (
      Object.keys(nextErrors).length > 0 ||
      !methodId ||
      !numberColourId ||
      count === null
    ) {
      return;
    }

    setSaving(true);
    try {
      const payload = {
        job_name: jobName.trim(),
        description: description.trim() || null,
        job_date: jobDate,
        colour_count: count,
        production_method_id: methodId,
        dice_job_number_colour_id: numberColourId,
      };
      let jobId: number;
      if (editingId) {
        await updateDiceJob(editingId, payload);
        jobId = editingId;
      } else {
        jobId = (await createDiceJob(payload)).dice_job_id;
      }
      await replaceDiceJobColours(jobId, jobColourStockIds);
      resetForm();
      await loadAll();
    } catch (e) {
      console.warn("Failed to save job", e);
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

  const numberColourLabel = (id: number) =>
    numberColours.find((c) => c.dice_job_number_colour_id === id)
      ?.dice_job_number_colour_name ?? t("jobs.unknownNumberColour");

  const stockColourLabel = (id: number) =>
    stock.find((item) => item.material_stock_id === id)?.colour_name ??
    t("jobs.unknownNumberColour");

  const coloursForJob = (jobId: number) =>
    allJobColours
      .filter((colour) => colour.dice_job_id === jobId)
      .map((colour) => stockColourLabel(colour.material_stock_id));

  const usedJobColourIds = new Set(
    jobColourStockIds.filter((_, index) => index !== editingColourIndex),
  );
  const replacementStock = stock.filter((item) => {
    if (item.is_active === 0 || usedJobColourIds.has(item.material_stock_id)) {
      return false;
    }
    if (allowedTypeIds === null) return true;
    return allowedTypeIds.includes(item.material_type_id);
  });

  const canGenerate = parseColourCount() !== null;

  return (
    <ScreenList
      data={jobs}
      keyExtractor={(item) => String(item.dice_job_id)}
      countLabel={t("jobs.jobCount", { count: jobs.length })}
      emptyText={t("jobs.empty")}
      form={
        <>
          <FormField
            label={t("jobs.jobName")}
            required
            error={errors.jobName}
            value={jobName}
            onChangeText={(value) => {
              setJobName(value);
              setErrors((current) => ({ ...current, jobName: undefined }));
            }}
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
              required
              error={errors.jobDate}
              value={jobDateInput}
              onChangeText={(value) => {
                setJobDateInput(value);
                const parsed = parseDisplayDate(value);
                if (parsed) setJobDate(parsed);
                setErrors((current) => ({ ...current, jobDate: undefined }));
              }}
              placeholder={t("jobs.jobDatePlaceholder")}
              keyboardType="number-pad"
            />
          ) : (
            <View style={styles.dateField}>
              <FieldLabel label={t("jobs.jobDate")} required />
              <Pressable
                onPress={() => setShowDatePicker(true)}
                style={[
                  styles.dateButton,
                  {
                    borderColor: errors.jobDate
                      ? colors.destructive
                      : colors.inputBorder,
                  },
                ]}
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
              <FieldError message={errors.jobDate} />
            </View>
          )}
          <View style={styles.colourCountBlock}>
            <FormField
              label={t("jobs.colourCount")}
              required
              error={errors.colourCount}
              value={colourCount}
              onChangeText={(value) => {
                setColourCount(value);
                setErrors((current) => ({
                  ...current,
                  colourCount: undefined,
                }));
              }}
              onBlur={() => {
                void handleColourCountBlur();
              }}
              keyboardType="number-pad"
            />
            <PrimaryButton
              title={t("jobs.generate")}
              disabled={!canGenerate}
              onPress={() => {
                void handleGenerateColours();
              }}
            />
            <SelectDropdown
              label={t("jobs.productionMethod")}
              placeholder={t("jobs.selectProductionMethod")}
              required
              error={errors.methodId}
              value={methodId}
              options={methods.map((method) => ({
                value: method.production_method_id,
                label:
                  method.description ?? method.production_method_id.toString(),
              }))}
              onChange={(value) => {
                void handleProductionMethodChange(value);
              }}
              emptyHint={t("jobs.addProductionMethodHint")}
            />
            {jobColourStockIds.length > 0 ? (
              <View style={styles.generatedColours}>
                <FieldLabel label={t("jobs.generatedColours")} />
                {jobColourStockIds.map((id, index) => (
                  <EntityListItem
                    key={`${id}-${index}`}
                    title={`${index + 1}. ${stockColourLabel(id)}`}
                    onEdit={() => handleEditJobColour(index)}
                    onDelete={() => {
                      void handleDeleteJobColour(index);
                    }}
                  />
                ))}
                <Modal
                  visible={showJobColourPicker}
                  transparent
                  animationType="fade"
                  onRequestClose={() => {
                    setShowJobColourPicker(false);
                    setEditingColourIndex(null);
                  }}
                >
                  <RNView
                    style={[
                      styles.modalBackdrop,
                      { backgroundColor: colors.overlay },
                    ]}
                  >
                    <Pressable
                      style={StyleSheet.absoluteFill}
                      onPress={() => {
                        setShowJobColourPicker(false);
                        setEditingColourIndex(null);
                      }}
                    />
                    <RNView
                      style={[
                        styles.optionsSheet,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[styles.optionsTitle, { color: colors.text }]}
                      >
                        {t("jobs.selectJobColour")}
                      </Text>
                      {replacementStock.length === 0 ? (
                        <Text
                          style={[Type.hint, styles.selectHint, styles.option]}
                        >
                          {t("jobs.noReplacementColours")}
                        </Text>
                      ) : (
                        <ScrollView>
                          {replacementStock.map((item) => {
                            const selected =
                              editingColourIndex !== null &&
                              jobColourStockIds[editingColourIndex] ===
                                item.material_stock_id;
                            return (
                              <Pressable
                                key={item.material_stock_id}
                                onPress={() =>
                                  handleSelectJobColour(item.material_stock_id)
                                }
                                style={[
                                  styles.option,
                                  selected && {
                                    backgroundColor: colors.primary,
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.optionLabel,
                                    { color: colors.text },
                                    selected && styles.selectedOptionLabel,
                                    selected && { color: colors.onPrimary },
                                  ]}
                                >
                                  {item.colour_name}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </ScrollView>
                      )}
                    </RNView>
                  </RNView>
                </Modal>
              </View>
            ) : null}
          </View>
          <SelectDropdown
            label={t("jobs.numberColour")}
            placeholder={t("jobs.selectNumberColour")}
            required
            error={errors.numberColourId}
            value={numberColourId}
            options={numberColours.map((colour) => ({
              value: colour.dice_job_number_colour_id,
              label: colour.dice_job_number_colour_name,
            }))}
            onChange={(value) => {
              setNumberColourId(value);
              setErrors((current) => ({
                ...current,
                numberColourId: undefined,
              }));
            }}
            emptyHint={t("jobs.addNumberColourHint")}
          />
          <FormActionRow
            saveTitle={editingId ? t("jobs.save") : t("jobs.addJob")}
            onSave={handleCreate}
            onCancel={resetForm}
            saving={saving}
          />
        </>
      }
      renderItem={({ item }) => {
        const colourNames = coloursForJob(item.dice_job_id);
        return (
          <EntityListItem
            title={item.job_name}
            meta={`${formatDisplayDate(item.job_date)} • ${methodLabel(item.production_method_id)} • ${t("jobs.colourCountValue", { count: item.colour_count })} • ${numberColourLabel(item.dice_job_number_colour_id)}${
              colourNames.length ? ` • ${colourNames.join(", ")}` : ""
            }`}
            description={item.description}
            onEdit={() => handleEdit(item)}
            onDelete={() => handleDelete(item.dice_job_id)}
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  dateField: { marginBottom: Space[3] },
  dateButton: {
    borderWidth: Stroke.input,
    borderRadius: Radius.md,
    paddingHorizontal: Space[3],
    paddingVertical: Space[3],
    minHeight: Touch.minHeight,
    justifyContent: "center",
  },
  selectField: { marginBottom: Space[3] },
  colourCountBlock: { marginBottom: Space[3] },
  generatedColours: { marginTop: Space[2], gap: Space[2] },
  selectHint: { opacity: 0.5 },
  pickerContainer: {
    borderWidth: Stroke.input,
    borderRadius: Radius.md,
    minHeight: Touch.minHeight,
    paddingHorizontal: Space[3],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerValue: { fontSize: FontSize.md },
  pickerPlaceholder: { opacity: 0.5 },
  pickerChevron: { fontSize: 22, opacity: 0.6, marginTop: -6 },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    padding: Space[6],
  },
  optionsSheet: {
    maxHeight: "70%",
    borderRadius: Radius.lg,
    padding: Space[2],
    borderWidth: Stroke.hairline,
  },
  optionsTitle: {
    paddingHorizontal: Space[3],
    paddingVertical: 10,
    fontSize: FontSize.md,
    fontWeight: "700",
  },
  option: {
    paddingHorizontal: Space[3],
    paddingVertical: 13,
    borderRadius: Radius.sm,
  },
  selectedOptionLabel: { fontWeight: "600" },
  optionLabel: { fontSize: FontSize.md },
});
