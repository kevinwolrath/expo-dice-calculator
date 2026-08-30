import {
  BACKUP_FORMAT,
  parseBackupJson,
  BackupParseError,
} from "../db/backupFormat";

const validBackup = {
  format: BACKUP_FORMAT,
  schemaVersion: 12,
  exportedAt: "2026-08-30T00:00:00.000Z",
  tables: {
    material_type: [{ material_type_id: "mt1", description: "Resin" }],
  },
};

describe("parseBackupJson", () => {
  it("accepts a backup and fills missing tables", () => {
    const backup = parseBackupJson(JSON.stringify(validBackup));
    expect(backup.format).toBe(BACKUP_FORMAT);
    expect(backup.tables.material_type).toEqual(validBackup.tables.material_type);
    expect(backup.tables.dice_job).toEqual([]);
  });

  it("rejects invalid JSON", () => {
    expect(() => parseBackupJson("{")).toThrow(BackupParseError);
  });

  it("rejects a file that is not this app's backup format", () => {
    expect(() => parseBackupJson(JSON.stringify({ format: "other" }))).toThrow(
      BackupParseError,
    );
  });
});
