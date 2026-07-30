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

const NOTICIA_WITH_REACTIONS = `
  SELECT n.*,
    (SELECT COUNT(*) FROM Noticia_Reaction WHERE noticia_id = n.id AND tipo = 'like') as likes,
    (SELECT COUNT(*) FROM Noticia_Reaction WHERE noticia_id = n.id AND tipo = 'dislike') as dislikes
  FROM Noticia n
`;

export async function getAllNoticias(
  db: SQLiteDatabase,
): Promise<NoticiaRow[]> {
  return db.getAllAsync<NoticiaRow>(
    NOTICIA_WITH_REACTIONS + " ORDER BY n.id DESC",
  );
}

export async function getNoticiaById(
  db: SQLiteDatabase,
  id: number,
): Promise<NoticiaRow | null> {
  return db.getFirstAsync<NoticiaRow>(
    NOTICIA_WITH_REACTIONS + " WHERE n.id = ?",
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
    `INSERT INTO Noticia (usuario_id, titulo, descripcion, categoria, datetime) VALUES (?, ?, ?, ?, ?)`,
    [data.usuario_id, data.titulo, data.descripcion, data.categoria, data.datetime],
  );
  return result.lastInsertRowId;
}

export async function upsertReaction(
  db: SQLiteDatabase,
  usuario_id: number,
  noticia_id: number,
  tipo: "like" | "dislike",
): Promise<void> {
  const existing = await db.getFirstAsync<{ id: number; tipo: string }>(
    "SELECT id, tipo FROM Noticia_Reaction WHERE usuario_id = ? AND noticia_id = ?",
    [usuario_id, noticia_id],
  );

  if (existing) {
    if (existing.tipo === tipo) {
      await db.runAsync("DELETE FROM Noticia_Reaction WHERE id = ?", [existing.id]);
    } else {
      await db.runAsync("UPDATE Noticia_Reaction SET tipo = ? WHERE id = ?", [
        tipo,
        existing.id,
      ]);
    }
  } else {
    await db.runAsync(
      "INSERT INTO Noticia_Reaction (usuario_id, noticia_id, tipo) VALUES (?, ?, ?)",
      [usuario_id, noticia_id, tipo],
    );
  }
}
