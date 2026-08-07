import { getDatabase } from "../client";
import type { MaterialStock } from "../types";

export const listMaterialStock = async (): Promise<MaterialStock[]> => {
  const db = await getDatabase();
  return db.getAllAsync<MaterialStock>(
    "SELECT * FROM material_stock ORDER BY colour_name;",
  );
};

export const getMaterialStock = async (
  id: number,
): Promise<MaterialStock | null> => {
  const db = await getDatabase();
  return db.getFirstAsync<MaterialStock>(
    "SELECT * FROM material_stock WHERE material_stock_id = ?;",
    id,
  );
};

export const createMaterialStock = async (input: {
  colour_name: string;
  material_type_id: number;
  quantity_in_stock?: number;
  is_active?: boolean;
}): Promise<MaterialStock> => {
  const db = await getDatabase();
  const result = await db.runAsync(
    "INSERT INTO material_stock (colour_name, material_type_id, quantity_in_stock, is_active) VALUES (?, ?, ?, ?);",
    input.colour_name,
    input.material_type_id,
    input.quantity_in_stock ?? 0,
    input.is_active === false ? 0 : 1,
  );
  const created = await getMaterialStock(result.lastInsertRowId);
  if (!created) throw new Error("Failed to load created material stock");
  return created;
};

export const updateMaterialStock = async (
  id: number,
  input: {
    colour_name?: string;
    material_type_id?: number;
    quantity_in_stock?: number;
    is_active?: boolean;
  },
): Promise<void> => {
  const db = await getDatabase();
  const current = await getMaterialStock(id);
  if (!current) throw new Error(`Material stock ${id} not found`);
  await db.runAsync(
    `UPDATE material_stock
     SET colour_name = ?, material_type_id = ?, quantity_in_stock = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
     WHERE material_stock_id = ?;`,
    input.colour_name ?? current.colour_name,
    input.material_type_id ?? current.material_type_id,
    input.quantity_in_stock ?? current.quantity_in_stock,
    input.is_active === undefined ? current.is_active : input.is_active ? 1 : 0,
    id,
  );
};

export const deleteMaterialStock = async (id: number): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    "DELETE FROM material_stock WHERE material_stock_id = ?;",
    id,
  );
};
