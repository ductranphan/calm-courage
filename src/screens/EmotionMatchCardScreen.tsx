/**
 * Emotion Match card screen.
 *
 * All six cards for the current level are mounted at the same time.
 * Transitions only animate opacity between already-rendered layers,
 * which avoids a blank frame while a new PNG/SVG card is mounting.
 *
 * The two PNG templates are preloaded globally in preloadAssets.ts.
 * SVG scene/reaction cards are imported as React components.
 */

import {
  router,
  type Href,
  useLocalSearchParams,
} from "expo-router";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { GAME_HUB_ACTIVITY_IDS } from "@/constants/activities";
import { colors } from "@/constants/colors";
import {
  EMOTION_MATCH_TOTAL_LEVELS,
  getEmotionMatchChallenge,
} from "@/constants/emotionMatchChallenges";
import { useActiveChild } from "@/contexts/ActiveChildContext";
import { useAuth } from "@/contexts/AuthContext";
import { useParentAccess } from "@/contexts/ParentAccessContext";
import {
  completeHubLevel,
  startHubLevel,
} from "@/services/hubLevelProgress";
import { x, y } from "@/utils/scaling";

import AudioOffIcon from "../../assets/icons/audio-off.svg";
import AudioOnIcon from "../../assets/icons/audio-on.svg";
import BackIcon from "../../assets/icons/back.svg";
import HouseIcon from "../../assets/icons/house.svg";
import StarIcon from "../../assets/icons/star.svg";
import WorkbookDashboardIcon from "../../assets/icons/workbook-dashboard.svg";

import EmotionMatch01Scene from "../../assets/images/emotion-match/emotion-match-01-scene.svg";
import EmotionMatch01Reaction from "../../assets/images/emotion-match/emotion-match-01-reaction.svg";

import EmotionMatch02Scene from "../../assets/images/emotion-match/emotion-match-02-scene.svg";
import EmotionMatch02Reaction from "../../assets/images/emotion-match/emotion-match-02-reaction.svg";

import EmotionMatch03Scene from "../../assets/images/emotion-match/emotion-match-03-scene.svg";
import EmotionMatch03Reaction from "../../assets/images/emotion-match/emotion-match-03-reaction.svg";

import EmotionMatch04Scene from "../../assets/images/emotion-match/emotion-match-04-scene.svg";
import EmotionMatch04Reaction from "../../assets/images/emotion-match/emotion-match-04-reaction.svg";

import EmotionMatch05Scene from "../../assets/images/emotion-match/emotion-match-05-scene.svg";
import EmotionMatch05Reaction from "../../assets/images/emotion-match/emotion-match-05-reaction.svg";

import EmotionMatch06Scene from "../../assets/images/emotion-match/emotion-match-06-scene.svg";
import EmotionMatch06Reaction from "../../assets/images/emotion-match/emotion-match-06-reaction.svg";

import EmotionMatch07Scene from "../../assets/images/emotion-match/emotion-match-07-scene.svg";
import EmotionMatch07Reaction from "../../assets/images/emotion-match/emotion-match-07-reaction.svg";

import EmotionMatch08Scene from "../../assets/images/emotion-match/emotion-match-08-scene.svg";
import EmotionMatch08Reaction from "../../assets/images/emotion-match/emotion-match-08-reaction.svg";

import EmotionMatch09Scene from "../../assets/images/emotion-match/emotion-match-09-scene.svg";
import EmotionMatch09Reaction from "../../assets/images/emotion-match/emotion-match-09-reaction.svg";

import EmotionMatch10Scene from "../../assets/images/emotion-match/emotion-match-10-scene.svg";
import EmotionMatch10Reaction from "../../assets/images/emotion-match/emotion-match-10-reaction.svg";

import EmotionMatch11Scene from "../../assets/images/emotion-match/emotion-match-11-scene.svg";
import EmotionMatch11Reaction from "../../assets/images/emotion-match/emotion-match-11-reaction.svg";

import EmotionMatch12Scene from "../../assets/images/emotion-match/emotion-match-12-scene.svg";
import EmotionMatch12Reaction from "../../assets/images/emotion-match/emotion-match-12-reaction.svg";

import EmotionMatch13Scene from "../../assets/images/emotion-match/emotion-match-13-scene.svg";
import EmotionMatch13Reaction from "../../assets/images/emotion-match/emotion-match-13-reaction.svg";

import EmotionMatch14Scene from "../../assets/images/emotion-match/emotion-match-14-scene.svg";
import EmotionMatch14Reaction from "../../assets/images/emotion-match/emotion-match-14-reaction.svg";

import EmotionMatch15Scene from "../../assets/images/emotion-match/emotion-match-15-scene.svg";
import EmotionMatch15Reaction from "../../assets/images/emotion-match/emotion-match-15-reaction.svg";

import EmotionMatch16Scene from "../../assets/images/emotion-match/emotion-match-16-scene.svg";
import EmotionMatch16Reaction from "../../assets/images/emotion-match/emotion-match-16-reaction.svg";

import EmotionMatch17Scene from "../../assets/images/emotion-match/emotion-match-17-scene.svg";
import EmotionMatch17Reaction from "../../assets/images/emotion-match/emotion-match-17-reaction.svg";

import EmotionMatch18Scene from "../../assets/images/emotion-match/emotion-match-18-scene.svg";
import EmotionMatch18Reaction from "../../assets/images/emotion-match/emotion-match-18-reaction.svg";

import EmotionMatch19Scene from "../../assets/images/emotion-match/emotion-match-19-scene.svg";
import EmotionMatch19Reaction from "../../assets/images/emotion-match/emotion-match-19-reaction.svg";

import EmotionMatch20Scene from "../../assets/images/emotion-match/emotion-match-20-scene.svg";
import EmotionMatch20Reaction from "../../assets/images/emotion-match/emotion-match-20-reaction.svg";

const SCREEN_BACKGROUND = "#DEDEE9";
const NAV_BACKGROUND = "#F1F3F5";

const CARD_WIDTH = 380;
const CARD_HEIGHT = 532;

const CARD_LEFT = 11;
const CARD_TOP = 171;
const CARD_RADIUS = 60;

const FINAL_STEP = 5;

const CARD_COUNT = FINAL_STEP + 1;

const FADE_OUT_DURATION = 130;
const FADE_IN_DURATION = 180;

const FRONT_TEMPLATE = require(
  "../../assets/images/emotion-match/emotion-match-front-template.png",
);

const TEXT_TEMPLATE = require(
  "../../assets/images/emotion-match/emotion-match-text-template.png",
);

const EMOTION_MATCH_IMAGES = {
  1: {
    scene: EmotionMatch01Scene,
    reaction: EmotionMatch01Reaction,
  },
  2: {
    scene: EmotionMatch02Scene,
    reaction: EmotionMatch02Reaction,
  },
  3: {
    scene: EmotionMatch03Scene,
    reaction: EmotionMatch03Reaction,
  },
  4: {
    scene: EmotionMatch04Scene,
    reaction: EmotionMatch04Reaction,
  },
  5: {
    scene: EmotionMatch05Scene,
    reaction: EmotionMatch05Reaction,
  },
  6: {
    scene: EmotionMatch06Scene,
    reaction: EmotionMatch06Reaction,
  },
  7: {
    scene: EmotionMatch07Scene,
    reaction: EmotionMatch07Reaction,
  },
  8: {
    scene: EmotionMatch08Scene,
    reaction: EmotionMatch08Reaction,
  },
  9: {
    scene: EmotionMatch09Scene,
    reaction: EmotionMatch09Reaction,
  },
  10: {
    scene: EmotionMatch10Scene,
    reaction: EmotionMatch10Reaction,
  },
  11: {
    scene: EmotionMatch11Scene,
    reaction: EmotionMatch11Reaction,
  },
  12: {
    scene: EmotionMatch12Scene,
    reaction: EmotionMatch12Reaction,
  },
  13: {
    scene: EmotionMatch13Scene,
    reaction: EmotionMatch13Reaction,
  },
  14: {
    scene: EmotionMatch14Scene,
    reaction: EmotionMatch14Reaction,
  },
  15: {
    scene: EmotionMatch15Scene,
    reaction: EmotionMatch15Reaction,
  },
  16: {
    scene: EmotionMatch16Scene,
    reaction: EmotionMatch16Reaction,
  },
  17: {
    scene: EmotionMatch17Scene,
    reaction: EmotionMatch17Reaction,
  },
  18: {
    scene: EmotionMatch18Scene,
    reaction: EmotionMatch18Reaction,
  },
  19: {
    scene: EmotionMatch19Scene,
    reaction: EmotionMatch19Reaction,
  },
  20: {
    scene: EmotionMatch20Scene,
    reaction: EmotionMatch20Reaction,
  },
};

function getPromptFontSize(
  textLength: number,
): number {
  if (textLength >= 150) {
    return 20;
  }

  if (textLength >= 125) {
    return 21;
  }

  if (textLength >= 100) {
    return 22;
  }

  if (textLength >= 75) {
    return 23;
  }

  return 24;
}

function getTextCardFontSize(
  textLength: number,
): number {
  if (textLength >= 210) {
    return 17;
  }

  if (textLength >= 170) {
    return 18;
  }

  if (textLength >= 130) {
    return 19;
  }

  if (textLength >= 95) {
    return 20;
  }

  return 21;
}

export default function EmotionMatchCardScreen() {
  const { user } = useAuth();

  const { activeChild } =
    useActiveChild();

  const { childModeActive } =
    useParentAccess();

  const { levelId } =
    useLocalSearchParams<{
      levelId?:
        | string
        | string[];
    }>();

  const [
    audioEnabled,
    setAudioEnabled,
  ] = useState(false);

  const [step, setStep] =
    useState(0);

  const hasStartedRef =
    useRef(false);

  const hasCompletedRef =
    useRef(false);

  const isTransitioningRef =
    useRef(false);

  const cardOpacities =
    useRef(
      Array.from(
        {
          length: CARD_COUNT,
        },
        (_, index) =>
          new Animated.Value(
            index === 0
              ? 1
              : 0,
          ),
      ),
    ).current;

  const parsedLevelId =
    useMemo(() => {
      const rawLevel =
        Array.isArray(levelId)
          ? levelId[0]
          : levelId;

      if (!rawLevel) {
        return Number.NaN;
      }

      return Number.parseInt(
        rawLevel,
        10,
      );
    }, [levelId]);

  const challenge =
    useMemo(
      () =>
        getEmotionMatchChallenge(
          parsedLevelId,
        ),
      [parsedLevelId],
    );

  const images =
    EMOTION_MATCH_IMAGES[
      parsedLevelId as keyof typeof EMOTION_MATCH_IMAGES
    ];

  useEffect(() => {
    setStep(0);

    hasStartedRef.current =
      false;

    hasCompletedRef.current =
      false;

    isTransitioningRef.current =
      false;

    cardOpacities.forEach(
      (
        opacity,
        index,
      ) => {
        opacity.setValue(
          index === 0
            ? 1
            : 0,
        );
      },
    );
  }, [
    parsedLevelId,
    cardOpacities,
  ]);

  useEffect(() => {
    if (
      !childModeActive ||
      !activeChild
    ) {
      router.replace(
        "/parent-verification" as Href,
      );
    }
  }, [
    activeChild,
    childModeActive,
  ]);

  useEffect(() => {
    if (
      !user?.uid ||
      !activeChild?.id ||
      !challenge ||
      hasStartedRef.current
    ) {
      return;
    }

    hasStartedRef.current =
      true;

    void startHubLevel(
      user.uid,
      activeChild.id,
      GAME_HUB_ACTIVITY_IDS
        .emotion_puzzle,
      challenge.id,
      EMOTION_MATCH_TOTAL_LEVELS,
      {
        source:
          "emotion_match_card",

        emotionMatchLevel:
          challenge.id,
      },
    ).catch(
      (error: unknown) => {
        console.warn(
          "Unable to start Emotion Match level:",
          error,
        );

        hasStartedRef.current =
          false;

        router.replace(
          "/emotion-puzzle" as Href,
        );
      },
    );
  }, [
    activeChild?.id,
    challenge,
    user?.uid,
  ]);

  function handleBack() {
    router.replace(
      "/emotion-puzzle" as Href,
    );
  }

  function handleParentMode() {
    router.push(
      "/parent-verification" as Href,
    );
  }

  function toggleAudio() {
    setAudioEnabled(
      (current) => !current,
    );
  }

  if (
    !childModeActive ||
    !activeChild
  ) {
    return null;
  }

  if (
    !challenge ||
    !images
  ) {
    return (
      <View
        style={
          styles.missingScreen
        }
      >
        <Text
          style={
            styles.missingTitle
          }
        >
          This Emotion Match
          activity was not found.
        </Text>

        <Pressable
          style={
            styles.missingButton
          }
          onPress={handleBack}
          accessibilityRole="button"
        >
          <Text
            style={
              styles.missingButtonText
            }
          >
            Back to Emotion Match
          </Text>
        </Pressable>
      </View>
    );
  }

  const currentChallenge =
    challenge;

  const currentImages =
    images;

  const SceneCard =
    currentImages.scene;

  const ReactionCard =
    currentImages.reaction;

  const frontText =
    currentChallenge.frontLines.join(
      "\n",
    );

  const coachPromptText =
    currentChallenge.coachPromptLines.join(
      "\n",
    );

  const frontFontSize =
    getPromptFontSize(
      frontText.length,
    );

  const coachFontSize =
    getPromptFontSize(
      coachPromptText.length,
    );

  const reflectionFontSize =
    getTextCardFontSize(
      currentChallenge
        .reflectionText.length,
    );

  const answerFontSize =
    getTextCardFontSize(
      currentChallenge
        .coachAnswerText.length,
    );

  async function markLevelComplete() {
    if (
      !user?.uid ||
      !activeChild?.id ||
      hasCompletedRef.current
    ) {
      return;
    }

    hasCompletedRef.current =
      true;

    try {
      await completeHubLevel(
        user.uid,
        activeChild.id,
        GAME_HUB_ACTIVITY_IDS
          .emotion_puzzle,
        currentChallenge.id,
        EMOTION_MATCH_TOTAL_LEVELS,
        {
          source:
            "emotion_match_card",

          emotionMatchLevel:
            currentChallenge.id,

          completedAllCards:
            true,
        },
      );
    } catch (error) {
      console.warn(
        "Unable to complete Emotion Match level:",
        error,
      );

      hasCompletedRef.current =
        false;
    }
  }

  function handleCardPress() {
    if (
      isTransitioningRef.current
    ) {
      return;
    }

    isTransitioningRef.current =
      true;

    const nextStep =
      step >= FINAL_STEP
        ? 0
        : step + 1;

    /*
     * Both the current and next cards are already mounted.
     * We only cross-fade their opacity, so no new card has
     * to mount in the middle of the transition.
     */
    cardOpacities[
      nextStep
    ].setValue(0);

    Animated.parallel([
      Animated.timing(
        cardOpacities[
          step
        ],
        {
          toValue: 0,
          duration:
            FADE_OUT_DURATION,
          useNativeDriver:
            true,
        },
      ),

      Animated.timing(
        cardOpacities[
          nextStep
        ],
        {
          toValue: 1,
          duration:
            FADE_IN_DURATION,
          useNativeDriver:
            true,
        },
      ),
    ]).start(() => {
      setStep(nextStep);

      /*
       * Reaching the final card completes the level.
       * The completion write does not block the UI.
       */
      if (
        nextStep === FINAL_STEP
      ) {
        void markLevelComplete();
      }

      isTransitioningRef.current =
        false;
    });
  }

  function renderPromptCard(
    text: string,
    fontSize: number,
  ) {
    return (
      <View
        style={styles.cardFill}
      >
        <Image
          source={FRONT_TEMPLATE}
          resizeMode="stretch"
          fadeDuration={0}
          style={
            styles.cardBackground
          }
          accessibilityIgnoresInvertColors
        />

        <View
          style={
            styles.promptContainer
          }
        >
          <Text
            style={[
              styles.promptText,
              {
                fontSize:
                  x(fontSize),

                lineHeight:
                  x(
                    fontSize *
                      1.32,
                  ),
              },
            ]}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            numberOfLines={10}
          >
            {text}
          </Text>
        </View>
      </View>
    );
  }

  function renderTextCard(
    text: string,
    fontSize: number,
    textAlign:
      | "left"
      | "center" = "center",
  ) {
    return (
      <View
        style={styles.cardFill}
      >
        <Image
          source={TEXT_TEMPLATE}
          resizeMode="stretch"
          fadeDuration={0}
          style={
            styles.cardBackground
          }
          accessibilityIgnoresInvertColors
        />

        <View
          style={
            styles.textCardContainer
          }
        >
          <Text
            style={[
              styles.textCardText,
              {
                fontSize:
                  x(fontSize),

                lineHeight:
                  x(
                    fontSize *
                      1.45,
                  ),

                textAlign,
              },
            ]}
            adjustsFontSizeToFit
            minimumFontScale={0.72}
            numberOfLines={16}
          >
            {text}
          </Text>
        </View>
      </View>
    );
  }

  function renderCardForStep(
    cardStep: number,
  ) {
    switch (cardStep) {
      case 0:
        return renderPromptCard(
          frontText,
          frontFontSize,
        );

      case 1:
        return (
          <View
            style={
              styles.svgCardContainer
            }
          >
            <SceneCard
              width={x(
                CARD_WIDTH,
              )}
              height={y(
                CARD_HEIGHT,
              )}
            />
          </View>
        );

      case 2:
        return (
          <View
            style={
              styles.svgCardContainer
            }
          >
            <ReactionCard
              width={x(
                CARD_WIDTH,
              )}
              height={y(
                CARD_HEIGHT,
              )}
            />
          </View>
        );

      case 3:
        return renderTextCard(
          currentChallenge
            .reflectionText,

          reflectionFontSize,
        );

      case 4:
        return renderPromptCard(
          coachPromptText,
          coachFontSize,
        );

      case 5:
        return renderTextCard(
          currentChallenge
            .coachAnswerText,

          answerFontSize,

          currentChallenge
            .coachAnswerAlign ??
            "center",
        );

      default:
        return null;
    }
  }

  return (
    <View style={styles.screen}>
      <Pressable
        style={({
          pressed,
        }) => [
          styles.backButton,

          pressed &&
            styles.controlPressed,
        ]}
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel="Back to Emotion Match"
        hitSlop={8}
      >
        <BackIcon
          width={x(37.24)}
          height={y(22.18)}
        />
      </Pressable>

      <Pressable
        style={({
          pressed,
        }) => [
          styles.audioButton,

          pressed &&
            styles.controlPressed,
        ]}
        onPress={toggleAudio}
        accessibilityRole="button"
        accessibilityLabel={
          audioEnabled
            ? "Turn audio off"
            : "Turn audio on"
        }
        accessibilityState={{
          selected:
            audioEnabled,
        }}
        hitSlop={8}
      >
        {audioEnabled ? (
          <AudioOnIcon
            width={x(35)}
            height={x(35)}
          />
        ) : (
          <AudioOffIcon
            width={x(35)}
            height={x(35)}
          />
        )}
      </Pressable>

      <Text
        style={
          styles.activityNumber
        }
      >
        {currentChallenge.id}.
      </Text>

      <Pressable
        style={
          styles.cardPressable
        }
        onPress={
          handleCardPress
        }
        accessibilityRole="button"
        accessibilityLabel={
          step === FINAL_STEP
            ? `Emotion Match Activity ${currentChallenge.id}. Final card. Tap to restart this level.`
            : `Emotion Match Activity ${currentChallenge.id}. Card ${step + 1} of 6. Tap to continue.`
        }
      >
        <View
          style={
            styles.cardSurface
          }
        >
          {Array.from(
            {
              length:
                CARD_COUNT,
            },
            (_, cardStep) => (
              <Animated.View
                key={
                  cardStep
                }
                pointerEvents="none"
                style={[
                  styles.cardLayer,
                  {
                    opacity:
                      cardOpacities[
                        cardStep
                      ],
                  },
                ]}
              >
                {renderCardForStep(
                  cardStep,
                )}
              </Animated.View>
            ),
          )}
        </View>
      </Pressable>

      <View
        style={
          styles.fixedFooter
        }
      >
        <Pressable
          style={({
            pressed,
          }) => [
            styles.parentModeLink,

            pressed &&
              styles.controlPressed,
          ]}
          onPress={
            handleParentMode
          }
          accessibilityRole="button"
          accessibilityLabel="Switch to Parent Mode"
        >
          <Text
            style={
              styles.parentModeText
            }
          >
            Switch to Parent Mode
          </Text>
        </Pressable>

        <View
          style={
            styles.bottomNav
          }
        >
          <Pressable
            style={
              styles.navItem
            }
            onPress={() =>
              router.replace(
                "/digital-workbook" as Href,
              )
            }
            accessibilityRole="button"
            accessibilityLabel="Workbook"
          >
            <WorkbookDashboardIcon
              width={x(41.94)}
              height={y(40.07)}
            />

            <Text
              style={
                styles.navLabel
              }
            >
              Workbook
            </Text>
          </Pressable>

          <Pressable
            style={
              styles.navItem
            }
            onPress={() =>
              router.replace(
                "/child-dashboard" as Href,
              )
            }
            accessibilityRole="button"
            accessibilityLabel="Home"
          >
            <HouseIcon
              width={x(40)}
              height={x(40)}
            />

            <Text
              style={
                styles.navLabel
              }
            >
              Home
            </Text>
          </Pressable>

          <Pressable
            style={
              styles.navItem
            }
            onPress={() =>
              router.replace(
                "/rewards" as Href,
              )
            }
            accessibilityRole="button"
            accessibilityLabel="Rewards"
          >
            <StarIcon
              width={x(42)}
              height={x(42)}
            />

            <Text
              style={
                styles.navLabel
              }
            >
              Rewards
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      position: "relative",
      backgroundColor:
        SCREEN_BACKGROUND,
    },

    backButton: {
      position: "absolute",
      left: x(20),
      top: y(48),
      width: x(37.24),
      height: y(35),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "transparent",
      zIndex: 20,
    },

    audioButton: {
      position: "absolute",
      left: x(347),
      top: y(48),
      width: x(35),
      height: x(35),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "transparent",
      zIndex: 20,
    },

    activityNumber: {
      position: "absolute",

      left: x(70),
      top: y(68),

      width: x(262),
      height: y(82),

      color: colors.primary,

      fontFamily: "Outfit",

      fontSize: x(50),
      lineHeight: y(70),

      textAlign: "center",

      includeFontPadding:
        false,

      paddingHorizontal:
        x(10),

      overflow: "visible",
    },

    cardPressable: {
      position: "absolute",

      left: x(
        CARD_LEFT,
      ),

      top: y(
        CARD_TOP,
      ),

      width: x(
        CARD_WIDTH,
      ),

      height: y(
        CARD_HEIGHT,
      ),

      borderRadius: x(
        CARD_RADIUS,
      ),

      overflow: "hidden",

      backgroundColor:
        "transparent",
    },

    cardSurface: {
      position: "relative",

      width: "100%",
      height: "100%",

      borderRadius: x(
        CARD_RADIUS,
      ),

      overflow: "hidden",

      backgroundColor:
        "transparent",
    },

    cardLayer: {
      position: "absolute",

      top: 0,
      right: 0,
      bottom: 0,
      left: 0,

      width: "100%",
      height: "100%",
    },

    cardFill: {
      position: "absolute",

      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },

    cardBackground: {
      position: "absolute",

      top: 0,
      left: 0,

      width: x(
        CARD_WIDTH,
      ),

      height: y(
        CARD_HEIGHT,
      ),
    },

    svgCardContainer: {
      position: "absolute",

      top: 0,
      left: 0,

      width: x(
        CARD_WIDTH,
      ),

      height: y(
        CARD_HEIGHT,
      ),

      alignItems: "center",
      justifyContent: "center",

      overflow: "hidden",
    },

    promptContainer: {
      position: "absolute",

      left: x(35),
      right: x(35),

      top: y(82),
      bottom: y(82),

      alignItems: "center",

      justifyContent:
        "center",

      backgroundColor:
        "transparent",
    },

    promptText: {
      width: "100%",

      color: colors.primary,

      fontFamily:
        "OutfitSemiBold",

      textAlign: "center",

      includeFontPadding:
        false,

      backgroundColor:
        "transparent",
    },

    textCardContainer: {
      position: "absolute",

      left: x(42),
      right: x(42),

      top: y(62),
      bottom: y(62),

      alignItems: "center",

      justifyContent:
        "center",
    },

    textCardText: {
      width: "100%",

      color: colors.primary,

      fontFamily: "Literata",

      includeFontPadding:
        false,

      backgroundColor:
        "transparent",
    },

    controlPressed: {
      opacity: 0.65,
    },

    fixedFooter: {
      position: "absolute",

      left: x(20),
      bottom: y(20),

      width: x(362),
      height: y(105),

      backgroundColor:
        "transparent",

      zIndex: 50,
    },

    parentModeLink: {
      position: "absolute",

      left: 0,
      top: 0,

      width: x(217),
      height: y(24),

      justifyContent:
        "center",
    },

    parentModeText: {
      color: colors.primary,

      fontFamily: "Literata",

      fontSize: x(20),
      lineHeight: y(24),

      textDecorationLine:
        "underline",
    },

    bottomNav: {
      position: "absolute",

      left: 0,
      top: y(33),

      width: x(362),
      height: y(72),

      borderWidth: x(1),

      borderColor:
        colors.primary,

      borderRadius: x(50),

      backgroundColor:
        NAV_BACKGROUND,

      overflow: "hidden",

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-around",

      paddingHorizontal:
        x(18),
    },

    navItem: {
      width: x(58),
      height: y(56.75),

      alignItems: "center",
      justifyContent: "center",
    },

    navLabel: {
      color: colors.primary,

      fontFamily: "Literata",

      fontSize: x(10),
      lineHeight: y(12),

      marginTop: y(1),

      textAlign: "center",
    },

    missingScreen: {
      flex: 1,

      paddingHorizontal:
        x(30),

      alignItems: "center",

      justifyContent:
        "center",

      backgroundColor:
        SCREEN_BACKGROUND,
    },

    missingTitle: {
      color: colors.primary,

      fontFamily:
        "OutfitSemiBold",

      fontSize: x(24),
      lineHeight: y(31),

      textAlign: "center",
    },

    missingButton: {
      width: x(240),
      height: y(52),

      marginTop: y(24),

      borderRadius:
        x(20),

      backgroundColor:
        "#F1F3F5",

      alignItems: "center",

      justifyContent:
        "center",
    },

    missingButtonText: {
      color: colors.primary,

      fontFamily: "Outfit",

      fontSize: x(18),
    },
  });