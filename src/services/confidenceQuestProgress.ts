import {
  doc,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/config/firebase";
import { ACTIVITIES_BY_ID } from "@/constants/activities";
import {
  createActivityAttempt,
  getActivityAttempt,
} from "@/services/activityAttempts";
import {
  getCompletedHubLevels,
} from "@/services/hubLevelProgress";

export type CompleteConfidenceQuestInput =
  {
    parentUid: string;

    childId: string;

    baseActivityId: string;

    levelNumber: number;

    totalLevels: number;

    starsReward: number;

    gemsReward: number;

    reflection?: string;

    metadata?: Record<
      string,
      unknown
    >;
  };

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
      `Invalid Confidence Quest level ${levelNumber} of ${totalLevels}.`,
    );
  }
}

function levelActivityId(
  baseActivityId: string,
  levelNumber: number,
): string {
  return `${baseActivityId}__level_${levelNumber}`;
}

function normalizedReflection(
  reflection:
    | string
    | undefined,
): string | null {
  const value =
    reflection?.trim() ??
    "";

  return value.length > 0
    ? value
    : null;
}

async function markBaseActivityCompleted(
  parentUid: string,
  childId: string,
  baseActivityId: string,
  levelNumber: number,
  totalLevels: number,
  metadata: Record<
    string,
    unknown
  >,
) {
  if (
    levelNumber !== 1
  ) {
    return;
  }

  const catalog =
    ACTIVITIES_BY_ID[
      baseActivityId
    ];

  if (!catalog) {
    throw new Error(
      `Unknown Confidence Quest activity: ${baseActivityId}`,
    );
  }

  const badges =
    catalog.badgeId
      ? [
          catalog.badgeId,
        ]
      : [];

  const existing =
    await getActivityAttempt(
      parentUid,
      childId,
      baseActivityId,
    );

  const baseMetadata = {
    ...(existing?.metadata ??
      {}),

    ...metadata,

    hubLevel:
      levelNumber,

    totalHubLevels:
      totalLevels,

    lastCompletedHubLevel:
      levelNumber,
  };

  if (existing) {
    await updateDoc(
      doc(
        db,
        "parents",
        parentUid,
        "children",
        childId,
        "activityAttempts",
        existing.id,
      ),
      {
        status:
          "completed",

        pillar:
          catalog.pillar,

        starsEarned: 0,

        badgesEarned:
          badges,

        progress: 1,

        metadata:
          baseMetadata,

        completedAt:
          existing.status ===
          "completed"
            ? existing.completedAt ??
              serverTimestamp()
            : serverTimestamp(),

        updatedAt:
          serverTimestamp(),
      },
    );

    return;
  }

  await createActivityAttempt(
    parentUid,
    childId,
    {
      activityId:
        baseActivityId,

      pillar:
        catalog.pillar,

      status:
        "completed",

      starsEarned: 0,

      badgesEarned:
        badges,

      progress: 1,

      metadata:
        baseMetadata,
    },
  );
}

export async function completeConfidenceQuestLevel({
  parentUid,
  childId,
  baseActivityId,
  levelNumber,
  totalLevels,
  starsReward,
  gemsReward,
  reflection,
  metadata,
}: CompleteConfidenceQuestInput): Promise<{
  awarded: boolean;
  completedLevels: number[];
}> {
  assertValidLevel(
    levelNumber,
    totalLevels,
  );

  const catalog =
    ACTIVITIES_BY_ID[
      baseActivityId
    ];

  if (!catalog) {
    throw new Error(
      `Unknown Confidence Quest activity: ${baseActivityId}`,
    );
  }

  const completedBefore =
    await getCompletedHubLevels(
      parentUid,
      childId,
      baseActivityId,
      totalLevels,
    );

  const activityId =
    levelActivityId(
      baseActivityId,
      levelNumber,
    );

  const existing =
    await getActivityAttempt(
      parentUid,
      childId,
      activityId,
    );

  const attemptRef =
    existing
      ? doc(
          db,
          "parents",
          parentUid,
          "children",
          childId,
          "activityAttempts",
          existing.id,
        )
      : doc(
          db,
          "parents",
          parentUid,
          "children",
          childId,
          "activityAttempts",
          `confidence_level_${levelNumber}`,
        );

  const childRef = doc(
    db,
    "parents",
    parentUid,
    "children",
    childId,
  );

  const reflectionValue =
    normalizedReflection(
      reflection,
    );

  const levelMetadata = {
    ...(existing?.metadata ??
      {}),

    ...(metadata ?? {}),

    hubParentActivityId:
      baseActivityId,

    hubLevel:
      levelNumber,

    totalHubLevels:
      totalLevels,

    gemsEarned:
      gemsReward,

    reflection:
      reflectionValue,
  };

  const baseBadge =
    levelNumber === 1 &&
    catalog.badgeId
      ? [
          catalog.badgeId,
        ]
      : [];

  let awarded = false;

  await runTransaction(
    db,
    async (
      transaction,
    ) => {
      const [
        attemptSnapshot,
        childSnapshot,
      ] =
        await Promise.all([
          transaction.get(
            attemptRef,
          ),

          transaction.get(
            childRef,
          ),
        ]);

      if (
        !childSnapshot.exists()
      ) {
        throw new Error(
          "Child profile not found.",
        );
      }

      const attemptData =
        attemptSnapshot.exists()
          ? attemptSnapshot.data()
          : null;

      const alreadyCompleted =
        attemptData?.status ===
        "completed";

      if (
        alreadyCompleted
      ) {
        transaction.update(
          attemptRef,
          {
            metadata: {
              ...((attemptData?.metadata &&
              typeof attemptData.metadata ===
                "object" &&
              !Array.isArray(
                attemptData.metadata,
              )
                ? attemptData.metadata
                : {}) as Record<
                string,
                unknown
              >),

              ...levelMetadata,
            },

            updatedAt:
              serverTimestamp(),
          },
        );

        return;
      }

      const attemptPayload =
        {
          activityId,

          pillar:
            catalog.pillar,

          status:
            "completed",

          starsEarned:
            starsReward,

          badgesEarned:
            baseBadge,

          progress: 1,

          metadata:
            levelMetadata,

          completedAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        };

      if (
        attemptSnapshot.exists()
      ) {
        transaction.update(
          attemptRef,
          attemptPayload,
        );
      } else {
        transaction.set(
          attemptRef,
          {
            ...attemptPayload,

            createdAt:
              serverTimestamp(),
          },
        );
      }

      const childData =
        childSnapshot.data();

      const currentStars =
        typeof childData.stars ===
        "number"
          ? childData.stars
          : 0;

      const currentGems =
        typeof childData.gems ===
        "number"
          ? childData.gems
          : 0;

      const currentBadges =
        Array.isArray(
          childData.badges,
        )
          ? childData.badges.filter(
              (
                badge,
              ): badge is string =>
                typeof badge ===
                "string",
            )
          : [];

      const nextBadges = [
        ...currentBadges,
      ];

      for (
        const badge of
        baseBadge
      ) {
        if (
          !nextBadges.includes(
            badge,
          )
        ) {
          nextBadges.push(
            badge,
          );
        }
      }

      transaction.update(
        childRef,
        {
          stars:
            currentStars +
            starsReward,

          gems:
            currentGems +
            gemsReward,

          badges:
            nextBadges,

          updatedAt:
            serverTimestamp(),
        },
      );

      awarded = true;
    },
  );

  await markBaseActivityCompleted(
    parentUid,
    childId,
    baseActivityId,
    levelNumber,
    totalLevels,
    levelMetadata,
  );

  const completedLevels = [
    ...completedBefore,
    levelNumber,
  ]
    .filter(
      (
        level,
        index,
        levels,
      ) =>
        levels.indexOf(
          level,
        ) === index,
    )
    .sort(
      (left, right) =>
        left - right,
    );

  return {
    awarded,
    completedLevels,
  };
}