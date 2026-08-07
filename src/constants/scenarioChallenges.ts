/**
 * Front-side content for the 20 Choose Your Courage scenarios.
 *
 * The back sides are complete SVG assets stored in:
 * assets/images/scenarios/scenario-01-back.svg
 * ...
 * assets/images/scenarios/scenario-20-back.svg
 */

export type ScenarioChallenge = {
  id: number;
  frontText: string;
};

export const SCENARIO_CHALLENGES: ScenarioChallenge[] = [
  {
    id: 1,
    frontText:
      "Your friends are playing a fun game together, but nobody asks you to join. You feel left out. What can you do and say?",
  },
  {
    id: 2,
    frontText:
      "You want to play with a toy, but your friend has been using it for a long time and won’t share. What can you say?",
  },
  {
    id: 3,
    frontText:
      "You say hello or ask a classmate a question, but they turn away and pretend they didn’t hear you. What can you do?",
  },
  {
    id: 4,
    frontText:
      "There is a new classmate sitting alone, and you want to be their friend but feel a little nervous. How can you start?",
  },
  {
    id: 5,
    frontText:
      "Your best friend decides to sit and play with someone else today, and you feel a bit lonely or jealous. What can you tell yourself?",
  },
  {
    id: 6,
    frontText:
      "Another kid says something unkind to you or makes a mean face. It hurts your feelings. What should you do?",
  },
  {
    id: 7,
    frontText:
      "You find out that a few classmates were invited to a party, but you didn’t get an invitation. You feel sad. What can you tell yourself?",
  },
  {
    id: 8,
    frontText:
      "The teacher asks a question, and you know the answer! What should you do and say?",
  },
  {
    id: 9,
    frontText:
      "There is a new food to taste, but you feel a bit scared. What can you tell yourself?",
  },
  {
    id: 10,
    frontText:
      "You accidentally spilled paint on your drawing. You feel upset. What can you say to yourself?",
  },
  {
    id: 11,
    frontText:
      "The teacher calls on you to speak, but suddenly your mind goes blank and you forget what to say. What can you do?",
  },
  {
    id: 12,
    frontText:
      "You are placed in a big group for a project, and everyone is talking at once. You feel too shy to speak up. What can you do?",
  },
  {
    id: 13,
    frontText:
      "A group of kids is building a cool block tower, and you really want to join in. How can you ask?",
  },
  {
    id: 14,
    frontText:
      "You realize you like different clothes, foods, or games than most of your classmates, and you feel out of place. What can you tell yourself?",
  },
  {
    id: 15,
    frontText:
      "Something didn’t go your way, and you feel a hot, angry feeling in your chest. You want to yell or stomp. What can you do?",
  },
  {
    id: 16,
    frontText:
      "It’s almost your turn to speak on stage, or it’s the first day of school, and your tummy feels fluttery and nervous. What can you do?",
  },
  {
    id: 17,
    frontText:
      "You feel sad, and a teacher or parent asks, “How are you feeling today?” What can you say?",
  },
  {
    id: 18,
    frontText:
      "There is too much noise, too many tasks, or too many things happening around you all at once. You feel like crying. What can you do?",
  },
  {
    id: 19,
    frontText:
      "You are trying to tie your shoes or build a puzzle, but it keeps falling apart. You feel frustrated and want to throw it. What can you do?",
  },
  {
    id: 20,
    frontText:
      "You just heard some amazing news or it’s almost recess, and you feel so excited that you want to run and scream inside the classroom. What can you do?",
  },
];

export function getScenarioChallenge(
  scenarioId: number,
): ScenarioChallenge | null {
  return (
    SCENARIO_CHALLENGES.find(
      (scenario) => scenario.id === scenarioId,
    ) ?? null
  );
}