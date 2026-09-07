import type * as SQLite from "expo-sqlite";

import { COLOUR_CATALOG } from "./seedColourCatalog";
import { generateId } from "./uuid";

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

export const seedInitialData = async (
  db: SQLite.SQLiteDatabase,
): Promise<void> => {
  await db.runAsync(
    "INSERT OR IGNORE INTO material_type (material_type_id, description) VALUES (?, ?);",
    generateId(),
    "Resin",
  );
  await db.runAsync(
    "INSERT OR IGNORE INTO material_type (material_type_id, description) VALUES (?, ?);",
    generateId(),
    "Clay",
  );

  const resinRow = await db.getFirstAsync<{ material_type_id: string }>(
    "SELECT material_type_id FROM material_type WHERE description = ?;",
    "Resin",
  );
  const clayRow = await db.getFirstAsync<{ material_type_id: string }>(
    "SELECT material_type_id FROM material_type WHERE description = ?;",
    "Clay",
  );

  if (!resinRow || !clayRow) {
    throw new Error("Failed to ensure material types for seeding");
  }

  const resinId = resinRow.material_type_id;
  const clayId = clayRow.material_type_id;

  for (const t of TECHNIQUES) {
    await db.runAsync(
      "INSERT OR IGNORE INTO production_method (production_method_id, description) VALUES (?, ?);",
      generateId(),
      t.technique,
    );

    const pm = await db.getFirstAsync<{ production_method_id: string }>(
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
      "INSERT OR IGNORE INTO dice_job_number_colour (dice_job_number_colour_id, dice_job_number_colour_name) VALUES (?, ?);",
      generateId(),
      name,
    );
  }

  await replaceColourCatalog(db, resinId, clayId);
};

const replaceColourCatalog = async (
  db: SQLite.SQLiteDatabase,
  resinId: string,
  clayId: string,
): Promise<void> => {
  await db.runAsync("DELETE FROM dice_job_colour_type_exclusion;");
  await db.runAsync("DELETE FROM dice_job_colour;");
  await db.runAsync("DELETE FROM material_stock;");
  await db.runAsync("DELETE FROM colour_brand;");
  await db.runAsync("DELETE FROM colour_type_material_type;");
  await db.runAsync("DELETE FROM colour_type;");

  const colourTypeIds = new Map<string, string>();
  const brands = [
    ...new Set(
      COLOUR_CATALOG.map((row) => row.colourBrand).filter((name) => name),
    ),
  ];
  const brandIds = new Map<string, string>();
  for (const name of brands) {
    const id = generateId();
    await db.runAsync(
      "INSERT INTO colour_brand (colour_brand_id, colour_brand_name) VALUES (?, ?);",
      id,
      name,
    );
    brandIds.set(name, id);
  }

  const ensureColourTypeId = async (description: string): Promise<string> => {
    const key = description.trim().toLowerCase();
    const existing = colourTypeIds.get(key);
    if (existing) return existing;
    const id = generateId();
    await db.runAsync(
      "INSERT INTO colour_type (colour_type_id, description) VALUES (?, ?);",
      id,
      description,
    );
    colourTypeIds.set(key, id);
    return id;
  };

  for (const row of COLOUR_CATALOG) {
    const colourBrandId = row.colourBrand
      ? (brandIds.get(row.colourBrand) ?? null)
      : null;
    const quantity = row.inStock ? 1 : 0;
    const isActive = row.inStock ? 1 : 0;
    const materials: string[] = [];
    if (row.resin) materials.push(resinId);
    if (row.clay) materials.push(clayId);
    if (materials.length === 0) continue;

    const colourTypeId = await ensureColourTypeId(row.colourType);
    for (const materialTypeId of materials) {
      await db.runAsync(
        "INSERT OR IGNORE INTO colour_type_material_type (colour_type_id, material_type_id) VALUES (?, ?);",
        colourTypeId,
        materialTypeId,
      );
    }
    await db.runAsync(
      `INSERT INTO material_stock
          (material_stock_id, colour_name, comment, colour_type_id, colour_brand_id, quantity_in_stock, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
      generateId(),
      row.colourName,
      row.comment,
      colourTypeId,
      colourBrandId,
      quantity,
      isActive,
    );
  }
};

export default seedInitialData;
