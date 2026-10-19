/**
 * Secure ID Encryption / Decryption Utility (Frontend)
 * URL-safe symmetric cipher for MongoDB ObjectIds.
 */

const KEY = [0x3b, 0x8a, 0x5c, 0xd1, 0x4f, 0x92, 0xe7, 0x18, 0x6a, 0xc3, 0x75, 0xbf];

export const encryptUserId = (id) => {
  if (!id || typeof id !== "string") return id || "";
  const clean = id.trim();
  if (clean.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(clean)) return clean;
  let out = "";
  for (let i = 0; i < 12; i++) {
    const byte = parseInt(clean.substr(i * 2, 2), 16);
    const enc = byte ^ KEY[i];
    out += enc.toString(16).padStart(2, "0");
  }
  return out;
};

export const decryptUserId = (encId) => {
  if (!encId || typeof encId !== "string") return encId || "";
  const clean = encId.trim();
  if (clean.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(clean)) return clean;
  let out = "";
  for (let i = 0; i < 12; i++) {
    const byte = parseInt(clean.substr(i * 2, 2), 16);
    const dec = byte ^ KEY[i];
    out += dec.toString(16).padStart(2, "0");
  }
  return out;
};
