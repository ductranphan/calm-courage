/**
 * Quest Board screen.
 *
 * Matches Figma Screen 14.1:
 * - weekly quest categories
 * - four quest cards
 * - quest status and actions
 * - Confidence Climb reward popup
 * - fixed child-mode footer
 */

import { router, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";

import RewardUnlockModal from "@/components/quest-board/RewardUnlockModal";
import { colors } from "@/constants/colors";
import {
  type QuestCategory,
} from "@/constants/quests";
import { useActiveChild } from "@/contexts/ActiveChildContext";
import { useAuth } from "@/contexts/AuthContext";
import { useParentAccess } from "@/contexts/ParentAccessContext";
import {
  completeQuest,
  listChildQuests,
  seedWeeklyQuests,
  startQuest,
  type ChildQuest,
  type QuestStatus as BackendQuestStatus,
} from "@/services/quests";
import { x, y } from "@/utils/scaling";

import AudioOffIcon from "../../assets/icons/audio-off.svg";
import AudioOnIcon from "../../assets/icons/audio-on.svg";
import BackIcon from "../../assets/icons/back.svg";
import HouseIcon from "../../assets/icons/house.svg";
import LockIcon from "../../assets/icons/lock.svg";
import StarIcon from "../../assets/icons/star.svg";
import WorkbookDashboardIcon from "../../assets/icons/workbook-dashboard.svg";

const PAGE_BACKGROUND = "#F1F3F5";

const CONTENT_HEIGHT = 958;
const FOOTER_SPACE = 125;

type UiQuestStatus =
  | "In Progress"
  | "Available"
  | "Locked"
  | "Completed";

type QuestItem = {
  id: string;
  title: string;
  description: string;
  status: UiQuestStatus;
  buttonLabel: string;
  left: number;
  top: number;
  image: ImageSourcePropType;
};

function toUiStatus(
  status: BackendQuestStatus,
): UiQuestStatus {
  switch (status) {
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "locked":
      return "Locked";
    default:
      return "Available";
  }
}

function toButtonLabel(
  status: BackendQuestStatus,
): string {
  switch (status) {
    case "in_progress":
      return "Continue →";
    case "completed":
      return "Claimed";
    case "locked":
      return "Locked";
    default:
      return "Start Quest →";
  }
}

const CATEGORIES: Array<{
  id: QuestCategory;
  label: string;
  left: number;
  top: number;
}> = [
  {
    id: "confidence",
    label: "Confidence",
    left: 20,
    top: 245,
  },
  {
    id: "emotion",
    label: "Emotion",
    left: 147,
    top: 245,
  },
  {
    id: "kindness",
    label: "Kindness",
    left: 274,
    top: 245,
  },
  {
    id: "gratitude",
    label: "Gratitude",
    left: 19,
    top: 307,
  },
  {
    id: "resilience",
    label: "Resilience",
    left: 147,
    top: 307,
  },
  {
    id: "friendship",
    label: "Friendship",
    left: 274,
    top: 307,
  },
];

const CONFIDENCE_CLIMB_IMAGE = require(
  "../../assets/images/quest-confidence-climb.png",
);

const KINDNESS_RANGER_IMAGE = require(
  "../../assets/images/quest-kindness-ranger.png",
);

const EMOTION_EXPLORER_IMAGE = require(
  "../../assets/images/quest-emotion-explorer.png",
);

const GRATITUDE_GARDEN_IMAGE = require(
  "../../assets/images/quest-gratitude-garden.png",
);

const QUEST_LAYOUT: Array<{
  id: string;
  title: string;
  description: string;
  left: number;
  top: number;
  image: ImageSourcePropType;
}> = [
  {
    id: "confidence-climb",
    title: "The Confidence\nClimb",
    description:
      "Help Pip climb the mountain by proving your own strengths step by step!",
    left: 20,
    top: 395,
    image: CONFIDENCE_CLIMB_IMAGE,
  },
  {
    id: "kindness-ranger",
    title: "The Kindness\nRanger",
    description:
      "Bring warmth back to the forest by completing acts of kindness!",
    left: 211,
    top: 395,
    image: KINDNESS_RANGER_IMAGE,
  },
  {
    id: "emotion-explorer",
    title: "The Emotion\nExplorer",
    description:
      "Explore your feelings and become a mood detective!",
    left: 20,
    top: 666,
    image: EMOTION_EXPLORER_IMAGE,
  },
  {
    id: "gratitude-garden",
    title: "The Gratitude\nGarden",
    description:
      "Grow your garden by noticing the good things around you!",
    left: 211,
    top: 666,
    image: GRATITUDE_GARDEN_IMAGE,
  },
];

export default function QuestBoardScreen() {
  const { user } = useAuth();
  const { activeChild } = useActiveChild();
  const { childModeActive } =
    useParentAccess();

  const [audioEnabled, setAudioEnabled] =
    useState(false);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<QuestCategory>("confidence");

  const [
    rewardUnlockVisible,
    setRewardUnlockVisible,
  ] = useState(false);

  const [backendQuests, setBackendQuests] =
    useState<ChildQuest[]>([]);
  const [questsLoading, setQuestsLoading] =
    useState(true);
  const [questBusy, setQuestBusy] =
    useState(false);
  const [pendingClaimQuestId, setPendingClaimQuestId] =
    useState<string | null>(null);

  const quests = useMemo((): QuestItem[] => {
    return QUEST_LAYOUT.map((layout) => {
      const backend = backendQuests.find(
        (quest) => quest.questId === layout.id,
      );
      const status = backend
        ? toUiStatus(backend.status)
        : "Available";
      const buttonLabel = backend
        ? toButtonLabel(backend.status)
        : "Start Quest →";

      return {
        ...layout,
        status,
        buttonLabel,
      };
    });
  }, [backendQuests]);

  useEffect(() => {
    if (!childModeActive || !activeChild) {
      router.replace(
        "/parent-verification" as Href,
      );
    }
  }, [activeChild, childModeActive]);

  useEffect(() => {
    let stillMounted = true;

    async function loadQuests() {
      if (!user?.uid || !activeChild?.id) {
        if (stillMounted) {
          setQuestsLoading(false);
        }
        return;
      }

      setQuestsLoading(true);

      try {
        const seeded = await seedWeeklyQuests(
          user.uid,
          activeChild.id,
        );

        if (stillMounted) {
          setBackendQuests(seeded);
        }
      } catch (loadError) {
        console.error(
          "Unable to load weekly quests:",
          loadError,
        );

        if (stillMounted) {
          try {
            const fallback = await listChildQuests(
              user.uid,
              activeChild.id,
            );
            setBackendQuests(fallback);
          } catch {
            setBackendQuests([]);
          }
        }
      } finally {
        if (stillMounted) {
          setQuestsLoading(false);
        }
      }
    }

    void loadQuests();

    return () => {
      stillMounted = false;
    };
  }, [activeChild?.id, user?.uid]);

  function handleBack() {
    router.replace(
      "/child-dashboard" as Href,
    );
  }

  function handleParentMode() {
    router.push(
      "/parent-verification" as Href,
    );
  }

  async function handleQuestPress(
    quest: QuestItem,
  ) {
    if (
      quest.status === "Locked" ||
      questBusy ||
      !user?.uid ||
      !activeChild?.id
    ) {
      return;
    }

    if (quest.status === "Completed") {
      if (quest.id === "confidence-climb") {
        setPendingClaimQuestId(quest.id);
        setRewardUnlockVisible(true);
      }
      return;
    }

    setQuestBusy(true);

    try {
      await startQuest(
        user.uid,
        activeChild.id,
        quest.id,
      );

      const completed = await completeQuest(
        user.uid,
        activeChild.id,
        quest.id,
      );

      const refreshed = await seedWeeklyQuests(
        user.uid,
        activeChild.id,
      );
      setBackendQuests(refreshed);

      if (quest.id === "confidence-climb") {
        setPendingClaimQuestId(quest.id);
        setRewardUnlockVisible(true);
      } else {
        Alert.alert(
          "Quest Complete!",
          completed
            ? `You earned ${completed.starsEarned} stars and ${completed.gemsEarned} gems.`
            : "Great work on your weekly quest.",
        );
      }
    } catch (questError) {
      console.error(
        "Unable to complete quest:",
        questError,
      );
      Alert.alert(
        "Quest unavailable",
        questError instanceof Error
          ? questError.message
          : "Please try again.",
      );
    } finally {
      setQuestBusy(false);
    }
  }

  function handleClaimReward() {
    setRewardUnlockVisible(false);
    setPendingClaimQuestId(null);
  }

  function handlePrintCertificate() {
    console.log(
      "Certificate requested:",
      {
        childId: activeChild?.id,
        questId:
          pendingClaimQuestId ??
          "confidence-climb",
        rewardId: "star-explorer-hat",
      },
    );
  }

  if (!childModeActive || !activeChild) {
    return null;
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
      >
        <View style={styles.figmaContent}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed &&
                styles.headerButtonPressed,
            ]}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Back to adventure path"
            hitSlop={8}
          >
            <BackIcon
              width={x(37.24)}
              height={y(22.18)}
            />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.audioButton,
              pressed &&
                styles.headerButtonPressed,
            ]}
            onPress={() =>
              setAudioEnabled(
                (current) => !current,
              )
            }
            accessibilityRole="button"
            accessibilityLabel={
              audioEnabled
                ? "Turn audio off"
                : "Turn audio on"
            }
            accessibilityState={{
              selected: audioEnabled,
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

          <Text style={styles.title}>
            Quest Board
          </Text>

          <View
            style={styles.weeklyQuestText}
          >
            <Text
              style={styles.weeklyQuestTitle}
            >
              Weekly Quest
            </Text>

            <Text
              style={
                styles.weeklyQuestSubtitle
              }
            >
              Choose your adventure for today!
            </Text>
          </View>

          {CATEGORIES.map((category) => {
            const selected =
              selectedCategory === category.id;

            return (
              <Pressable
                key={category.id}
                style={({ pressed }) => [
                  styles.categoryButton,
                  {
                    left: x(category.left),
                    top: y(category.top),
                  },
                  selected
                    ? styles.selectedCategory
                    : styles.inactiveCategory,
                  pressed &&
                    styles.categoryPressed,
                ]}
                onPress={() =>
                  setSelectedCategory(
                    category.id,
                  )
                }
                accessibilityRole="button"
                accessibilityLabel={
                  category.label
                }
                accessibilityState={{
                  selected,
                }}
              >
                <Text
                  style={[
                    styles.categoryText,
                    !selected &&
                      styles.inactiveCategoryText,
                  ]}
                >
                  {category.label}
                </Text>
              </Pressable>
            );
          })}

          {questsLoading ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={{
                position: "absolute",
                top: y(480),
                left: 0,
                right: 0,
              }}
            />
          ) : null}

          {quests.map((quest) => {
            const locked =
              quest.status === "Locked";

            return (
              <View
                key={quest.id}
                style={[
                  styles.questCard,
                  {
                    left: x(quest.left),
                    top: y(quest.top),
                  },
                ]}
              >
                <View
                  style={styles.statusPill}
                >
                  <Text
                    style={styles.statusText}
                  >
                    {quest.status}
                  </Text>
                </View>

                <Image
                  source={quest.image}
                  style={styles.questImage}
                  resizeMode="contain"
                  fadeDuration={0}
                  accessible
                  accessibilityLabel={
                    quest.title.replace(
                      "\n",
                      " ",
                    )
                  }
                  onError={(event) => {
                    console.error(
                      `Unable to load image for ${quest.id}:`,
                      event.nativeEvent.error,
                    );
                  }}
                />

                <Text
                  style={styles.questTitle}
                >
                  {quest.title}
                </Text>

                <Text
                  style={
                    styles.questDescription
                  }
                >
                  {quest.description}
                </Text>

                <Pressable
                  style={({ pressed }) => [
                    styles.questButton,
                    locked &&
                      styles.lockedQuestButton,
                    pressed &&
                      !locked &&
                      styles.questButtonPressed,
                  ]}
                  onPress={() => {
                    void handleQuestPress(quest);
                  }}
                  disabled={locked || questBusy}
                  accessibilityRole="button"
                  accessibilityLabel={`${quest.buttonLabel} ${quest.title.replace(
                    "\n",
                    " ",
                  )}`}
                  accessibilityState={{
                    disabled: locked,
                  }}
                >
                  <Text
                    style={[
                      styles.questButtonText,
                      locked &&
                        styles.lockedQuestButtonText,
                    ]}
                  >
                    {quest.buttonLabel}
                  </Text>

                  {locked && (
                    <LockIcon
                      width={x(15)}
                      height={x(15)}
                      style={
                        styles.buttonLockIcon
                      }
                    />
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.fixedFooter}>
        <Pressable
          style={({ pressed }) => [
            styles.parentModeLink,
            pressed &&
              styles.footerButtonPressed,
          ]}
          onPress={handleParentMode}
          accessibilityRole="button"
          accessibilityLabel="Switch to Parent Mode"
        >
          <Text
            style={styles.parentModeText}
          >
            Switch to Parent Mode
          </Text>
        </Pressable>

        <View style={styles.bottomNav}>
          <Pressable
            style={({ pressed }) => [
              styles.navItem,
              pressed &&
                styles.footerButtonPressed,
            ]}
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

            <Text style={styles.navLabel}>
              Workbook
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.navItem,
              pressed &&
                styles.footerButtonPressed,
            ]}
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

            <Text style={styles.navLabel}>
              Home
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.navItem,
              pressed &&
                styles.footerButtonPressed,
            ]}
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

            <Text style={styles.navLabel}>
              Rewards
            </Text>
          </Pressable>
        </View>
      </View>

      <RewardUnlockModal
        visible={rewardUnlockVisible}
        onClose={() =>
          setRewardUnlockVisible(false)
        }
        onClaimReward={handleClaimReward}
        onPrintCertificate={
          handlePrintCertificate
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: "relative",
    backgroundColor: PAGE_BACKGROUND,
  },

  scrollView: {
    flex: 1,
    backgroundColor: PAGE_BACKGROUND,
  },

  scrollContent: {
    minHeight: y(
      CONTENT_HEIGHT + FOOTER_SPACE,
    ),
    paddingBottom: y(FOOTER_SPACE),
    backgroundColor: PAGE_BACKGROUND,
  },

  figmaContent: {
    position: "relative",
    width: "100%",
    height: y(CONTENT_HEIGHT),
    backgroundColor: PAGE_BACKGROUND,
  },

  backButton: {
    position: "absolute",
    left: x(20),
    top: y(48),
    width: x(37.24),
    height: y(35),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  audioButton: {
    position: "absolute",
    left: x(347),
    top: y(48),
    width: x(35),
    height: x(35),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  headerButtonPressed: {
    opacity: 0.65,
  },

  title: {
    position: "absolute",
    left: x(20),
    top: y(123),
    width: x(362),
    height: y(39),
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(30),
    lineHeight: y(39),
    textAlign: "center",
  },

  weeklyQuestText: {
    position: "absolute",
    left: x(19),
    top: y(177),
    width: x(364),
    height: y(48),
    justifyContent: "center",
  },

  weeklyQuestTitle: {
    color: colors.primary,
    fontFamily: "LiterataBold",
    fontSize: x(20),
    lineHeight: y(22),
  },

  weeklyQuestSubtitle: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(22),
  },

  categoryButton: {
    position: "absolute",
    width: x(107),
    height: y(47),
    borderRadius: x(10),
    alignItems: "center",
    justifyContent: "center",

    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 4,
  },

  selectedCategory: {
    backgroundColor: "#E6D8EB",
  },

  inactiveCategory: {
    backgroundColor: "#D9D9D9",
  },

  categoryPressed: {
    opacity: 0.7,
  },

  categoryText: {
    width: x(99),
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(16),
    lineHeight: y(21),
    textAlign: "center",
  },

  inactiveCategoryText: {
    color: "#7D7C7C",
  },

  questCard: {
    position: "absolute",
    width: x(171),
    height: y(251),
    borderWidth: x(1),
    borderColor: colors.primary,
    borderRadius: x(20),
    backgroundColor: "transparent",
    overflow: "hidden",
  },

  statusPill: {
    position: "absolute",
    left: x(16),
    top: y(12),
    width: x(74),
    height: y(17),
    borderRadius: x(10),
    backgroundColor: "#E6D8EB",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },

  statusText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(8),
    lineHeight: y(10),
    textAlign: "center",
  },

  questImage: {
    position: "absolute",
    left: x(23),
    top: y(25),
    width: x(125),
    height: x(125),
    opacity: 0.7,
  },

  questTitle: {
    position: "absolute",
    left: x(14),
    top: y(106),
    width: x(139),
    minHeight: y(32),
    color: colors.primary,
    fontFamily: "LiterataBold",
    fontSize: x(13),
    lineHeight: y(14),
  },

  questDescription: {
    position: "absolute",
    left: x(14),
    top: y(143),
    width: x(139),
    height: y(62),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(12),
    lineHeight: y(13),
  },

  questButton: {
    position: "absolute",
    left: x(15),
    top: y(214),
    width: x(140),
    height: y(24),
    borderRadius: x(5),
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 4,
  },

  lockedQuestButton: {
    backgroundColor: "#ACACD7",
  },

  questButtonPressed: {
    opacity: 0.7,
  },

  questButtonText: {
    color: colors.white,
    fontFamily: "LiterataBold",
    fontSize: x(13),
    lineHeight: y(16),
    textAlign: "center",
  },

  lockedQuestButtonText: {
    opacity: 0.65,
  },

  buttonLockIcon: {
    marginLeft: x(5),
  },

  fixedFooter: {
    position: "absolute",
    left: x(20),
    bottom: y(20),
    width: x(362),
    height: y(105),
    backgroundColor: "transparent",
    zIndex: 50,
  },

  parentModeLink: {
    position: "absolute",
    left: 0,
    top: 0,
    width: x(217),
    height: y(24),
    justifyContent: "center",
  },

  parentModeText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textDecorationLine: "underline",
  },

  bottomNav: {
    position: "absolute",
    left: 0,
    top: y(33),
    width: x(362),
    height: y(72),
    borderWidth: x(1),
    borderColor: colors.primary,
    borderRadius: x(50),
    backgroundColor: PAGE_BACKGROUND,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: x(18),
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

  footerButtonPressed: {
    opacity: 0.65,
  },
});