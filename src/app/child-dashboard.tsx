/**
 * Child home dashboard / adventure path.
 *
 * V1 activities:
 * - Choose Your Courage Scenario
 * - Emotion Puzzle Match
 * - Roleplay Challenges
 * - Confidence Quests
 *
 * Quest Board is intentionally hidden in V1
 * and is reserved for a future version.
 */

import {
  router,
  type Href,
} from "expo-router";

import {
  useEffect,
  useState,
} from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "@/constants/colors";
import { useActiveChild } from "@/contexts/ActiveChildContext";
import { useParentAccess } from "@/contexts/ParentAccessContext";
import { useChildRewards } from "@/hooks/useChildRewards";
import { x, y } from "@/utils/scaling";

import AudioOffIcon from "../../assets/icons/audio-off.svg";
import AudioOnIcon from "../../assets/icons/audio-on.svg";
import BackIcon from "../../assets/icons/back.svg";
import BadgeIcon from "../../assets/icons/certificate-badge.svg";
import ClockIcon from "../../assets/icons/clock.svg";
import DiamondIcon from "../../assets/icons/diamond.svg";
import HouseIcon from "../../assets/icons/house.svg";
import StarIcon from "../../assets/icons/star.svg";
import WorkbookIcon from "../../assets/icons/workbook.svg";
import WorkbookDashboardIcon from "../../assets/icons/workbook-dashboard.svg";

import Vector1 from "../../assets/icons/vector-1.svg";
import Vector2 from "../../assets/icons/vector-2.svg";
import Vector3 from "../../assets/icons/vector-3.svg";
import Vector4 from "../../assets/icons/vector-4.svg";

import DailyChallengeIllustration from "../../assets/images/daily-challenge.svg";

const PAGE_BACKGROUND =
  "#F1F3F5";

const PATH_VERTICAL_SHIFT = -28;

const FIGMA_CONTENT_HEIGHT = 1290;

const FOOTER_SPACE = 125;

/*
 * Quest Board has intentionally been
 * removed from this list for V1.
 */
const ACTIVITY_TILES = [
  {
    id: "scenario",
    label:
      "Choose Your\nCourage\nScenario",
    left: 20,
    top: 788.16,
  },

  {
    id: "emotion-puzzle",
    label:
      "Emotion\nPuzzle Match",
    left: 213,
    top: 857,
  },

  {
    id: "roleplay",
    label:
      "Roleplay\nChallenges",
    left: 20,
    top: 950,
  },

  {
    id: "confidence",
    label:
      "Confidence\nQuests",
    left: 213,
    top: 1072.16,
  },
] as const;

type ActivityId =
  (typeof ACTIVITY_TILES)[number]["id"];

function formatScore(
  value: number,
): string {
  return value
    .toString()
    .padStart(2, "0");
}

function getChallengeTimeLeft(): string {
  const now = new Date();

  const nextMidnight =
    new Date(now);

  nextMidnight.setHours(
    24,
    0,
    0,
    0,
  );

  const difference =
    Math.max(
      0,
      nextMidnight.getTime() -
        now.getTime(),
    );

  const hours =
    Math.floor(
      difference /
        3_600_000,
    );

  const minutes =
    Math.floor(
      (difference %
        3_600_000) /
        60_000,
    );

  return `${hours}h ${minutes
    .toString()
    .padStart(
      2,
      "0",
    )}m left`;
}

export default function ChildDashboardScreen() {
  const { activeChild } =
    useActiveChild();

  const { childModeActive } =
    useParentAccess();

  const rewards =
    useChildRewards(
      activeChild?.id,
    );

  const [
    audioEnabled,
    setAudioEnabled,
  ] = useState(false);

  const [
    timeLeft,
    setTimeLeft,
  ] = useState(
    getChallengeTimeLeft,
  );

  /*
   * Child mode protection.
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
   * Update Daily Challenge
   * remaining time once per minute.
   */
  useEffect(() => {
    const timer =
      setInterval(() => {
        setTimeLeft(
          getChallengeTimeLeft(),
        );
      }, 60_000);

    return () => {
      clearInterval(
        timer,
      );
    };
  }, []);

  /*
   * V1 activity navigation.
   */
  function handleActivityPress(
    activityId: ActivityId,
  ) {
    switch (activityId) {
      case "scenario":
        router.push(
          "/scenario-challenges" as Href,
        );
        break;

      case "emotion-puzzle":
        router.push(
          "/emotion-puzzle" as Href,
        );
        break;

      case "roleplay":
        router.push(
          "/roleplay-challenges" as Href,
        );
        break;

      case "confidence":
        router.push(
          "/confidence-quests" as Href,
        );
        break;

      default:
        break;
    }
  }

  function handleBack() {
    router.replace(
      "/child-welcome" as Href,
    );
  }

  function handleSwitchToParentMode() {
    router.push(
      "/parent-verification" as Href,
    );
  }

  if (
    !childModeActive ||
    !activeChild
  ) {
    return null;
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={
          styles.scrollView
        }
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
        bounces={false}
        alwaysBounceVertical={
          false
        }
        overScrollMode="never"
      >
        <View
          style={
            styles.figmaContent
          }
        >
          {/* BACK */}

          <Pressable
            style={
              styles.backButton
            }
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={8}
          >
            <BackIcon
              width={x(37.24)}
              height={y(22.18)}
            />
          </Pressable>

          {/* AUDIO */}

          <Pressable
            style={
              styles.audioButton
            }
            onPress={() =>
              setAudioEnabled(
                (
                  current,
                ) =>
                  !current,
              )
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

          {/* TITLE */}

          <Text
            style={
              styles.title
            }
          >
            Adventure Path
          </Text>

          {/* CHILD REWARDS */}

          <View
            style={
              styles.statsRow
            }
          >
            <StarIcon
              width={x(21)}
              height={x(20)}
            />

            <Text
              style={
                styles.statText
              }
            >
              {rewards.stars}
            </Text>

            <DiamondIcon
              width={x(22)}
              height={x(22)}
            />

            <Text
              style={
                styles.statText
              }
            >
              {formatScore(
                rewards.gems,
              )}
            </Text>

            <BadgeIcon
              width={x(28)}
              height={x(28)}
            />

            <Text
              style={
                styles.statText
              }
            >
              {formatScore(
                rewards.badges
                  .length,
              )}
            </Text>
          </View>

          {/* DIGITAL WORKBOOK */}

          <Pressable
            style={
              styles.workbookLink
            }
            onPress={() =>
              router.push(
                "/digital-workbook" as Href,
              )
            }
            accessibilityRole="button"
            accessibilityLabel="Digital Workbook"
          >
            <WorkbookIcon
              width={x(56)}
              height={y(53.51)}
            />

            <Text
              style={
                styles.workbookLinkText
              }
            >
              Digital
              {"\n"}
              Workbook
            </Text>
          </Pressable>

          {/* DAILY CHALLENGE */}

          <View
            style={
              styles.dailyChallengeCard
            }
          >
            <Text
              style={
                styles.dailyChallengeLabel
              }
            >
              Daily Challenge
            </Text>

            <View
              style={
                styles.timerRow
              }
            >
              <ClockIcon
                width={x(18)}
                height={x(18)}
              />

              <Text
                style={
                  styles.timerText
                }
              >
                {timeLeft}
              </Text>
            </View>

            <Text
              style={
                styles.challengeTitle
              }
            >
              Stand up a
              little
              {"\n"}
              straighter
              today!
            </Text>

            <Text
              style={
                styles.rewardLabel
              }
            >
              Reward
            </Text>

            <View
              style={
                styles.rewardStarsRow
              }
            >
              <StarIcon
                width={x(21)}
                height={x(20)}
              />

              <Text
                style={
                  styles.rewardValue
                }
              >
                + 10 Stars
              </Text>
            </View>

            <View
              style={
                styles.rewardGemsRow
              }
            >
              <DiamondIcon
                width={x(22)}
                height={x(22)}
              />

              <Text
                style={
                  styles.rewardValue
                }
              >
                + 05 Gems
              </Text>
            </View>

            <DailyChallengeIllustration
              width={x(125)}
              height={y(205)}
              style={
                styles.challengeIllustration
              }
            />

            <Pressable
              style={
                styles.completeButton
              }
              onPress={() => {
                /*
                 * Daily challenge
                 * completion will be
                 * connected later.
                 */
              }}
              accessibilityRole="button"
              accessibilityLabel="Complete daily challenge"
            >
              <Text
                style={
                  styles.challengeButtonText
                }
              >
                Complete
              </Text>
            </Pressable>

            <Pressable
              style={
                styles.skipButton
              }
              onPress={() => {
                /*
                 * Daily challenge
                 * skipping will be
                 * connected later.
                 */
              }}
              accessibilityRole="button"
              accessibilityLabel="Skip daily challenge"
            >
              <Text
                style={
                  styles.challengeButtonText
                }
              >
                Skip
              </Text>
            </Pressable>
          </View>

          {/* ADVENTURE PATH */}

          <View
            style={
              styles.pathGraphic
            }
            pointerEvents="none"
          >
            {/*
             * Start
             * ->
             * Scenario
             */}
            <Vector4
              width={x(92)}
              height={y(130)}
              style={
                styles.vector4
              }
            />

            {/*
             * Scenario
             * ->
             * Emotion Puzzle
             */}
            <Vector1
              width={x(150)}
              height={y(128)}
              style={
                styles.vector1
              }
            />

            {/*
             * Emotion Puzzle
             * ->
             * Roleplay
             */}
            <Vector2
              width={x(115)}
              height={y(120)}
              style={
                styles.vector2
              }
            />

            {/*
             * Roleplay
             * ->
             * Confidence
             */}
            <Vector3
              width={x(150)}
              height={y(64)}
              style={
                styles.vector3
              }
            />
          </View>

          <Text
            style={
              styles.startLabel
            }
          >
            [ Start ]
          </Text>

          {/* V1 ACTIVITY CARDS */}

          {ACTIVITY_TILES.map(
            (activity) => (
              <Pressable
                key={
                  activity.id
                }
                style={[
                  styles.activityTile,
                  {
                    left: x(
                      activity.left,
                    ),

                    top: y(
                      activity.top +
                        PATH_VERTICAL_SHIFT,
                    ),
                  },
                ]}
                onPress={() =>
                  handleActivityPress(
                    activity.id,
                  )
                }
                accessibilityRole="button"
                accessibilityLabel={activity.label.replaceAll(
                  "\n",
                  " ",
                )}
              >
                <Text
                  style={
                    styles.activityTileText
                  }
                >
                  {
                    activity.label
                  }
                </Text>
              </Pressable>
            ),
          )}

          <Text
            style={
              styles.phaseTwoText
            }
          >
            [ Phase 2 -
            {"\n"}
            Coming Soon ]
          </Text>
        </View>
      </ScrollView>

      {/* FIXED CHILD NAVIGATION */}

      <View
        style={
          styles.fixedFooter
        }
      >
        <Pressable
          style={
            styles.parentModeLink
          }
          onPress={
            handleSwitchToParentMode
          }
          accessibilityRole="button"
          accessibilityLabel="Switch to Parent Mode"
        >
          <Text
            style={
              styles.parentModeText
            }
          >
            Switch to Parent
            Mode
          </Text>
        </Pressable>

        <View
          style={
            styles.bottomNav
          }
        >
          {/* WORKBOOK */}

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

          {/* HOME */}

          <Pressable
            style={
              styles.navItem
            }
            onPress={() => {
              // Already on Home.
            }}
            accessibilityRole="button"
            accessibilityLabel="Home"
            accessibilityState={{
              selected: true,
            }}
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

          {/* REWARDS */}

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
        PAGE_BACKGROUND,
    },

    scrollView: {
      flex: 1,
      backgroundColor:
        PAGE_BACKGROUND,
    },

    scrollContent: {
      minHeight: y(
        FIGMA_CONTENT_HEIGHT +
          FOOTER_SPACE,
      ),

      paddingBottom: y(
        FOOTER_SPACE,
      ),

      backgroundColor:
        PAGE_BACKGROUND,
    },

    figmaContent: {
      width: "100%",

      height: y(
        FIGMA_CONTENT_HEIGHT,
      ),

      position:
        "relative",

      backgroundColor:
        PAGE_BACKGROUND,
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

      zIndex: 10,
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

      zIndex: 10,
    },

    title: {
      position:
        "absolute",

      left: x(20),

      top: y(123),

      width: x(362),

      height: y(39),

      color:
        colors.primary,

      fontFamily:
        "Outfit",

      fontSize: x(30),

      lineHeight: y(39),

      textAlign:
        "center",
    },

    statsRow: {
      position:
        "absolute",

      left: x(168),

      top: y(179),

      width: x(212),

      height: y(32),

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "flex-end",

      columnGap: x(7),
    },

    statText: {
      color:
        colors.primary,

      fontFamily:
        "Literata",

      fontSize: x(20),

      lineHeight: y(24),

      marginRight: x(5),
    },

    workbookLink: {
      position:
        "absolute",

      left: x(19),

      top: y(240),

      width: x(210),

      height: y(53.51),

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    workbookLinkText: {
      marginLeft: x(15),

      color:
        colors.primary,

      fontFamily:
        "Outfit",

      fontSize: x(20),

      lineHeight: y(22),

      textDecorationLine:
        "underline",
    },

    dailyChallengeCard: {
      position:
        "absolute",

      left: x(20),

      top: y(332),

      width: x(362),

      height: y(300),

      borderRadius:
        x(20),

      backgroundColor:
        colors.lavender,
    },

    dailyChallengeLabel: {
      position:
        "absolute",

      left: x(23),

      top: y(20),

      width: x(169),

      height: y(26),

      color:
        colors.primary,

      fontFamily:
        "Outfit",

      fontSize: x(20),

      lineHeight: y(26),
    },

    timerRow: {
      position:
        "absolute",

      right: x(18),

      top: y(25),

      height: y(18),

      flexDirection:
        "row",

      alignItems:
        "center",

      columnGap: x(6),
    },

    timerText: {
      color:
        colors.primary,

      fontFamily:
        "Literata",

      fontSize: x(15),

      lineHeight: y(18),
    },

    challengeTitle: {
      position:
        "absolute",

      left: x(23),

      top: y(72),

      width: x(209),

      minHeight: y(60),

      color:
        colors.primary,

      fontFamily:
        "LiterataBold",

      fontSize: x(25),

      lineHeight: y(30),
    },

    rewardLabel: {
      position:
        "absolute",

      left: x(28),

      top: y(152),

      color:
        colors.primary,

      fontFamily:
        "Literata",

      fontStyle:
        "italic",

      fontSize: x(20),

      lineHeight: y(24),
    },

    rewardStarsRow: {
      position:
        "absolute",

      left: x(24),

      top: y(186),

      height: y(22),

      flexDirection:
        "row",

      alignItems:
        "center",

      columnGap: x(5),
    },

    rewardGemsRow: {
      position:
        "absolute",

      left: x(24),

      top: y(220),

      height: y(22),

      flexDirection:
        "row",

      alignItems:
        "center",

      columnGap: x(5),
    },

    rewardValue: {
      color:
        colors.primary,

      fontFamily:
        "Literata",

      fontSize: x(20),

      lineHeight: y(24),
    },

    challengeIllustration: {
      position:
        "absolute",

      left: x(224),

      top: y(62),
    },

    completeButton: {
      position:
        "absolute",

      left: x(23),

      top: y(250),

      width: x(108),

      height: y(40),

      borderRadius:
        x(20),

      backgroundColor:
        colors.muted,

      alignItems:
        "center",

      justifyContent:
        "center",

      shadowColor:
        colors.black,

      shadowOffset: {
        width: 0,
        height: y(4),
      },

      shadowOpacity:
        0.25,

      shadowRadius: x(4),

      elevation: 4,
    },

    skipButton: {
      position:
        "absolute",

      left: x(147),

      top: y(250),

      width: x(61),

      height: y(40),

      borderRadius:
        x(20),

      backgroundColor:
        colors.muted,

      alignItems:
        "center",

      justifyContent:
        "center",

      shadowColor:
        colors.black,

      shadowOffset: {
        width: 0,
        height: y(4),
      },

      shadowOpacity:
        0.25,

      shadowRadius: x(4),

      elevation: 4,
    },

    challengeButtonText: {
      color:
        colors.white,

      fontFamily:
        "OutfitBlack",

      fontSize: x(15),

      lineHeight: y(19),
    },

    pathGraphic: {
      position:
        "absolute",

      top: 0,

      right: 0,

      bottom: 0,

      left: 0,

      zIndex: 1,
    },

    /*
     * Start -> Scenario
     */
    vector4: {
      position:
        "absolute",

      left: x(98),

      top: y(
        707 +
          PATH_VERTICAL_SHIFT,
      ),
    },

    /*
     * Scenario -> Emotion Puzzle
     */
    vector1: {
      position:
        "absolute",

      left: x(176),

      top: y(
        755.48 +
          PATH_VERTICAL_SHIFT,
      ),
    },

    /*
     * Emotion Puzzle -> Roleplay
     */
    vector2: {
      position:
        "absolute",

      left: x(184),

      top: y(
        941.01 +
          PATH_VERTICAL_SHIFT,
      ),
    },

    /*
     * Roleplay -> Confidence
     */
    vector3: {
      position:
        "absolute",

      left: x(64),

      top: y(
        1082.16 +
          PATH_VERTICAL_SHIFT,
      ),
    },

    startLabel: {
      position:
        "absolute",

      left: x(251),

      top: y(
        711.16 +
          PATH_VERTICAL_SHIFT,
      ),

      width: x(125),

      height: y(46),

      color:
        colors.primary,

      fontFamily:
        "Outfit",

      fontSize: x(35),

      lineHeight: y(46),

      textAlign:
        "center",

      zIndex: 3,
    },

    activityTile: {
      position:
        "absolute",

      width: x(171),

      height: y(138),

      borderRadius:
        x(20),

      backgroundColor:
        "#DCEAEC",

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        x(12),

      shadowColor:
        colors.black,

      shadowOffset: {
        width: 0,
        height: y(4),
      },

      shadowOpacity:
        0.25,

      shadowRadius: x(4),

      elevation: 5,

      zIndex: 2,
    },

    activityTileText: {
      color:
        colors.primary,

      fontFamily:
        "Outfit",

      fontSize: x(20),

      lineHeight: y(23),

      textAlign:
        "center",
    },

    /*
     * In V1 the path ends after
     * Confidence Quests.
     */
    phaseTwoText: {
      position:
        "absolute",

      left: x(95),

      top: y(1200),

      width: x(213),

      height: y(78),

      color:
        colors.primary,

      fontFamily:
        "Outfit",

      fontSize: x(30),

      lineHeight: y(34),

      textAlign:
        "center",

      zIndex: 3,
    },

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

      borderRadius:
        x(50),

      backgroundColor:
        PAGE_BACKGROUND,

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
  });