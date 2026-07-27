import * as Crypto from "expo-crypto";

function ensureSecure() {}

const subtle = {
  digest: async (_algorithm: string, data: Uint8Array) => {
    const hex = Array.from(data)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const hashHex = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      hex,
    );
    const hashBytes = new Uint8Array(hashHex.length / 2);
    for (let i = 0; i < hashHex.length; i += 2) {
      hashBytes[i / 2] = parseInt(hashHex.slice(i, i + 2), 16);
    }
    return hashBytes;
  },
  encrypt: () => Promise.reject(new Error("Not implemented")),
  decrypt: () => Promise.reject(new Error("Not implemented")),
  generateKey: () => Promise.reject(new Error("Not implemented")),
  importKey: () => Promise.reject(new Error("Not implemented")),
  exportKey: () => Promise.reject(new Error("Not implemented")),
  sign: () => Promise.reject(new Error("Not implemented")),
  verify: () => Promise.reject(new Error("Not implemented")),
  deriveKey: () => Promise.reject(new Error("Not implemented")),
  deriveBits: () => Promise.reject(new Error("Not implemented")),
  wrapKey: () => Promise.reject(new Error("Not implemented")),
  unwrapKey: () => Promise.reject(new Error("Not implemented")),
};

const cryptoImpl = {
  ensureSecure,
  subtle,
  getRandomValues: (array: Uint8Array) => Crypto.getRandomValues(array),
  randomUUID: () => Crypto.randomUUID(),
};

export default cryptoImpl;
export { getRandomValues, subtle };

function getRandomValues(array: Uint8Array) {
  return Crypto.getRandomValues(array);
}
