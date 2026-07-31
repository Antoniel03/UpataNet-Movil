import { getDb } from "@/src/db/database";
import {
  getAllNoticias,
  getNoticiaById as repoGetNoticiaById,
  createNoticia,
  upsertReaction,
  type NoticiaRow,
} from "@/src/repositories/noticiaRepository";
import { syncReactionToYjs, updateNoticiaInYjs } from "@/src/sync/SyncService";
import { getCurrentUsuarioId, loadPerfil } from "@/src/data/usuario-store";

export type Noticia = NoticiaRow;

type Listener = () => void;

const listeners: Set<Listener> = new Set();

function notify() {
  for (const fn of listeners) {
    fn();
  }
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function getNoticias(): Promise<Noticia[]> {
  const db = getDb();
  return getAllNoticias(db);
}

export async function getNoticiaById(id: number): Promise<Noticia | null> {
  const db = getDb();
  return repoGetNoticiaById(db, id);
}

export async function publishNoticia(data: {
  title: string;
  body: string;
  category: string;
}): Promise<number> {
  const db = getDb();
  const now = new Date();
  const date = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getFullYear()).slice(2)} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const perfil = await loadPerfil();
  const userNombre = perfil?.nombre ?? "";
  const userApellido = perfil?.apellido ?? "";
  const comunidadNombre = perfil?.comunidad ?? "";
  const id = await createNoticia(db, {
    usuario_id: 1,
    titulo: data.title,
    descripcion: data.body,
    categoria: data.category,
    datetime: date,
    usuario_nombre: userNombre,
    usuario_apellido: userApellido,
    comunidad_nombre: comunidadNombre,
  });
  const created = await repoGetNoticiaById(db, id);
  if (created) updateNoticiaInYjs(created as unknown as Record<string, unknown>);
  notify();
  return id;
}

export async function likeNoticia(id: number): Promise<void> {
  const db = getDb();
  const usuario_id = await getCurrentUsuarioId();
  const result = await upsertReaction(db, usuario_id, id, "like");
  syncReactionToYjs(id, usuario_id, result ?? "");
  notify();
}

export async function dislikeNoticia(id: number): Promise<void> {
  const db = getDb();
  const usuario_id = await getCurrentUsuarioId();
  const result = await upsertReaction(db, usuario_id, id, "dislike");
  syncReactionToYjs(id, usuario_id, result ?? "");
  notify();
}
