import { getDatabase } from "../client";
import type { ProductionMethodMaterial } from "../types";

export const listAllowedMaterialsForMethod = async (
  productionMethodId: number,
): Promise<ProductionMethodMaterial[]> => {
  const db = await getDatabase();
  return db.getAllAsync<ProductionMethodMaterial>(
    "SELECT * FROM production_method_material WHERE production_method_id = ?;",
    productionMethodId,
  );
};

export const addAllowedMaterial = async (
  productionMethodId: number,
  materialTypeId: number,
): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    "INSERT OR IGNORE INTO production_method_material (production_method_id, material_type_id) VALUES (?, ?);",
    productionMethodId,
    materialTypeId,
  );
};

export const removeAllowedMaterial = async (
  productionMethodId: number,
  materialTypeId: number,
): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    "DELETE FROM production_method_material WHERE production_method_id = ? AND material_type_id = ?;",
    productionMethodId,
    materialTypeId,
  );
};
