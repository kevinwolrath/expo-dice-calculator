import { getDatabase } from "./client";
import { addAllowedMaterial } from "./services/productionMethodMaterial";

// Techniques data (derived from Techniques.csv)
const TECHNIQUES: Array<{ technique: string; resin: boolean; clay: boolean }> =
  [
    { technique: "Dirty Pour", resin: true, clay: false },
    { technique: "Cloud", resin: true, clay: false },
    { technique: "Petri", resin: true, clay: false },
    { technique: "Swirl", resin: true, clay: false },
    { technique: "Slush Pour", resin: true, clay: false },
    { technique: "Inserts", resin: true, clay: false },
    { technique: "Galaxy", resin: true, clay: false },
    { technique: "Marble", resin: true, clay: true },
    { technique: "Mokume gane", resin: false, clay: true },
    { technique: "Agate style", resin: false, clay: true },
    { technique: "Split pour", resin: true, clay: false },
    { technique: "Layered", resin: true, clay: true },
  ];

export const seedInitialData = async (): Promise<void> => {
  const db = await getDatabase();

  // Ensure material types exist (use INSERT OR IGNORE then read id)
  await db.runAsync(
    "INSERT OR IGNORE INTO material_type (description) VALUES (?);",
    "Resin",
  );
  await db.runAsync(
    "INSERT OR IGNORE INTO material_type (description) VALUES (?);",
    "Clay",
  );

  const resinRow = await db.getFirstAsync<{ material_type_id: number }>(
    "SELECT material_type_id FROM material_type WHERE description = ?;",
    "Resin",
  );
  const clayRow = await db.getFirstAsync<{ material_type_id: number }>(
    "SELECT material_type_id FROM material_type WHERE description = ?;",
    "Clay",
  );

  if (!resinRow || !clayRow) {
    throw new Error("Failed to ensure material types for seeding");
  }

  const resinId = resinRow.material_type_id;
  const clayId = clayRow.material_type_id;

  // For each technique, ensure production_method exists and add allowed materials
  for (const t of TECHNIQUES) {
    await db.runAsync(
      "INSERT OR IGNORE INTO production_method (description) VALUES (?);",
      t.technique,
    );

    const pm = await db.getFirstAsync<{ production_method_id: number }>(
      "SELECT production_method_id FROM production_method WHERE description = ?;",
      t.technique,
    );

    if (!pm) continue;

    const methodId = pm.production_method_id;

    if (t.resin) {
      await addAllowedMaterial(methodId, resinId);
    }
    if (t.clay) {
      await addAllowedMaterial(methodId, clayId);
    }
  }
};

export default seedInitialData;
