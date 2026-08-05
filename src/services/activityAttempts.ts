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
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  ACTIVITIES_BY_ID,
  getActivitiesForPhase,
  type ActivityPillar,
  type CatalogActivity,
} from "@/constants/activities";
import { db } from "@/config/firebase";
import { awardRewards } from "@/services/children";

export type ActivityStatus =
  | "available"
  | "in_progress"
  | "completed";

export type ActivityAttempt = {
  id: string;
  activityId: string;
  pillar: string;
  status: ActivityStatus;
  starsEarned: number;
  badgesEarned: string[];
  progress?: number;
  metadata?: Record<string, unknown>;
  completedAt?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type CreateActivityAttemptInput = {
  activityId: string;
  pillar: string;
  status?: ActivityStatus;
  starsEarned?: number;
  badgesEarned?: string[];
  progress?: number;
  metadata?: Record<string, unknown>;
};

export type ChildActivityProgress = {
  phase: number;
  completedActivities: number;
  totalActivities: number;
};

export type RecentCompletion = {
  activityId: string;
  title: string;
  pillar: string;
  starsEarned: number;
  gemsEarned: number;
  completedAt?: unknown;
};

export type ChildGameSummary = {
  completedByPillar: Record<string, number>;
  totalCompleted: number;
  recentCompletions: RecentCompletion[];
};

function attemptsCollection(
  parentUid: string,
  childId: string,
) {
  return collection(
    db,
    "parents",
    parentUid,
    "children",
    childId,
    "activityAttempts",
  );
}

function mapAttempt(
  id: string,
  data: Record<string, unknown>,
): ActivityAttempt {
  return {
    id,
    activityId:
      typeof data.activityId === "string"
        ? data.activityId
        : "",
    pillar:
      typeof data.pillar === "string"
        ? data.pillar
        : "",
    status:
      data.status === "in_progress" ||
      data.status === "completed" ||
      data.status === "available"
        ? data.status
        : "available",
    starsEarned:
      typeof data.starsEarned === "number"
        ? data.starsEarned
        : 0,
    badgesEarned: Array.isArray(data.badgesEarned)
      ? data.badgesEarned.filter(
          (badge): badge is string =>
            typeof badge === "string",
        )
      : [],
    progress:
      typeof data.progress === "number"
        ? data.progress
        : undefined,
    metadata:
      data.metadata &&
      typeof data.metadata === "object" &&
      !Array.isArray(data.metadata)
        ? (data.metadata as Record<string, unknown>)
        : undefined,
    completedAt: data.completedAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function listActivityAttempts(
  parentUid: string,
  childId: string,
): Promise<ActivityAttempt[]> {
  const snapshot = await getDocs(
    query(
      attemptsCollection(parentUid, childId),
      orderBy("createdAt", "desc"),
    ),
  );

  return snapshot.docs.map((attemptDoc) =>
    mapAttempt(
      attemptDoc.id,
      attemptDoc.data() as Record<string, unknown>,
    ),
  );
}

/**
 * Loads the attempt document for one catalog activity ID.
 */
export async function getActivityAttempt(
  parentUid: string,
  childId: string,
  activityId: string,
): Promise<ActivityAttempt | null> {
  const snapshot = await getDocs(
    query(
      attemptsCollection(parentUid, childId),
      where("activityId", "==", activityId),
      limit(1),
    ),
  );

  if (snapshot.empty) {
    return null;
  }

  const attemptDoc = snapshot.docs[0];

  return mapAttempt(
    attemptDoc.id,
    attemptDoc.data() as Record<string, unknown>,
  );
}

export async function createActivityAttempt(
  parentUid: string,
  childId: string,
  data: CreateActivityAttemptInput,
): Promise<string> {
  const status = data.status ?? "available";

  const ref = await addDoc(
    attemptsCollection(parentUid, childId),
    {
      activityId: data.activityId,
      pillar: data.pillar,
      status,
      starsEarned: data.starsEarned ?? 0,
      badgesEarned: data.badgesEarned ?? [],
      progress: data.progress ?? 0,
      metadata: data.metadata ?? null,
      completedAt:
        status === "completed"
          ? serverTimestamp()
          : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  );

  return ref.id;
}

/**
 * Seed Phase activities for a newly created or older child profile.
 * Existing activity IDs are preserved.
 */
export async function seedPhaseActivities(
  parentUid: string,
  childId: string,
  phase = 1,
): Promise<void> {
  const catalog = getActivitiesForPhase(phase);
  const existing = await listActivityAttempts(
    parentUid,
    childId,
  );
  const existingIds = new Set(
    existing.map((attempt) => attempt.activityId),
  );

  await Promise.all(
    catalog
      .filter(
        (activity) => !existingIds.has(activity.id),
      )
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
 * Marks a catalog activity in_progress so hubs can show Continue state.
 * Already-completed activities are left unchanged.
 */
export async function startActivityById(
  parentUid: string,
  childId: string,
  activityId: string,
  metadata?: Record<string, unknown>,
): Promise<ActivityAttempt | null> {
  const activity = ACTIVITIES_BY_ID[activityId];

  if (!activity) {
    console.warn(
      `Skipping unknown activity start: ${activityId}`,
    );
    return null;
  }

  const existing = await getActivityAttempt(
    parentUid,
    childId,
    activityId,
  );

  if (existing?.status === "completed") {
    return existing;
  }

  if (!existing) {
    const id = await createActivityAttempt(
      parentUid,
      childId,
      {
        activityId: activity.id,
        pillar: activity.pillar,
        status: "in_progress",
        progress: 0,
        metadata,
      },
    );

    return {
      id,
      activityId: activity.id,
      pillar: activity.pillar,
      status: "in_progress",
      starsEarned: 0,
      badgesEarned: [],
      progress: 0,
      metadata,
    };
  }

  await updateDoc(
    doc(
      attemptsCollection(parentUid, childId),
      existing.id,
    ),
    {
      status: "in_progress",
      updatedAt: serverTimestamp(),
      ...(metadata
        ? { metadata }
        : {}),
    },
  );

  return {
    ...existing,
    status: "in_progress",
    metadata: metadata ?? existing.metadata,
  };
}

/**
 * Complete a catalog activity by ID. Unknown IDs are ignored safely.
 */
export async function completeActivityById(
  parentUid: string,
  childId: string,
  activityId: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const activity = ACTIVITIES_BY_ID[activityId];

  if (!activity) {
    console.warn(
      `Skipping unknown activity completion: ${activityId}`,
    );
    return;
  }

  await completeActivityAttempt(
    parentUid,
    childId,
    activity,
    metadata,
  );
}

/**
 * Marks an activity attempt completed and awards the catalog rewards once.
 */
export async function completeActivityAttempt(
  parentUid: string,
  childId: string,
  activity: CatalogActivity,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const snapshot = await getDocs(
    query(
      attemptsCollection(parentUid, childId),
      where("activityId", "==", activity.id),
    ),
  );

  const badges = activity.badgeId
    ? [activity.badgeId]
    : [];

  if (snapshot.empty) {
    await createActivityAttempt(
      parentUid,
      childId,
      {
        activityId: activity.id,
        pillar: activity.pillar,
        status: "completed",
        starsEarned: activity.starsReward,
        badgesEarned: badges,
        progress: 1,
        metadata,
      },
    );
  } else {
    const attemptDoc = snapshot.docs[0];
    const current = attemptDoc.data() as Omit<
      ActivityAttempt,
      "id"
    >;

    if (current.status === "completed") {
      return;
    }

    await updateDoc(
      doc(
        attemptsCollection(parentUid, childId),
        attemptDoc.id,
      ),
      {
        status: "completed",
        starsEarned: activity.starsReward,
        badgesEarned: badges,
        progress: 1,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...(metadata
          ? { metadata }
          : {}),
      },
    );
  }

  await awardRewards(parentUid, childId, {
    stars: activity.starsReward,
    gems: activity.gemsReward,
    badges,
  });
}

/**
 * Computes dashboard progress for a child's phase from Firestore attempts.
 */
export async function getChildActivityProgress(
  parentUid: string,
  childId: string,
  phase = 1,
): Promise<ChildActivityProgress> {
  const catalog = getActivitiesForPhase(phase);
  const totalActivities = catalog.length;

  if (totalActivities === 0) {
    return {
      phase,
      completedActivities: 0,
      totalActivities: 0,
    };
  }

  const catalogIds = new Set(
    catalog.map((activity) => activity.id),
  );
  const attempts = await listActivityAttempts(
    parentUid,
    childId,
  );

  const completedIds = new Set(
    attempts
      .filter(
        (attempt) =>
          attempt.status === "completed" &&
          catalogIds.has(attempt.activityId),
      )
      .map((attempt) => attempt.activityId),
  );

  return {
    phase,
    completedActivities: completedIds.size,
    totalActivities,
  };
}

function timestampToMillis(
  value: unknown,
): number {
  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof (value as { toMillis?: unknown })
      .toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }

  return 0;
}

/**
 * Recent completed catalog activities for the parent dashboard strip.
 */
export async function getRecentCompletions(
  parentUid: string,
  childId: string,
  maxItems = 5,
): Promise<RecentCompletion[]> {
  const attempts = await listActivityAttempts(
    parentUid,
    childId,
  );

  return attempts
    .filter(
      (attempt) =>
        attempt.status === "completed" &&
        Boolean(ACTIVITIES_BY_ID[attempt.activityId]),
    )
    .sort(
      (left, right) =>
        timestampToMillis(right.completedAt) -
        timestampToMillis(left.completedAt),
    )
    .slice(0, maxItems)
    .map((attempt) => {
      const catalog =
        ACTIVITIES_BY_ID[attempt.activityId];

      return {
        activityId: attempt.activityId,
        title: catalog.title,
        pillar: catalog.pillar,
        starsEarned: catalog.starsReward,
        gemsEarned: catalog.gemsReward,
        completedAt: attempt.completedAt,
      };
    });
}

/**
 * Pillar counts + recent completions for parent progress copy.
 */
export async function getChildGameSummary(
  parentUid: string,
  childId: string,
): Promise<ChildGameSummary> {
  const attempts = await listActivityAttempts(
    parentUid,
    childId,
  );

  const completedByPillar: Record<
    string,
    number
  > = {};

  let totalCompleted = 0;

  for (const attempt of attempts) {
    if (attempt.status !== "completed") {
      continue;
    }

    const catalog =
      ACTIVITIES_BY_ID[attempt.activityId];

    if (!catalog) {
      continue;
    }

    totalCompleted += 1;
    const pillar: ActivityPillar | string =
      catalog.pillar;
    completedByPillar[pillar] =
      (completedByPillar[pillar] ?? 0) + 1;
  }

  const recentCompletions =
    await getRecentCompletions(
      parentUid,
      childId,
      5,
    );

  return {
    completedByPillar,
    totalCompleted,
    recentCompletions,
  };
}
