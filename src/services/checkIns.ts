/**
 * Check-in service (stub).
 *
 * Future: daily emotion/check-in records under parents/{uid}/children/{childId}/checkIns.
 */
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/config/firebase";

export type CheckIn = {
  id: string;
  emotion: string;
  scenarioId?: string;
  notes?: string;
  createdAt?: unknown;
};

export async function listCheckIns(
  parentUid: string,
  childId: string
): Promise<CheckIn[]> {
  const checkInsRef = collection(
    db,
    "parents",
    parentUid,
    "children",
    childId,
    "checkIns"
  );
  const snapshot = await getDocs(query(checkInsRef, orderBy("createdAt", "desc")));

  return snapshot.docs.map((checkInDoc) => ({
    id: checkInDoc.id,
    ...(checkInDoc.data() as Omit<CheckIn, "id">),
  }));
}

export async function createCheckIn(
  parentUid: string,
  childId: string,
  data: Pick<CheckIn, "emotion" | "scenarioId" | "notes">
) {
  const checkInsRef = collection(
    db,
    "parents",
    parentUid,
    "children",
    childId,
    "checkIns"
  );

  await addDoc(checkInsRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
}
