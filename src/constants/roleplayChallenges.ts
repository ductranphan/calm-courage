export type RoleplayChallenge = {
  id: number;
  frontText: string;
  backText: string;
};

export const ROLEPLAY_CHALLENGES: RoleplayChallenge[] = [
  {
    id: 1,
    frontText:
      "Your friends are playing a fun game, and you want to play with them. What can you say to join the fun?",
    backText:
      'Walk up to them with a smile and say, "Can I play with you?" or "That looks fun! Can I join the next game?"',
  },
  {
    id: 2,
    frontText:
      "You see a new friend at the playground and want to know their name. How can you say hello?",
    backText:
      'Smile, wave your hand, and say, "Hello! My name is {childName}! What’s your name?"',
  },
  {
    id: 3,
    frontText:
      "You are trying to open your lunchbox or finish a task, but it is too hard. What can you say to your teacher?",
    backText:
      'Raise your hand or walk up nicely and say, "Teacher, I’m having a little trouble. Can you help me, please?"',
  },
  {
    id: 4,
    frontText:
      "You accidentally bumped into a friend or knocked down their blocks. What should you say right away?",
    backText:
      'Look at your friend gently and say, "I’m sorry, it was an accident. Are you okay? Let me help you fix it."',
  },
  {
    id: 5,
    frontText:
      "A friend asks if they can play with the toy you are holding. What is a kind way to answer?",
    backText:
      'Pass the toy gently and say, "Sure! We can play with it together," or "I’m using it right now, but you can have it next!"',
  },
  {
    id: 6,
    frontText:
      "You want to ride the swing, but a friend is already on it. What can you say to take turns?",
    backText:
      'Wait patiently and say nicely, "Can I have a turn on the swing when you are finished?"',
  },
  {
    id: 7,
    frontText:
      "The teacher asks a question, and you know the answer! What should you do and say?",
    backText:
      'Raise your hand calmly, wait for your turn, and say, "I think the answer is _____!"',
  },
  {
    id: 8,
    frontText:
      "There is a new food to taste or a new game to try, but you feel a bit scared. What can you tell yourself?",
    backText:
      'Take a deep breath and say, "It’s okay to be a little scared. I can try just a small piece!" or "I can give it a try!"',
  },
  {
    id: 9,
    frontText:
      "A friend takes a toy from your hand without asking, and it makes you upset. What can you say to stop them?",
    backText:
      'Look at them with a firm but calm voice and say, "Please don’t take things from my hand. I was still playing with it."',
  },
  {
    id: 10,
    frontText:
      'You feel sad or tired, and a teacher or parent asks, "How are you feeling today?" What can you say?',
    backText:
      'Trust them and speak honestly, "I feel a little sad today because _____," or "I’m feeling tired. Can I rest for a bit?"',
  },
];

export function getRoleplayChallenge(
  roleplayId: number,
): RoleplayChallenge | null {
  return (
    ROLEPLAY_CHALLENGES.find(
      (challenge) => challenge.id === roleplayId,
    ) ?? null
  );
}