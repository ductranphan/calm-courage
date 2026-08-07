/**
 * Reusable sequential adventure selector screen.
 *
 * Lock rule:
 * - stage 1 is always unlocked
 * - every next stage stays locked until ALL previous stages are completed
 *
 * Use this for:
 * - Choose Your Courage
 * - Emotion Puzzle Match
 * - any other adventure game level selector
 */

import { router, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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

import AudioOffIcon from "../../../assets/icons/audio-off.svg";
import BackIcon from "../../../assets/icons/back.svg";
import AudioOnIcon from "../../../assets/icons/audio-on.svg";
import BadgeIcon from "../../../assets/icons/certificate-badge.svg";
import DiamondIcon from "../../../assets/icons/diamond.svg";
import HouseIcon from "../../../assets/icons/house.svg";
import StarIcon from "../../../assets/icons/star.svg";
import WorkbookDashboardIcon from "../../../assets/icons/workbook-dashboard.svg";
import LockStateIcon from "../../../assets/icons/lock-state.svg";

const PAGE_BACKGROUND = "#F1F3F5";
const UNLOCKED_CARD_BACKGROUND = "#DCE8EC";
const LOCKED_CARD_BACKGROUND = "#D9D9D9";
const LOCKED_TEXT_COLOR = "#7D7C7C";

export type AdventureStage = {
  id: string;
  label: string;
  href?: Href;
};

type SequentialAdventureSelectorProps = {
  title: string;
  stages: AdventureStage[];
  completedStageIds: string[];
  activeNav?: "workbook" | "home" | "rewards";
  onOpenStage?: (stage: AdventureStage) => void;
};

type StageState = AdventureStage & {
  locked: boolean;
  completed: boolean;
};

function formatScore(value: number): string {
  return value.toString().padStart(2, "0");
}

export default function SequentialAdventureSelector({
  title,
  stages,
  completedStageIds,
  activeNav = "rewards",
  onOpenStage,
}: SequentialAdventureSelectorProps) {
  const { activeChild } = useActiveChild();
  const { childModeActive } = useParentAccess();
  const rewards = useChildRewards(activeChild?.id);

  const [audioEnabled, setAudioEnabled] =
    useState(false);

  useEffect(() => {
    if (!childModeActive || !activeChild) {
      router.replace(
        "/parent-verification" as Href,
      );
    }
  }, [activeChild, childModeActive]);

  const stageStates = useMemo(() => {
    const completedSet = new Set(
      completedStageIds,
    );

    return stages.map((stage, index) => {
      const completed = completedSet.has(
        stage.id,
      );

      const unlocked =
        index === 0
          ? true
          : stages
              .slice(0, index)
              .every((previousStage) =>
                completedSet.has(
                  previousStage.id,
                ),
              );

      return {
        ...stage,
        completed,
        locked: !unlocked,
      };
    });
  }, [completedStageIds, stages]);

  function handleParentMode() {
    router.push(
      "/parent-verification" as Href,
    );
  }

  function handleOpenStage(
    stage: StageState,
  ) {
    if (stage.locked) {
      return;
    }

    if (onOpenStage) {
      onOpenStage(stage);
      return;
    }

    if (stage.href) {
      router.push(stage.href);
    }
  }

  function goToWorkbook() {
    router.replace(
      "/digital-workbook" as Href,
    );
  }

  function goToHome() {
    router.replace(
      "/child-dashboard" as Href,
    );
  }

  function goToRewards() {
    router.replace("/rewards" as Href);
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
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <BackIcon
              width={x(37.24)}
              height={y(22.18)}
            />
          </Pressable>

          <Pressable
            style={styles.audioButton}
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
          >
            {audioEnabled ? (
              <AudioOnIcon
                width={x(35)}
                height={y(35)}
              />
            ) : (
              <AudioOffIcon
                width={x(35)}
                height={y(35)}
              />
            )}
          </Pressable>

          <Text style={styles.title}>
            {title}
          </Text>

          <View style={styles.statistics}>
            <StarIcon
              width={x(20)}
              height={x(20)}
            />
            <Text style={styles.statText}>
              {formatScore(rewards.stars)}
            </Text>

            <DiamondIcon
              width={x(18)}
              height={x(18)}
            />
            <Text style={styles.statText}>
              {formatScore(rewards.gems)}
            </Text>

            <BadgeIcon
              width={x(18)}
              height={x(18)}
            />
            <Text style={styles.statText}>
              {formatScore(
                rewards.badges.length,
              )}
            </Text>
          </View>

          <View style={styles.grid}>
            {stageStates.map((stage) => (
              <Pressable
                key={stage.id}
                style={[
                  styles.card,
                  stage.locked
                    ? styles.lockedCard
                    : styles.unlockedCard,
                ]}
                onPress={() =>
                  handleOpenStage(stage)
                }
                disabled={stage.locked}
                accessibilityRole="button"
                accessibilityLabel={stage.label}
                accessibilityState={{
                  disabled: stage.locked,
                }}
              >
                <Text
                  style={[
                    styles.cardText,
                    stage.locked &&
                      styles.lockedCardText,
                  ]}
                >
                  {stage.label}
                </Text>

                {stage.locked ? (
                  <View style={styles.lockIconWrap}>
                    <LockStateIcon
                      width={x(23)}
                      height={y(30)}
                    />
                  </View>
                ) : null}
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.fixedFooter}>
        <Pressable
          style={styles.parentModeLink}
          onPress={handleParentMode}
          accessibilityRole="button"
          accessibilityLabel="Switch to Parent Mode"
        >
          <Text style={styles.parentModeText}>
            Switch to Parent Mode
          </Text>
        </Pressable>

        <View style={styles.bottomNav}>
          <Pressable
            style={styles.navItem}
            onPress={goToWorkbook}
            accessibilityRole="button"
            accessibilityLabel="Workbook"
          >
            <View
              style={
                activeNav === "workbook"
                  ? styles.activeNavIcon
                  : styles.inactiveNavIcon
              }
            >
              <WorkbookDashboardIcon
                width={x(41.94)}
                height={y(40.07)}
              />
            </View>

            <Text style={styles.navLabel}>
              Workbook
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={goToHome}
            accessibilityRole="button"
            accessibilityLabel="Home"
          >
            <View
              style={
                activeNav === "home"
                  ? styles.activeNavIcon
                  : styles.inactiveNavIcon
              }
            >
              <HouseIcon
                width={x(40)}
                height={y(40)}
              />
            </View>

            <Text style={styles.navLabel}>
              Home
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={goToRewards}
            accessibilityRole="button"
            accessibilityLabel="Rewards"
          >
            <View
              style={
                activeNav === "rewards"
                  ? styles.activeRewardWrap
                  : undefined
              }
            >
              <StarIcon
                width={x(42)}
                height={y(42)}
              />
            </View>

            <Text style={styles.navLabel}>
              Rewards
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PAGE_BACKGROUND,
  },

  scrollView: {
    flex: 1,
    backgroundColor: PAGE_BACKGROUND,
  },

  scrollContent: {
    paddingBottom: y(125),
    backgroundColor: PAGE_BACKGROUND,
  },

  figmaContent: {
    position: "relative",
    width: "100%",
    paddingTop: y(20),
    paddingHorizontal: x(20),
    paddingBottom: y(30),
    backgroundColor: PAGE_BACKGROUND,
  },

  backButton: {
    position: "absolute",
    left: x(20),
    top: y(20),
    width: x(30),
    height: x(30),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  audioButton: {
    position: "absolute",
    right: x(20),
    top: y(20),
    width: x(35),
    height: y(35),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  title: {
    marginTop: y(55),
    alignSelf: "center",
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(18),
    lineHeight: y(24),
    textAlign: "center",
  },

  statistics: {
    marginTop: y(10),
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    columnGap: x(6),
  },

  statText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(14),
    lineHeight: y(18),
    marginRight: x(8),
  },

  grid: {
    marginTop: y(18),
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: y(12),
  },

  card: {
    width: x(171),
    height: y(138),
    borderRadius: x(20),
    paddingHorizontal: x(10),
    paddingTop: y(28),
    alignItems: "center",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.18,
    shadowRadius: x(4),
    elevation: 4,
  },

  unlockedCard: {
    backgroundColor: UNLOCKED_CARD_BACKGROUND,
  },

  lockedCard: {
    backgroundColor: LOCKED_CARD_BACKGROUND,
  },

  cardText: {
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(25),
    lineHeight: y(25),
    textAlign: "center",
  },

  lockedCardText: {
    color: LOCKED_TEXT_COLOR,
  },

  lockIconWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: y(16),
    alignItems: "center",
    justifyContent: "center",
  },

  fixedFooter: {
    position: "absolute",
    left: x(20),
    right: x(20),
    bottom: y(20),
    height: y(105),
    zIndex: 20,
  },

  parentModeLink: {
    position: "absolute",
    left: 0,
    top: 0,
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
    right: 0,
    top: y(33),
    height: y(72),
    borderWidth: x(1),
    borderColor: colors.primary,
    borderRadius: x(50),
    backgroundColor: PAGE_BACKGROUND,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: x(18),
    overflow: "hidden",
  },

  navItem: {
    width: x(70),
    height: y(56.75),
    alignItems: "center",
    justifyContent: "center",
  },

  activeNavIcon: {
    opacity: 1,
  },

  inactiveNavIcon: {
    opacity: 0.72,
  },

  activeRewardWrap: {
    opacity: 1,
  },

  navLabel: {
    marginTop: y(1),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(10),
    lineHeight: y(12),
    textAlign: "center",
  },
});