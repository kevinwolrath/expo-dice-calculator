import { useCallback, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

import { showMessage } from "@/components/alert";
import EntityListItem from "@/components/ui/EntityListItem";
import FormActionRow from "@/components/ui/FormActionRow";
import FormField from "@/components/ui/FormField";
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
  const [colours, setColours] = useState<DiceJobNumberColour[]>([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [colourEditingId, setColourEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listDiceJobNumberColours();
      setColours(rows);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await initDatabase();
      await load();
    })();
  }, [load]);

  const handleSaveColour = async () => {
    if (!name.trim()) {
      setErrors({ name: t("common.required") });
      return;
    }
    setErrors({});
    try {
      if (colourEditingId) {
        await updateDiceJobNumberColour(colourEditingId, {
          dice_job_number_colour_name: name.trim(),
        });
      } else {
        await createDiceJobNumberColour({
          dice_job_number_colour_name: name.trim(),
        });
      }
      setName("");
      setColourEditingId(null);
      setErrors({});
      await load();
    } catch (e) {
      console.warn(e);
      showMessage(t("common.error"), t("diceNumberColours.saveError"));
    }
  };

  const handleEditColour = (colour: DiceJobNumberColour) => {
    setColourEditingId(colour.dice_job_number_colour_id);
    setName(colour.dice_job_number_colour_name ?? "");
    setErrors({});
  };

  const handleCancelColour = () => {
    setName("");
    setColourEditingId(null);
    setErrors({});
  };

  const handleDeleteColour = (id: number) => {
    if (Platform.OS === "web") {
      if (
        window.confirm(
          `${t("diceNumberColours.deleteTitle")} - ${t("diceNumberColours.deleteMessage")}`,
        )
      ) {
        (async () => {
          await deleteDiceJobNumberColour(id);
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
            await load();
          },
        },
      ],
    );
  };

  return (
    <ScreenList
      data={colours}
      keyExtractor={(item) => String(item.dice_job_number_colour_id)}
      countLabel={t("diceNumberColours.colourCount", { count: colours.length })}
      emptyText={t("diceNumberColours.empty")}
      form={
        <>
          <FormField
            label={t("diceNumberColours.name")}
            required
            error={errors.name}
            value={name}
            onChangeText={(value) => {
              setName(value);
              setErrors({});
            }}
          />
          <FormActionRow
            saveTitle={
              colourEditingId
                ? t("diceNumberColours.save")
                : t("diceNumberColours.add")
            }
            onSave={handleSaveColour}
            onCancel={handleCancelColour}
            saving={loading}
          />
        </>
      }
      renderItem={({ item }) => (
        <EntityListItem
          title={item.dice_job_number_colour_name}
          onEdit={() => handleEditColour(item)}
          onDelete={() => handleDeleteColour(item.dice_job_number_colour_id)}
        />
      )}
    />
  );
}
