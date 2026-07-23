/**
 * Activity attempt service.
 *
 * Tracks scenario/game attempts under
 * parents/{parentUid}/children/{childId}/activityAttempts/{attemptId}.
 */
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  getActivitiesForPhase,
  type CatalogActivity,
} from "@/constants/activities";
import { db } from "@/config/firebase";
import { awardRewards } from "@/services/children";

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

export type ChildActivityProgress = {
  phase: number;
  completedActivities: number;
  totalActivities: number;
};

function attemptsCollection(parentUid: string, childId: string) {
  return collection(
    db,
    "parents",
    parentUid,
    "children",
    childId,
    "activityAttempts",
  );
}

export async function listActivityAttempts(
  parentUid: string,
  childId: string,
): Promise<ActivityAttempt[]> {
  const snapshot = await getDocs(
    query(attemptsCollection(parentUid, childId), orderBy("createdAt", "desc")),
  );

  return snapshot.docs.map((attemptDoc) => ({
    id: attemptDoc.id,
    ...(attemptDoc.data() as Omit<ActivityAttempt, "id">),
  }));
}

export async function createActivityAttempt(
  parentUid: string,
  childId: string,
  data: CreateActivityAttemptInput,
) {
  const status = data.status ?? "available";

  const ref = await addDoc(attemptsCollection(parentUid, childId), {
    activityId: data.activityId,
    pillar: data.pillar,
    status,
    starsEarned: data.starsEarned ?? 0,
    badgesEarned: data.badgesEarned ?? [],
    completedAt: status === "completed" ? serverTimestamp() : null,
    createdAt: serverTimestamp(),
  });

  return ref.id;
}

/**
 * Seed Phase 1 activity attempts for a newly created child.
 * Skips any activityId that already has an attempt.
 */
export async function seedPhaseActivities(
  parentUid: string,
  childId: string,
  phase = 1,
): Promise<void> {
  const catalog = getActivitiesForPhase(phase);
  const existing = await listActivityAttempts(parentUid, childId);
  const existingIds = new Set(existing.map((attempt) => attempt.activityId));

  await Promise.all(
    catalog
      .filter((activity) => !existingIds.has(activity.id))
      .map((activity) =>
        createActivityAttempt(parentUid, childId, {
          activityId: activity.id,
          pillar: activity.pillar,
          status: "available",
        }),
      ),
  );
}

/**
 * Mark an activity attempt completed and award the catalog rewards.
 */
export async function completeActivityAttempt(
  parentUid: string,
  childId: string,
  activity: CatalogActivity,
): Promise<void> {
  const snapshot = await getDocs(
    query(
      attemptsCollection(parentUid, childId),
      where("activityId", "==", activity.id),
    ),
  );

  const badges = activity.badgeId ? [activity.badgeId] : [];

  if (snapshot.empty) {
    await createActivityAttempt(parentUid, childId, {
      activityId: activity.id,
      pillar: activity.pillar,
      status: "completed",
      starsEarned: activity.starsReward,
      badgesEarned: badges,
    });
  } else {
    const attemptDoc = snapshot.docs[0];
    const current = attemptDoc.data() as Omit<ActivityAttempt, "id">;

    if (current.status === "completed") {
      return;
    }

    await updateDoc(doc(attemptsCollection(parentUid, childId), attemptDoc.id), {
      status: "completed",
      starsEarned: activity.starsReward,
      badgesEarned: badges,
      completedAt: serverTimestamp(),
    });
  }

  await awardRewards(parentUid, childId, {
    stars: activity.starsReward,
    gems: activity.gemsReward,
    badges,
  });
}

/**
 * Compute dashboard progress for a child's current phase from Firestore attempts.
 */
export async function getChildActivityProgress(
  parentUid: string,
  childId: string,
  phase = 1,
): Promise<ChildActivityProgress> {
  const catalog = getActivitiesForPhase(phase);
  const totalActivities = catalog.length;

  if (totalActivities === 0) {
    return { phase, completedActivities: 0, totalActivities: 0 };
  }

  const catalogIds = new Set(catalog.map((activity) => activity.id));
  const attempts = await listActivityAttempts(parentUid, childId);

  const completedIds = new Set(
    attempts
      .filter(
        (attempt) =>
          attempt.status === "completed" && catalogIds.has(attempt.activityId),
      )
      .map((attempt) => attempt.activityId),
  );

  return {
    phase,
    completedActivities: completedIds.size,
    totalActivities,
  };
}
