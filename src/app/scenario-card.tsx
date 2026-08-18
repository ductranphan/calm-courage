/**
 * Choose Your Courage scenario card.
 *
 * The front PNG template is preloaded globally during app startup,
 * so the card renders its background and text together immediately.
 * No per-card loading state or image-load gate is used here.
 */

import type {
  ComponentType,
} from "react";

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

import type {
  SvgProps,
} from "react-native-svg";

import { GAME_HUB_ACTIVITY_IDS } from "@/constants/activities";
import { colors } from "@/constants/colors";
import { getScenarioChallenge } from "@/constants/scenarioChallenges";
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

import Scenario01Back from "../../assets/images/scenarios/scenario-01-back.svg";
import Scenario02Back from "../../assets/images/scenarios/scenario-02-back.svg";
import Scenario03Back from "../../assets/images/scenarios/scenario-03-back.svg";
import Scenario04Back from "../../assets/images/scenarios/scenario-04-back.svg";
import Scenario05Back from "../../assets/images/scenarios/scenario-05-back.svg";
import Scenario06Back from "../../assets/images/scenarios/scenario-06-back.svg";
import Scenario07Back from "../../assets/images/scenarios/scenario-07-back.svg";
import Scenario08Back from "../../assets/images/scenarios/scenario-08-back.svg";
import Scenario09Back from "../../assets/images/scenarios/scenario-09-back.svg";
import Scenario10Back from "../../assets/images/scenarios/scenario-10-back.svg";
import Scenario11Back from "../../assets/images/scenarios/scenario-11-back.svg";
import Scenario12Back from "../../assets/images/scenarios/scenario-12-back.svg";
import Scenario13Back from "../../assets/images/scenarios/scenario-13-back.svg";
import Scenario14Back from "../../assets/images/scenarios/scenario-14-back.svg";
import Scenario15Back from "../../assets/images/scenarios/scenario-15-back.svg";
import Scenario16Back from "../../assets/images/scenarios/scenario-16-back.svg";
import Scenario17Back from "../../assets/images/scenarios/scenario-17-back.svg";
import Scenario18Back from "../../assets/images/scenarios/scenario-18-back.svg";
import Scenario19Back from "../../assets/images/scenarios/scenario-19-back.svg";
import Scenario20Back from "../../assets/images/scenarios/scenario-20-back.svg";

const SCREEN_BACKGROUND =
  "#DDEAEC";

const TOTAL_SCENARIOS = 20;

const CARD_WIDTH = 380;
const CARD_HEIGHT = 532;

const CARD_LEFT = 11;
const CARD_TOP = 171;

const CARD_RADIUS = 60;

const FRONT_TEMPLATE =
  require(
    "../../assets/images/scenarios/scenario-front-template.png",
  );

const SCENARIO_BACK_CARDS: Record<
  number,
  ComponentType<SvgProps>
> = {
  1: Scenario01Back,
  2: Scenario02Back,
  3: Scenario03Back,
  4: Scenario04Back,
  5: Scenario05Back,
  6: Scenario06Back,
  7: Scenario07Back,
  8: Scenario08Back,
  9: Scenario09Back,
  10: Scenario10Back,
  11: Scenario11Back,
  12: Scenario12Back,
  13: Scenario13Back,
  14: Scenario14Back,
  15: Scenario15Back,
  16: Scenario16Back,
  17: Scenario17Back,
  18: Scenario18Back,
  19: Scenario19Back,
  20: Scenario20Back,
};

function getFrontFontSize(
  textLength: number,
): number {
  if (textLength >= 145) {
    return 19;
  }

  if (textLength >= 120) {
    return 20;
  }

  if (textLength >= 95) {
    return 22;
  }

  return 24;
}

export default function ScenarioCardScreen() {
  const { user } =
    useAuth();

  const { activeChild } =
    useActiveChild();

  const { childModeActive } =
    useParentAccess();

  const { scenarioId } =
    useLocalSearchParams<{
      scenarioId?:
        | string
        | string[];
    }>();

  const [
    audioEnabled,
    setAudioEnabled,
  ] = useState(false);

  const [
    showBack,
    setShowBack,
  ] = useState(false);

  const hasStartedRef =
    useRef(false);

  const hasCompletedRef =
    useRef(false);

  const sideProgress =
    useRef(
      new Animated.Value(
        0,
      ),
    ).current;

  const parsedScenarioId =
    useMemo(() => {
      const rawScenarioId =
        Array.isArray(
          scenarioId,
        )
          ? scenarioId[0]
          : scenarioId;

      if (!rawScenarioId) {
        return Number.NaN;
      }

      return Number.parseInt(
        rawScenarioId,
        10,
      );
    }, [scenarioId]);

  const scenario =
    useMemo(
      () =>
        getScenarioChallenge(
          parsedScenarioId,
        ),
      [parsedScenarioId],
    );

  const BackCard =
    SCENARIO_BACK_CARDS[
      parsedScenarioId
    ];

  /*
   * Protect child-only screen.
   */
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

  /*
   * Front/back cross-fade.
   */
  useEffect(() => {
    Animated.timing(
      sideProgress,
      {
        toValue:
          showBack
            ? 1
            : 0,

        duration: 140,

        useNativeDriver:
          true,
      },
    ).start();
  }, [
    showBack,
    sideProgress,
  ]);

  /*
   * Reset when opening another
   * scenario.
   */
  useEffect(() => {
    hasStartedRef.current =
      false;

    hasCompletedRef.current =
      false;

    setShowBack(false);

    sideProgress.setValue(
      0,
    );
  }, [
    parsedScenarioId,
    sideProgress,
  ]);

  /*
   * Keep existing activity start
   * tracking.
   */
  useEffect(() => {
    if (
      !user?.uid ||
      !activeChild?.id ||
      !scenario?.id ||
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
        .scenario,

      scenario.id,

      TOTAL_SCENARIOS,

      {
        source:
          "scenario_card",

        scenarioId:
          scenario.id,
      },
    ).catch(
      (
        error: unknown,
      ) => {
        console.warn(
          "Unable to start scenario level:",
          error,
        );

        hasStartedRef.current =
          false;
      },
    );
  }, [
    activeChild?.id,
    scenario?.id,
    user?.uid,
  ]);

  function handleBack() {
    /*
     * Back always returns to
     * Choose Your Courage.
     *
     * It does not flip the card.
     */
    router.replace(
      "/scenario-challenges" as Href,
    );
  }

  function handleParentMode() {
    router.push(
      "/parent-verification" as Href,
    );
  }

  function toggleAudio() {
    setAudioEnabled(
      (current) =>
        !current,
    );
  }

  function finishScenario() {
    if (
      hasCompletedRef.current
    ) {
      return;
    }

    hasCompletedRef.current =
      true;

    /*
     * Keep the existing backend
     * completion tracking.
     *
     * The UI does not wait for it
     * before showing the Figma
     * success popup.
     */
    if (
      user?.uid &&
      activeChild?.id &&
      scenario?.id
    ) {
      void completeHubLevel(
        user.uid,
        activeChild.id,

        GAME_HUB_ACTIVITY_IDS
          .scenario,

        scenario.id,

        TOTAL_SCENARIOS,

        {
          source:
            "scenario_card",

          scenarioId:
            scenario.id,

          flippedToBack:
            true,
        },
      ).catch(
        (
          error: unknown,
        ) => {
          console.warn(
            "Unable to complete scenario level:",
            error,
          );
        },
      );
    }

    /*
     * Return to the scenario list
     * and tell it to display the
     * Figma success modal.
     */
    router.replace(
      {
        pathname:
          "/scenario-challenges",

        params: {
          rewardSuccess:
            "1",
        },
      } as unknown as Href,
    );
  }

  function handleCardPress() {
    /*
     * Tap 1:
     * front -> guidance/back.
     */
    if (!showBack) {
      setShowBack(true);

      return;
    }

    /*
     * Tap 2:
     * finish the scenario.
     */
    finishScenario();
  }

  if (
    !childModeActive ||
    !activeChild
  ) {
    return null;
  }

  if (
    !scenario ||
    !BackCard
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
          This scenario was
          not found.
        </Text>

        <Pressable
          style={
            styles.missingButton
          }
          onPress={() =>
            router.replace(
              "/scenario-challenges" as Href,
            )
          }
          accessibilityRole="button"
        >
          <Text
            style={
              styles.missingButtonText
            }
          >
            Back to Scenarios
          </Text>
        </Pressable>
      </View>
    );
  }

  const frontFontSize =
    getFrontFontSize(
      scenario.frontText
        .length,
    );

  const frontOpacity =
    sideProgress.interpolate(
      {
        inputRange: [
          0,
          1,
        ],

        outputRange: [
          1,
          0,
        ],
      },
    );

  const backOpacity =
    sideProgress;

  return (
    <View style={styles.screen}>
      {/* BACK */}
      <Pressable
        style={({ pressed }) => [
          styles.backButton,

          pressed &&
            styles.controlPressed,
        ]}
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel="Back to Choose Your Courage"
        hitSlop={8}
      >
        <BackIcon
          width={x(37.24)}
          height={y(22.18)}
        />
      </Pressable>

      {/* AUDIO */}
      <Pressable
        style={({ pressed }) => [
          styles.audioButton,

          pressed &&
            styles.controlPressed,
        ]}
        onPress={
          toggleAudio
        }
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

      {/* NUMBER */}
      <Text
        style={
          styles.scenarioNumber
        }
      >
        {scenario.id}.
      </Text>

      {/* CARD */}
      <Pressable
        style={
          styles.cardPressable
        }
        onPress={
          handleCardPress
        }
        accessibilityRole="button"
        accessibilityLabel={
          showBack
            ? `Scenario ${scenario.id} guidance. Tap when you are finished to complete the scenario.`
            : `Scenario ${scenario.id}. ${scenario.frontText} Tap to show the guidance.`
        }
      >
        <View
          style={
            styles.cardSurface
          }
        >
          {/* BACK */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.cardSide,

              {
                opacity:
                  backOpacity,
              },
            ]}
          >
            <BackCard
              width={
                x(CARD_WIDTH)
              }
              height={
                y(CARD_HEIGHT)
              }
              preserveAspectRatio="none"
            />
          </Animated.View>

          {/* FRONT */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.cardSide,

              {
                opacity:
                  frontOpacity,
              },
            ]}
          >
            <Image
              source={
                FRONT_TEMPLATE
              }
              defaultSource={
                FRONT_TEMPLATE
              }
              resizeMode="stretch"
              fadeDuration={0}
              style={
                styles.frontBackground
              }
              accessibilityIgnoresInvertColors
            />

            <View
              style={
                styles.frontTextContainer
              }
            >
              <Text
                style={[
                  styles.frontText,

                  {
                    fontSize:
                      x(
                        frontFontSize,
                      ),

                    lineHeight:
                      x(
                        frontFontSize *
                          1.28,
                      ),
                  },
                ]}
                numberOfLines={
                  12
                }
                adjustsFontSizeToFit
                minimumFontScale={
                  0.76
                }
              >
                {
                  scenario.frontText
                }
              </Text>
            </View>
          </Animated.View>
        </View>
      </Pressable>

      {/*
       * TRANSPARENT FOOTER WRAPPER.
       *
       * No white rectangle is
       * introduced behind navbar.
       */}
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

      position:
        "relative",

      backgroundColor:
        SCREEN_BACKGROUND,
    },

    backButton: {
      position:
        "absolute",

      left: x(20),
      top: y(48),

      width: x(37.24),
      height: y(35),

      alignItems:
        "center",

      justifyContent:
        "center",

      zIndex: 20,
    },

    audioButton: {
      position:
        "absolute",

      left: x(347),
      top: y(48),

      width: x(35),
      height: x(35),

      alignItems:
        "center",

      justifyContent:
        "center",

      zIndex: 20,
    },

    scenarioNumber: {
      position:
        "absolute",

      left: x(90),
      top: y(72),

      width: x(222),
      height: y(76),

      color:
        colors.primary,

      fontFamily:
        "Outfit",

      fontSize: x(50),
      lineHeight: y(70),

      textAlign:
        "center",

      includeFontPadding:
        false,

      paddingHorizontal:
        x(8),

      overflow:
        "visible",
    },

    cardPressable: {
      position:
        "absolute",

      left:
        x(CARD_LEFT),

      top:
        y(CARD_TOP),

      width:
        x(CARD_WIDTH),

      height:
        y(CARD_HEIGHT),

      borderRadius:
        x(CARD_RADIUS),

      overflow:
        "hidden",

      backgroundColor:
        SCREEN_BACKGROUND,
    },

    cardSurface: {
      position:
        "relative",

      width:
        x(CARD_WIDTH),

      height:
        y(CARD_HEIGHT),

      borderRadius:
        x(CARD_RADIUS),

      overflow:
        "hidden",

      backgroundColor:
        SCREEN_BACKGROUND,
    },

    cardSide: {
      position:
        "absolute",

      top: 0,
      right: 0,
      bottom: 0,
      left: 0,

      width:
        x(CARD_WIDTH),

      height:
        y(CARD_HEIGHT),

      backgroundColor:
        SCREEN_BACKGROUND,
    },

    frontBackground: {
      position:
        "absolute",

      left: 0,
      top: 0,

      width:
        x(CARD_WIDTH),

      height:
        y(CARD_HEIGHT),
    },

    frontTextContainer: {
      position:
        "absolute",

      left: x(31),
      right: x(31),

      top: y(92),
      bottom: y(88),

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    frontText: {
      width: "100%",

      color:
        colors.primary,

      fontFamily:
        "LiterataBold",

      textAlign:
        "center",

      includeFontPadding:
        false,
    },

    /*
     * No white rectangle.
     */
    fixedFooter: {
      position:
        "absolute",

      left: x(20),
      bottom: y(20),

      width: x(362),
      height: y(105),

      backgroundColor:
        "transparent",

      zIndex: 50,
    },

    parentModeLink: {
      position:
        "absolute",

      left: 0,
      top: 0,

      width: x(217),
      height: y(24),

      justifyContent:
        "center",
    },

    parentModeText: {
      color:
        colors.primary,

      fontFamily:
        "Literata",

      fontSize: x(20),
      lineHeight: y(24),

      textDecorationLine:
        "underline",
    },

    /*
     * Only this rounded element
     * has a background.
     */
    bottomNav: {
      position:
        "absolute",

      left: 0,
      top: y(33),

      width: x(362),
      height: y(72),

      borderWidth: x(1),

      borderColor:
        colors.primary,

      borderRadius: x(50),

      backgroundColor:
        SCREEN_BACKGROUND,

      overflow:
        "hidden",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-around",

      paddingHorizontal:
        x(18),
    },

    navItem: {
      width: x(58),
      height: y(56.75),

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    navLabel: {
      color:
        colors.primary,

      fontFamily:
        "Literata",

      fontSize: x(10),
      lineHeight: y(12),

      marginTop: y(1),

      textAlign:
        "center",
    },

    missingScreen: {
      flex: 1,

      paddingHorizontal:
        x(30),

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        SCREEN_BACKGROUND,
    },

    missingTitle: {
      color:
        colors.primary,

      fontFamily:
        "OutfitBold",

      fontSize: x(24),
      lineHeight: y(31),

      textAlign:
        "center",
    },

    missingButton: {
      width: x(210),
      height: y(52),

      marginTop:
        y(24),

      borderRadius:
        x(20),

      backgroundColor:
        "#E7D8EC",

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    missingButtonText: {
      color:
        colors.primary,

      fontFamily:
        "Outfit",

      fontSize: x(18),
    },

    controlPressed: {
      opacity: 0.65,
    },
  });