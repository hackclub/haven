import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  type CipherGCMTypes,
} from "crypto";
// Read the key from `process.env` rather than `$env/dynamic/private` so this
// module stays importable outside the SvelteKit runtime — the Drizzle schema
// pulls it in through `encryptedText`, and drizzle-kit can't resolve `$env`.
// `dotenv` fills in `.env` the way SvelteKit otherwise would.
import "dotenv/config";

// Encrypted values are stored as `v1.<iv>.<authTag>.<ciphertext>`, all base64.
// The version prefix lets us rotate the scheme later without guessing at
// what an existing row contains.
const VERSION = "v1";
const ALGORITHM: CipherGCMTypes = "aes-256-gcm";
const KEY_BYTES = 32;
const IV_BYTES = 12;

let cachedKey: Buffer | null = null;

function getKey(): Buffer {
  if (cachedKey) return cachedKey;

  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("ENCRYPTION_KEY is not set");
  }

  const key = Buffer.from(raw, "base64");
  if (key.length !== KEY_BYTES) {
    throw new Error(
      `ENCRYPTION_KEY must be ${KEY_BYTES} base64-encoded bytes, got ${key.length}`,
    );
  }

  cachedKey = key;
  return key;
}

export function encrypt(plaintext: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  return [
    VERSION,
    iv.toString("base64"),
    cipher.getAuthTag().toString("base64"),
    ciphertext.toString("base64"),
  ].join(".");
}

export function decrypt(value: string): string {
  const [version, iv, authTag, ciphertext] = value.split(".");

  if (version !== VERSION || !iv || !authTag || !ciphertext) {
    throw new Error("Malformed encrypted value");
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(authTag, "base64"));

  return (
    decipher.update(Buffer.from(ciphertext, "base64")).toString("utf8") +
    decipher.final("utf8")
  );
}
