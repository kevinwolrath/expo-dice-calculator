import * as SQLite from "expo-sqlite";

import { DATABASE_SCHEMA } from "./schema";
import { seedInitialData } from "./seed";

const DATABASE_NAME = "dice_calculator.db";

// Bump this and add a branch below whenever `schema.ts` changes.
// We're using a destructive prototype migration: create a fresh schema
// by dropping existing tables when the version increases.
export const DATABASE_VERSION = 14;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const getDatabase = (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbPromise) {
    dbPromise = openDatabaseWithRetry(DATABASE_NAME);
  }
  return dbPromise;
};

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function openDatabaseWithRetry(name: string, attempts = 5, delay = 200) {
  let lastErr: unknown = null;
  for (let i = 0; i < attempts; i++) {
    try {
      return await SQLite.openDatabaseAsync(name);
    } catch (err: any) {
      lastErr = err;
      // Detect the File System Access API race that prevents opening sync handles.
      const isNoModificationAllowed =
        err?.name === "NoModificationAllowedError" ||
        (typeof err?.message === "string" &&
          err.message.includes("createSyncAccessHandle"));
      if (!isNoModificationAllowed) throw err;
      // If this was the last attempt, rethrow the error.
      if (i === attempts - 1) break;
      // Back off and retry — another handle may be closing.
      // Increase delay slightly between attempts.
      await sleep(delay * (i + 1));
    }
  }
  throw lastErr;
}

// Creates the schema on first run, and migrates on later app updates.
// Pattern follows Expo's recommended `migrateDbIfNeeded` approach.
export const initDatabase = (): Promise<SQLite.SQLiteDatabase> => {
  if (!initPromise) {
    initPromise = initializeDatabase().catch((error) => {
      initPromise = null;
      throw error;
    });
  }

  return initPromise;
};

async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await getDatabase();

  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  let currentVersion = result?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) {
    await seedIfDatabaseIsBlank(db);
    return db;
  }

  await db.execAsync("PRAGMA journal_mode = WAL;");

  // For prototypes we can recreate the DB when the schema version increases.
  if (currentVersion === 0) {
    await db.execAsync(DATABASE_SCHEMA);
    await db.execAsync("PRAGMA foreign_keys = ON;");
    // Seed initial reference data (material types, methods, method-material links)
    try {
      await seedInitialData(db);
    } catch (e) {
      // Swallow seeding errors to avoid breaking DB init in unusual environments,
      // but log to console for diagnostics.
      // eslint-disable-next-line no-console
      console.warn("DB seeding failed:", e);
    }
    currentVersion = DATABASE_VERSION;
  } else {
    // Destructive replace: drop existing tables then create the new schema.
    // This intentionally wipes existing data (acceptable for prototype).
    await db.execAsync("BEGIN;");
    await db.execAsync("DROP TABLE IF EXISTS dice_job_colour_type_exclusion;");
    await db.execAsync("DROP TABLE IF EXISTS production_method_material;");
    await db.execAsync("DROP TABLE IF EXISTS dice_job_colour;");
    await db.execAsync("DROP TABLE IF EXISTS dice_job;");
    await db.execAsync("DROP TABLE IF EXISTS dice_job_number_colour;");
    await db.execAsync("DROP TABLE IF EXISTS material_stock;");
    await db.execAsync("DROP TABLE IF EXISTS colour_brand;");
    await db.execAsync("DROP TABLE IF EXISTS colour_type_material_type;");
    await db.execAsync("DROP TABLE IF EXISTS colour_type;");
    await db.execAsync("DROP TABLE IF EXISTS production_method;");
    await db.execAsync("DROP TABLE IF EXISTS material_type;");
    await db.execAsync(DATABASE_SCHEMA);
    await db.execAsync("COMMIT;");
    await db.execAsync("PRAGMA foreign_keys = ON;");
    try {
      await seedInitialData(db);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("DB seeding failed:", e);
    }
    currentVersion = DATABASE_VERSION;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);

  return db;
}

async function seedIfDatabaseIsBlank(db: SQLite.SQLiteDatabase): Promise<void> {
  const materialTypeCount = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) AS count FROM material_type;",
  );
  const productionMethodCount = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) AS count FROM production_method;",
  );

  if (
    (materialTypeCount?.count ?? 0) > 0 ||
    (productionMethodCount?.count ?? 0) > 0
  ) {
    return;
  }

  try {
    await seedInitialData(db);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("DB seeding failed:", e);
  }
}
