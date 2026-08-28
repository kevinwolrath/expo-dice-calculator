import { getDatabase } from "../client";
import type { DiceJob } from "../types";

export const listDiceJobs = async (): Promise<DiceJob[]> => {
  const db = await getDatabase();
  return db.getAllAsync<DiceJob>(
    "SELECT * FROM dice_job ORDER BY created_at DESC, dice_job_id DESC;",
  );
};

export const getDiceJob = async (id: number): Promise<DiceJob | null> => {
  const db = await getDatabase();
  return db.getFirstAsync<DiceJob>(
    "SELECT * FROM dice_job WHERE dice_job_id = ?;",
    id,
  );
};

export const createDiceJob = async (input: {
  job_name: string;
  description?: string | null;
  colour_count: number;
  production_method_id: number;
  dice_job_number_colour_id: number;
}): Promise<DiceJob> => {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO dice_job
      (job_name, description, colour_count, production_method_id, dice_job_number_colour_id)
     VALUES (?, ?, ?, ?, ?);`,
    input.job_name,
    input.description ?? null,
    input.colour_count,
    input.production_method_id,
    input.dice_job_number_colour_id,
  );
  const created = await getDiceJob(result.lastInsertRowId);
  if (!created) throw new Error("Failed to load created dice job");
  return created;
};

export const updateDiceJob = async (
  id: number,
  input: {
    job_name?: string;
    description?: string | null;
    colour_count?: number;
    production_method_id?: number;
    dice_job_number_colour_id?: number;
  },
): Promise<void> => {
  const db = await getDatabase();
  const current = await getDiceJob(id);
  if (!current) throw new Error(`Dice job ${id} not found`);
  await db.runAsync(
    `UPDATE dice_job
     SET job_name = ?, description = ?, colour_count = ?,
         production_method_id = ?, dice_job_number_colour_id = ?, updated_at = CURRENT_TIMESTAMP
     WHERE dice_job_id = ?;`,
    input.job_name ?? current.job_name,
    input.description !== undefined ? input.description : current.description,
    input.colour_count ?? current.colour_count,
    input.production_method_id ?? current.production_method_id,
    input.dice_job_number_colour_id !== undefined
      ? input.dice_job_number_colour_id
      : current.dice_job_number_colour_id,
    id,
  );
};

export const deleteDiceJob = async (id: number): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM dice_job WHERE dice_job_id = ?;", id);
};
