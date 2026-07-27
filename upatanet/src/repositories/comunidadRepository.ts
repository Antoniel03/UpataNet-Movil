import type { SQLiteDatabase } from "expo-sqlite";

export interface ComunidadRow {
  id: number;
  nombre: string;
  ubicacion: string;
  descripcion: string;
}

export async function getAllComunidades(
  db: SQLiteDatabase,
): Promise<ComunidadRow[]> {
  return db.getAllAsync<ComunidadRow>(
    "SELECT * FROM Comunidad ORDER BY nombre",
  );
}
