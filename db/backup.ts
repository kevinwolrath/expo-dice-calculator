import type { SQLiteDatabase } from "expo-sqlite";

import {
  BACKUP_FORMAT,
  BACKUP_TABLES,
  parseBackupJson,
  type BackupTableName,
  type DatabaseBackup,
} from "./backupFormat";
import { DATABASE_VERSION, getDatabase } from "./client";

export { BACKUP_FORMAT, BACKUP_TABLES, parseBackupJson };
export type { BackupTableName, DatabaseBackup };
export { BackupParseError } from "./backupFormat";

const COLUMN_NAME = /^[a-z_][a-z0-9_]*$/i;

const insertRow = async (
  db: SQLiteDatabase,
  table: BackupTableName,
  row: Record<string, unknown>,
) => {
  const columns = Object.keys(row).filter((name) => COLUMN_NAME.test(name));
  if (columns.length === 0) return;

  const placeholders = columns.map(() => "?").join(", ");
  const values = columns.map((name) => {
    const value = row[name];
    if (value === undefined) return null;
    if (value === null || typeof value === "string" || typeof value === "number") {
      return value;
    }
    if (typeof value === "boolean") return value ? 1 : 0;
    return JSON.stringify(value);
  });

  await db.runAsync(
    `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`,
    ...values,
  );
};

export const exportDatabaseJson = async (): Promise<string> => {
  const db = await getDatabase();
  const tables = {} as DatabaseBackup["tables"];

  for (const table of BACKUP_TABLES) {
    tables[table] = await db.getAllAsync<Record<string, unknown>>(
      `SELECT * FROM ${table}`,
    );
  }

  const backup: DatabaseBackup = {
    format: BACKUP_FORMAT,
    schemaVersion: DATABASE_VERSION,
    exportedAt: new Date().toISOString(),
    tables,
  };

  return JSON.stringify(backup, null, 2);
};

export const importDatabaseJson = async (text: string): Promise<void> => {
  const backup = parseBackupJson(text);
  const db = await getDatabase();

  await db.execAsync("PRAGMA foreign_keys = OFF");
  try {
    await db.withTransactionAsync(async () => {
      for (const table of [...BACKUP_TABLES].reverse()) {
        await db.execAsync(`DELETE FROM ${table}`);
      }

      for (const table of BACKUP_TABLES) {
        for (const row of backup.tables[table]) {
          await insertRow(db, table, row);
        }
      }
    });
  } finally {
    await db.execAsync("PRAGMA foreign_keys = ON");
  }
};
