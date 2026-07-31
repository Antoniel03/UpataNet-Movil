import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { getDb } from "@/src/db/database";
import {
  getAllNoticias,
  getAllReactions,
} from "@/src/repositories/noticiaRepository";

import { SYNC_SERVER_URL } from "./config";
const ROOM_NAME = "upatanet-sync";

export type SyncSubscriber = {
  onNoticiasChange: () => void;
  onAlarmActivationsChange?: () => void;
};

let ydoc: Y.Doc | null = null;
let provider: WebsocketProvider | null = null;
let subscribers: Set<SyncSubscriber> = new Set();

export function isSyncConnected(): boolean {
  if (!provider) return false;
  return (provider as unknown as { wsconnected?: boolean }).wsconnected ?? false;
}

export function subscribe(sub: SyncSubscriber): () => void {
  subscribers.add(sub);
  return () => subscribers.delete(sub);
}

function notifyNoticiasChange() {
  for (const sub of subscribers) {
    sub.onNoticiasChange();
  }
}

function notifyAlarmActivationsChange() {
  for (const sub of subscribers) {
    sub.onAlarmActivationsChange?.();
  }
}

export function getYDoc(): Y.Doc | null {
  return ydoc;
}

export function updateNoticiaInYjs(noticia: Record<string, unknown>) {
  if (!ydoc) return;
  const map = ydoc.getMap("noticias");
  const { likes, dislikes, ...clean } = noticia;
  map.set(String(noticia.id), clean);
}

export function syncReactionToYjs(
  noticiaId: number,
  usuarioId: number,
  tipo: "like" | "dislike" | "",
) {
  if (!ydoc) return;
  const map = ydoc.getMap("reactions");
  const key = `${noticiaId}_${usuarioId}`;
  if (tipo === "") {
    map.delete(key);
  } else {
    map.set(key, tipo);
  }
}

export interface AlarmActivation {
  id: string;
  communityId: string;
  authorPeerId: string;
  esp32Mac: string;
  action: 'on' | 'off';
  timestamp: number;
  battery?: number;
}

export function getAlarmActivationsArray(): Y.Array<AlarmActivation> | null {
  if (!ydoc) return null;
  return ydoc.getArray<AlarmActivation>("alarm_activations");
}

export function addAlarmActivation(activation: AlarmActivation) {
  if (!ydoc) return;
  const arr = ydoc.getArray<AlarmActivation>("alarm_activations");
  arr.push([activation]);
  notifyAlarmActivationsChange();

  // Auto-generate 'negro' news post when alarm is triggered
  if (activation.action === 'on') {
    const newsId = `alarm-${activation.id}`;
    const map = ydoc.getMap("noticias");
    map.set(newsId, {
      id: newsId,
      usuario_id: 1,
      titulo: `🚨 Alarma activada en ${activation.communityId}`,
      descripcion: `Alarma activada por dispositivo ${activation.esp32Mac.slice(-5)} a las ${new Date(activation.timestamp).toLocaleTimeString()}`,
      categoria: 'alerta',
      datetime: new Date(activation.timestamp).toISOString(),
      likes: 0,
      dislikes: 0,
      severity: 'negro',
      sourceAlarmId: activation.id,
    } as Record<string, unknown>);
  }
}

export function initSync() {
  const db = getDb();
  ydoc = new Y.Doc();

  provider = new WebsocketProvider(SYNC_SERVER_URL, ROOM_NAME, ydoc, {
    connect: true,
  });

  provider.on("status", (event: { status: string }) => {
    console.log("[Sync] WebSocket:", event.status);
  });

  const noticiasMap = ydoc.getMap("noticias");

  getAllNoticias(db).then((existing) => {
    for (const noticia of existing) {
      const key = String(noticia.id);
      if (!noticiasMap.get(key)) {
        const { likes, dislikes, ...clean } = noticia;
        noticiasMap.set(key, clean as unknown as Record<string, unknown>);
      }
    }
  });

  const reactionsMap = ydoc.getMap("reactions");
  getAllReactions(db).then((reactions) => {
    for (const r of reactions) {
      const key = `${r.noticia_id}_${r.usuario_id}`;
      if (!reactionsMap.get(key)) {
        reactionsMap.set(key, r.tipo);
      }
    }
  });

  noticiasMap.observe(() => {
    loadNoticiasFromYjs();
  });

  reactionsMap.observe(() => {
    loadNoticiasFromYjs();
  });
}

async function loadNoticiasFromYjs() {
  if (!ydoc) return;
  const db = getDb();
  const map = ydoc.getMap("noticias");

  for (const [key, value] of map) {
    const noticia = value as Record<string, unknown>;
    const id = parseInt(key, 10);
    if (isNaN(id) || id <= 1) continue;

    const exists = await db.getFirstAsync<{ id: number }>(
      "SELECT id FROM Noticia WHERE id = ?",
      [id],
    );

    if (!exists) {
      const titulo = typeof noticia.titulo === "string" ? noticia.titulo : "";
      const descripcion =
        typeof noticia.descripcion === "string" ? noticia.descripcion : "";
      const categoria =
        typeof noticia.categoria === "string" ? noticia.categoria : null;
      const datetime =
        typeof noticia.datetime === "string" ? noticia.datetime : null;
      const usuario_nombre =
        typeof noticia.usuario_nombre === "string" ? noticia.usuario_nombre : "";
      const usuario_apellido =
        typeof noticia.usuario_apellido === "string" ? noticia.usuario_apellido : "";
      const comunidad_nombre =
        typeof noticia.comunidad_nombre === "string" ? noticia.comunidad_nombre : "";
      await db.runAsync(
        `INSERT OR IGNORE INTO Noticia (id, usuario_id, titulo, descripcion, categoria, datetime, usuario_nombre, usuario_apellido, comunidad_nombre) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, 1, titulo, descripcion, categoria, datetime, usuario_nombre, usuario_apellido, comunidad_nombre],
      );
    }
  }

  const reactionsMap = ydoc.getMap("reactions");
  const countMap = new Map<number, { likes: number; dislikes: number }>();

  for (const [key, tipo] of reactionsMap) {
    const parts = key.split("_");
    const noticiaId = parseInt(parts[0], 10);
    if (isNaN(noticiaId)) continue;
    if (!countMap.has(noticiaId)) countMap.set(noticiaId, { likes: 0, dislikes: 0 });
    const entry = countMap.get(noticiaId)!;
    if (tipo === "like") entry.likes++;
    else if (tipo === "dislike") entry.dislikes++;
  }

  for (const [noticiaId, counts] of countMap) {
    await db.runAsync(
      "UPDATE Noticia SET likes = ?, dislikes = ? WHERE id = ?",
      [counts.likes, counts.dislikes, noticiaId],
    );
  }

  notifyNoticiasChange();
}
