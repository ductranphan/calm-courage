export type EmotionMatchTextAlign =
  | "left"
  | "center";

export type EmotionMatchChallenge = {
  id: number;

  frontLines: string[];

  reflectionText: string;

  coachPromptLines: string[];

  coachAnswerText: string;

  coachAnswerAlign?: EmotionMatchTextAlign;
};

export const EMOTION_MATCH_TOTAL_LEVELS = 20;

export const EMOTION_MATCH_CHALLENGES: EmotionMatchChallenge[] =
  [
    {
      id: 1,

      frontLines: [
        "Pit a pat!",
        "Today is the first",
        "day of school!",
        "How do I feel",
        "waiting for the bus?",
      ],

      reflectionText:
        "\"Thump, thump...\nI guess I'm a little nervous since it's my first day!\"",

      coachPromptLines: [
        "The secret to",
        "bubbling up with",
        "courage!",
        "What should we do",
        "at times like this?",
      ],

      coachAnswerText:
        "Let's hold your kind teacher's hand, and take a step into the classroom!",
    },

    {
      id: 2,

      frontLines: [
        "Clatter... My favourite,",
        "cool robot toy fell to",
        "the floor and broke.",
        "How do I feel at a",
        "time like this?",
      ],

      reflectionText:
        "You might want to cry and\nfeel mad inside.",

      coachPromptLines: [
        "When your favourite",
        "toy breaks, what",
        "would be the best",
        "thing to say?",
      ],

      coachAnswerText:
        "1. Fix it right now!\n2. This is a stupid toy!\n3. Go away, I don't care.\n4. Mom, I'm sad because my robot is broken.",

      coachAnswerAlign: "left",
    },

    {
      id: 3,

      frontLines: [
        "Look at this popular",
        "yellow slide!",
        "Everyone loves it.",
        "What can I do if a",
        "friend won't get off?",
      ],

      reflectionText:
        "You might want to cry and\nfeel mad inside.",

      coachPromptLines: [
        "When your favourite",
        "toy breaks, what",
        "would be the best",
        "thing to say?",
      ],

      coachAnswerText:
        "\"Can I ride with you?\"\nAsk your friend nicely. When you share, playtime is more fun!",
    },

    {
      id: 4,

      frontLines: [
        "Wow! Look at them",
        "building blocks",
        "together!",
        "What can I do if I",
        "want to play, too?",
      ],

      reflectionText:
        "\"Um... What can I say? I want to join them so badly. My heart is just a little fluttery inside.\"",

      coachPromptLines: [
        "Let's take",
        "a deep breath",
        "and speak up!",
        "Which words would",
        "be the best?",
      ],

      coachAnswerText:
        "1. Throw the puzzle pieces and yell, \"I quit!\"\n2. Hide the puzzle pieces so no one can see them.\n3. Ask your teacher, \"Can we find where this piece fits together?\"",

      coachAnswerAlign: "left",
    },

    {
      id: 5,

      frontLines: [
        "Wow, so many pieces!",
        "You want to finish",
        "this cool picture, but",
        "what if it's too hard?",
      ],

      reflectionText:
        "It can be frustrating when the pieces don't fit, right? But you don't have to worry alone. Shall we look around for some help?",

      coachPromptLines: [
        "What is the best",
        "thing to do when you",
        "want to solve this",
        "problem?",
      ],

      coachAnswerText:
        "1. Throw the puzzle pieces and yell, \"I quit!\"\n2. Hide the puzzle pieces so no one can see them.\n3. Ask your teacher, \"Can we find where this piece fits together?\"",

      coachAnswerAlign: "left",
    },

    {
      id: 6,

      frontLines: [
        "I feel really nervous",
        "because I have to",
        "speak in front of",
        "many people. What",
        "signals might my",
        "body give me?",
      ],

      reflectionText:
        "My heart is beating super fast...and my hands are all sweaty!",

      coachPromptLines: [
        "Can you notice the",
        "signs your nervous",
        "body is giving you?",
      ],

      coachAnswerText:
        "When your heart beats fast, it means your body is getting ready to help you!",
    },

    {
      id: 7,

      frontLines: [
        "My friend keeps",
        "poking me or pulling",
        "my bag to get my",
        "attention. What",
        "should I say in this",
        "situation?",
      ],

      reflectionText:
        "It keeps happening, so it's annoying and makes me feel sad... Should I get angry?",

      coachPromptLines: [
        "Try expressing your",
        "feelings calmly and",
        "firmly!",
      ],

      coachAnswerText:
        "Let's say, \"Don't poke me. It hurts and it feels uncomfortable. Please say it calmly.\"",
    },

    {
      id: 8,

      frontLines: [
        "A friend accidentally",
        "dropped their lunch",
        "tray, and the food",
        "spilled on the floor.",
      ],

      reflectionText:
        "Ew, that's gross! It's kind of funny too... Should I laugh and tease them?",

      coachPromptLines: [
        "Choose a kind way to",
        "comfort your friend",
        "who feels",
        "embarrassed!",
      ],

      coachAnswerText:
        "Let's say,\n\"It's okay, it was just a mistake! I'll help you clean it up.\"",
    },

    {
      id: 9,

      frontLines: [
        "My friends are",
        "playing freeze tag far",
        "away and having fun,",
        "and I want to join",
        "them.",
      ],

      reflectionText:
        "I feel upset because they're playing without me.",

      coachPromptLines: [
        "What is the best",
        "option when you are",
        "trying to solve this",
        "problem?",
      ],

      coachAnswerText:
        "1. I just stand far away and watch.\n2. I walk up to them and get angry.\n3. When they take a short break, I walk over and say, \"Hey guys, can I join the next round too?\"",

      coachAnswerAlign: "left",
    },

    {
      id: 10,

      frontLines: [
        "We both grabbed the",
        "same doll first, and we",
        "keep trying to take it",
        "from each other. It",
        "feels like we might end",
        "up having a big fight.",
      ],

      reflectionText:
        "I got it first! Should I pull it harder and take it away?",

      coachPromptLines: [
        "Shall we learn",
        "a 2-step way to solve",
        "problems without",
        "fighting?",
      ],

      coachAnswerText:
        "Step 1.\nLet go carefully so no one gets hurt.\n\nStep 2.\nSuggest, \"Let's take turns and set a timer for 5 minutes each!\"",

      coachAnswerAlign: "left",
    },

    {
      id: 11,

      frontLines: [
        "I have a yummy",
        "snack, but my friend",
        "has none. So, my",
        "friend is sitting here",
        "looking very sad.",
      ],

      reflectionText:
        "I want to eat this yummy snack all by myself... But my friend keeps looking at me, so I feel a bit uncomfortable.",

      coachPromptLines: [
        "Shall we choose the",
        "happiness of sharing",
        "together?",
      ],

      coachAnswerText:
        "\"I have so many snacks! Do you want to try one?\"",
    },

    {
      id: 12,

      frontLines: [
        "My classmate",
        "brought lunch with a",
        "food I have never",
        "seen before. It looks",
        "very unusual. What",
        "should I do?",
      ],

      reflectionText:
        "Eww, it smells strange and looks unusual. Should I say it doesn't look tasty?",

      coachPromptLines: [
        "Let's use kind words",
        "to respect your",
        "friend's special food!",
      ],

      coachAnswerText:
        "\"Wow, what kind of food is that? I've never seen it before. It looks really interesting!\"",
    },

    {
      id: 13,

      frontLines: [
        "I am playing a fun",
        "game on my tablet.",
        "My friend is waiting",
        "beside me and says,",
        "\"Can I have a turn",
        "too?\"",
      ],

      reflectionText:
        "I'm not done yet! Should I just pretend I can't hear?",

      coachPromptLines: [
        "Shall we be cool",
        "friends who take",
        "turns nicely?",
      ],

      coachAnswerText:
        "\"I will give it to you right after this game! Please wait just a moment.\"",
    },

    {
      id: 14,

      frontLines: [
        "I really want to try",
        "the big slide, but",
        "standing on the",
        "stairs is a little scary!",
      ],

      reflectionText:
        "Should I just go back down? What if my friends call me a scaredy-cat?",

      coachPromptLines: [
        "Shall we wake up",
        "the brave magic",
        "inside our hearts?",
      ],

      coachAnswerText:
        "\"It's okay to be scared! I can do it if I take my time.\"",
    },

    {
      id: 15,

      frontLines: [
        "We played so hard,",
        "and now blocks are",
        "everywhere!",
        "Teacher says it's time",
        "to clean up!",
      ],

      reflectionText:
        "Cleaning up is so boring and hard... Should I just hide until my friends finish?",

      coachPromptLines: [
        "Let's work together",
        "like a team to show",
        "love for our",
        "classroom!",
      ],

      coachAnswerText:
        "\"Let's clean up with a game! Who can put the most in the basket?\"",
    },

    {
      id: 16,

      frontLines: [
        "I really wanted to",
        "be the tiger in our",
        "stage play, but my",
        "friend got the role.",
        "I feel like crying!",
      ],

      reflectionText:
        "I'm not doing it anymore! I want to ruin everything because I'm so upset!",

      coachPromptLines: [
        "Shall we comfort",
        "our sad hearts and",
        "find something",
        "new and fun?",
      ],

      coachAnswerText:
        "\"The tiger role is cool, but my bunny role is super cute too!\"",
    },

    {
      id: 17,

      frontLines: [
        "I accidentally broke",
        "the pencil my friend",
        "lent me. My heart is",
        "beating so fast!",
      ],

      reflectionText:
        "I'm so scared! Should I just lie and say it was already broken?",

      coachPromptLines: [
        "Shall we show the",
        "true bravery of telling",
        "the truth?",
      ],

      coachAnswerText:
        "\"I'm sorry, I accidentally broke your pencil. You can borrow mine!\"",
    },

    {
      id: 18,

      frontLines: [
        "What should I do",
        "when I'm eating and",
        "suddenly think of a",
        "super funny story",
        "that I want to tell my",
        "friend right away?",
      ],

      reflectionText:
        "If I don't say it right now, I'll forget! I have food in my mouth, but should I just say it anyway?",

      coachPromptLines: [
        "Shall we use",
        "our best manners",
        "so everyone can",
        "enjoy their meal?",
      ],

      coachAnswerText:
        "\"Gulp! Now that I've swallowed my food, I can tell my funny story with a beautiful voice!\"",
    },

    {
      id: 19,

      frontLines: [
        "I'm so thirsty",
        "after PE class, but",
        "the line for the water",
        "fountain is so long!",
      ],

      reflectionText:
        "I'm dying of thirst! I'm so annoyed. Should I just push past the friend in front of me?",

      coachPromptLines: [
        "Let's be a cool kid",
        "who waits calmly",
        "for our turn!",
      ],

      coachAnswerText:
        "\"Take a deep breath, and wait for my turn in line, step by step.\"",
    },

    {
      id: 20,

      frontLines: [
        "I'm so happy to see",
        "my friend that I want",
        "to give them a big,",
        "tight hug! What",
        "should I do?",
      ],

      reflectionText:
        "We're best friends, so it's okay to just hug them! Should I surprise them with a hug from behind without saying anything?",

      coachPromptLines: [
        "Let's be gentle and",
        "respect our friend's",
        "body and feelings!",
      ],

      coachAnswerText:
        "\"Can I give you a hug? Is that okay?\" Then, give them a warm hug.",
    },
  ];

export function getEmotionMatchChallenge(
  levelId: number,
): EmotionMatchChallenge | null {
  return (
    EMOTION_MATCH_CHALLENGES.find(
      (challenge) =>
        challenge.id === levelId,
    ) ?? null
  );
}