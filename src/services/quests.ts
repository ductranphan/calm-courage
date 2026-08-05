/**
 * Weekly quest service for the Quest Board.
 *
 * Documents live at:
 * parents/{parentUid}/children/{childId}/quests/{weekKey_questId}
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/config/firebase";
import {
  QUEST_CATALOG,
  QUEST_CATALOG_BY_ID,
  getWeekKey,
  questDocumentId,
  type QuestCatalogItem,
} from "@/constants/quests";
import {
  completeActivityById,
} from "@/services/activityAttempts";
import { awardRewards } from "@/services/children";

export type QuestStatus =
  | "locked"
  | "available"
  | "in_progress"
  | "completed";

export type ChildQuest = {
  id: string;
  questId: string;
  weekKey: string;
  status: QuestStatus;
  progress: number;
  totalSteps: number;
  starsEarned: number;
  gemsEarned: number;
  title: string;
  description: string;
  category: QuestCatalogItem["category"];
  completedAt?: unknown;
  updatedAt?: unknown;
};

function questsCollection(
  parentUid: string,
  childId: string,
) {
  return collection(
    db,
    "parents",
    parentUid,
    "children",
    childId,
    "quests",
  );
}

function questRef(
  parentUid: string,
  childId: string,
  weekKey: string,
  questId: string,
) {
  return doc(
    questsCollection(parentUid, childId),
    questDocumentId(weekKey, questId),
  );
}

function mapQuest(
  data: Record<string, unknown>,
  catalog: QuestCatalogItem,
): ChildQuest {
  const status =
    data.status === "locked" ||
    data.status === "available" ||
    data.status === "in_progress" ||
    data.status === "completed"
      ? data.status
      : "available";

  return {
    id:
      typeof data.id === "string"
        ? data.id
        : questDocumentId(
            String(data.weekKey ?? ""),
            catalog.id,
          ),
    questId: catalog.id,
    weekKey:
      typeof data.weekKey === "string"
        ? data.weekKey
        : "",
    status,
    progress:
      typeof data.progress === "number"
        ? data.progress
        : 0,
    totalSteps: catalog.totalSteps,
    starsEarned:
      typeof data.starsEarned === "number"
        ? data.starsEarned
        : 0,
    gemsEarned:
      typeof data.gemsEarned === "number"
        ? data.gemsEarned
        : 0,
    title: catalog.title,
    description: catalog.description,
    category: catalog.category,
    completedAt: data.completedAt,
    updatedAt: data.updatedAt,
  };
}

function initialStatusForQuest(
  quest: QuestCatalogItem,
  completedQuestIds: Set<string>,
): QuestStatus {
  if (!quest.unlockAfterQuestIds?.length) {
    return "available";
  }

  const unlocked = quest.unlockAfterQuestIds.every(
    (requiredId) => completedQuestIds.has(requiredId),
  );

  return unlocked ? "available" : "locked";
}

/**
 * Creates missing quest docs for the current (or given) week.
 * Existing docs are left alone except locked quests may unlock.
 */
export async function seedWeeklyQuests(
  parentUid: string,
  childId: string,
  weekKey = getWeekKey(),
): Promise<ChildQuest[]> {
  const existingSnapshot = await getDocs(
    query(
      questsCollection(parentUid, childId),
      where("weekKey", "==", weekKey),
    ),
  );

  const existingByQuestId = new Map(
    existingSnapshot.docs.map((questDoc) => {
      const data = questDoc.data() as Record<
        string,
        unknown
      >;
      return [
        String(data.questId ?? ""),
        { id: questDoc.id, data },
      ] as const;
    }),
  );

  const completedQuestIds = new Set(
    [...existingByQuestId.values()]
      .filter(
        ({ data }) => data.status === "completed",
      )
      .map(({ data }) => String(data.questId)),
  );

  for (const catalogQuest of QUEST_CATALOG) {
    const existing = existingByQuestId.get(
      catalogQuest.id,
    );

    if (!existing) {
      const status = initialStatusForQuest(
        catalogQuest,
        completedQuestIds,
      );

      const documentId = questDocumentId(
        weekKey,
        catalogQuest.id,
      );

      await setDoc(
        questRef(
          parentUid,
          childId,
          weekKey,
          catalogQuest.id,
        ),
        {
          id: documentId,
          questId: catalogQuest.id,
          weekKey,
          status,
          progress: 0,
          totalSteps: catalogQuest.totalSteps,
          starsEarned: 0,
          gemsEarned: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          completedAt: null,
        },
      );

      continue;
    }

    if (existing.data.status === "locked") {
      const nextStatus = initialStatusForQuest(
        catalogQuest,
        completedQuestIds,
      );

      if (nextStatus === "available") {
        await updateDoc(
          doc(
            questsCollection(parentUid, childId),
            existing.id,
          ),
          {
            status: "available",
            updatedAt: serverTimestamp(),
          },
        );
      }
    }
  }

  return listChildQuests(parentUid, childId, weekKey);
}

export async function listChildQuests(
  parentUid: string,
  childId: string,
  weekKey = getWeekKey(),
): Promise<ChildQuest[]> {
  const snapshot = await getDocs(
    query(
      questsCollection(parentUid, childId),
      where("weekKey", "==", weekKey),
    ),
  );

  const quests: ChildQuest[] = [];

  for (const questDoc of snapshot.docs) {
    const data = questDoc.data() as Record<
      string,
      unknown
    >;
    const questId =
      typeof data.questId === "string"
        ? data.questId
        : "";
    const catalog = QUEST_CATALOG_BY_ID[questId];

    if (!catalog) {
      continue;
    }

    quests.push(mapQuest(data, catalog));
  }

  return QUEST_CATALOG.map((catalogQuest) => {
    const match = quests.find(
      (quest) => quest.questId === catalogQuest.id,
    );

    return (
      match ??
      mapQuest(
        {
          id: questDocumentId(
            weekKey,
            catalogQuest.id,
          ),
          questId: catalogQuest.id,
          weekKey,
          status: initialStatusForQuest(
            catalogQuest,
            new Set(),
          ),
          progress: 0,
          totalSteps: catalogQuest.totalSteps,
          starsEarned: 0,
          gemsEarned: 0,
        },
        catalogQuest,
      )
    );
  });
}

export async function startQuest(
  parentUid: string,
  childId: string,
  questId: string,
  weekKey = getWeekKey(),
): Promise<ChildQuest | null> {
  const catalog = QUEST_CATALOG_BY_ID[questId];

  if (!catalog) {
    return null;
  }

  await seedWeeklyQuests(parentUid, childId, weekKey);

  const ref = questRef(
    parentUid,
    childId,
    weekKey,
    questId,
  );
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return null;
  }

  const current = snapshot.data() as Record<
    string,
    unknown
  >;

  if (current.status === "completed") {
    return mapQuest(current, catalog);
  }

  if (current.status === "locked") {
    throw new Error(
      "This quest is still locked for this week.",
    );
  }

  if (current.status !== "in_progress") {
    await updateDoc(ref, {
      status: "in_progress",
      updatedAt: serverTimestamp(),
    });
  }

  const refreshed = await getDoc(ref);

  return mapQuest(
    refreshed.data() as Record<string, unknown>,
    catalog,
  );
}

export async function updateQuestProgress(
  parentUid: string,
  childId: string,
  questId: string,
  progress: number,
  weekKey = getWeekKey(),
): Promise<ChildQuest | null> {
  const catalog = QUEST_CATALOG_BY_ID[questId];

  if (!catalog) {
    return null;
  }

  const ref = questRef(
    parentUid,
    childId,
    weekKey,
    questId,
  );
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return null;
  }

  const current = snapshot.data() as Record<
    string,
    unknown
  >;

  if (current.status === "completed") {
    return mapQuest(current, catalog);
  }

  const nextProgress = Math.max(
    0,
    Math.min(catalog.totalSteps, progress),
  );

  await updateDoc(ref, {
    progress: nextProgress,
    status:
      current.status === "locked"
        ? "locked"
        : "in_progress",
    updatedAt: serverTimestamp(),
  });

  if (nextProgress >= catalog.totalSteps) {
    return completeQuest(
      parentUid,
      childId,
      questId,
      weekKey,
    );
  }

  const refreshed = await getDoc(ref);

  return mapQuest(
    refreshed.data() as Record<string, unknown>,
    catalog,
  );
}

/**
 * Completes a quest once, awards quest rewards, and may complete a
 * linked Phase 1 activity (also once).
 */
export async function completeQuest(
  parentUid: string,
  childId: string,
  questId: string,
  weekKey = getWeekKey(),
): Promise<ChildQuest | null> {
  const catalog = QUEST_CATALOG_BY_ID[questId];

  if (!catalog) {
    return null;
  }

  await seedWeeklyQuests(parentUid, childId, weekKey);

  const ref = questRef(
    parentUid,
    childId,
    weekKey,
    questId,
  );
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return null;
  }

  const current = snapshot.data() as Record<
    string,
    unknown
  >;

  if (current.status === "completed") {
    return mapQuest(current, catalog);
  }

  if (current.status === "locked") {
    throw new Error(
      "This quest is still locked for this week.",
    );
  }

  await updateDoc(ref, {
    status: "completed",
    progress: catalog.totalSteps,
    starsEarned: catalog.starsReward,
    gemsEarned: catalog.gemsReward,
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await awardRewards(parentUid, childId, {
    stars: catalog.starsReward,
    gems: catalog.gemsReward,
    badges: catalog.badgeId
      ? [catalog.badgeId]
      : [],
  });

  if (catalog.linkedActivityId) {
    await completeActivityById(
      parentUid,
      childId,
      catalog.linkedActivityId,
      {
        source: "quest",
        questId: catalog.id,
        weekKey,
      },
    );
  }

  /*
   * Re-seed so gratitude-garden (and any gated quest) can unlock
   * after prerequisites finish.
   */
  await seedWeeklyQuests(parentUid, childId, weekKey);

  const refreshed = await getDoc(ref);

  return mapQuest(
    refreshed.data() as Record<string, unknown>,
    catalog,
  );
}
