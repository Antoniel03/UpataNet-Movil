import type { SQLiteDatabase } from "expo-sqlite";

export interface UsuarioRow {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  tipo: string;
}

export interface PerfilData {
  nombre: string;
  apellido: string;
  comunidad: string;
}

export async function getDefaultUsuario(
  db: SQLiteDatabase,
): Promise<UsuarioRow | null> {
  return db.getFirstAsync<UsuarioRow>(
    "SELECT * FROM Usuario ORDER BY id LIMIT 1",
  );
}

export async function getPerfil(
  db: SQLiteDatabase,
): Promise<PerfilData | null> {
  const usuario = await getDefaultUsuario(db);
  if (!usuario) return null;
  const indigena = await db.getFirstAsync<{ comunidad_id: number }>(
    "SELECT comunidad_id FROM Indigena WHERE usuario_id = ?",
    [usuario.id],
  );
  let comunidad = "";
  if (indigena) {
    const c = await db.getFirstAsync<{ nombre: string }>(
      "SELECT nombre FROM Comunidad WHERE id = ?",
      [indigena.comunidad_id],
    );
    comunidad = c?.nombre ?? "";
  }
  return {
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    comunidad,
  };
}

export async function updatePerfil(
  db: SQLiteDatabase,
  data: PerfilData,
): Promise<void> {
  const usuario = await getDefaultUsuario(db);
  if (!usuario) return;
  await db.runAsync(
    "UPDATE Usuario SET nombre = ?, apellido = ? WHERE id = ?",
    [data.nombre, data.apellido, usuario.id],
  );
  const existing = await db.getFirstAsync<{ id: number }>(
    "SELECT id FROM Comunidad WHERE nombre = ?",
    [data.comunidad],
  );
  let comunidadId: number;
  if (existing) {
    comunidadId = existing.id;
  } else {
    const result = await db.runAsync(
      "INSERT INTO Comunidad (nombre) VALUES (?)",
      [data.comunidad],
    );
    comunidadId = result.lastInsertRowId;
  }
  const indigena = await db.getFirstAsync<{ id: number }>(
    "SELECT id FROM Indigena WHERE usuario_id = ?",
    [usuario.id],
  );
  if (indigena) {
    await db.runAsync(
      "UPDATE Indigena SET comunidad_id = ? WHERE id = ?",
      [comunidadId, indigena.id],
    );
  } else {
    await db.runAsync(
      "INSERT INTO Indigena (usuario_id, comunidad_id, fecha_nacimiento) VALUES (?, ?, '')",
      [usuario.id, comunidadId],
    );
  }
}

export async function isUsuarioRegistered(db: SQLiteDatabase): Promise<boolean> {
  const usuario = await getDefaultUsuario(db);
  if (!usuario) return false;
  return usuario.nombre.trim() !== "" && usuario.apellido.trim() !== "";
}

export async function clearUserDataRepo(db: SQLiteDatabase): Promise<void> {
  const usuario = await getDefaultUsuario(db);
  if (!usuario) return;
  await db.runAsync(
    "UPDATE Usuario SET nombre = '', apellido = '' WHERE id = ?",
    [usuario.id],
  );
  await db.runAsync(
    "DELETE FROM Indigena WHERE usuario_id = ?",
    [usuario.id],
  );
}
