import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(nodeScrypt);

function parsePasswordHash(value: string) {
  const [salt, derivedKey] = value.split(":");
  if (!salt || !derivedKey) {
    throw new Error("Invalid password hash format.");
  }

  return {
    salt: Buffer.from(salt, "hex"),
    derivedKey: Buffer.from(derivedKey, "hex"),
  };
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, passwordHash: string) {
  const { salt, derivedKey } = parsePasswordHash(passwordHash);
  const candidate = (await scrypt(password, salt, 64)) as Buffer;
  return timingSafeEqual(derivedKey, candidate);
}
