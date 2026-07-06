/**
 * Hash a parent PIN before storing in Firestore.
 */
import * as Crypto from "expo-crypto";

export async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
}

export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}
