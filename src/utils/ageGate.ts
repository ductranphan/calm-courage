/**
 * COPPA age-gate helpers.
 *
 * Uses a neutral birth-year prompt (not "Are you over 13?").
 * Adult clearance may be stored locally. Under-13 birth years are
 * never persisted so we do not collect child personal information
 * before verifiable parental consent.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export const COPPA_MINIMUM_AGE = 13;

const AGE_GATE_STORAGE_KEY = "@calmcourage/ageGate.v1";

export type AgeGateAllowedRecord = {
  status: "allowed";
  birthYear: number;
  completedAt: string;
};

export type AgeGateRecord = AgeGateAllowedRecord;

export function getCurrentCalendarYear(
  now: Date = new Date(),
): number {
  return now.getFullYear();
}

export function isValidBirthYear(
  birthYear: number,
  now: Date = new Date(),
): boolean {
  const currentYear = getCurrentCalendarYear(now);
  return (
    Number.isInteger(birthYear) &&
    birthYear >= 1900 &&
    birthYear <= currentYear
  );
}

/**
 * Age from birth year only (neutral age screen method).
 * Uses calendar year difference, not a full birthday.
 */
export function ageFromBirthYear(
  birthYear: number,
  now: Date = new Date(),
): number {
  return getCurrentCalendarYear(now) - birthYear;
}

export function isCoppaAdult(
  birthYear: number,
  now: Date = new Date(),
): boolean {
  if (!isValidBirthYear(birthYear, now)) {
    return false;
  }

  return ageFromBirthYear(birthYear, now) >= COPPA_MINIMUM_AGE;
}

export async function getAgeGateRecord(): Promise<AgeGateRecord | null> {
  try {
    const raw = await AsyncStorage.getItem(AGE_GATE_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<AgeGateRecord>;

    if (
      parsed.status !== "allowed" ||
      typeof parsed.birthYear !== "number" ||
      !isCoppaAdult(parsed.birthYear) ||
      typeof parsed.completedAt !== "string"
    ) {
      await AsyncStorage.removeItem(AGE_GATE_STORAGE_KEY);
      return null;
    }

    return {
      status: "allowed",
      birthYear: parsed.birthYear,
      completedAt: parsed.completedAt,
    };
  } catch {
    return null;
  }
}

export async function saveAgeGateAllowed(
  birthYear: number,
): Promise<AgeGateAllowedRecord> {
  if (!isCoppaAdult(birthYear)) {
    throw new Error(
      "Only adult birth years may be stored on device.",
    );
  }

  const record: AgeGateAllowedRecord = {
    status: "allowed",
    birthYear,
    completedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(
    AGE_GATE_STORAGE_KEY,
    JSON.stringify(record),
  );

  return record;
}

export async function clearAgeGateRecord(): Promise<void> {
  await AsyncStorage.removeItem(AGE_GATE_STORAGE_KEY);
}

export function parseBirthYearInput(value: string): number | null {
  const trimmed = value.trim();

  if (!/^\d{4}$/.test(trimmed)) {
    return null;
  }

  const year = Number(trimmed);
  return isValidBirthYear(year) ? year : null;
}
