import type { SQLiteDatabase } from "expo-sqlite";

export async function seedIfEmpty(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM Usuario",
  );
  if (row && row.count > 0) return;

  await db.execAsync(`
    INSERT INTO Usuario (id, nombre, apellido, telefono, tipo) VALUES (1, 'Usuario', '', '', 'indigena');

    INSERT INTO Comunidad (id, nombre, ubicacion, descripcion) VALUES (1, 'General', '', '');

    INSERT INTO Centro_Medico (id, nombre, ubicacion, contacto) VALUES (1, 'Centro General', '', '');

    INSERT INTO Noticia (id, usuario_id, titulo, descripcion, categoria, datetime, usuario_nombre, usuario_apellido, comunidad_nombre) VALUES
      (1, 1, 'Ola de paludismo en Hasupuwei', 'Han aumentado considerablemente los contagios y afectados por el paludismo en la comunidad de Upata. Se necesita atención médica urgente.', 'salud', '17/03/26 10:30', 'Usuario', '', 'General'),
      (2, 1, 'Llegaron insumos a Mahekoto-teri', 'Entre los insumos que se recibieron están: mantas, cobijas, medicamentos y alimentos no perecederos para la comunidad de Mahekoto-teri.', 'insumos', '21/05/26 14:15', 'Usuario', '', 'General'),
      (3, 1, 'Tala de árboles cerca de Comun', 'Se ha reportado tala indiscriminada de árboles en los alrededores de la comunidad. Solicitamos intervención de las autoridades ambientales.', 'naturaleza', '17/03/26 08:45', 'Usuario', '', 'General'),
      (4, 1, 'Se esperan fuertes lluvias estos días', 'El servicio meteorológico ha emitido alerta por fuertes lluvias en la región durante los próximos días. Se recomienda tomar precauciones.', 'alertas', '17/03/26 16:00', 'Usuario', '', 'General');

    INSERT INTO Noticia_Reaction (usuario_id, noticia_id, tipo) VALUES
      (1, 1, 'like'),
      (1, 2, 'like'),
      (1, 3, 'dislike'),
      (1, 4, 'like');

    INSERT INTO Alarma (id, noticia_id, activa) VALUES (1, 1, 0);
  `);
}
