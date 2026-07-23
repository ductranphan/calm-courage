/**
 * Static catalog of courage activities shown on the parent dashboard.
 *
 * Activity attempts in Firestore reference these IDs.
 * Progress is completedAttempts / activities in the child's current phase.
 */

export type ActivityPillar =
  | "emotional_awareness"
  | "confidence"
  | "calm"
  | "courage"
  | "connection";

export type CatalogActivity = {
  id: string;
  title: string;
  pillar: ActivityPillar;
  phase: number;
  starsReward: number;
  gemsReward: number;
  badgeId?: string;
};

/** Phase 1 activities — denominator for the dashboard progress bar. */
export const PHASE_1_ACTIVITIES: CatalogActivity[] = [
  {
    id: "phase1_name_the_feeling",
    title: "Name the Feeling",
    pillar: "emotional_awareness",
    phase: 1,
    starsReward: 2,
    gemsReward: 1,
  },
  {
    id: "phase1_brave_breath",
    title: "Brave Breath",
    pillar: "calm",
    phase: 1,
    starsReward: 2,
    gemsReward: 0,
  },
  {
    id: "phase1_try_something_new",
    title: "Try Something New",
    pillar: "courage",
    phase: 1,
    starsReward: 3,
    gemsReward: 1,
    badgeId: "first_brave_step",
  },
  {
    id: "phase1_kind_words",
    title: "Kind Words",
    pillar: "connection",
    phase: 1,
    starsReward: 2,
    gemsReward: 1,
  },
  {
    id: "phase1_proud_moment",
    title: "Proud Moment",
    pillar: "confidence",
    phase: 1,
    starsReward: 3,
    gemsReward: 1,
    badgeId: "phase1_complete",
  },
];

export const ACTIVITIES_BY_ID: Record<string, CatalogActivity> =
  Object.fromEntries(
    PHASE_1_ACTIVITIES.map((activity) => [activity.id, activity]),
  );

export function getActivitiesForPhase(phase: number): CatalogActivity[] {
  return PHASE_1_ACTIVITIES.filter((activity) => activity.phase === phase);
}
