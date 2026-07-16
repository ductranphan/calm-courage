/**
 * Activity attempt service.
 *
 * Tracks scenario/game attempts under
 * parents/{parentUid}/children/{childId}/activityAttempts/{attemptId}.
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

export type ActivityStatus = "available" | "in_progress" | "completed";

export type ActivityAttempt = {
  id: string;
  activityId: string;
  pillar: string;
  status: ActivityStatus;
  starsEarned: number;
  badgesEarned: string[];
  completedAt?: unknown;
  createdAt?: unknown;
};

export type CreateActivityAttemptInput = {
  activityId: string;
  pillar: string;
  status?: ActivityStatus;
  starsEarned?: number;
  badgesEarned?: string[];
};

function attemptsCollection(parentUid: string, childId: string) {
  return collection(
    db,
    "parents",
    parentUid,
    "children",
    childId,
    "activityAttempts"
  );
}

export async function listActivityAttempts(
  parentUid: string,
  childId: string
): Promise<ActivityAttempt[]> {
  const snapshot = await getDocs(
    query(attemptsCollection(parentUid, childId), orderBy("createdAt", "desc"))
  );

  return snapshot.docs.map((attemptDoc) => ({
    id: attemptDoc.id,
    ...(attemptDoc.data() as Omit<ActivityAttempt, "id">),
  }));
}

export async function createActivityAttempt(
  parentUid: string,
  childId: string,
  data: CreateActivityAttemptInput
) {
  const status = data.status ?? "available";

  await addDoc(attemptsCollection(parentUid, childId), {
    activityId: data.activityId,
    pillar: data.pillar,
    status,
    starsEarned: data.starsEarned ?? 0,
    badgesEarned: data.badgesEarned ?? [],
    completedAt: status === "completed" ? serverTimestamp() : null,
    createdAt: serverTimestamp(),
  });
}
