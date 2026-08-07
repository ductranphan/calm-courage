/**
 * Choose Your Courage scenario card screen.
 *
 * Matches the Figma layout:
 * - scenario number at top 79, left 185
 * - card at top 171, left 11
 * - front and back both use exactly 380 × 532
 * - card/screen background is #DDEAEC
 *
 * The front and back stay mounted at the same time and cross-fade.
 * This avoids the visible flash that happened when one side was
 * unmounted before the other side finished rendering.
 */

import type { ComponentType } from "react";
import { Asset } from "expo-asset";
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
import type { SvgProps } from "react-native-svg";

import {
  getScenarioChallenge,
} from "@/constants/scenarioChallenges";
import { colors } from "@/constants/colors";
import { useActiveChild } from "@/contexts/ActiveChildContext";
import { useParentAccess } from "@/contexts/ParentAccessContext";
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

const SCREEN_BACKGROUND = "#DDEAEC";

const CARD_WIDTH = 380;
const CARD_HEIGHT = 532;
const CARD_LEFT = 11;
const CARD_TOP = 171;
const CARD_RADIUS = 60;

const FRONT_TEMPLATE = require(
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
  const { activeChild } = useActiveChild();
  const { childModeActive } = useParentAccess();

  const { scenarioId } =
    useLocalSearchParams<{
      scenarioId?: string | string[];
    }>();

  const [audioEnabled, setAudioEnabled] =
    useState(false);

  const [showBack, setShowBack] =
    useState(false);

  const [
    frontImageLoaded,
    setFrontImageLoaded,
  ] = useState(false);

  /**
   * 0 = front visible
   * 1 = back visible
   *
   * Both sides remain mounted, so tapping never waits for the
   * SVG or PNG to be created again.
   */
  const sideProgress = useRef(
    new Animated.Value(0),
  ).current;

  useEffect(() => {
    if (!childModeActive || !activeChild) {
      router.replace(
        "/parent-verification" as Href,
      );
    }
  }, [activeChild, childModeActive]);

  useEffect(() => {
    void Asset.loadAsync(
      FRONT_TEMPLATE,
    ).catch((error: unknown) => {
      console.warn(
        "Unable to preload the scenario front template:",
        error,
      );
    });
  }, []);

  useEffect(() => {
    Animated.timing(sideProgress, {
      toValue: showBack ? 1 : 0,
      duration: 140,
      useNativeDriver: true,
    }).start();
  }, [showBack, sideProgress]);

  const parsedScenarioId = useMemo(() => {
    const rawScenarioId = Array.isArray(
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

  const scenario = useMemo(
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

  function handleBack() {
    if (showBack) {
      setShowBack(false);
      return;
    }

    router.replace(
      "/scenario-challenges" as Href,
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

  if (!scenario || !BackCard) {
    return (
      <View style={styles.missingScreen}>
        <Text style={styles.missingTitle}>
          This scenario was not found.
        </Text>

        <Pressable
          style={styles.missingButton}
          onPress={() =>
            router.replace(
              "/scenario-challenges" as Href,
            )
          }
          accessibilityRole="button"
        >
          <Text style={styles.missingButtonText}>
            Back to Scenarios
          </Text>
        </Pressable>
      </View>
    );
  }

  const frontFontSize =
    getFrontFontSize(
      scenario.frontText.length,
    );

  const frontOpacity =
    sideProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    });

  const backOpacity = sideProgress;

  return (
    <View style={styles.screen}>
      <Pressable
        style={styles.backButton}
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel={
          showBack
            ? "Show the front of this scenario"
            : "Back to Choose Your Courage"
        }
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

      <Text style={styles.scenarioNumber}>
        {scenario.id}.
      </Text>

      <Pressable
        style={styles.cardPressable}
        onPress={() =>
          setShowBack(
            (current) => !current,
          )
        }
        accessibilityRole="button"
        accessibilityLabel={
          showBack
            ? `Scenario ${scenario.id} guidance. Tap to show the situation.`
            : `Scenario ${scenario.id}. ${scenario.frontText} Tap to show the guidance.`
        }
      >
        <View style={styles.cardSurface}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.cardSide,
              {
                opacity: backOpacity,
              },
            ]}
          >
            <BackCard
              width={x(CARD_WIDTH)}
              height={y(CARD_HEIGHT)}
              preserveAspectRatio="none"
            />
          </Animated.View>

          <Animated.View
            pointerEvents="none"
            style={[
              styles.cardSide,
              {
                opacity: frontOpacity,
              },
            ]}
          >
            <Image
              source={FRONT_TEMPLATE}
              defaultSource={FRONT_TEMPLATE}
              resizeMode="stretch"
              fadeDuration={0}
              onLoad={() =>
                setFrontImageLoaded(true)
              }
              onError={() =>
                setFrontImageLoaded(true)
              }
              style={styles.frontBackground}
              accessibilityIgnoresInvertColors
            />

            <View
              style={[
                styles.frontTextContainer,
                !frontImageLoaded &&
                  styles.hiddenFrontText,
              ]}
            >
              <Text
                style={[
                  styles.frontText,
                  {
                    fontSize:
                      x(frontFontSize),
                    lineHeight: x(
                      frontFontSize * 1.28,
                    ),
                  },
                ]}
                numberOfLines={12}
                adjustsFontSizeToFit
                minimumFontScale={0.76}
              >
                {scenario.frontText}
              </Text>
            </View>
          </Animated.View>
        </View>
      </Pressable>

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
    backgroundColor: SCREEN_BACKGROUND,
  },

  backButton: {
    position: "absolute",
    left: x(20),
    top: y(48),
    width: x(37.24),
    height: y(35),
    alignItems: "center",
    justifyContent: "center",
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
    zIndex: 20,
  },

  scenarioNumber: {
    position: "absolute",
    left: x(185),
    top: y(79),
    width: x(32),
    height: y(63),
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(50),
    lineHeight: y(63),
    textAlign: "center",
    includeFontPadding: false,
  },

  cardPressable: {
    position: "absolute",
    left: x(CARD_LEFT),
    top: y(CARD_TOP),
    width: x(CARD_WIDTH),
    height: y(CARD_HEIGHT),
    borderRadius: x(CARD_RADIUS),
    overflow: "hidden",
    backgroundColor: SCREEN_BACKGROUND,
  },

  cardSurface: {
    position: "relative",
    width: x(CARD_WIDTH),
    height: y(CARD_HEIGHT),
    borderRadius: x(CARD_RADIUS),
    overflow: "hidden",
    backgroundColor: SCREEN_BACKGROUND,
  },

  cardSide: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: x(CARD_WIDTH),
    height: y(CARD_HEIGHT),
    backgroundColor: SCREEN_BACKGROUND,
  },

  frontBackground: {
    position: "absolute",
    left: 0,
    top: 0,
    width: x(CARD_WIDTH),
    height: y(CARD_HEIGHT),
  },

  frontTextContainer: {
    position: "absolute",
    left: x(31),
    right: x(31),
    top: y(92),
    bottom: y(88),
    alignItems: "center",
    justifyContent: "center",
  },

  hiddenFrontText: {
    opacity: 0,
  },

  frontText: {
    width: "100%",
    color: colors.primary,
    fontFamily: "LiterataBold",
    textAlign: "center",
    includeFontPadding: false,
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
    backgroundColor: SCREEN_BACKGROUND,
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

  missingScreen: {
    flex: 1,
    paddingHorizontal: x(30),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SCREEN_BACKGROUND,
  },

  missingTitle: {
    color: colors.primary,
    fontFamily: "OutfitBold",
    fontSize: x(24),
    lineHeight: y(31),
    textAlign: "center",
  },

  missingButton: {
    width: x(210),
    height: y(52),
    marginTop: y(24),
    borderRadius: x(20),
    backgroundColor: "#E7D8EC",
    alignItems: "center",
    justifyContent: "center",
  },

  missingButtonText: {
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(18),
  },

  controlPressed: {
    opacity: 0.65,
  },
});