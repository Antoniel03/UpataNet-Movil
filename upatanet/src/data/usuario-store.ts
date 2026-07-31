import { getDb } from "@/src/db/database";
import {
  getDefaultUsuarioId,
  getPerfil,
  isUsuarioRegistered,
  updatePerfil,
  clearUserDataRepo,
  type PerfilData,
} from "@/src/repositories/usuarioRepository";

type Listener = () => void;

const listeners: Set<Listener> = new Set();

let cachedRegistered: boolean | null = null;

function notify() {
  for (const fn of listeners) {
    fn();
  }
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function checkRegistration(): Promise<boolean> {
  const db = getDb();
  cachedRegistered = await isUsuarioRegistered(db);
  return cachedRegistered;
}

export function getIsRegistered(): boolean {
  return cachedRegistered ?? false;
}

export async function loadPerfil(): Promise<PerfilData | null> {
  const db = getDb();
  return getPerfil(db);
}

export async function savePerfil(data: PerfilData): Promise<void> {
  const db = getDb();
  await updatePerfil(db, data);
  cachedRegistered = await isUsuarioRegistered(db);
  notify();
}

export async function clearUserData(): Promise<void> {
  const db = getDb();
  await clearUserDataRepo(db);
  cachedRegistered = false;
  notify();
}

export async function getCurrentUsuarioId(): Promise<number> {
  const db = getDb();
  return getDefaultUsuarioId(db);
}
