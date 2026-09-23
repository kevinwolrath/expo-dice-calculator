import { useFocusEffect } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  View as RNView,
  ScrollView,
  StyleSheet,
  type ListRenderItem,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { confirm, showMessage } from "@/components/alert";
import { Text, useThemeColors, View } from "@/components/Themed";
import { usePackSurface } from "@/components/usePackSurface";
import DicePreview from "@/components/ui/DicePreview";
import EntityListItem from "@/components/ui/EntityListItem";
import FieldLabel from "@/components/ui/FieldLabel";
import FormActions from "@/components/ui/FormActions";
import { isFormDirty } from "@/components/ui/formDirty";
import FormField from "@/components/ui/FormField";
import { useFormFieldRefs } from "@/components/ui/fieldFocus";
import JobsGenerateBar from "@/components/ui/JobsGenerateBar";
import JobsHeroBanner from "@/components/ui/JobsHeroBanner";
import LockFieldCard from "@/components/ui/LockFieldCard";
import PreviewSettingsFooter from "@/components/ui/PreviewSettingsFooter";
import RemovableChipList from "@/components/ui/RemovableChipList";
import ScreenList from "@/components/ui/ScreenList";
import SelectDropdown from "@/components/ui/SelectDropdown";
import { packIcon } from "@/constants/themePackAssets";
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
  expandColourTypeExclusions,
  initDatabase,
  listAllAllowedMaterials,
  listAllDiceJobColours,
  listAllowedMaterialsForMethod,
  listDiceJobColours,
  listDiceJobColourTypeExclusions,
  listDiceJobNumberColours,
  listDiceJobs,
  listProductionMethods,
  materialTypeIdsForStock,
  pickRandomDistinctStock,
  replaceDiceJobColours,
  replaceDiceJobColourTypeExclusions,
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
  const { icon, assets, isNight } = usePackSurface();
  const insets = useSafeAreaInsets();
  const [jobs, setJobs] = useState<DiceJob[]>([]);
  const [methods, setMethods] = useState<ProductionMethod[]>([]);
  const [numberColours, setNumberColours] = useState<DiceJobNumberColour[]>([]);
  const stock = useInventoryStore((s) => s.stock);
  const colourTypes = useInventoryStore((s) => s.colourTypes);
  const colourTypeMaterials = useInventoryStore((s) => s.colourTypeMaterials);
  const materialTypes = useInventoryStore((s) => s.types);
  const loadStock = useInventoryStore((s) => s.loadStock);
  const loadColourTypes = useInventoryStore((s) => s.loadColourTypes);
  const loadMaterialTypes = useInventoryStore((s) => s.loadTypes);
  const colourTypeToMaterialTypes = useMemo(
    () => colourTypeMaterialMap(colourTypeMaterials),
    [colourTypeMaterials],
  );

  const [jobName, setJobName] = useState("");
  const [description, setDescription] = useState("");
  const [colourCount, setColourCount] = useState("");
  const [colourCountManual, setColourCountManual] = useState(false);
  const [jobColourStockIds, setJobColourStockIds] = useState<string[]>([]);
  const [excludedColourTypeIds, setExcludedColourTypeIds] = useState<string[]>(
    [],
  );
  const [allJobColours, setAllJobColours] = useState<DiceJobColour[]>([]);
  const [materialTypeId, setMaterialTypeId] = useState<string | null>(null);
  const [materialTypeManual, setMaterialTypeManual] = useState(false);
  const [methodId, setMethodId] = useState<string | null>(null);
  const [methodManual, setMethodManual] = useState(false);
  const [allowedTypeIds, setAllowedTypeIds] = useState<string[] | null>(null);
  const [numberColourId, setNumberColourId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showJobColourPicker, setShowJobColourPicker] = useState(false);
  const [showDicePreview, setShowDicePreview] = useState(false);
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
  const { bind, focusError } = useFormFieldRefs<
    | "jobName"
    | "materialTypeId"
    | "methodId"
    | "colourCount"
    | "numberColourId"
  >();
  const jobFieldOrder = [
    "jobName",
    "materialTypeId",
    "methodId",
    "colourCount",
    "numberColourId",
  ] as const;
  const emptyForm = {
    jobName: "",
    description: "",
    colourCount: "",
    colourCountManual: false,
    jobColourStockIds: [] as string[],
    excludedColourTypeIds: [] as string[],
    materialTypeId: null as string | null,
    materialTypeManual: false,
    methodId: null as string | null,
    methodManual: false,
    numberColourId: null as string | null,
  };
  const currentForm = {
    jobName,
    description,
    colourCount,
    colourCountManual,
    jobColourStockIds,
    excludedColourTypeIds,
    materialTypeId,
    materialTypeManual,
    methodId,
    methodManual,
    numberColourId,
  };
  const [cleanForm, setCleanForm] = useState(emptyForm);
  const formDirty = isFormDirty(currentForm, cleanForm);

  const excludedColourTypeIdsForJob = useMemo(
    () => expandColourTypeExclusions(excludedColourTypeIds, colourTypes),
    [excludedColourTypeIds, colourTypes],
  );

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
    setColourCountManual(false);
    setJobColourStockIds([]);
    setExcludedColourTypeIds([]);
    setMethodId(null);
    setMethodManual(false);
    setMaterialTypeId(null);
    setMaterialTypeManual(false);
    setNumberColourId(null);
    setEditingId(null);
    setShowJobColourPicker(false);
    setEditingColourIndex(null);
    setErrors({});
    setCleanForm(emptyForm);
  };

  const applyJobEdit = (job: DiceJob) => {
    setEditingId(job.dice_job_id);
    setJobName(job.job_name);
    setDescription(job.description ?? "");
    setColourCount(String(job.colour_count));
    setColourCountManual(job.colour_count_manual !== 0);
    setMethodId(job.production_method_id);
    setMethodManual(job.production_method_manual !== 0);
    setMaterialTypeId(job.material_type_id);
    setMaterialTypeManual(job.material_type_manual !== 0);
    setNumberColourId(job.dice_job_number_colour_id);
    setErrors({});
    void Promise.all([
      listDiceJobColours(job.dice_job_id),
      listDiceJobColourTypeExclusions(job.dice_job_id),
    ]).then(([colours, exclusions]) => {
      const nextColours = colours.map((colour) => colour.material_stock_id);
      const nextExclusions = exclusions.map(
        (exclusion) => exclusion.colour_type_id,
      );
      setJobColourStockIds(nextColours);
      setExcludedColourTypeIds(nextExclusions);
      setCleanForm({
        jobName: job.job_name,
        description: job.description ?? "",
        colourCount: String(job.colour_count),
        colourCountManual: job.colour_count_manual !== 0,
        jobColourStockIds: nextColours,
        excludedColourTypeIds: nextExclusions,
        materialTypeId: job.material_type_id,
        materialTypeManual: job.material_type_manual !== 0,
        methodId: job.production_method_id,
        methodManual: job.production_method_manual !== 0,
        numberColourId: job.dice_job_number_colour_id,
      });
    });
  };

  // Stable identity (id in, no closure over `job`) so EntityListItem's
  // memo isn't busted on every render of this screen.
  const handleEdit = useCallback(
    (id: string) => {
      const job = jobs.find((row) => row.dice_job_id === id);
      if (job) applyJobEdit(job);
    },
    [jobs],
  );

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
        .filter(
          (item) =>
            item.is_active !== 0 &&
            !excludedColourTypeIdsForJob.includes(item.colour_type_id),
        )
        .flatMap((item) =>
          materialTypeIdsForStock(item, colourTypeToMaterialTypes),
        ),
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
    const selectedMaterialTypeId = materialTypeManual
      ? materialTypeId
      : shuffleInPlace(
          eligibleMaterialTypeIds.filter(
            (typeId) =>
              !methodManual ||
              (methodId !== null &&
                (allowedByMethodId.get(methodId) ?? []).includes(typeId)),
          ),
        )[0];
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
    const selectedMethodId = methodManual
      ? methodId
      : shuffleInPlace(eligibleMethodIds)[0];
    if (!selectedMethodId) {
      showMessage(t("common.error"), t("jobs.noCompatibleStock"));
      return;
    }
    const selectedMethod = methods.find(
      (method) => method.production_method_id === selectedMethodId,
    );

    const availableColours = pickRandomDistinctStock(
      stock,
      stock.length,
      [selectedMaterialTypeId],
      [],
      colourTypeToMaterialTypes,
      excludedColourTypeIdsForJob,
      colourTypes,
    );
    const minimumRandomColourCount = selectedMethod?.minimum_colour_count ?? 1;
    const maximumRandomColourCount = Math.min(
      availableColours.length,
      MAX_COLOUR_COUNT,
      selectedMethod?.maximum_colour_count ?? MAX_COLOUR_COUNT,
    );
    if (minimumRandomColourCount > maximumRandomColourCount) {
      showMessage(t("common.error"), t("jobs.noCompatibleStock"));
      return;
    }
    const selectedColourCount = colourCountManual
      ? parseColourCount()
      : Math.floor(
          Math.random() *
            (maximumRandomColourCount - minimumRandomColourCount + 1),
        ) + minimumRandomColourCount;
    if (selectedColourCount === null) {
      const nextErrors = {
        ...errors,
        colourCount: t("jobs.invalidCountMessage", { max: MAX_COLOUR_COUNT }),
      };
      setErrors(nextErrors);
      focusError(nextErrors, jobFieldOrder);
      return;
    }
    const selectedColours = pickRandomDistinctStock(
      stock,
      selectedColourCount,
      [selectedMaterialTypeId],
      [],
      colourTypeToMaterialTypes,
      excludedColourTypeIdsForJob,
      colourTypes,
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
      const nextErrors = {
        ...errors,
        colourCount: t("jobs.invalidCountMessage", {
          max: MAX_COLOUR_COUNT,
        }),
      };
      setErrors(nextErrors);
      focusError(nextErrors, jobFieldOrder);
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
      const nextErrors = {
        ...errors,
        materialTypeId: t("common.required"),
      };
      setErrors(nextErrors);
      focusError(nextErrors, jobFieldOrder);
      return;
    }
    if (!selectedMethodId) {
      const nextErrors = {
        ...errors,
        methodId: t("common.required"),
      };
      setErrors(nextErrors);
      focusError(nextErrors, jobFieldOrder);
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
      if (!item) return false;
      if (excludedColourTypeIdsForJob.includes(item.colour_type_id)) {
        return false;
      }
      return materialTypeIdsForStock(item, colourTypeToMaterialTypes).some(
        (id) => allowedTypeIdsForGeneration.includes(id),
      );
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
      colourTypeToMaterialTypes,
      excludedColourTypeIdsForJob,
      colourTypes,
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
      focusError(nextErrors, jobFieldOrder);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        job_name: jobName.trim(),
        description: description.trim() || null,
        colour_count: count,
        colour_count_manual: colourCountManual ? 1 : 0,
        material_type_id: materialTypeId,
        material_type_manual: materialTypeManual ? 1 : 0,
        production_method_id: methodId,
        production_method_manual: methodManual ? 1 : 0,
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
      await replaceDiceJobColourTypeExclusions(
        jobId,
        excludedColourTypeIdsForJob,
      );
      setEditingId(jobId);
      setCleanForm(currentForm);
      await loadAll();
    } catch (e) {
      console.warn("Failed to save job", e);
      showMessage(t("common.error"), t("jobs.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = useCallback(
    (id: string) => {
      if (Platform.OS === "web") {
        if (
          window.confirm(
            `${t("jobs.deleteTitle")} - ${t("jobs.deleteMessage")}`,
          )
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
    },
    [t, editingId, loadAll],
  );

  const methodLabel = useCallback(
    (id: string) =>
      methods.find((m) => m.production_method_id === id)?.description ??
      t("jobs.unknownMethod"),
    [methods, t],
  );

  const numberColourLabel = useCallback(
    (id: string) =>
      numberColours.find((c) => c.dice_job_number_colour_id === id)
        ?.dice_job_number_colour_name ?? t("jobs.unknownNumberColour"),
    [numberColours, t],
  );

  const stockColourLabel = useCallback(
    (id: string) =>
      stock.find((item) => item.material_stock_id === id)?.colour_name ??
      t("jobs.unknownNumberColour"),
    [stock, t],
  );

  const stockColour = useCallback(
    (id: string) =>
      stock.find((item) => item.material_stock_id === id)?.colour ??
      "#d9d9d9",
    [stock],
  );

  const coloursForJob = useCallback(
    (jobId: string) =>
      allJobColours
        .filter((colour) => colour.dice_job_id === jobId)
        .map((colour) => stockColourLabel(colour.material_stock_id)),
    [allJobColours, stockColourLabel],
  );

  // Memoized so DicePreview/DieShape (both React.memo'd) can actually skip
  // re-running their procedural SVG/resin work when nothing relevant here
  // has changed — an inline `.map()` at the call site would create a new
  // array every render and defeat that memoization.
  const previewColours = useMemo(
    () => jobColourStockIds.map(stockColour),
    [jobColourStockIds, stockColour],
  );

  const usedJobColourIds = useMemo(
    () =>
      new Set(
        jobColourStockIds.filter((_, index) => index !== editingColourIndex),
      ),
    [jobColourStockIds, editingColourIndex],
  );
  const replacementStock = useMemo(
    () =>
      stock.filter((item) => {
        if (
          item.is_active === 0 ||
          usedJobColourIds.has(item.material_stock_id)
        ) {
          return false;
        }
        const itemMaterialTypeIds = materialTypeIdsForStock(
          item,
          colourTypeToMaterialTypes,
        );
        if (materialTypeId && !itemMaterialTypeIds.includes(materialTypeId)) {
          return false;
        }
        if (excludedColourTypeIdsForJob.includes(item.colour_type_id)) {
          return false;
        }
        return (
          allowedTypeIds === null ||
          itemMaterialTypeIds.some((id) => allowedTypeIds.includes(id))
        );
      }),
    [
      stock,
      usedJobColourIds,
      colourTypeToMaterialTypes,
      materialTypeId,
      excludedColourTypeIdsForJob,
      allowedTypeIds,
    ],
  );

  const canChooseColourCount = materialTypeId !== null;
  const canGenerate = materialTypes.length > 0 && methods.length > 0;
  const canPreview =
    jobColourStockIds.length > 0 &&
    materialTypeId !== null &&
    methodId !== null;

  const excludableColourTypeOptions = useMemo(
    () =>
      colourTypes
        .filter((type) => !excludedColourTypeIds.includes(type.colour_type_id))
        .reduce<{ value: string; label: string }[]>((options, type) => {
          const label = type.description;
          if (
            options.some(
              (option) =>
                option.label.trim().toLowerCase() === label.trim().toLowerCase(),
            )
          ) {
            return options;
          }
          return [...options, { value: type.colour_type_id, label }];
        }, []),
    [colourTypes, excludedColourTypeIds],
  );

  const excludedColourTypeChips = useMemo(
    () =>
      excludedColourTypeIds.reduce<{ value: string; label: string }[]>(
        (items, id) => {
          const type = colourTypes.find((item) => item.colour_type_id === id);
          if (!type) return items;
          const label = type.description;
          if (
            items.some(
              (item) =>
                item.label.trim().toLowerCase() === label.trim().toLowerCase(),
            )
          ) {
            return items;
          }
          return [...items, { value: id, label }];
        },
        [],
      ),
    [excludedColourTypeIds, colourTypes],
  );

  const materialTypeOptions = useMemo(
    () =>
      materialTypes.map((type) => ({
        value: type.material_type_id,
        label: type.description ?? type.material_type_id.toString(),
      })),
    [materialTypes],
  );

  const methodOptions = useMemo(
    () =>
      methods.map((method) => ({
        value: method.production_method_id,
        label: method.description ?? method.production_method_id.toString(),
      })),
    [methods],
  );

  const numberColourOptions = useMemo(
    () =>
      numberColours.map((colour) => ({
        value: colour.dice_job_number_colour_id,
        label: colour.dice_job_number_colour_name,
      })),
    [numberColours],
  );

  const renderJobItem: ListRenderItem<DiceJob> = useCallback(
    ({ item }) => {
      const colourNames = coloursForJob(item.dice_job_id);
      return (
        <EntityListItem
          id={item.dice_job_id}
          title={item.job_name}
          meta={`${formatJobTimestamp(item.created_at, i18n.language)} • ${methodLabel(item.production_method_id)} • ${t("jobs.colourCountValue", { count: item.colour_count })} • ${numberColourLabel(item.dice_job_number_colour_id)}${
            colourNames.length ? ` • ${colourNames.join(", ")}` : ""
          }`}
          description={item.description}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      );
    },
    [
      coloursForJob,
      i18n.language,
      methodLabel,
      numberColourLabel,
      t,
      handleEdit,
      handleDelete,
    ],
  );

  return (
    <ScreenList
        data={jobs}
        keyExtractor={(item) => String(item.dice_job_id)}
        countLabel={t("jobs.jobCount", { count: jobs.length })}
        emptyText={t("jobs.empty")}
        hero={
          !isNight && assets.banner ? (
            <JobsHeroBanner source={assets.banner} />
          ) : null
        }
        form={
          <>
            <FormField
              focusRef={bind("jobName")}
              label={t("jobs.jobName")}
              icon={icon("dice")}
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
              icon={icon("notes")}
              value={description}
              onChangeText={setDescription}
              placeholder={t("jobs.descriptionPlaceholder")}
              multiline
            />
            <View style={styles.colourCountBlock}>
              <SelectDropdown
                label={t("jobs.excludedColourTypes")}
                placeholder={t("jobs.selectExcludedColourType")}
                value={null}
                options={excludableColourTypeOptions}
                onChange={(value) => {
                  const expanded = expandColourTypeExclusions(
                    [value],
                    colourTypes,
                  );
                  setExcludedColourTypeIds((current) => [
                    ...new Set([...current, ...expanded]),
                  ]);
                }}
                emptyHint={t("jobs.noColourTypesToExclude")}
              />
              <RemovableChipList
                items={excludedColourTypeChips}
                onRemove={(value) => {
                  const expanded = expandColourTypeExclusions(
                    [value],
                    colourTypes,
                  );
                  setExcludedColourTypeIds((current) =>
                    current.filter((id) => !expanded.includes(id)),
                  );
                }}
                emptyText={t("jobs.noExcludedColourTypes")}
              />
              <JobsGenerateBar
                generateTitle={t("jobs.generate")}
                previewTitle={t("jobs.preview")}
                onGenerate={() => {
                  void handleGenerateRandomJob();
                }}
                onPreview={() => setShowDicePreview(true)}
                generateDisabled={!canGenerate}
                previewDisabled={!canPreview}
              />
              <Modal
                visible={showDicePreview}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setShowDicePreview(false)}
              >
                <RNView style={styles.dicePreviewRoot}>
<Pressable
  style={styles.dicePreviewScrim}
  onPress={() => setShowDicePreview(false)}
/>
                  <RNView
                    style={[
                      styles.dicePreviewCenter,
                      {
                        paddingTop: Math.max(insets.top, 16),
                        paddingBottom: Math.max(insets.bottom, 16),
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.dicePreviewCard,
                        isNight
                          ? styles.dicePreviewCardNight
                          : styles.dicePreviewCardDay,
                      ]}
                    >
                      <ScrollView
                        bounces={false}
                        keyboardShouldPersistTaps="handled"
                        style={styles.dicePreviewScroll}
                        contentContainerStyle={styles.dicePreviewScrollContent}
                      >
                      <View style={styles.dicePreviewHeader}>
                        <View style={styles.dicePreviewTitleRow}>
                          {icon("dice") ? (
                            <Image
                              source={icon("dice")}
                              style={styles.dicePreviewTitleIcon}
                              accessibilityIgnoresInvertColors
                            />
                          ) : null}
                          <Text style={styles.dicePreviewTitle}>
                            {t("jobs.dicePreview")}
                          </Text>
                        </View>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={t("common.close")}
                          onPress={() => setShowDicePreview(false)}
                          style={styles.dicePreviewClose}
                        >
                          <SymbolView
                            name={{
                              ios: "xmark",
                              android: "close",
                              web: "close",
                            }}
                            size={22}
                            tintColor="#F6EAD3"
                          />
                        </Pressable>
                      </View>
                      <DicePreview
                        variant="modal"
                        colours={previewColours}
                        numberColourName={
                          numberColourId
                            ? numberColourLabel(numberColourId)
                            : null
                        }
                        stroke={isNight ? "#ffffff" : "#F6EAD3"}
                        material={
                          materialTypeId
                            ? (materialTypes.find(
                                (type) =>
                                  type.material_type_id === materialTypeId,
                              )?.description ?? null)
                            : null
                        }
                        productionMethod={
                          methodId
                            ? (methods.find(
                                (method) =>
                                  method.production_method_id === methodId,
                              )?.description ?? null)
                            : null
                        }
                      />
                      <Text style={styles.dicePreviewHint}>
                        {t("jobs.generateUntilHint")}
                      </Text>
                      <Pressable
                        accessibilityRole="button"
                        disabled={!canGenerate}
                        onPress={() => {
                          void handleGenerateRandomJob();
                        }}
                        style={({ pressed }) => [
                          styles.dicePreviewGenerate,
                          !canGenerate && styles.dicePreviewGenerateDisabled,
                          pressed && canGenerate && styles.dicePreviewGeneratePressed,
                        ]}
                      >
                        <SymbolView
                          name={{
                            ios: "wand.and.stars",
                            android: "auto_fix_high",
                            web: "auto_awesome",
                          }}
                          size={22}
                          tintColor="#FFFFFF"
                        />
                        <Text style={styles.dicePreviewGenerateLabel}>
                          {t("jobs.generateNewColours")}
                        </Text>
                      </Pressable>
                      <PreviewSettingsFooter
                        colourCount={colourCount}
                        numberColour={
                          numberColourId
                            ? numberColourLabel(numberColourId)
                            : null
                        }
                        material={
                          materialTypeId
                            ? (materialTypes.find(
                                (type) =>
                                  type.material_type_id === materialTypeId,
                              )?.description ?? null)
                            : null
                        }
                        method={
                          methodId
                            ? (methods.find(
                                (method) =>
                                  method.production_method_id === methodId,
                              )?.description ?? null)
                            : null
                        }
                      />
                      </ScrollView>
                    </View>
                  </RNView>
                </RNView>
              </Modal>
              <LockFieldCard
                icon={packIcon(assets, "material")}
                label={t("jobs.materialType")}
                required
                error={errors.materialTypeId}
                locked={materialTypeManual}
                onLockedChange={setMaterialTypeManual}
                lockLabel={t("jobs.set")}
                lockAccessibilityLabel={t("jobs.manualMaterialType")}
              >
                <SelectDropdown
                  focusRef={bind("materialTypeId")}
                  embedded
                  label={t("jobs.materialType")}
                  placeholder={t("jobs.selectMaterialType")}
                  error={errors.materialTypeId}
                  value={materialTypeId}
                  options={materialTypeOptions}
                  onChange={(value) => {
                    void handleMaterialTypeChange(value);
                  }}
                  emptyHint={t("jobs.addMaterialTypeHint")}
                />
              </LockFieldCard>
              <LockFieldCard
                icon={packIcon(assets, "method")}
                label={t("jobs.productionMethod")}
                required
                error={errors.methodId}
                locked={methodManual}
                onLockedChange={setMethodManual}
                lockLabel={t("jobs.set")}
                lockAccessibilityLabel={t("jobs.manualProductionMethod")}
              >
                <SelectDropdown
                  focusRef={bind("methodId")}
                  embedded
                  label={t("jobs.productionMethod")}
                  placeholder={t("jobs.selectProductionMethod")}
                  error={errors.methodId}
                  value={methodId}
                  options={methodOptions}
                  onChange={(value) => {
                    void handleProductionMethodChange(value);
                  }}
                  emptyHint={t("jobs.addProductionMethodHint")}
                  disabled={!canChooseColourCount}
                />
              </LockFieldCard>
              <LockFieldCard
                icon={packIcon(assets, "colour")}
                label={t("jobs.colourCount")}
                required
                error={errors.colourCount}
                locked={colourCountManual}
                onLockedChange={setColourCountManual}
                lockLabel={t("jobs.set")}
                lockAccessibilityLabel={t("jobs.manualColourCount")}
              >
                <FormField
                  focusRef={bind("colourCount")}
                  embedded
                  label={t("jobs.colourCount")}
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
              </LockFieldCard>
              {jobColourStockIds.length > 0 ? (
                <View style={styles.generatedColours}>
                  <FieldLabel label={t("jobs.generatedColours")} />
                  {jobColourStockIds.map((id, index) => (
                    <EntityListItem
                      key={`${id}-${index}`}
                      id={String(index)}
                      title={`${index + 1}. ${stockColourLabel(id)}`}
                      onEdit={(indexKey) =>
                        handleEditJobColour(Number(indexKey))
                      }
                      onDelete={(indexKey) => {
                        void handleDeleteJobColour(Number(indexKey));
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
                            style={[
                              Type.hint,
                              styles.selectHint,
                              styles.option,
                            ]}
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
                                    handleSelectJobColour(
                                      item.material_stock_id,
                                    )
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
              focusRef={bind("numberColourId")}
              label={t("jobs.numberColour")}
              icon={icon("dice")}
              placeholder={t("jobs.selectNumberColour")}
              required
              error={errors.numberColourId}
              value={numberColourId}
              options={numberColourOptions}
              onChange={(value) => {
                setNumberColourId(value);
                setErrors((current) => ({
                  ...current,
                  numberColourId: undefined,
                }));
              }}
              emptyHint={t("jobs.addNumberColourHint")}
            />
            <FormActions
              onAdd={resetForm}
              onSave={handleCreate}
              onCancel={resetForm}
              saving={saving}
              dirty={formDirty}
            />
          </>
        }
        renderItem={renderJobItem}
      />
  );
}

const styles = StyleSheet.create({
  generatedColours: { marginBottom: Space[4] },
  selectField: { marginBottom: Space[3] },
  colourCountBlock: { marginBottom: Space[4] },
  dicePreviewRoot: {
    flex: 1,
  },
  dicePreviewScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.62)",
  },
  dicePreviewCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Space[3],
  },
  dicePreviewCard: {
    width: "100%",
    maxWidth: 560,
    maxHeight: "92%",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: Space[4],
    paddingTop: Space[2],
    paddingBottom: Space[2],
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 16,
  },
  dicePreviewScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  dicePreviewScrollContent: {
    flexGrow: 0,
  },
  dicePreviewCardDay: {
    backgroundColor: "rgba(15, 18, 24, 0.97)",
    borderColor: "rgba(190, 125, 55, 0.7)",
  },
  dicePreviewCardNight: {
    backgroundColor: "#000000",
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  dicePreviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
    marginBottom: Space[1],
    gap: Space[2],
  },
  dicePreviewTitleRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: Space[2],
  },
  dicePreviewTitleIcon: {
    width: 22,
    height: 22,
  },
  dicePreviewTitle: {
    flexShrink: 1,
    color: "#F6EAD3",
    fontSize: 20,
    fontWeight: "700",
  },
  dicePreviewClose: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  dicePreviewHint: {
    marginTop: 4,
    marginBottom: 8,
    textAlign: "center",
    color: "rgba(246, 234, 211, 0.62)",
    fontSize: FontSize.sm,
  },
  dicePreviewGenerate: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#2D8CFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Space[2],
    marginHorizontal: Space[1],
    marginBottom: 10,
    shadowColor: "#2D8CFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
  dicePreviewGenerateLabel: {
    color: "#FFFFFF",
    fontSize: FontSize.md,
    fontWeight: "700",
  },
  dicePreviewGenerateDisabled: {
    opacity: 0.45,
  },
  dicePreviewGeneratePressed: {
    opacity: 0.88,
  },
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
