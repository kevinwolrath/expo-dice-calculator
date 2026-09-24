import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Platform, type ListRenderItem } from "react-native";

import { showMessage } from "@/components/alert";
import { usePackSurface } from "@/components/usePackSurface";
import EntityListItem from "@/components/ui/EntityListItem";
import FormActions from "@/components/ui/FormActions";
import { isFormDirty } from "@/components/ui/formDirty";
import FormField from "@/components/ui/FormField";
import { useFormFieldRefs } from "@/components/ui/fieldFocus";
import ScreenList from "@/components/ui/ScreenList";
import {
    createDiceJobNumberColour,
    deleteDiceJobNumberColour,
    initDatabase,
    listDiceJobNumberColours,
    updateDiceJobNumberColour,
    type DiceJobNumberColour,
} from "@/db";
import { useTranslation } from "react-i18next";

export default function DiceNumberColoursScreen() {
  const { t } = useTranslation();
  const { icon } = usePackSurface();
  const [colours, setColours] = useState<DiceJobNumberColour[]>([]);
  const [loading, setLoading] = useState(false);

  const { bind, focusError } = useFormFieldRefs<"name">();
  const [name, setName] = useState("");
  const [colourEditingId, setColourEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string }>({});
  const emptyForm = { name: "" };
  const [cleanForm, setCleanForm] = useState(emptyForm);
  const formDirty = isFormDirty({ name }, cleanForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listDiceJobNumberColours();
      setColours(rows);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        await initDatabase();
        await load();
      })();
    }, [load]),
  );

  const handleSaveColour = async () => {
    if (!name.trim()) {
      const nextErrors = { name: t("common.required") };
      setErrors(nextErrors);
      focusError(nextErrors, ["name"]);
      return;
    }
    setErrors({});
    try {
      if (colourEditingId) {
        await updateDiceJobNumberColour(colourEditingId, {
          dice_job_number_colour_name: name.trim(),
        });
      } else {
        const created = await createDiceJobNumberColour({
          dice_job_number_colour_name: name.trim(),
        });
        setColourEditingId(created.dice_job_number_colour_id);
      }
      setCleanForm({ name });
      setErrors({});
      await load();
    } catch (e) {
      console.warn(e);
      showMessage(t("common.error"), t("diceNumberColours.saveError"));
    }
  };

  const applyEditColour = (colour: DiceJobNumberColour) => {
    setColourEditingId(colour.dice_job_number_colour_id);
    setName(colour.dice_job_number_colour_name ?? "");
    setErrors({});
    setCleanForm({ name: colour.dice_job_number_colour_name ?? "" });
  };

  const handleEditColour = useCallback(
    (id: string) => {
      const colour = colours.find(
        (row) => row.dice_job_number_colour_id === id,
      );
      if (colour) applyEditColour(colour);
    },
    [colours],
  );

  const handleCancelColour = () => {
    setName("");
    setColourEditingId(null);
    setErrors({});
    setCleanForm(emptyForm);
  };

  const handleDeleteColour = useCallback(
    (id: string) => {
      if (Platform.OS === "web") {
        if (
          window.confirm(
            `${t("diceNumberColours.deleteTitle")} - ${t("diceNumberColours.deleteMessage")}`,
          )
        ) {
          (async () => {
            await deleteDiceJobNumberColour(id);
            if (colourEditingId === id) handleCancelColour();
            await load();
          })();
        }
        return;
      }

      Alert.alert(
        t("diceNumberColours.deleteTitle"),
        t("diceNumberColours.deleteMessage"),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("common.delete"),
            style: "destructive",
            onPress: async () => {
              await deleteDiceJobNumberColour(id);
              if (colourEditingId === id) handleCancelColour();
              await load();
            },
          },
        ],
      );
    },
    [t, colourEditingId, load],
  );

  const renderItem: ListRenderItem<DiceJobNumberColour> = useCallback(
    ({ item }) => (
      <EntityListItem
        id={item.dice_job_number_colour_id}
        title={item.dice_job_number_colour_name}
        onEdit={handleEditColour}
        onDelete={handleDeleteColour}
      />
    ),
    [handleEditColour, handleDeleteColour],
  );

  return (
    <ScreenList
      data={colours}
      keyExtractor={(item) => String(item.dice_job_number_colour_id)}
      countLabel={t("diceNumberColours.colourCount", { count: colours.length })}
      emptyText={t("diceNumberColours.empty")}
      form={
        <>
          <FormField
            focusRef={bind("name")}
            label={t("diceNumberColours.name")}
            icon={icon("dice")}
            required
            error={errors.name}
            placeholder={t("diceNumberColours.namePlaceholder")}
            value={name}
            onChangeText={(value) => {
              setName(value);
              setErrors({});
            }}
          />
          <FormActions
            onAdd={handleCancelColour}
            onSave={handleSaveColour}
            onCancel={handleCancelColour}
            saving={loading}
            dirty={formDirty}
          />
        </>
      }
      renderItem={renderItem}
    />
  );
}
