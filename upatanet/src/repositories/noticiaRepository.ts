import type { SQLiteDatabase } from "expo-sqlite";

export interface NoticiaRow {
  id: number;
  usuario_id: number;
  titulo: string;
  descripcion: string;
  categoria: string | null;
  datetime: string | null;
  likes: number;
  dislikes: number;
}

export async function getAllNoticias(
  db: SQLiteDatabase,
): Promise<NoticiaRow[]> {
  return db.getAllAsync<NoticiaRow>(
    "SELECT * FROM Noticia ORDER BY id DESC",
  );
}

export async function getNoticiaById(
  db: SQLiteDatabase,
  id: number,
): Promise<NoticiaRow | null> {
  return db.getFirstAsync<NoticiaRow>(
    "SELECT * FROM Noticia WHERE id = ?",
    [id],
  );
}

export async function createNoticia(
  db: SQLiteDatabase,
  data: {
    usuario_id: number;
    titulo: string;
    descripcion: string;
    categoria: string;
    datetime: string;
  },
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO Noticia (usuario_id, titulo, descripcion, categoria, datetime, likes, dislikes) VALUES (?, ?, ?, ?, ?, 0, 0)`,
    [data.usuario_id, data.titulo, data.descripcion, data.categoria, data.datetime],
  );
  return result.lastInsertRowId;
}

export async function updateLikes(
  db: SQLiteDatabase,
  id: number,
  likes: number,
): Promise<void> {
  await db.runAsync("UPDATE Noticia SET likes = ? WHERE id = ?", [
    likes,
    id,
  ]);
}

export async function updateDislikes(
  db: SQLiteDatabase,
  id: number,
  dislikes: number,
): Promise<void> {
  await db.runAsync("UPDATE Noticia SET dislikes = ? WHERE id = ?", [
    dislikes,
    id,
  ]);
}
