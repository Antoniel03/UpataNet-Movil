import * as Crypto from "expo-crypto";
import { Buffer } from "buffer";

if (!globalThis.crypto) {
  (globalThis as Record<string, unknown>).crypto = {};
}
const _crypto = globalThis.crypto as unknown as Record<string, unknown>;
_crypto.getRandomValues = (array: Uint8Array) => Crypto.getRandomValues(array);
_crypto.randomUUID = () => Crypto.randomUUID();

globalThis.Buffer = Buffer;
