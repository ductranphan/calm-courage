/**
 * Child Rewards and Achievements screen.
 *
 * Matches Figma Screen 9.0.
 *
 * Reward totals and badge unlock states are temporary visual values
 * until activityAttempts and reward persistence are connected.
 */

import { router, type Href } from "expo-router";
import { useEffect, useState } from "react";
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

const FIGMA_CONTENT_HEIGHT = 1100;
const FOOTER_SPACE = 125;
const PAGE_BACKGROUND = "#F1F3F5";

const TEMP_REWARDS = {
  stars: 15,
  gems: 5,
  collectedBadges: 3,
  totalBadges: 15,
};

const LOCKED_BADGES = Array.from(
  { length: 12 },
  (_, index) => index,
);

export default function RewardsScreen() {
  const { activeChild } = useActiveChild();
  const { childModeActive } = useParentAccess();

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
            My Rewards
          </Text>

          <View style={styles.starSummary}>
            <StarIcon
              width={x(65)}
              height={x(65)}
            />

            <Text style={styles.summaryText}>
              {TEMP_REWARDS.stars} Stars
            </Text>
          </View>

          <View style={styles.gemSummary}>
            <DiamondIcon
              width={x(37.72)}
              height={y(37.54)}
            />

            <Text style={styles.summaryText}>
              {TEMP_REWARDS.gems} Gems
            </Text>
          </View>

          <View style={styles.divider} />

          <BadgeIcon
            width={x(46)}
            height={x(46)}
            style={styles.badgeHeaderIcon}
          />

          <Text style={styles.badgeHeaderText}>
            Collected Badges
          </Text>

          <Text style={styles.badgeCountText}>
            {TEMP_REWARDS.collectedBadges}/
            {TEMP_REWARDS.totalBadges}
          </Text>

          <View style={styles.collectedBadgeRow}>
            <View
              style={
                styles.collectedBadgeShadow
              }
            >
              <View
                style={
                  styles.collectedBadgeCard
                }
              >
                <BraveSpeakerBadge
                  width={x(107)}
                  height={x(107)}
                />
              </View>
            </View>

            <View
              style={
                styles.collectedBadgeShadow
              }
            >
              <View
                style={
                  styles.collectedBadgeCard
                }
              >
                <KindVoiceBadge
                  width={x(107)}
                  height={x(107)}
                />
              </View>
            </View>

            <View
              style={
                styles.collectedBadgeShadow
              }
            >
              <View
                style={
                  styles.collectedBadgeCard
                }
              >
                <HelperFriendBadge
                  width={x(107)}
                  height={x(107)}
                />
              </View>
            </View>
          </View>

          <View style={styles.lockedBadgeGrid}>
            {LOCKED_BADGES.map(
              (badgeIndex) => (
                <View
                  key={badgeIndex}
                  style={
                    styles.lockedBadgeCard
                  }
                >
                  <LockIcon
                    width={x(34)}
                    height={y(45)}
                    style={styles.lockIcon}
                  />
                </View>
              ),
            )}
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
                height={x(40)}
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
              height={x(42)}
            />

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
    position: "relative",
    backgroundColor: PAGE_BACKGROUND,
  },

  scrollView: {
    flex: 1,
    backgroundColor: PAGE_BACKGROUND,
  },

  scrollContent: {
    minHeight: y(FIGMA_CONTENT_HEIGHT + FOOTER_SPACE),
    paddingBottom: y(FOOTER_SPACE),
    backgroundColor: PAGE_BACKGROUND,
  },

  figmaContent: {
    width: "100%",
    height: y(FIGMA_CONTENT_HEIGHT),
    position: "relative",
    backgroundColor: PAGE_BACKGROUND,
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

  title: {
    position: "absolute",
    left: x(20),
    top: y(123),
    width: x(362),
    height: y(39),
    color: colors.primary,
    fontFamily: "Quiche",
    fontSize: x(30),
    lineHeight: y(39),
    textAlign: "center",
  },

  starSummary: {
    position: "absolute",
    left: x(28),
    top: y(172),
    width: x(145),
    height: y(65),
    flexDirection: "row",
    alignItems: "center",
    columnGap: x(10),
  },

  gemSummary: {
    position: "absolute",
    left: x(229),
    top: y(186),
    width: x(125),
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
    height: x(107),
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

  lockIcon: {
    opacity: 0.5,
  },

  /*
   * Same footer and navbar structure as Scenario Challenges.
   * The outer footer is transparent, so the white background
   * fits only inside the rounded navbar rectangle.
   */

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

  inactiveNavIcon: {
    opacity: 0.72,
  },

  navLabel: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(10),
    lineHeight: y(12),
    marginTop: y(1),
    textAlign: "center",
  },
});