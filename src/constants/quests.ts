/**
 * Weekly quest catalog for the Quest Board.
 *
 * Quest progress is stored per child under
 * parents/{uid}/children/{childId}/quests/{weekKey_questId}.
 */

export type QuestCategory =
  | "confidence"
  | "emotion"
  | "kindness"
  | "gratitude"
  | "resilience"
  | "friendship";

export type QuestCatalogItem = {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  totalSteps: number;
  starsReward: number;
  gemsReward: number;
  badgeId?: string;
  /**
   * Optional Phase 1 activity completed the first time this quest finishes.
   */
  linkedActivityId?: string;
  /** Quests that must be completed before this one unlocks. */
  unlockAfterQuestIds?: string[];
};

export const QUEST_CATALOG: QuestCatalogItem[] = [
  {
    id: "confidence-climb",
    title: "The Confidence Climb",
    description:
      "Help Pip climb the mountain by proving your own strengths step by step!",
    category: "confidence",
    totalSteps: 1,
    starsReward: 3,
    gemsReward: 1,
    badgeId: "star-explorer-hat",
    linkedActivityId: "phase1_proud_moment",
  },
  {
    id: "kindness-ranger",
    title: "The Kindness Ranger",
    description:
      "Bring warmth back to the forest by completing acts of kindness!",
    category: "kindness",
    totalSteps: 1,
    starsReward: 2,
    gemsReward: 1,
    linkedActivityId: "phase1_kind_words",
  },
  {
    id: "emotion-explorer",
    title: "The Emotion Explorer",
    description:
      "Explore your feelings and become a mood detective!",
    category: "emotion",
    totalSteps: 1,
    starsReward: 2,
    gemsReward: 0,
    linkedActivityId: "phase1_brave_breath",
  },
  {
    id: "gratitude-garden",
    title: "The Gratitude Garden",
    description:
      "Grow your garden by noticing the good things around you!",
    category: "gratitude",
    totalSteps: 1,
    starsReward: 2,
    gemsReward: 1,
    unlockAfterQuestIds: [
      "confidence-climb",
      "kindness-ranger",
    ],
  },
];

export const QUEST_CATALOG_BY_ID: Record<
  string,
  QuestCatalogItem
> = Object.fromEntries(
  QUEST_CATALOG.map((quest) => [quest.id, quest]),
);

/**
 * Stable ISO-like week key: YYYY-Www (Monday-based week).
 */
export function getWeekKey(date = new Date()): string {
  const target = new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    ),
  );

  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);

  const yearStart = new Date(
    Date.UTC(target.getUTCFullYear(), 0, 1),
  );

  const weekNumber = Math.ceil(
    ((target.getTime() - yearStart.getTime()) / 86_400_000 + 1) /
      7,
  );

  const week = String(weekNumber).padStart(2, "0");

  return `${target.getUTCFullYear()}-W${week}`;
}

export function questDocumentId(
  weekKey: string,
  questId: string,
): string {
  return `${weekKey}_${questId}`;
}
