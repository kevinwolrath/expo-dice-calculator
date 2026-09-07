import { getDatabase } from "../client";
import type { ColourTypeMaterialType } from "../types";

export const listMaterialsForColourType = async (
  colourTypeId: string,
): Promise<ColourTypeMaterialType[]> => {
  const db = await getDatabase();
  return db.getAllAsync<ColourTypeMaterialType>(
    "SELECT * FROM colour_type_material_type WHERE colour_type_id = ?;",
    colourTypeId,
  );
};

export const listAllColourTypeMaterials = async (): Promise<
  ColourTypeMaterialType[]
> => {
  const db = await getDatabase();
  return db.getAllAsync<ColourTypeMaterialType>(
    "SELECT * FROM colour_type_material_type;",
  );
};

export const addColourTypeMaterial = async (
  colourTypeId: string,
  materialTypeId: string,
): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    "INSERT OR IGNORE INTO colour_type_material_type (colour_type_id, material_type_id) VALUES (?, ?);",
    colourTypeId,
    materialTypeId,
  );
};

export const removeColourTypeMaterial = async (
  colourTypeId: string,
  materialTypeId: string,
): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    "DELETE FROM colour_type_material_type WHERE colour_type_id = ? AND material_type_id = ?;",
    colourTypeId,
    materialTypeId,
  );
};

export const replaceColourTypeMaterials = async (
  colourTypeId: string,
  materialTypeIds: string[],
): Promise<void> => {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    const current = await db.getAllAsync<{ material_type_id: string }>(
      "SELECT material_type_id FROM colour_type_material_type WHERE colour_type_id = ?;",
      colourTypeId,
    );
    const currentIds = current.map((row) => row.material_type_id);

    for (const id of currentIds) {
      if (!materialTypeIds.includes(id)) {
        await db.runAsync(
          "DELETE FROM colour_type_material_type WHERE colour_type_id = ? AND material_type_id = ?;",
          colourTypeId,
          id,
        );
      }
    }

    for (const id of materialTypeIds) {
      if (!currentIds.includes(id)) {
        await db.runAsync(
          "INSERT OR IGNORE INTO colour_type_material_type (colour_type_id, material_type_id) VALUES (?, ?);",
          colourTypeId,
          id,
        );
      }
    }
  });
};
