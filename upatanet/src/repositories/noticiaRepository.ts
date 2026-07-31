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
  usuario_nombre: string;
  usuario_apellido: string;
  comunidad_nombre: string;
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
    usuario_nombre: string;
    usuario_apellido: string;
    comunidad_nombre: string;
  },
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO Noticia (usuario_id, titulo, descripcion, categoria, datetime, usuario_nombre, usuario_apellido, comunidad_nombre) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.usuario_id, data.titulo, data.descripcion, data.categoria, data.datetime, data.usuario_nombre, data.usuario_apellido, data.comunidad_nombre],
  );
  return result.lastInsertRowId;
}

export async function syncNoticiaCounts(
  db: SQLiteDatabase,
  noticia_id: number,
): Promise<void> {
  const likes = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM Noticia_Reaction WHERE noticia_id = ? AND tipo = 'like'",
    [noticia_id],
  );
  const dislikes = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM Noticia_Reaction WHERE noticia_id = ? AND tipo = 'dislike'",
    [noticia_id],
  );
  await db.runAsync(
    "UPDATE Noticia SET likes = ?, dislikes = ? WHERE id = ?",
    [likes?.count ?? 0, dislikes?.count ?? 0, noticia_id],
  );
}

export async function getAllReactions(
  db: SQLiteDatabase,
  deviceId: string,
): Promise<{ noticia_id: number; usuario_id: string; tipo: string }[]> {
  await db.runAsync(
    "UPDATE Noticia_Reaction SET usuario_id = ? WHERE typeof(usuario_id) = 'integer'",
    [deviceId],
  );
  return db.getAllAsync<{ noticia_id: number; usuario_id: string; tipo: string }>(
    "SELECT noticia_id, usuario_id, tipo FROM Noticia_Reaction",
  );
}

export async function upsertReaction(
  db: SQLiteDatabase,
  deviceId: string,
  noticia_id: number,
  tipo: "like" | "dislike",
): Promise<"like" | "dislike" | null> {
  const existing = await db.getFirstAsync<{ id: number; tipo: string }>(
    "SELECT id, tipo FROM Noticia_Reaction WHERE usuario_id = ? AND noticia_id = ?",
    [deviceId, noticia_id],
  );

  if (existing) {
    if (existing.tipo === tipo) {
      await db.runAsync("DELETE FROM Noticia_Reaction WHERE id = ?", [existing.id]);
      return null;
    } else {
      await db.runAsync("UPDATE Noticia_Reaction SET tipo = ? WHERE id = ?", [
        tipo,
        existing.id,
      ]);
      return tipo;
    }
  } else {
    await db.runAsync(
      "INSERT INTO Noticia_Reaction (usuario_id, noticia_id, tipo) VALUES (?, ?, ?)",
      [deviceId, noticia_id, tipo],
    );
    return tipo;
  }
}
