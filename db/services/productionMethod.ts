import { getDatabase } from "../client";
import type { ProductionMethod } from "../types";
import { generateId } from "../uuid";

export const listProductionMethods = async (): Promise<ProductionMethod[]> => {
  const db = await getDatabase();
  return db.getAllAsync<ProductionMethod>(
    "SELECT production_method_id, description, minimum_colour_count, maximum_colour_count, created_at FROM production_method ORDER BY description;",
  );
};

export const getProductionMethod = async (
  id: string,
): Promise<ProductionMethod | null> => {
  const db = await getDatabase();
  return db.getFirstAsync<ProductionMethod>(
    "SELECT production_method_id, description, minimum_colour_count, maximum_colour_count, created_at FROM production_method WHERE production_method_id = ?;",
    id,
  );
};

export const createProductionMethod = async (input: {
  description: string;
  minimum_colour_count?: number | null;
  maximum_colour_count?: number | null;
}): Promise<ProductionMethod> => {
  const db = await getDatabase();
  const id = generateId();
  await db.runAsync(
    "INSERT INTO production_method (production_method_id, description, minimum_colour_count, maximum_colour_count) VALUES (?, ?, ?, ?);",
    id,
    input.description,
    input.minimum_colour_count ?? null,
    input.maximum_colour_count ?? null,
  );
  const created = await getProductionMethod(id);
  if (!created) throw new Error("Failed to load created production method");
  return created;
};

export const updateProductionMethod = async (
  id: string,
  input: {
    description?: string | null;
    minimum_colour_count?: number | null;
    maximum_colour_count?: number | null;
  },
): Promise<void> => {
  const db = await getDatabase();
  const current = await getProductionMethod(id);
  if (!current) throw new Error(`Production method ${id} not found`);
  const newDesc =
    input.description !== undefined ? input.description : current.description;
  const newMin =
    input.minimum_colour_count !== undefined
      ? input.minimum_colour_count
      : current.minimum_colour_count;
  const newMax =
    input.maximum_colour_count !== undefined
      ? input.maximum_colour_count
      : current.maximum_colour_count;
  await db.runAsync(
    "UPDATE production_method SET description = ?, minimum_colour_count = ?, maximum_colour_count = ? WHERE production_method_id = ?;",
    newDesc,
    newMin,
    newMax,
    id,
  );
};

export const deleteProductionMethod = async (id: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    "DELETE FROM production_method WHERE production_method_id = ?;",
    id,
  );
};
