import { getDatabase } from "../client";
import type { ColourType } from "../types";
import { generateId } from "../uuid";

export const listColourTypes = async (): Promise<ColourType[]> => {
  const db = await getDatabase();
  return db.getAllAsync<ColourType>(
    `SELECT colour_type_id, description, material_type_id, created_at
     FROM colour_type
     ORDER BY description, material_type_id;`,
  );
};

export const getColourType = async (id: string): Promise<ColourType | null> => {
  const db = await getDatabase();
  return db.getFirstAsync<ColourType>(
    `SELECT colour_type_id, description, material_type_id, created_at
     FROM colour_type
     WHERE colour_type_id = ?;`,
    id,
  );
};

export const createColourType = async (input: {
  description: string;
  material_type_id: string;
}): Promise<ColourType> => {
  const db = await getDatabase();
  const id = generateId();
  await db.runAsync(
    "INSERT INTO colour_type (colour_type_id, description, material_type_id) VALUES (?, ?, ?);",
    id,
    input.description,
    input.material_type_id,
  );
  const created = await getColourType(id);
  if (!created) throw new Error("Failed to load created colour type");
  return created;
};

export const updateColourType = async (
  id: string,
  input: { description?: string | null; material_type_id?: string },
): Promise<void> => {
  const db = await getDatabase();
  const current = await getColourType(id);
  if (!current) throw new Error(`Colour type ${id} not found`);
  await db.runAsync(
    "UPDATE colour_type SET description = ?, material_type_id = ? WHERE colour_type_id = ?;",
    input.description !== undefined && input.description !== null
      ? input.description
      : current.description,
    input.material_type_id ?? current.material_type_id,
    id,
  );
};

export const deleteColourType = async (id: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM colour_type WHERE colour_type_id = ?;", id);
};
