/**
 * Confidence Quests activities screen.
 *
 * Mini Session 1 is free. Mini Sessions 2–30 open the
 * subscription paywall until purchase access is connected.
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
import { CONFIDENCE_QUEST_TOTAL_LEVELS } from "@/constants/confidenceQuests";
import { useActiveChild } from "@/contexts/ActiveChildContext";
import { useParentAccess } from "@/contexts/ParentAccessContext";
import { useChildRewards } from "@/hooks/useChildRewards";
import { isPremiumActivity } from "@/utils/premiumAccess";
import { x, y } from "@/utils/scaling";

import AudioOffIcon from "../../assets/icons/audio-off.svg";
import AudioOnIcon from "../../assets/icons/audio-on.svg";
import BackIcon from "../../assets/icons/back.svg";
import BadgeIcon from "../../assets/icons/certificate-badge.svg";
import DiamondIcon from "../../assets/icons/diamond.svg";
import HouseIcon from "../../assets/icons/house.svg";
import StarIcon from "../../assets/icons/star.svg";
import WorkbookDashboardIcon from "../../assets/icons/workbook-dashboard.svg";

const PAGE_BACKGROUND =
  "#F1F3F5";

const CARD_WIDTH = 171;
const CARD_HEIGHT = 138;

const LEFT_COLUMN = 20;
const RIGHT_COLUMN = 211;

const FIRST_ROW_TOP = 226;
const ROW_DISTANCE = 158;

const CONTENT_HEIGHT = 2600;
const FOOTER_SPACE = 125;

const miniSessions =
  Array.from(
    {
      length:
        CONFIDENCE_QUEST_TOTAL_LEVELS,
    },
    (_, index) => {
      const sessionNumber =
        index + 1;

      const row =
        Math.floor(
          index / 2,
        );

      const isLeftColumn =
        index % 2 === 0;

      return {
        id: sessionNumber,

        label:
          `Mini Session\n${sessionNumber}`,

        accessibilityLabel:
          `Mini Session ${sessionNumber}`,

        left:
          isLeftColumn
            ? LEFT_COLUMN
            : RIGHT_COLUMN,

        top:
          FIRST_ROW_TOP +
          row *
            ROW_DISTANCE,
      };
    },
  );

function formatScore(
  value: number,
): string {
  return value
    .toString()
    .padStart(2, "0");
}

export default function ConfidenceQuestsScreen() {
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

  function handleMiniSessionPress(
    sessionNumber: number,
  ) {
    /*
     * Mini Session 1 is the free preview.
     * Premium sessions remain clickable so
     * the user can see the subscription page.
     */
    if (
      isPremiumActivity(
        sessionNumber,
      )
    ) {
      router.push(
        "/paywall" as Href,
      );

      return;
    }

    router.push(
      {
        pathname:
          "/confidence-quest-card",

        params: {
          questId:
            String(
              sessionNumber,
            ),
        },
      } as unknown as Href,
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

  if (
    !childModeActive ||
    !activeChild
  ) {
    return null;
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
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
        <View style={styles.figmaContent}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed &&
                styles.controlPressed,
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
                styles.controlPressed,
            ]}
            onPress={() =>
              setAudioEnabled(
                (current) =>
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

          <Text style={styles.title}>
            Confidence Quests
          </Text>

          <View style={styles.statistics}>
            <View style={styles.starIcon}>
              <StarIcon
                width={x(32)}
                height={x(32)}
              />
            </View>

            <Text style={styles.starValue}>
              {rewards.stars}
            </Text>

            <View style={styles.diamondIcon}>
              <DiamondIcon
                width={x(20)}
                height={x(20)}
              />
            </View>

            <Text style={styles.gemValue}>
              {formatScore(
                rewards.gems,
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
                rewards.badges.length,
              )}
            </Text>
          </View>

          {miniSessions.map(
            (session) => (
              <Pressable
                key={session.id}
                style={({ pressed }) => [
                  styles.sessionCard,
                  {
                    left: x(
                      session.left,
                    ),
                    top: y(
                      session.top,
                    ),
                  },
                  pressed &&
                    styles.sessionCardPressed,
                ]}
                onPress={() =>
                  handleMiniSessionPress(
                    session.id,
                  )
                }
                accessibilityRole="button"
                accessibilityLabel={
                  session.id === 1
                    ? session.accessibilityLabel
                    : `${session.accessibilityLabel}, premium`
                }
                accessibilityHint={
                  session.id === 1
                    ? undefined
                    : "Opens the subscription page."
                }
              >
                <Text style={styles.sessionText}>
                  {session.label}
                </Text>
              </Pressable>
            ),
          )}
        </View>
      </ScrollView>

      <View style={styles.fixedFooter}>
        <Pressable
          style={({ pressed }) => [
            styles.parentModeLink,
            pressed &&
              styles.controlPressed,
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
            style={({ pressed }) => [
              styles.navItem,
              pressed &&
                styles.controlPressed,
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
                styles.controlPressed,
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
                styles.controlPressed,
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: "relative",
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
      CONTENT_HEIGHT +
        FOOTER_SPACE,
    ),
    paddingBottom:
      y(FOOTER_SPACE),
    backgroundColor:
      PAGE_BACKGROUND,
  },

  figmaContent: {
    width: "100%",
    height: y(
      CONTENT_HEIGHT,
    ),
    position: "relative",
    backgroundColor:
      PAGE_BACKGROUND,
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
    backgroundColor:
      "transparent",
    zIndex: 10,
  },

  controlPressed: {
    opacity: 0.65,
  },

  title: {
    position: "absolute",
    left: x(20),
    top: y(123),
    width: x(362),
    height: y(39),
    color:
      colors.primary,
    fontFamily: "Outfit",
    fontSize: x(30),
    lineHeight: y(39),
    textAlign: "center",
  },

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
    color:
      colors.primary,
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
    color:
      colors.primary,
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
    color:
      colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textAlign: "center",
  },

  sessionCard: {
    position: "absolute",
    width: x(CARD_WIDTH),
    height: y(CARD_HEIGHT),
    borderRadius: x(20),
    backgroundColor:
      "#DCEAEC",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: x(8),
    shadowColor:
      colors.black,
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 5,
  },

  sessionCardPressed: {
    opacity: 0.8,
  },

  sessionText: {
    width: x(160),
    minHeight: y(46),
    color:
      colors.primary,
    fontFamily: "Outfit",
    fontSize: x(20),
    lineHeight: y(23),
    textAlign: "center",
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
    justifyContent: "center",
  },

  parentModeText: {
    color:
      colors.primary,
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
      PAGE_BACKGROUND,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-around",
    paddingHorizontal: x(18),
  },

  navItem: {
    width: x(58),
    height: y(56.75),
    alignItems: "center",
    justifyContent: "center",
  },

  navLabel: {
    color:
      colors.primary,
    fontFamily: "Literata",
    fontSize: x(10),
    lineHeight: y(12),
    marginTop: y(1),
    textAlign: "center",
  },
});