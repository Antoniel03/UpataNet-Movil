import Storage from "expo-sqlite/kv-store";
import * as Crypto from "expo-crypto";
import { SYNC_SERVER_URL } from "@/src/sync/config";

const SYNC_SERVER_URL_KEY = "sync_server_url";
const DEVICE_ID_KEY = "device_id";

let cachedUrl: string | null = null;
let cachedDeviceId: string | null = null;

export async function getDeviceId(): Promise<string> {
  if (cachedDeviceId) return cachedDeviceId;
  const stored = await Storage.getItemAsync(DEVICE_ID_KEY);
  if (stored && stored.trim() !== "") {
    cachedDeviceId = stored;
    return stored;
  }
  const randomBytes = await Crypto.getRandomBytes(16);
  const id = Array.from(randomBytes, (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  await Storage.setItemAsync(DEVICE_ID_KEY, id);
  cachedDeviceId = id;
  return id;
}

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
