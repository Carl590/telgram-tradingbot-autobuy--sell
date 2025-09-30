import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 12;

const getEncryptionSecret = (): Buffer => {
  const secret = process.env.PRIVATE_KEY_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error(
      "PRIVATE_KEY_ENCRYPTION_KEY is not set. Unable to encrypt sensitive data."
    );
  }
  return crypto.createHash("sha256").update(secret).digest().subarray(0, KEY_LENGTH);
};

export const encryptSensitiveValue = (plaintext: string): string => {
  if (!plaintext) {
    throw new Error("Cannot encrypt empty value");
  }
  const key = getEncryptionSecret();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key as any, iv as any);
  const encryptedChunks: Uint8Array[] = [];
  encryptedChunks.push(cipher.update(plaintext, "utf8") as Uint8Array);
  encryptedChunks.push(cipher.final() as Uint8Array);
  const encrypted = Buffer.concat(encryptedChunks);
  const authTag = cipher.getAuthTag() as any;
  return [iv.toString("base64"), encrypted.toString("base64"), authTag.toString("base64")].join(":");
};

export const decryptSensitiveValue = (payload: string): string => {
  if (!payload) {
    throw new Error("Cannot decrypt empty value");
  }
  const segments = payload.split(":");
  if (segments.length !== 3) {
    // payload is likely stored in plaintext from older versions
    return payload;
  }
  const [ivEncoded, encryptedEncoded, authTagEncoded] = segments;
  const key = getEncryptionSecret();
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key as any,
    Buffer.from(ivEncoded, "base64") as any
  );
  decipher.setAuthTag(Buffer.from(authTagEncoded, "base64") as any);
  const decryptedChunks: Uint8Array[] = [];
  decryptedChunks.push(decipher.update(Buffer.from(encryptedEncoded, "base64")) as Uint8Array);
  decryptedChunks.push(decipher.final() as Uint8Array);
  const decrypted = Buffer.concat(decryptedChunks);
  return decrypted.toString("utf8");
};

export const hashSensitiveValue = (value: string): string => {
  return crypto.createHash("sha256").update(value).digest("hex");
};
