import { useFocusEffect } from "expo-router";
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
import { Text, useThemeColors, View } from "@/components/Themed";
import EntityListItem from "@/components/ui/EntityListItem";
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
  colourTypeMaterialMap,
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
  pickRandomDistinctStock,
  replaceDiceJobColours,
  shuffleInPlace,
  updateDiceJob,
  type DiceJob,
  type DiceJobColour,
  type DiceJobNumberColour,
  type ProductionMethod,
} from "@/db";
import useInventoryStore from "@/stores/useInventoryStore";
import { useTranslation } from "react-i18next";

const MAX_COLOUR_COUNT = 6;

const formatJobTimestamp = (value: string, locale: string) => {
  const iso = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
};

export default function JobsScreen() {
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const [jobs, setJobs] = useState<DiceJob[]>([]);
  const [methods, setMethods] = useState<ProductionMethod[]>([]);
  const [numberColours, setNumberColours] = useState<DiceJobNumberColour[]>([]);
  const stock = useInventoryStore((s) => s.stock);
  const colourTypes = useInventoryStore((s) => s.colourTypes);
  const materialTypes = useInventoryStore((s) => s.types);
  const loadStock = useInventoryStore((s) => s.loadStock);
  const loadColourTypes = useInventoryStore((s) => s.loadColourTypes);
  const loadMaterialTypes = useInventoryStore((s) => s.loadTypes);
  const colourTypeToMaterialType = colourTypeMaterialMap(colourTypes);

  const [jobName, setJobName] = useState("");
  const [description, setDescription] = useState("");
  const [colourCount, setColourCount] = useState("");
  const [jobColourStockIds, setJobColourStockIds] = useState<string[]>([]);
  const [allJobColours, setAllJobColours] = useState<DiceJobColour[]>([]);
  const [materialTypeId, setMaterialTypeId] = useState<string | null>(null);
  const [methodId, setMethodId] = useState<string | null>(null);
  const [allowedTypeIds, setAllowedTypeIds] = useState<string[] | null>(null);
  const [numberColourId, setNumberColourId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showJobColourPicker, setShowJobColourPicker] = useState(false);
  const [editingColourIndex, setEditingColourIndex] = useState<number | null>(
    null,
  );
  const [errors, setErrors] = useState<{
    jobName?: string;
    colourCount?: string;
    methodId?: string;
    numberColourId?: string;
    materialTypeId?: string;
  }>({});

  const loadAll = useCallback(async () => {
    const [jobRows, methodRows, numberColourRows, colourRows] =
      await Promise.all([
        listDiceJobs(),
        listProductionMethods(),
        listDiceJobNumberColours(),
        listAllDiceJobColours(),
        loadMaterialTypes(),
        loadStock(),
        loadColourTypes(),
      ]);
    setJobs(jobRows);
    setMethods(methodRows);
    setNumberColours(numberColourRows);
    setAllJobColours(colourRows);
  }, [loadMaterialTypes, loadStock, loadColourTypes]);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        try {
          await initDatabase();
          await loadAll();
        } catch (e) {
          console.warn("Failed to initialise jobs screen", e);
        }
      })();
    }, [loadAll]),
  );

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
    setColourCount("");
    setJobColourStockIds([]);
    setMethodId(null);
    setMaterialTypeId(null);
    setNumberColourId(null);
    setEditingId(null);
    setShowJobColourPicker(false);
    setEditingColourIndex(null);
    setErrors({});
  };

  const handleEdit = (job: DiceJob) => {
    setEditingId(job.dice_job_id);
    setJobName(job.job_name);
    setDescription(job.description ?? "");
    setColourCount(String(job.colour_count));
    setMethodId(job.production_method_id);
    setMaterialTypeId(job.material_type_id);
    setNumberColourId(job.dice_job_number_colour_id);
    setErrors({});
    void listDiceJobColours(job.dice_job_id).then((colours) => {
      setJobColourStockIds(colours.map((colour) => colour.material_stock_id));
    });
  };

  const parseColourCount = (value = colourCount) => {
    const count = Number(value);
    if (!Number.isInteger(count) || count <= 0 || count > MAX_COLOUR_COUNT) {
      return null;
    }
    return count;
  };

  const confirmRegenerate = (message: string) =>
    confirm(t("jobs.regenerateColoursTitle"), message, {
      confirm: t("common.yes"),
      cancel: t("common.no"),
    });

  const handleGenerateRandomJob = async () => {
    if (methods.length === 0) {
      showMessage(t("common.error"), t("jobs.noProductionMethods"));
      return;
    }

    const allowedRows = await listAllAllowedMaterials();
    const allowedByMethodId = new Map<string, string[]>();
    for (const row of allowedRows) {
      const allowedTypeIds =
        allowedByMethodId.get(row.production_method_id) ?? [];
      allowedTypeIds.push(row.material_type_id);
      allowedByMethodId.set(row.production_method_id, allowedTypeIds);
    }

    const activeMaterialTypeIds = new Set(
      stock
        .filter((item) => item.is_active !== 0)
        .map((item) => colourTypeToMaterialType.get(item.colour_type_id))
        .filter((id): id is string => id !== undefined),
    );
    const eligibleMaterialTypeIds = materialTypes
      .map((type) => type.material_type_id)
      .filter(
        (typeId) =>
          activeMaterialTypeIds.has(typeId) &&
          methods.some((method) =>
            (allowedByMethodId.get(method.production_method_id) ?? []).includes(
              typeId,
            ),
          ),
      );
    const selectedMaterialTypeId = shuffleInPlace(eligibleMaterialTypeIds)[0];
    if (!selectedMaterialTypeId) {
      showMessage(t("common.error"), t("jobs.noCompatibleStock"));
      return;
    }

    const eligibleMethodIds = methods
      .filter((method) =>
        (allowedByMethodId.get(method.production_method_id) ?? []).includes(
          selectedMaterialTypeId,
        ),
      )
      .map((method) => method.production_method_id);
    const selectedMethodId = shuffleInPlace(eligibleMethodIds)[0];
    if (!selectedMethodId) {
      showMessage(t("common.error"), t("jobs.noCompatibleStock"));
      return;
    }

    const availableColours = pickRandomDistinctStock(
      stock,
      stock.length,
      [selectedMaterialTypeId],
      [],
      colourTypeToMaterialType,
    );
    const maxRandomColourCount = Math.min(
      availableColours.length,
      MAX_COLOUR_COUNT,
    );
    const selectedColourCount =
      Math.floor(Math.random() * maxRandomColourCount) + 1;
    const selectedColours = pickRandomDistinctStock(
      stock,
      selectedColourCount,
      [selectedMaterialTypeId],
      [],
      colourTypeToMaterialType,
    );

    setMaterialTypeId(selectedMaterialTypeId);
    setMethodId(selectedMethodId);
    setColourCount(String(selectedColourCount));
    setJobColourStockIds(selectedColours.map((item) => item.material_stock_id));
    setErrors({});
  };

  const handleGenerateColours = async (options?: {
    replace?: boolean;
    count?: number;
    methodId?: string | null;
    materialTypeId?: string | null;
  }) => {
    const count = options?.count ?? parseColourCount();
    if (count === null) {
      setErrors((current) => ({
        ...current,
        colourCount: t("jobs.invalidCountMessage", {
          max: MAX_COLOUR_COUNT,
        }),
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

    const selectedMethodId =
      options?.methodId !== undefined ? options.methodId : methodId;
    const selectedMaterialTypeId =
      options?.materialTypeId !== undefined
        ? options.materialTypeId
        : materialTypeId;
    if (!selectedMaterialTypeId) {
      setErrors((current) => ({
        ...current,
        materialTypeId: t("common.required"),
      }));
      return;
    }
    if (!selectedMethodId) {
      setErrors((current) => ({
        ...current,
        methodId: t("common.required"),
      }));
      return;
    }

    const allowedTypeIdsForMethod = (
      await listAllowedMaterialsForMethod(selectedMethodId)
    ).map((row) => row.material_type_id);

    if (allowedTypeIdsForMethod.length === 0) {
      showMessage(t("common.error"), t("jobs.noCompatibleStock"));
      return;
    }

    if (!allowedTypeIdsForMethod.includes(selectedMaterialTypeId)) {
      showMessage(t("common.error"), t("jobs.noCompatibleStock"));
      return;
    }

    const allowedTypeIdsForGeneration = [selectedMaterialTypeId];

    const compatibleExistingIds = existingIds.filter((id) => {
      const item = stock.find((row) => row.material_stock_id === id);
      return item
        ? allowedTypeIdsForGeneration.includes(
            colourTypeToMaterialType.get(item.colour_type_id) ?? "",
          )
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
      allowedTypeIdsForGeneration,
      compatibleExistingIds,
      colourTypeToMaterialType,
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

  const handleProductionMethodChange = async (value: string) => {
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
  const handleMaterialTypeChange = async (value: string) => {
    if (value === materialTypeId) return;
    setMaterialTypeId(value);
    setMethodId(null);
    setErrors((current) => ({ ...current, materialTypeId: undefined }));

    if (jobColourStockIds.length === 0) return;

    const shouldRegenerate = await confirmRegenerate(
      t("jobs.regenerateColoursOnMaterialType"),
    );
    if (!shouldRegenerate) return;
    await handleGenerateColours({ replace: true, materialTypeId: value });
  };

  const applyJobColourStockIds = (ids: string[]) => {
    setJobColourStockIds(ids);
  };

  const handleEditJobColour = (index: number) => {
    setEditingColourIndex(index);
    setShowJobColourPicker(true);
  };

  const handleSelectJobColour = (materialStockId: string) => {
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

  const handleCreate = async () => {
    const nextErrors: typeof errors = {};
    if (!jobName.trim()) nextErrors.jobName = t("common.required");
    const count = parseColourCount();
    if (count === null) {
      nextErrors.colourCount = t("jobs.invalidCountMessage", {
        max: MAX_COLOUR_COUNT,
      });
    } else if (jobColourStockIds.length !== count) {
      nextErrors.colourCount = t("jobs.generateColoursRequired");
    }
    if (!methodId) nextErrors.methodId = t("common.required");
    if (!materialTypeId) nextErrors.materialTypeId = t("common.required");
    if (!numberColourId) nextErrors.numberColourId = t("common.required");
    setErrors(nextErrors);
    if (
      Object.keys(nextErrors).length > 0 ||
      !methodId ||
      !materialTypeId ||
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
        colour_count: count,
        material_type_id: materialTypeId,
        production_method_id: methodId,
        dice_job_number_colour_id: numberColourId,
      };
      let jobId: string;
      if (editingId) {
        await updateDiceJob(editingId, payload);
        jobId = editingId;
      } else {
        jobId = (await createDiceJob(payload)).dice_job_id;
      }
      await replaceDiceJobColours(jobId, jobColourStockIds);
      setEditingId(jobId);
      await loadAll();
    } catch (e) {
      console.warn("Failed to save job", e);
      showMessage(t("common.error"), t("jobs.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === "web") {
      if (
        window.confirm(`${t("jobs.deleteTitle")} - ${t("jobs.deleteMessage")}`)
      ) {
        (async () => {
          await deleteDiceJob(id);
          if (editingId === id) resetForm();
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
          if (editingId === id) resetForm();
          await loadAll();
        },
      },
    ]);
  };

  const methodLabel = (id: string) =>
    methods.find((m) => m.production_method_id === id)?.description ??
    t("jobs.unknownMethod");

  const numberColourLabel = (id: string) =>
    numberColours.find((c) => c.dice_job_number_colour_id === id)
      ?.dice_job_number_colour_name ?? t("jobs.unknownNumberColour");

  const stockColourLabel = (id: string) =>
    stock.find((item) => item.material_stock_id === id)?.colour_name ??
    t("jobs.unknownNumberColour");

  const coloursForJob = (jobId: string) =>
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
    const itemMaterialTypeId =
      colourTypeToMaterialType.get(item.colour_type_id) ?? "";
    if (materialTypeId && itemMaterialTypeId !== materialTypeId) return false;
    return (
      allowedTypeIds === null || allowedTypeIds.includes(itemMaterialTypeId)
    );
  });

  const hasValidColourCount = parseColourCount() !== null;
  const canChooseColourCount = materialTypeId !== null;
  const canChooseMethod = canChooseColourCount && hasValidColourCount;
  const canGenerate = materialTypes.length > 0 && methods.length > 0;

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
          <View style={styles.colourCountBlock}>
            <PrimaryButton
              title={t("jobs.generate")}
              onPress={() => {
                void handleGenerateRandomJob();
              }}
              disabled={!canGenerate}
            />
            <SelectDropdown
              label={t("jobs.materialType")}
              placeholder={t("jobs.selectMaterialType")}
              required
              error={errors.materialTypeId}
              value={materialTypeId}
              options={materialTypes.map((type) => ({
                value: type.material_type_id,
                label: type.description ?? type.material_type_id.toString(),
              }))}
              onChange={(value) => {
                void handleMaterialTypeChange(value);
              }}
              emptyHint={t("jobs.addMaterialTypeHint")}
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
              disabled={!canChooseMethod}
            />
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
              editable={canChooseColourCount}
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
            addTitle={t("jobs.addJob")}
            onAdd={resetForm}
            saveTitle={t("jobs.save")}
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
            meta={`${formatJobTimestamp(item.created_at, i18n.language)} • ${methodLabel(item.production_method_id)} • ${t("jobs.colourCountValue", { count: item.colour_count })} • ${numberColourLabel(item.dice_job_number_colour_id)}${
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
