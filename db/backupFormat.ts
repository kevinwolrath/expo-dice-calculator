export const BACKUP_FORMAT = "expo-dice-calculator-backup";

export const BACKUP_TABLES = [
  "material_type",
  "production_method",
  "colour_type",
  "colour_type_material_type",
  "colour_brand",
  "material_stock",
  "dice_job_number_colour",
  "dice_job",
  "dice_job_colour",
  "dice_job_colour_type_exclusion",
  "production_method_material",
] as const;

export type BackupTableName = (typeof BACKUP_TABLES)[number];

export type DatabaseBackup = {
  format: typeof BACKUP_FORMAT;
  schemaVersion: number;
  exportedAt: string;
  tables: Record<BackupTableName, Record<string, unknown>[]>;
};

export class BackupParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BackupParseError";
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isRow = (value: unknown): value is Record<string, unknown> =>
  isRecord(value);

export const parseBackupJson = (text: string): DatabaseBackup => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new BackupParseError("invalidJson");
  }

  if (!isRecord(parsed) || parsed.format !== BACKUP_FORMAT) {
    throw new BackupParseError("invalidFormat");
  }

  if (!isRecord(parsed.tables)) {
    throw new BackupParseError("invalidFormat");
  }

  const tables = {} as Record<BackupTableName, Record<string, unknown>[]>;
  for (const table of BACKUP_TABLES) {
    const rows = parsed.tables[table];
    if (rows === undefined) {
      tables[table] = [];
      continue;
    }
    if (!Array.isArray(rows) || !rows.every(isRow)) {
      throw new BackupParseError("invalidFormat");
    }
    tables[table] = rows;
  }

  return {
    format: BACKUP_FORMAT,
    schemaVersion:
      typeof parsed.schemaVersion === "number" ? parsed.schemaVersion : 0,
    exportedAt: typeof parsed.exportedAt === "string" ? parsed.exportedAt : "",
    tables,
  };
};
