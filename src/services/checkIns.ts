/**
 * Check-in service.
 *
 * Daily emotion check-ins under
 * parents/{parentUid}/children/{childId}/checkIns/{checkInId}.
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

export type Emotion =
  | "happy"
  | "sad"
  | "excited"
  | "frustrated"
  | "calm"
  | "proud"
  | "nervous";

export type CheckIn = {
  id: string;
  emotions: Emotion;
  createdAt?: unknown;
  audioUrl?: string | null;
};

export type CreateCheckInInput = {
  emotions: Emotion;
  audioUrl?: string | null;
};

function checkInsCollection(parentUid: string, childId: string) {
  return collection(
    db,
    "parents",
    parentUid,
    "children",
    childId,
    "checkIns"
  );
}

export async function listCheckIns(
  parentUid: string,
  childId: string
): Promise<CheckIn[]> {
  const snapshot = await getDocs(
    query(checkInsCollection(parentUid, childId), orderBy("createdAt", "desc"))
  );

  return snapshot.docs.map((checkInDoc) => ({
    id: checkInDoc.id,
    ...(checkInDoc.data() as Omit<CheckIn, "id">),
  }));
}

export async function createCheckIn(
  parentUid: string,
  childId: string,
  data: CreateCheckInInput
) {
  await addDoc(checkInsCollection(parentUid, childId), {
    emotions: data.emotions,
    audioUrl: data.audioUrl ?? null,
    createdAt: serverTimestamp(),
  });
}
