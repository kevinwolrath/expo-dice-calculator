import { getDatabase } from "../client";
import type { DiceJobColourTypeExclusion } from "../types";
import { generateId } from "../uuid";

export const listDiceJobColourTypeExclusions = async (
  diceJobId: string,
): Promise<DiceJobColourTypeExclusion[]> => {
  const db = await getDatabase();
  return db.getAllAsync<DiceJobColourTypeExclusion>(
    "SELECT * FROM dice_job_colour_type_exclusion WHERE dice_job_id = ?;",
    diceJobId,
  );
};

export const replaceDiceJobColourTypeExclusions = async (
  diceJobId: string,
  colourTypeIds: string[],
): Promise<DiceJobColourTypeExclusion[]> => {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      "DELETE FROM dice_job_colour_type_exclusion WHERE dice_job_id = ?;",
      diceJobId,
    );
    for (const colourTypeId of colourTypeIds) {
      await db.runAsync(
        `INSERT INTO dice_job_colour_type_exclusion
          (dice_job_colour_type_exclusion_id, dice_job_id, colour_type_id)
         VALUES (?, ?, ?);`,
        generateId(),
        diceJobId,
        colourTypeId,
      );
    }
  });
  return listDiceJobColourTypeExclusions(diceJobId);
};
