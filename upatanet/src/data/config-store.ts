import Storage from "expo-sqlite/kv-store";
import { SYNC_SERVER_URL } from "@/src/sync/config";

const SYNC_SERVER_URL_KEY = "sync_server_url";

let cachedUrl: string | null = null;

export async function loadSyncServerUrl(): Promise<string> {
  const stored = await Storage.getItemAsync(SYNC_SERVER_URL_KEY);
  cachedUrl = stored && stored.trim() !== "" ? stored : SYNC_SERVER_URL;
  return cachedUrl;
}

export async function setSyncServerUrl(url: string): Promise<string> {
  const normalized = normalizeUrl(url);
  await Storage.setItemAsync(SYNC_SERVER_URL_KEY, normalized);
  cachedUrl = normalized;
  return normalized;
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^wss?:\/\//i.test(trimmed)) return trimmed;
  return `ws://${trimmed}`;
}
