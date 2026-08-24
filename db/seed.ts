import type * as SQLite from "expo-sqlite";

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

const DICE_NUMBER_COLOURS: string[] = [
  "Black",
  "White",
  "Gold",
  "Silver",
  "Red",
  "Green",
  "Blue",
];

const SAMPLE_MATERIAL_STOCK: Array<{
  colour_name: string;
  type: "Resin" | "Clay";
  quantity_in_stock: number;
}> = [
  { colour_name: "Red", type: "Resin", quantity_in_stock: 10 },
  { colour_name: "Crimson", type: "Resin", quantity_in_stock: 8 },
  { colour_name: "Maroon", type: "Resin", quantity_in_stock: 6 },
  { colour_name: "Orange", type: "Resin", quantity_in_stock: 10 },
  { colour_name: "Amber", type: "Resin", quantity_in_stock: 7 },
  { colour_name: "Yellow", type: "Resin", quantity_in_stock: 10 },
  { colour_name: "Gold", type: "Resin", quantity_in_stock: 8 },
  { colour_name: "Lime", type: "Resin", quantity_in_stock: 7 },
  { colour_name: "Green", type: "Resin", quantity_in_stock: 10 },
  { colour_name: "Forest", type: "Resin", quantity_in_stock: 6 },
  { colour_name: "Teal", type: "Resin", quantity_in_stock: 8 },
  { colour_name: "Turquoise", type: "Resin", quantity_in_stock: 7 },
  { colour_name: "Cyan", type: "Resin", quantity_in_stock: 8 },
  { colour_name: "Sky Blue", type: "Resin", quantity_in_stock: 9 },
  { colour_name: "Blue", type: "Resin", quantity_in_stock: 10 },
  { colour_name: "Navy", type: "Resin", quantity_in_stock: 8 },
  { colour_name: "Royal Blue", type: "Resin", quantity_in_stock: 7 },
  { colour_name: "Purple", type: "Resin", quantity_in_stock: 9 },
  { colour_name: "Violet", type: "Resin", quantity_in_stock: 7 },
  { colour_name: "Lavender", type: "Resin", quantity_in_stock: 6 },
  { colour_name: "Magenta", type: "Resin", quantity_in_stock: 7 },
  { colour_name: "Pink", type: "Resin", quantity_in_stock: 9 },
  { colour_name: "Hot Pink", type: "Resin", quantity_in_stock: 6 },
  { colour_name: "Coral", type: "Resin", quantity_in_stock: 7 },
  { colour_name: "Peach", type: "Resin", quantity_in_stock: 6 },
  { colour_name: "Cream", type: "Resin", quantity_in_stock: 8 },
  { colour_name: "Ivory", type: "Resin", quantity_in_stock: 7 },
  { colour_name: "Pearl", type: "Resin", quantity_in_stock: 6 },
  { colour_name: "White", type: "Resin", quantity_in_stock: 10 },
  { colour_name: "Silver", type: "Resin", quantity_in_stock: 8 },
  { colour_name: "Smoke", type: "Resin", quantity_in_stock: 7 },
  { colour_name: "Grey", type: "Resin", quantity_in_stock: 8 },
  { colour_name: "Charcoal", type: "Resin", quantity_in_stock: 7 },
  { colour_name: "Black", type: "Resin", quantity_in_stock: 10 },
  { colour_name: "Copper", type: "Resin", quantity_in_stock: 6 },
  { colour_name: "Bronze", type: "Resin", quantity_in_stock: 6 },
  { colour_name: "Clear", type: "Resin", quantity_in_stock: 12 },
  { colour_name: "Neon Green", type: "Resin", quantity_in_stock: 5 },
  { colour_name: "Neon Pink", type: "Resin", quantity_in_stock: 5 },
  { colour_name: "Terracotta", type: "Clay", quantity_in_stock: 5 },
  { colour_name: "Stone Grey", type: "Clay", quantity_in_stock: 5 },
  { colour_name: "Ochre", type: "Clay", quantity_in_stock: 4 },
  { colour_name: "Sand", type: "Clay", quantity_in_stock: 5 },
  { colour_name: "Slate", type: "Clay", quantity_in_stock: 4 },
  { colour_name: "Rust", type: "Clay", quantity_in_stock: 4 },
  { colour_name: "Olive", type: "Clay", quantity_in_stock: 4 },
  { colour_name: "Bone", type: "Clay", quantity_in_stock: 5 },
  { colour_name: "Umber", type: "Clay", quantity_in_stock: 3 },
  { colour_name: "Sienna", type: "Clay", quantity_in_stock: 3 },
];

export const seedInitialData = async (
  db: SQLite.SQLiteDatabase,
): Promise<void> => {
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
      await db.runAsync(
        "INSERT OR IGNORE INTO production_method_material (production_method_id, material_type_id) VALUES (?, ?);",
        methodId,
        resinId,
      );
    }
    if (t.clay) {
      await db.runAsync(
        "INSERT OR IGNORE INTO production_method_material (production_method_id, material_type_id) VALUES (?, ?);",
        methodId,
        clayId,
      );
    }
  }

  for (const name of DICE_NUMBER_COLOURS) {
    await db.runAsync(
      "INSERT OR IGNORE INTO dice_job_number_colour (dice_job_number_colour_name) VALUES (?);",
      name,
    );
  }

  await seedMissingMaterialStock(db, resinId, clayId);
};

export const seedMissingMaterialStock = async (
  db: SQLite.SQLiteDatabase,
  resinId?: number,
  clayId?: number,
): Promise<void> => {
  const resolvedResinId =
    resinId ??
    (
      await db.getFirstAsync<{ material_type_id: number }>(
        "SELECT material_type_id FROM material_type WHERE description = ?;",
        "Resin",
      )
    )?.material_type_id;
  const resolvedClayId =
    clayId ??
    (
      await db.getFirstAsync<{ material_type_id: number }>(
        "SELECT material_type_id FROM material_type WHERE description = ?;",
        "Clay",
      )
    )?.material_type_id;

  if (!resolvedResinId || !resolvedClayId) return;

  for (const stock of SAMPLE_MATERIAL_STOCK) {
    const materialTypeId =
      stock.type === "Resin" ? resolvedResinId : resolvedClayId;
    await db.runAsync(
      `INSERT INTO material_stock (colour_name, material_type_id, quantity_in_stock)
       SELECT ?, ?, ?
       WHERE NOT EXISTS (
         SELECT 1 FROM material_stock
         WHERE colour_name = ? AND material_type_id = ?
       );`,
      stock.colour_name,
      materialTypeId,
      stock.quantity_in_stock,
      stock.colour_name,
      materialTypeId,
    );
  }
};

export default seedInitialData;
