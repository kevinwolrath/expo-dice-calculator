import { getDatabase } from "../client";
import type { MaterialType } from "../types";

export const listMaterialTypes = async (): Promise<MaterialType[]> => {
  const db = await getDatabase();
  return db.getAllAsync<MaterialType>(
    "SELECT material_type_id, description, created_at FROM material_type ORDER BY description;",
  );
};

export const getMaterialType = async (
  id: number,
): Promise<MaterialType | null> => {
  const db = await getDatabase();
  return db.getFirstAsync<MaterialType>(
    "SELECT material_type_id, description, created_at FROM material_type WHERE material_type_id = ?;",
    id,
  );
};

export const createMaterialType = async (input: {
  description: string;
}): Promise<MaterialType> => {
  const db = await getDatabase();
  const result = await db.runAsync(
    "INSERT INTO material_type (description) VALUES (?);",
    input.description,
  );
  const created = await getMaterialType(result.lastInsertRowId);
  if (!created) throw new Error("Failed to load created material type");
  return created;
};

export const updateMaterialType = async (
  id: number,
  input: { description?: string | null },
): Promise<void> => {
  const db = await getDatabase();
  const current = await getMaterialType(id);
  if (!current) throw new Error(`Material type ${id} not found`);
  const newDesc =
    input.description !== undefined ? input.description : current.description;
  await db.runAsync(
    "UPDATE material_type SET description = ? WHERE material_type_id = ?;",
    newDesc,
    id,
  );
};

export const deleteMaterialType = async (id: number): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    "DELETE FROM material_type WHERE material_type_id = ?;",
    id,
  );
};
