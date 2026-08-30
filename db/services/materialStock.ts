import { getDatabase } from "../client";
import type { MaterialStock } from "../types";
import { generateId } from "../uuid";

export const listMaterialStock = async (): Promise<MaterialStock[]> => {
  const db = await getDatabase();
  return db.getAllAsync<MaterialStock>(
    "SELECT * FROM material_stock ORDER BY colour_name;",
  );
};

export const getMaterialStock = async (
  id: string,
): Promise<MaterialStock | null> => {
  const db = await getDatabase();
  return db.getFirstAsync<MaterialStock>(
    "SELECT * FROM material_stock WHERE material_stock_id = ?;",
    id,
  );
};

export const createMaterialStock = async (input: {
  colour_name: string;
  colour_type_id: string;
  colour_brand_id?: string | null;
  quantity_in_stock?: number;
  is_active?: boolean;
}): Promise<MaterialStock> => {
  const db = await getDatabase();
  const id = generateId();
  await db.runAsync(
    "INSERT INTO material_stock (material_stock_id, colour_name, colour_type_id, colour_brand_id, quantity_in_stock, is_active) VALUES (?, ?, ?, ?, ?, ?);",
    id,
    input.colour_name,
    input.colour_type_id,
    input.colour_brand_id ?? null,
    input.quantity_in_stock ?? 0,
    input.is_active === false ? 0 : 1,
  );
  const created = await getMaterialStock(id);
  if (!created) throw new Error("Failed to load created material stock");
  return created;
};

export const updateMaterialStock = async (
  id: string,
  input: {
    colour_name?: string;
    colour_type_id?: string;
    colour_brand_id?: string | null;
    quantity_in_stock?: number;
    is_active?: boolean;
  },
): Promise<void> => {
  const db = await getDatabase();
  const current = await getMaterialStock(id);
  if (!current) throw new Error(`Material stock ${id} not found`);
  await db.runAsync(
    `UPDATE material_stock
     SET colour_name = ?, colour_type_id = ?, colour_brand_id = ?, quantity_in_stock = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
     WHERE material_stock_id = ?;`,
    input.colour_name ?? current.colour_name,
    input.colour_type_id ?? current.colour_type_id,
    input.colour_brand_id !== undefined
      ? input.colour_brand_id
      : current.colour_brand_id,
    input.quantity_in_stock ?? current.quantity_in_stock,
    input.is_active === undefined ? current.is_active : input.is_active ? 1 : 0,
    id,
  );
};

export const deleteMaterialStock = async (id: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    "DELETE FROM material_stock WHERE material_stock_id = ?;",
    id,
  );
};
