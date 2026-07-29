/**
 * Daily emotion check-in service.
 *
 * Check-ins are stored under:
 * parents/{parentUid}/children/{childId}/checkIns/{localDate}
 *
 * Using the local date as the document ID guarantees that each child can
 * have at most one check-in document per calendar day.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/config/firebase";

export type CheckIn = {
  id: string;
  emotion: string;
  localDate?: string;
  scenarioId?: string;
  notes?: string;
  createdAt?: unknown;
};

export type CreateCheckInInput = Pick<
  CheckIn,
  "emotion" | "scenarioId" | "notes"
>;

/**
 * Returns YYYY-MM-DD using the device's local calendar date.
 *
 * Do not use toISOString() here because it converts the date to UTC and can
 * produce the previous or following day for users in some time zones.
 */
export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function checkInsCollection(parentUid: string, childId: string) {
  return collection(
    db,
    "parents",
    parentUid,
    "children",
    childId,
    "checkIns",
  );
}

function dailyCheckInDocument(
  parentUid: string,
  childId: string,
  localDate: string,
) {
  return doc(checkInsCollection(parentUid, childId), localDate);
}

function timestampToDate(value: unknown): Date | null {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }

  return null;
}

function checkInMatchesDate(checkIn: CheckIn, localDate: string): boolean {
  if (checkIn.localDate === localDate || checkIn.id === localDate) {
    return true;
  }

  const createdDate = timestampToDate(checkIn.createdAt);

  return createdDate
    ? getLocalDateKey(createdDate) === localDate
    : false;
}

export async function listCheckIns(
  parentUid: string,
  childId: string,
): Promise<CheckIn[]> {
  const snapshot = await getDocs(
    query(
      checkInsCollection(parentUid, childId),
      orderBy("createdAt", "desc"),
    ),
  );

  return snapshot.docs.map((checkInDoc) => ({
    id: checkInDoc.id,
    ...(checkInDoc.data() as Omit<CheckIn, "id">),
  }));
}

/**
 * Finds today's check-in.
 *
 * The direct document read handles the new date-based structure. The small
 * fallback query also recognizes older test check-ins that used random IDs
 * and only stored createdAt.
 */
export async function getTodayCheckIn(
  parentUid: string,
  childId: string,
  date = new Date(),
): Promise<CheckIn | null> {
  const localDate = getLocalDateKey(date);
  const dailySnapshot = await getDoc(
    dailyCheckInDocument(parentUid, childId, localDate),
  );

  if (dailySnapshot.exists()) {
    return {
      id: dailySnapshot.id,
      ...(dailySnapshot.data() as Omit<CheckIn, "id">),
    };
  }

  const recentSnapshot = await getDocs(
    query(
      checkInsCollection(parentUid, childId),
      orderBy("createdAt", "desc"),
      limit(10),
    ),
  );

  for (const checkInDoc of recentSnapshot.docs) {
    const checkIn: CheckIn = {
      id: checkInDoc.id,
      ...(checkInDoc.data() as Omit<CheckIn, "id">),
    };

    if (checkInMatchesDate(checkIn, localDate)) {
      return checkIn;
    }
  }

  return null;
}

/**
 * Creates today's check-in only when one does not already exist.
 *
 * The transaction prevents two rapid taps from creating or replacing more
 * than one date-based document. Existing legacy check-ins from today are
 * also respected by the preliminary lookup.
 */
export async function saveDailyCheckIn(
  parentUid: string,
  childId: string,
  data: CreateCheckInInput,
  date = new Date(),
): Promise<CheckIn> {
  const existingCheckIn = await getTodayCheckIn(
    parentUid,
    childId,
    date,
  );

  if (existingCheckIn) {
    return existingCheckIn;
  }

  const localDate = getLocalDateKey(date);
  const checkInRef = dailyCheckInDocument(
    parentUid,
    childId,
    localDate,
  );

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(checkInRef);

    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...(snapshot.data() as Omit<CheckIn, "id">),
      };
    }

    transaction.set(checkInRef, {
      emotion: data.emotion,
      localDate,
      ...(data.scenarioId
        ? { scenarioId: data.scenarioId }
        : {}),
      ...(data.notes ? { notes: data.notes } : {}),
      createdAt: serverTimestamp(),
    });

    return {
      id: localDate,
      emotion: data.emotion,
      localDate,
      ...(data.scenarioId
        ? { scenarioId: data.scenarioId }
        : {}),
      ...(data.notes ? { notes: data.notes } : {}),
    };
  });
}

/**
 * Backward-compatible name for any older caller.
 */
export async function createCheckIn(
  parentUid: string,
  childId: string,
  data: CreateCheckInInput,
): Promise<CheckIn> {
  return saveDailyCheckIn(parentUid, childId, data);
}