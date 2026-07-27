import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { getDb } from "@/src/db/database";
import { getAllNoticias } from "@/src/repositories/noticiaRepository";

import { SYNC_SERVER_URL } from "./config";
const ROOM_NAME = "upatanet-sync";

export type SyncSubscriber = {
  onNoticiasChange: () => void;
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

export function getYDoc(): Y.Doc | null {
  return ydoc;
}

export function updateNoticiaInYjs(noticia: Record<string, unknown>) {
  if (!ydoc) return;
  const map = ydoc.getMap("noticias");
  map.set(String(noticia.id), noticia);
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
        noticiasMap.set(key, noticia as unknown as Record<string, unknown>);
      }
    }
  });

  noticiasMap.observe(() => {
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
      const likes = typeof noticia.likes === "number" ? noticia.likes : 0;
      const dislikes =
        typeof noticia.dislikes === "number" ? noticia.dislikes : 0;
      await db.runAsync(
        `INSERT INTO Noticia (id, usuario_id, titulo, descripcion, categoria, datetime, likes, dislikes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, 1, titulo, descripcion, categoria, datetime, likes, dislikes],
      );
    }
  }

  notifyNoticiasChange();
}
