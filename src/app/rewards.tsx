/**
 * Child Rewards and Achievements screen.
 *
 * Displays:
 * - the Figma empty state when the child has not earned any badges
 * - the collected-badges screen after at least one badge is earned
 * - a full child-mode error state when Firestore cannot load rewards
 */

import { router, type Href } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import ErrorStateScreen from "@/components/ui/ErrorStateScreen";
import { colors } from "@/constants/colors";
import { useActiveChild } from "@/contexts/ActiveChildContext";
import { useParentAccess } from "@/contexts/ParentAccessContext";
import { useChildRewards } from "@/hooks/useChildRewards";
import { x, y } from "@/utils/scaling";

import AudioOffIcon from "../../assets/icons/audio-off.svg";
import AudioOnIcon from "../../assets/icons/audio-on.svg";
import BadgeIcon from "../../assets/icons/certificate-badge.svg";
import DiamondIcon from "../../assets/icons/diamond.svg";
import HouseIcon from "../../assets/icons/house.svg";
import LockIcon from "../../assets/icons/lock.svg";
import StarIcon from "../../assets/icons/star.svg";
import WorkbookDashboardIcon from "../../assets/icons/workbook-dashboard.svg";

import BraveSpeakerBadge from "../../assets/images/brave-speaker.svg";
import HelperFriendBadge from "../../assets/images/helper-friend.svg";
import KindVoiceBadge from "../../assets/images/kind-voice.svg";
import RewardsEmptyStateIllustration from "../../assets/images/rewards-empty-state.svg";

const FIGMA_CONTENT_HEIGHT = 1100;
const FOOTER_SPACE = 125;
const PAGE_BACKGROUND = "#F1F3F5";

const SUMMARY_STAR_WIDTH = 65;
const SUMMARY_STAR_HEIGHT = 42;

const TOTAL_BADGE_SLOTS = 15;

const LOCKED_BADGES = Array.from(
  { length: 12 },
  (_, index) => index,
);

export default function RewardsScreen() {
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

  function handleParentMode() {
    router.push(
      "/parent-verification" as Href,
    );
  }

  function handleExploreQuests() {
    router.replace(
      "/child-dashboard" as Href,
    );
  }

  function renderAudioButton() {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.audioButton,
          pressed && styles.controlPressed,
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
            height={y(35)}
          />
        ) : (
          <AudioOffIcon
            width={x(35)}
            height={y(35)}
          />
        )}
      </Pressable>
    );
  }

  function renderFooter() {
    return (
      <View style={styles.fixedFooter}>
        <Pressable
          style={({ pressed }) => [
            styles.parentModeLink,
            pressed && styles.controlPressed,
          ]}
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
            onPress={() =>
              router.replace(
                "/digital-workbook" as Href,
              )
            }
            accessibilityRole="button"
            accessibilityLabel="Workbook"
          >
            <View style={styles.inactiveNavIcon}>
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
            onPress={() =>
              router.replace(
                "/child-dashboard" as Href,
              )
            }
            accessibilityRole="button"
            accessibilityLabel="Home"
          >
            <View style={styles.inactiveNavIcon}>
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
            onPress={() => {
              // Already on Rewards.
            }}
            accessibilityRole="button"
            accessibilityLabel="Rewards"
            accessibilityState={{
              selected: true,
            }}
          >
            <StarIcon
              width={x(42)}
              height={y(42)}
            />

            <Text style={styles.navLabel}>
              Rewards
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!childModeActive || !activeChild) {
    return null;
  }

  if (rewards.loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.loadingText}>
          Loading rewards...
        </Text>
      </View>
    );
  }

  if (rewards.error) {
    return (
      <ErrorStateScreen
        activeTab="rewards"
        message={rewards.error}
        onRetry={rewards.retry}
      />
    );
  }

  const hasCollectedBadges =
    rewards.badges.length > 0;

  if (!hasCollectedBadges) {
    return (
      <View style={styles.screen}>
        <View style={styles.emptyStateContent}>
          {renderAudioButton()}

          <Text style={styles.title}>
            My Rewards
          </Text>

          <StarIcon
            width={x(45)}
            height={y(45)}
            style={styles.emptyStarIcon}
          />

          <Text style={styles.emptyStarText}>
            {rewards.stars} Stars
          </Text>

          <DiamondIcon
            width={x(37.72)}
            height={y(37.54)}
            style={styles.emptyDiamondIcon}
          />

          <Text style={styles.emptyGemText}>
            {rewards.gems} Gems
          </Text>

          <View style={styles.divider} />

          <BadgeIcon
            width={x(46)}
            height={y(46)}
            style={styles.badgeHeaderIcon}
          />

          <Text style={styles.badgeHeaderText}>
            Collected Badges
          </Text>

          <Text style={styles.emptyBadgeCountText}>
            0/{TOTAL_BADGE_SLOTS}
          </Text>

          <RewardsEmptyStateIllustration
            width={x(200)}
            height={y(143)}
            style={styles.emptyIllustration}
          />

          <Text style={styles.emptyTitle}>
            No badges earned yet!
          </Text>

          <Text style={styles.emptyMessage}>
            Complete your first quest to unlock{"\n"}
            special rewards and badges!
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.exploreButton,
              pressed && styles.controlPressed,
            ]}
            onPress={handleExploreQuests}
            accessibilityRole="button"
            accessibilityLabel="Explore Quests"
          >
            <Text style={styles.exploreButtonText}>
              Explore Quests
            </Text>
          </Pressable>
        </View>

        {renderFooter()}
      </View>
    );
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
        contentInsetAdjustmentBehavior="never"
      >
        <View style={styles.figmaContent}>
          {renderAudioButton()}

          <Text style={styles.title}>
            My Rewards
          </Text>

          <View style={styles.starSummary}>
            <View style={styles.summaryStarWrapper}>
              <StarIcon
                width={x(SUMMARY_STAR_WIDTH)}
                height={y(SUMMARY_STAR_HEIGHT)}
              />
            </View>

            <Text style={styles.summaryText}>
              {rewards.stars} Stars
            </Text>
          </View>

          <View style={styles.gemSummary}>
            <DiamondIcon
              width={x(37.72)}
              height={y(37.54)}
            />

            <Text style={styles.summaryText}>
              {rewards.gems} Gems
            </Text>
          </View>

          <View style={styles.divider} />

          <BadgeIcon
            width={x(46)}
            height={y(46)}
            style={styles.badgeHeaderIcon}
          />

          <Text style={styles.badgeHeaderText}>
            Collected Badges
          </Text>

          <Text style={styles.badgeCountText}>
            {rewards.badges.length}/
            {TOTAL_BADGE_SLOTS}
          </Text>

          <View style={styles.collectedBadgeRow}>
            <View style={styles.collectedBadgeShadow}>
              <View style={styles.collectedBadgeCard}>
                <BraveSpeakerBadge
                  width={x(107)}
                  height={y(107)}
                />
              </View>
            </View>

            <View style={styles.collectedBadgeShadow}>
              <View style={styles.collectedBadgeCard}>
                <KindVoiceBadge
                  width={x(107)}
                  height={y(107)}
                />
              </View>
            </View>

            <View style={styles.collectedBadgeShadow}>
              <View style={styles.collectedBadgeCard}>
                <HelperFriendBadge
                  width={x(107)}
                  height={y(107)}
                />
              </View>
            </View>
          </View>

          <View style={styles.lockedBadgeGrid}>
            {LOCKED_BADGES.map(
              (badgeIndex) => (
                <View
                  key={badgeIndex}
                  style={styles.lockedBadgeCard}
                >
                  <LockIcon
                    width={x(34)}
                    height={y(45)}
                    color={colors.primary}
                    opacity={0.5}
                  />
                </View>
              ),
            )}
          </View>
        </View>
      </ScrollView>

      {renderFooter()}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PAGE_BACKGROUND,
  },

  loadingText: {
    marginTop: y(14),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(17),
    lineHeight: y(24),
  },

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
      FIGMA_CONTENT_HEIGHT +
        FOOTER_SPACE,
    ),
    paddingBottom: y(FOOTER_SPACE),
    backgroundColor: PAGE_BACKGROUND,
  },

  figmaContent: {
    position: "relative",
    width: "100%",
    height: y(FIGMA_CONTENT_HEIGHT),
    backgroundColor: PAGE_BACKGROUND,
  },

  emptyStateContent: {
    position: "relative",
    width: "100%",
    height: "100%",
    backgroundColor: PAGE_BACKGROUND,
  },

  audioButton: {
    position: "absolute",
    left: x(347),
    top: y(48),
    width: x(35),
    height: y(35),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
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
    includeFontPadding: false,
  },

  emptyStarIcon: {
    position: "absolute",
    left: x(28),
    top: y(182),
  },

  emptyStarText: {
    position: "absolute",
    left: x(96),
    top: y(193),
    width: x(80),
    height: y(30),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textAlign: "left",
    includeFontPadding: false,
  },

  emptyDiamondIcon: {
    position: "absolute",
    left: x(229),
    top: y(186),
  },

  emptyGemText: {
    position: "absolute",
    left: x(284),
    top: y(193),
    width: x(90),
    height: y(30),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textAlign: "left",
    includeFontPadding: false,
  },

  starSummary: {
    position: "absolute",
    left: x(28),
    top: y(172),
    width: x(145),
    height: y(65),
    flexDirection: "row",
    alignItems: "center",
  },

  summaryStarWrapper: {
    width: x(SUMMARY_STAR_WIDTH),
    height: y(SUMMARY_STAR_HEIGHT),
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginRight: x(10),
  },

  gemSummary: {
    position: "absolute",
    left: x(229),
    top: y(186),
    width: x(145),
    height: y(37.54),
    flexDirection: "row",
    alignItems: "center",
    columnGap: x(15),
  },

  summaryText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
  },

  divider: {
    position: "absolute",
    left: x(20),
    top: y(244),
    width: x(362),
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.primary,
  },

  badgeHeaderIcon: {
    position: "absolute",
    left: x(14),
    top: y(264),
  },

  badgeHeaderText: {
    position: "absolute",
    left: x(72),
    top: y(275),
    width: x(190),
    height: y(24),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    includeFontPadding: false,
  },

  badgeCountText: {
    position: "absolute",
    left: x(325),
    top: y(275),
    width: x(57),
    height: y(24),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textAlign: "right",
    includeFontPadding: false,
  },

  emptyBadgeCountText: {
    position: "absolute",
    left: x(338),
    top: y(275),
    width: x(44),
    height: y(30),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textAlign: "right",
    includeFontPadding: false,
  },

  emptyIllustration: {
    position: "absolute",
    left: x(101),
    top: y(350),
  },

  emptyTitle: {
    position: "absolute",
    left: x(47),
    top: y(533),
    width: x(309),
    height: y(38),
    color: colors.primary,
    fontFamily: "OutfitBold",
    fontSize: x(30),
    lineHeight: y(38),
    textAlign: "center",
    includeFontPadding: false,
  },

  emptyMessage: {
    position: "absolute",
    left: x(47),
    top: y(591),
    width: x(308),
    height: y(50),
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(20),
    lineHeight: y(25),
    textAlign: "center",
    includeFontPadding: false,
  },

  exploreButton: {
    position: "absolute",
    left: x(96),
    top: y(661),
    width: x(210),
    height: y(52),
    borderRadius: x(20),
    backgroundColor: "#E7D8EC",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 5,
  },

  exploreButtonText: {
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(20),
    lineHeight: y(25),
    textAlign: "center",
    includeFontPadding: false,
  },

  collectedBadgeRow: {
    position: "absolute",
    left: x(20),
    top: y(336),
    width: x(362),
    height: y(107),
    flexDirection: "row",
    justifyContent: "space-between",
  },

  collectedBadgeShadow: {
    width: x(107),
    height: y(107),
    borderRadius: x(20),
    backgroundColor: colors.white,

    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 5,
  },

  collectedBadgeCard: {
    width: "100%",
    height: "100%",
    borderRadius: x(20),
    overflow: "hidden",
    backgroundColor: colors.white,
  },

  lockedBadgeGrid: {
    position: "absolute",
    left: x(20),
    top: y(490),
    width: x(362),
    height: y(590),
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignContent: "space-between",
  },

  lockedBadgeCard: {
    width: x(107),
    height: y(107),
    borderRadius: x(20),
    backgroundColor: colors.white,
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
    width: x(250),
    height: y(24),
    justifyContent: "center",
  },

  parentModeText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textDecorationLine: "underline",
    includeFontPadding: false,
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

  inactiveNavIcon: {
    opacity: 0.72,
  },

  navLabel: {
    marginTop: y(1),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(10),
    lineHeight: y(12),
    textAlign: "center",
    includeFontPadding: false,
  },

  controlPressed: {
    opacity: 0.65,
  },
});