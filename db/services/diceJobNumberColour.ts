import { getDatabase } from "../client";
import type { DiceJobNumberColour } from "../types";
import { generateId } from "../uuid";

export const listDiceJobNumberColours = async (): Promise<
  DiceJobNumberColour[]
> => {
  const db = await getDatabase();
  return db.getAllAsync<DiceJobNumberColour>(
    "SELECT * FROM dice_job_number_colour ORDER BY dice_job_number_colour_name;",
  );
};

export const getDiceJobNumberColour = async (
  id: string,
): Promise<DiceJobNumberColour | null> => {
  const db = await getDatabase();
  return db.getFirstAsync<DiceJobNumberColour>(
    "SELECT * FROM dice_job_number_colour WHERE dice_job_number_colour_id = ?;",
    id,
  );
};

export const createDiceJobNumberColour = async (input: {
  dice_job_number_colour_name: string;
}): Promise<DiceJobNumberColour> => {
  const db = await getDatabase();
  const id = generateId();
  await db.runAsync(
    "INSERT INTO dice_job_number_colour (dice_job_number_colour_id, dice_job_number_colour_name) VALUES (?, ?);",
    id,
    input.dice_job_number_colour_name,
  );
  const created = await getDiceJobNumberColour(id);
  if (!created)
    throw new Error("Failed to load created dice job number colour");
  return created;
};

export const updateDiceJobNumberColour = async (
  id: string,
  input: { dice_job_number_colour_name?: string },
): Promise<void> => {
  const db = await getDatabase();
  const current = await getDiceJobNumberColour(id);
  if (!current) throw new Error(`Dice job number colour ${id} not found`);
  await db.runAsync(
    "UPDATE dice_job_number_colour SET dice_job_number_colour_name = ? WHERE dice_job_number_colour_id = ?;",
    input.dice_job_number_colour_name ?? current.dice_job_number_colour_name,
    id,
  );
};

export const deleteDiceJobNumberColour = async (id: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    "DELETE FROM dice_job_number_colour WHERE dice_job_number_colour_id = ?;",
    id,
  );
};
