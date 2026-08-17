import {
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/config/firebase";
import { ACTIVITIES_BY_ID } from "@/constants/activities";
import {
  completeActivityById,
  createActivityAttempt,
  getActivityAttempt,
  listActivityAttempts,
  startActivityById,
} from "@/services/activityAttempts";

function assertValidLevel(
  levelNumber: number,
  totalLevels: number,
) {
  if (
    !Number.isInteger(
      levelNumber,
    ) ||
    !Number.isInteger(
      totalLevels,
    ) ||
    totalLevels < 1 ||
    levelNumber < 1 ||
    levelNumber >
      totalLevels
  ) {
    throw new Error(
      `Invalid hub level ${levelNumber} of ${totalLevels}.`,
    );
  }
}

function getLevelActivityId(
  baseActivityId: string,
  levelNumber: number,
): string {
  return `${baseActivityId}__level_${levelNumber}`;
}

function getLevelPrefix(
  baseActivityId: string,
): string {
  return `${baseActivityId}__level_`;
}

export async function getCompletedHubLevels(
  parentUid: string,
  childId: string,
  baseActivityId: string,
  totalLevels: number,
): Promise<number[]> {
  const attempts =
    await listActivityAttempts(
      parentUid,
      childId,
    );

  const levelPrefix =
    getLevelPrefix(
      baseActivityId,
    );

  const completedLevels =
    new Set<number>();

  for (
    const attempt of attempts
  ) {
    if (
      attempt.status !==
        "completed" ||
      !attempt.activityId.startsWith(
        levelPrefix,
      )
    ) {
      continue;
    }

    const rawLevel =
      attempt.activityId.slice(
        levelPrefix.length,
      );

    const levelNumber =
      Number.parseInt(
        rawLevel,
        10,
      );

    if (
      Number.isInteger(
        levelNumber,
      ) &&
      levelNumber >= 1 &&
      levelNumber <=
        totalLevels
    ) {
      completedLevels.add(
        levelNumber,
      );
    }
  }

  const baseAttempt =
    attempts.find(
      (attempt) =>
        attempt.activityId ===
        baseActivityId,
    );

  if (
    baseAttempt?.status ===
      "completed" &&
    !completedLevels.has(1)
  ) {
    completedLevels.add(1);
  }

  return [
    ...completedLevels,
  ].sort(
    (left, right) =>
      left - right,
  );
}

export async function startHubLevel(
  parentUid: string,
  childId: string,
  baseActivityId: string,
  levelNumber: number,
  totalLevels: number,
  metadata?: Record<
    string,
    unknown
  >,
): Promise<void> {
  assertValidLevel(
    levelNumber,
    totalLevels,
  );

  if (
    !ACTIVITIES_BY_ID[
      baseActivityId
    ]
  ) {
    throw new Error(
      `Unknown hub activity: ${baseActivityId}`,
    );
  }

  await startActivityById(
    parentUid,
    childId,
    baseActivityId,
    {
      ...(metadata ?? {}),
      hubLevel:
        levelNumber,
      totalHubLevels:
        totalLevels,
    },
  );
}

export async function completeHubLevel(
  parentUid: string,
  childId: string,
  baseActivityId: string,
  levelNumber: number,
  totalLevels: number,
  metadata?: Record<
    string,
    unknown
  >,
): Promise<number[]> {
  assertValidLevel(
    levelNumber,
    totalLevels,
  );

  const catalogActivity =
    ACTIVITIES_BY_ID[
      baseActivityId
    ];

  if (!catalogActivity) {
    throw new Error(
      `Unknown hub activity: ${baseActivityId}`,
    );
  }

  const completedBefore =
    await getCompletedHubLevels(
      parentUid,
      childId,
      baseActivityId,
      totalLevels,
    );

  if (
    completedBefore.includes(
      levelNumber,
    )
  ) {
    return completedBefore;
  }

  await startActivityById(
    parentUid,
    childId,
    baseActivityId,
    {
      ...(metadata ?? {}),
      hubLevel:
        levelNumber,
      totalHubLevels:
        totalLevels,
    },
  );

  const levelActivityId =
    getLevelActivityId(
      baseActivityId,
      levelNumber,
    );

  const levelMetadata = {
    ...(metadata ?? {}),
    hubParentActivityId:
      baseActivityId,
    hubLevel:
      levelNumber,
    totalHubLevels:
      totalLevels,
  };

  const existingLevelAttempt =
    await getActivityAttempt(
      parentUid,
      childId,
      levelActivityId,
    );

  if (
    existingLevelAttempt
  ) {
    if (
      existingLevelAttempt.status !==
      "completed"
    ) {
      await updateDoc(
        doc(
          db,
          "parents",
          parentUid,
          "children",
          childId,
          "activityAttempts",
          existingLevelAttempt.id,
        ),
        {
          status:
            "completed",

          pillar:
            catalogActivity.pillar,

          starsEarned: 0,

          badgesEarned: [],

          progress: 1,

          metadata:
            levelMetadata,

          completedAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        },
      );
    }
  } else {
    await createActivityAttempt(
      parentUid,
      childId,
      {
        activityId:
          levelActivityId,

        pillar:
          catalogActivity.pillar,

        status:
          "completed",

        starsEarned: 0,

        badgesEarned: [],

        progress: 1,

        metadata:
          levelMetadata,
      },
    );
  }

  const completedAfter = [
    ...completedBefore,
    levelNumber,
  ]
    .filter(
      (
        level,
        index,
        allLevels,
      ) =>
        allLevels.indexOf(
          level,
        ) === index,
    )
    .sort(
      (left, right) =>
        left - right,
    );

  if (
    levelNumber === 1
  ) {
    await completeActivityById(
      parentUid,
      childId,
      baseActivityId,
      {
        ...(metadata ?? {}),

        completedLevels:
          completedAfter,

        totalHubLevels:
          totalLevels,

        lastCompletedHubLevel:
          levelNumber,
      },
    );
  }

  return completedAfter;
}