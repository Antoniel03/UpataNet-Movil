import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";
import { DDL } from "./schema";
import { seedIfEmpty } from "./seed";

let db: SQLiteDatabase | null = null;

export type DB = SQLiteDatabase;

export async function initDatabase(): Promise<SQLiteDatabase> {
  if (db) return db;
  db = await openDatabaseAsync("upatanet.db");
  await db.execAsync(DDL);
  await seedIfEmpty(db);
  return db;
}

export function getDb(): SQLiteDatabase {
  if (!db) {
    throw new Error(
      "Database not initialized. Call initDatabase() first.",
    );
  }
  return db;
}
