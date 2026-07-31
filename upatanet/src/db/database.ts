import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";
import { DDL } from "./schema";
import { seedIfEmpty } from "./seed";

let db: SQLiteDatabase | null = null;

export type DB = SQLiteDatabase;

async function migrate(db: SQLiteDatabase) {
  const columns = await db.getAllAsync<{ name: string }>(
    "PRAGMA table_info(Noticia)",
  );
  const names = columns.map((c) => c.name);

  if (!names.includes("usuario_nombre")) {
    await db.execAsync(
      "ALTER TABLE Noticia ADD COLUMN usuario_nombre TEXT NOT NULL DEFAULT ''",
    );
  }
  if (!names.includes("usuario_apellido")) {
    await db.execAsync(
      "ALTER TABLE Noticia ADD COLUMN usuario_apellido TEXT NOT NULL DEFAULT ''",
    );
  }
  if (!names.includes("comunidad_nombre")) {
    await db.execAsync(
      "ALTER TABLE Noticia ADD COLUMN comunidad_nombre TEXT NOT NULL DEFAULT ''",
    );
  }
  if (!names.includes("likes")) {
    await db.execAsync(
      "ALTER TABLE Noticia ADD COLUMN likes INTEGER NOT NULL DEFAULT 0",
    );
  }
  if (!names.includes("dislikes")) {
    await db.execAsync(
      "ALTER TABLE Noticia ADD COLUMN dislikes INTEGER NOT NULL DEFAULT 0",
    );
  }
}

export async function initDatabase(): Promise<SQLiteDatabase> {
  if (db) return db;
  db = await openDatabaseAsync("upatanet.db");
  await db.execAsync(DDL);
  await migrate(db);
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
