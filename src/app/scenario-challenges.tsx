/**
 * Scenario Challenges screen.
 *
 * Matches Figma Screen 7.1:
 * - 20 scenario cards
 * - reward statistics
 * - fixed child navigation
 * - parent-mode access
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
import BackIcon from "../../assets/icons/back.svg";
import BadgeIcon from "../../assets/icons/certificate-badge.svg";
import DiamondIcon from "../../assets/icons/diamond.svg";
import HouseIcon from "../../assets/icons/house.svg";
import StarIcon from "../../assets/icons/star.svg";
import WorkbookDashboardIcon from "../../assets/icons/workbook-dashboard.svg";

const FIGMA_CONTENT_HEIGHT = 1815;

const TEMP_REWARDS = {
  stars: 15,
  gems: 5,
  badges: 3,
};

const CARD_WIDTH = 171;
const CARD_HEIGHT = 138;

const LEFT_COLUMN = 20;
const RIGHT_COLUMN = 211;

const FIRST_ROW_TOP = 226;
const ROW_DISTANCE = 158;

const scenarios = Array.from(
  { length: 20 },
  (_, index) => {
    const scenarioNumber = index + 1;
    const row = Math.floor(index / 2);
    const isLeftColumn = index % 2 === 0;

    return {
      id: scenarioNumber,
      label: `Scenario ${scenarioNumber}`,
      left: isLeftColumn
        ? LEFT_COLUMN
        : RIGHT_COLUMN,
      top: FIRST_ROW_TOP + row * ROW_DISTANCE,
    };
  },
);

function formatScore(value: number): string {
  return value.toString().padStart(2, "0");
}

export default function ScenarioChallengesScreen() {
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

  function handleScenarioPress(
    scenarioNumber: number,
  ) {
    /*
     * Connect each scenario to its detail page later.
     *
     * Example:
     *
     * if (scenarioNumber === 1) {
     *   router.push("/scenario-1" as Href);
     * }
     */

    console.log(
      `Scenario ${scenarioNumber} selected`,
    );
  }

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
      >
        <View style={styles.figmaContent}>
          <Pressable
            style={styles.backButton}
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
            Choose Your Courage
          </Text>

          <View style={styles.statistics}>
            <View style={styles.starIcon}>
              <StarIcon
                width={x(32)}
                height={x(32)}
              />
            </View>

            <Text style={styles.starValue}>
              {TEMP_REWARDS.stars}
            </Text>

            <View style={styles.diamondIcon}>
              <DiamondIcon
                width={x(20)}
                height={x(20)}
              />
            </View>

            <Text style={styles.gemValue}>
              {formatScore(
                TEMP_REWARDS.gems,
              )}
            </Text>

            <View style={styles.badgeIcon}>
              <BadgeIcon
                width={x(28)}
                height={x(28)}
              />
            </View>

            <Text style={styles.badgeValue}>
              {formatScore(
                TEMP_REWARDS.badges,
              )}
            </Text>
          </View>

          {scenarios.map((scenario) => (
            <Pressable
              key={scenario.id}
              style={({ pressed }) => [
                styles.scenarioCard,
                {
                  left: x(scenario.left),
                  top: y(scenario.top),
                },
                pressed &&
                  styles.scenarioCardPressed,
              ]}
              onPress={() =>
                handleScenarioPress(
                  scenario.id,
                )
              }
              accessibilityRole="button"
              accessibilityLabel={
                scenario.label
              }
            >
              <Text
                style={styles.scenarioText}
              >
                {scenario.label}
              </Text>
            </Pressable>
          ))}
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
            <WorkbookDashboardIcon
              width={x(41.94)}
              height={y(40.07)}
            />

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
            <HouseIcon
              width={x(40)}
              height={x(40)}
            />

            <Text style={styles.navLabel}>
              Home
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: "relative",
    backgroundColor: colors.background,
  },

  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    minHeight: y(
      FIGMA_CONTENT_HEIGHT + 125,
    ),
    paddingBottom: y(125),
    backgroundColor: colors.background,
  },

  figmaContent: {
    width: "100%",
    height: y(FIGMA_CONTENT_HEIGHT),
    position: "relative",
    backgroundColor: colors.background,
  },

  /*
   * Header
   */

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

  /*
   * Reward statistics
   */

  statistics: {
    position: "absolute",
    left: x(168),
    top: y(179),
    width: x(212),
    height: y(32),
  },

  starIcon: {
    position: "absolute",
    left: 0,
    top: 0,
    width: x(32),
    height: x(32),
    alignItems: "center",
    justifyContent: "center",
  },

  starValue: {
    position: "absolute",
    left: x(39),
    top: y(4),
    width: x(24),
    height: y(24),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textAlign: "center",
  },

  diamondIcon: {
    position: "absolute",
    left: x(83),
    top: y(6),
    width: x(20),
    height: x(20),
    alignItems: "center",
    justifyContent: "center",
  },

  gemValue: {
    position: "absolute",
    left: x(115),
    top: y(4),
    width: x(30),
    height: y(24),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textAlign: "center",
  },

  badgeIcon: {
    position: "absolute",
    left: x(153),
    top: y(2),
    width: x(28),
    height: x(28),
    alignItems: "center",
    justifyContent: "center",
  },

  badgeValue: {
    position: "absolute",
    left: x(188),
    top: y(4),
    width: x(24),
    height: y(24),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textAlign: "center",
  },

  /*
   * Scenario cards
   */

  scenarioCard: {
    position: "absolute",
    width: x(CARD_WIDTH),
    height: y(CARD_HEIGHT),
    borderRadius: x(20),
    backgroundColor: "#DCEAEC",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 5,
  },

  scenarioCardPressed: {
    opacity: 0.8,
  },

  scenarioText: {
    width: x(168.52),
    minHeight: y(33),
    color: colors.primary,
    fontFamily: "Quiche",
    fontSize: x(25),
    lineHeight: y(33),
    textAlign: "center",
  },

  /*
   * Fixed child-mode footer
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
    backgroundColor: colors.background,
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
});