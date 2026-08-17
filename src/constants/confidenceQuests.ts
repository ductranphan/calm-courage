export type ConfidenceQuest = {
  id: number;
  level: 1 | 2 | 3;
  levelTitle: string;
  prompt: string;
  starsReward: number;
  gemsReward: number;
};

export const CONFIDENCE_QUEST_TOTAL_LEVELS = 30;

const LEVEL_1 = {
  level: 1 as const,
  levelTitle: "Easy Confidence Quests",
  starsReward: 10,
  gemsReward: 1,
};

const LEVEL_2 = {
  level: 2 as const,
  levelTitle: "Building Confidence",
  starsReward: 25,
  gemsReward: 3,
};

const LEVEL_3 = {
  level: 3 as const,
  levelTitle: "Courage Challenges",
  starsReward: 50,
  gemsReward: 5,
};

export const CONFIDENCE_QUESTS: ConfidenceQuest[] = [
  {
    id: 1,
    ...LEVEL_1,
    prompt: "Smile at someone today.",
  },
  {
    id: 2,
    ...LEVEL_1,
    prompt: "Say “hello” to someone.",
  },
  {
    id: 3,
    ...LEVEL_1,
    prompt: "Tell someone one thing you like about yourself.",
  },
  {
    id: 4,
    ...LEVEL_1,
    prompt: "Try a new activity for 5 minutes.",
  },
  {
    id: 5,
    ...LEVEL_1,
    prompt: "Make eye contact while talking to someone.",
  },
  {
    id: 6,
    ...LEVEL_1,
    prompt: "Ask someone how their day is going.",
  },
  {
    id: 7,
    ...LEVEL_1,
    prompt: "Share one idea during a conversation.",
  },
  {
    id: 8,
    ...LEVEL_1,
    prompt: "Wear your favorite outfit and feel proud.",
  },
  {
    id: 9,
    ...LEVEL_1,
    prompt: "Say “thank you” to someone who helped you.",
  },
  {
    id: 10,
    ...LEVEL_1,
    prompt: "Tell a family member something you’re proud of.",
  },
  {
    id: 11,
    ...LEVEL_2,
    prompt: "Ask a question when you don’t understand something.",
  },
  {
    id: 12,
    ...LEVEL_2,
    prompt: "Introduce yourself to someone new.",
  },
  {
    id: 13,
    ...LEVEL_2,
    prompt: "Give someone a compliment.",
  },
  {
    id: 14,
    ...LEVEL_2,
    prompt: "Try something you’ve never done before.",
  },
  {
    id: 15,
    ...LEVEL_2,
    prompt: "Complete a task without asking for help.",
  },
  {
    id: 16,
    ...LEVEL_2,
    prompt: "Tell someone about a hobby you enjoy.",
  },
  {
    id: 17,
    ...LEVEL_2,
    prompt: "Share your opinion respectfully.",
  },
  {
    id: 18,
    ...LEVEL_2,
    prompt: "Learn one new skill or fact today.",
  },
  {
    id: 19,
    ...LEVEL_2,
    prompt: "Help someone solve a problem.",
  },
  {
    id: 20,
    ...LEVEL_2,
    prompt: "Finish a task you normally avoid.",
  },
  {
    id: 21,
    ...LEVEL_3,
    prompt: "Raise your hand in class or a group activity.",
  },
  {
    id: 22,
    ...LEVEL_3,
    prompt: "Speak in front of a small group.",
  },
  {
    id: 23,
    ...LEVEL_3,
    prompt: "Try again after making a mistake.",
  },
  {
    id: 24,
    ...LEVEL_3,
    prompt: "Ask for help when you need it.",
  },
  {
    id: 25,
    ...LEVEL_3,
    prompt: "Encourage someone who feels nervous.",
  },
  {
    id: 26,
    ...LEVEL_3,
    prompt: "Try a new food.",
  },
  {
    id: 27,
    ...LEVEL_3,
    prompt: "Join a new activity or club.",
  },
  {
    id: 28,
    ...LEVEL_3,
    prompt: "Set a goal and complete it.",
  },
  {
    id: 29,
    ...LEVEL_3,
    prompt: "Do something kind even when nobody is watching.",
  },
  {
    id: 30,
    ...LEVEL_3,
    prompt:
      "Record or write down one thing you accomplished this week and celebrate your success.",
  },
];

export function getConfidenceQuest(
  questId: number,
): ConfidenceQuest | null {
  return (
    CONFIDENCE_QUESTS.find(
      (quest) => quest.id === questId,
    ) ?? null
  );
}