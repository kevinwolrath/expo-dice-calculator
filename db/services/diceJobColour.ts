import { getDatabase } from "../client";
import type { DiceJobColour } from "../types";

export const listDiceJobColours = async (
  diceJobId: number,
): Promise<DiceJobColour[]> => {
  const db = await getDatabase();
  return db.getAllAsync<DiceJobColour>(
    "SELECT * FROM dice_job_colour WHERE dice_job_id = ? ORDER BY colour_order;",
    diceJobId,
  );
};

export const getDiceJobColour = async (
  id: number,
): Promise<DiceJobColour | null> => {
  const db = await getDatabase();
  return db.getFirstAsync<DiceJobColour>(
    "SELECT * FROM dice_job_colour WHERE dice_job_colour_id = ?;",
    id,
  );
};

export const createDiceJobColour = async (input: {
  dice_job_id: number;
  material_stock_id: number;
  colour_order?: number | null;
}): Promise<DiceJobColour> => {
  const db = await getDatabase();
  const result = await db.runAsync(
    "INSERT INTO dice_job_colour (dice_job_id, material_stock_id, colour_order) VALUES (?, ?, ?);",
    input.dice_job_id,
    input.material_stock_id,
    input.colour_order ?? null,
  );
  const created = await getDiceJobColour(result.lastInsertRowId);
  if (!created) throw new Error("Failed to load created dice job colour");
  return created;
};

export const updateDiceJobColour = async (
  id: number,
  input: { material_stock_id?: number; colour_order?: number | null },
): Promise<void> => {
  const db = await getDatabase();
  const current = await getDiceJobColour(id);
  if (!current) throw new Error(`Dice job colour ${id} not found`);
  await db.runAsync(
    "UPDATE dice_job_colour SET material_stock_id = ?, colour_order = ? WHERE dice_job_colour_id = ?;",
    input.material_stock_id ?? current.material_stock_id,
    input.colour_order !== undefined
      ? input.colour_order
      : current.colour_order,
    id,
  );
};

export const deleteDiceJobColour = async (id: number): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    "DELETE FROM dice_job_colour WHERE dice_job_colour_id = ?;",
    id,
  );
};

export const listAllDiceJobColours = async (): Promise<DiceJobColour[]> => {
  const db = await getDatabase();
  return db.getAllAsync<DiceJobColour>(
    "SELECT * FROM dice_job_colour ORDER BY dice_job_id, colour_order;",
  );
};

export const replaceDiceJobColours = async (
  diceJobId: number,
  materialStockIds: number[],
): Promise<DiceJobColour[]> => {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      "DELETE FROM dice_job_colour WHERE dice_job_id = ?;",
      diceJobId,
    );
    for (let order = 0; order < materialStockIds.length; order += 1) {
      await db.runAsync(
        "INSERT INTO dice_job_colour (dice_job_id, material_stock_id, colour_order) VALUES (?, ?, ?);",
        diceJobId,
        materialStockIds[order],
        order + 1,
      );
    }
  });
  return listDiceJobColours(diceJobId);
};
