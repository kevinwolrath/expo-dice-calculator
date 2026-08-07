import { getDatabase } from "../client";
import type { ProductionMethod } from "../types";

export const listProductionMethods = async (): Promise<ProductionMethod[]> => {
  const db = await getDatabase();
  return db.getAllAsync<ProductionMethod>(
    "SELECT production_method_id, description, created_at FROM production_method ORDER BY description;",
  );
};

export const getProductionMethod = async (
  id: number,
): Promise<ProductionMethod | null> => {
  const db = await getDatabase();
  return db.getFirstAsync<ProductionMethod>(
    "SELECT production_method_id, description, created_at FROM production_method WHERE production_method_id = ?;",
    id,
  );
};

export const createProductionMethod = async (input: {
  description: string;
}): Promise<ProductionMethod> => {
  const db = await getDatabase();
  const result = await db.runAsync(
    "INSERT INTO production_method (description) VALUES (?);",
    input.description,
  );
  const created = await getProductionMethod(result.lastInsertRowId);
  if (!created) throw new Error("Failed to load created production method");
  return created;
};

export const updateProductionMethod = async (
  id: number,
  input: { description?: string | null },
): Promise<void> => {
  const db = await getDatabase();
  const current = await getProductionMethod(id);
  if (!current) throw new Error(`Production method ${id} not found`);
  const newDesc =
    input.description !== undefined ? input.description : current.description;
  await db.runAsync(
    "UPDATE production_method SET description = ? WHERE production_method_id = ?;",
    newDesc,
    id,
  );
};

export const deleteProductionMethod = async (id: number): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    "DELETE FROM production_method WHERE production_method_id = ?;",
    id,
  );
};
