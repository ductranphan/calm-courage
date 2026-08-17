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

import { GAME_HUB_ACTIVITY_IDS } from "@/constants/activities";
import { colors } from "@/constants/colors";
import { getRoleplayChallenge } from "@/constants/roleplayChallenges";
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

const SCREEN_BACKGROUND = "#CDB1D9";
const NAV_BACKGROUND = "#F1F3F5";
const TOTAL_ROLEPLAY_LEVELS = 10;
const CARD_WIDTH = 380;
const CARD_HEIGHT = 532;
const CARD_LEFT = 11;
const CARD_TOP = 171;
const CARD_RADIUS = 60;

const FRONT_TEMPLATE = require(
  "../../assets/images/roleplay/roleplay-front-template.png",
);

const BACK_TEMPLATE = require(
  "../../assets/images/roleplay/roleplay-back-template.png",
);

const ROLEPLAY_ILLUSTRATIONS: Record<number, number> = {
  1: require("../../assets/images/roleplay/roleplay-01.png"),
  2: require("../../assets/images/roleplay/roleplay-02.png"),
  3: require("../../assets/images/roleplay/roleplay-03.png"),
  4: require("../../assets/images/roleplay/roleplay-04.png"),
  5: require("../../assets/images/roleplay/roleplay-05.png"),
  6: require("../../assets/images/roleplay/roleplay-06.png"),
  7: require("../../assets/images/roleplay/roleplay-07.png"),
  8: require("../../assets/images/roleplay/roleplay-08.png"),
  9: require("../../assets/images/roleplay/roleplay-09.png"),
  10: require("../../assets/images/roleplay/roleplay-10.png"),
};

function getFrontFontSize(
  textLength: number,
): number {
  if (textLength >= 135) return 19;
  if (textLength >= 115) return 20;
  if (textLength >= 95) return 21;
  return 23;
}

function getBackFontSize(
  textLength: number,
): number {
  if (textLength >= 145) return 16;
  if (textLength >= 120) return 17;
  if (textLength >= 95) return 18;
  return 19;
}

function insertChildName(
  text: string,
  childName: string,
): string {
  const safeName =
    childName.trim().length > 0
      ? childName.trim()
      : "_____";

  return text
    .split("{childName}")
    .join(safeName);
}

export default function RoleplayCardScreen() {
  const { user } = useAuth();
  const { activeChild } = useActiveChild();
  const { childModeActive } = useParentAccess();

  const { roleplayId } =
    useLocalSearchParams<{
      roleplayId?: string | string[];
    }>();

  const [audioEnabled, setAudioEnabled] =
    useState(false);
  const [showBack, setShowBack] =
    useState(false);
  const [frontTemplateLoaded, setFrontTemplateLoaded] =
    useState(false);
  const [backTemplateLoaded, setBackTemplateLoaded] =
    useState(false);

  const hasStartedRef = useRef(false);
  const hasCompletedRef = useRef(false);
  const sideProgress = useRef(
    new Animated.Value(0),
  ).current;

  const parsedRoleplayId = useMemo(() => {
    const rawId = Array.isArray(roleplayId)
      ? roleplayId[0]
      : roleplayId;

    if (!rawId) {
      return Number.NaN;
    }

    return Number.parseInt(rawId, 10);
  }, [roleplayId]);

  const challenge = useMemo(
    () => getRoleplayChallenge(parsedRoleplayId),
    [parsedRoleplayId],
  );

  const illustration =
    ROLEPLAY_ILLUSTRATIONS[parsedRoleplayId];

  const childName = activeChild?.name ?? "";

  const frontText = useMemo(() => {
    if (!challenge) return "";
    return insertChildName(
      challenge.frontText,
      childName,
    );
  }, [challenge, childName]);

  const backText = useMemo(() => {
    if (!challenge) return "";
    return insertChildName(
      challenge.backText,
      childName,
    );
  }, [challenge, childName]);

  useEffect(() => {
    if (!childModeActive || !activeChild) {
      router.replace(
        "/parent-verification" as Href,
      );
    }
  }, [activeChild, childModeActive]);

  useEffect(() => {
    if (!illustration) return;

    void Asset.loadAsync([
      FRONT_TEMPLATE,
      BACK_TEMPLATE,
      illustration,
    ]).catch((error: unknown) => {
      console.warn(
        "Unable to preload roleplay assets:",
        error,
      );
    });
  }, [illustration]);

  useEffect(() => {
    Animated.timing(sideProgress, {
      toValue: showBack ? 1 : 0,
      duration: 140,
      useNativeDriver: true,
    }).start();
  }, [showBack, sideProgress]);

  useEffect(() => {
    hasStartedRef.current = false;
    hasCompletedRef.current = false;
    setShowBack(false);
  }, [parsedRoleplayId]);

  useEffect(() => {
    if (
      !user?.uid ||
      !activeChild?.id ||
      !challenge?.id ||
      hasStartedRef.current
    ) {
      return;
    }

    hasStartedRef.current = true;

    void startHubLevel(
      user.uid,
      activeChild.id,
      GAME_HUB_ACTIVITY_IDS.roleplay,
      challenge.id,
      TOTAL_ROLEPLAY_LEVELS,
      {
        source: "roleplay_card",
        roleplayId: challenge.id,
      },
    ).catch((error: unknown) => {
      console.warn(
        "Unable to start roleplay level:",
        error,
      );
      hasStartedRef.current = false;
    });
  }, [
    activeChild?.id,
    challenge?.id,
    user?.uid,
  ]);

  useEffect(() => {
    if (
      !showBack ||
      !user?.uid ||
      !activeChild?.id ||
      !challenge?.id ||
      hasCompletedRef.current
    ) {
      return;
    }

    hasCompletedRef.current = true;

    void completeHubLevel(
      user.uid,
      activeChild.id,
      GAME_HUB_ACTIVITY_IDS.roleplay,
      challenge.id,
      TOTAL_ROLEPLAY_LEVELS,
      {
        source: "roleplay_card",
        roleplayId: challenge.id,
        flippedToBack: true,
      },
    ).catch((error: unknown) => {
      console.warn(
        "Unable to complete roleplay level:",
        error,
      );
      hasCompletedRef.current = false;
    });
  }, [
    activeChild?.id,
    challenge?.id,
    showBack,
    user?.uid,
  ]);

  function handleBack() {
    router.replace(
      "/roleplay-challenges" as Href,
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

  if (!challenge || !illustration) {
    return (
      <View style={styles.missingScreen}>
        <Text style={styles.missingTitle}>
          This roleplay activity was not found.
        </Text>

        <Pressable
          style={styles.missingButton}
          onPress={() =>
            router.replace(
              "/roleplay-challenges" as Href,
            )
          }
          accessibilityRole="button"
        >
          <Text style={styles.missingButtonText}>
            Back to Roleplay
          </Text>
        </Pressable>
      </View>
    );
  }

  const frontFontSize = getFrontFontSize(
    frontText.length,
  );
  const backFontSize = getBackFontSize(
    backText.length,
  );

  const frontOpacity = sideProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const backOpacity = sideProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.screen}>
      <Pressable
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.controlPressed,
        ]}
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel="Back to Roleplay Challenges"
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
            height={x(35)}
          />
        ) : (
          <AudioOffIcon
            width={x(35)}
            height={x(35)}
          />
        )}
      </Pressable>

      <Text style={styles.activityNumber}>
        {challenge.id}.
      </Text>

      <Pressable
        style={styles.cardPressable}
        onPress={() =>
          setShowBack((current) => !current)
        }
        accessibilityRole="button"
        accessibilityLabel={
          showBack
            ? `Activity ${challenge.id} answer. Tap to return to the question.`
            : `Activity ${challenge.id}. ${frontText}. Tap to see the answer.`
        }
      >
        <View style={styles.cardSurface}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.cardSide,
              { opacity: backOpacity },
            ]}
          >
            <Image
              source={BACK_TEMPLATE}
              defaultSource={BACK_TEMPLATE}
              resizeMode="stretch"
              fadeDuration={0}
              style={styles.cardBackground}
              onLoad={() =>
                setBackTemplateLoaded(true)
              }
              onError={() =>
                setBackTemplateLoaded(true)
              }
              accessibilityIgnoresInvertColors
            />

            <View
              style={[
                styles.backContent,
                !backTemplateLoaded &&
                  styles.hiddenContent,
              ]}
            >
              <Image
                source={illustration}
                resizeMode="contain"
                fadeDuration={0}
                style={styles.roleplayIllustration}
                accessibilityIgnoresInvertColors
              />

              <View style={styles.backTextContainer}>
                <Text
                  style={[
                    styles.backText,
                    {
                      fontSize: x(backFontSize),
                      lineHeight: x(
                        backFontSize * 1.4,
                      ),
                    },
                  ]}
                  adjustsFontSizeToFit
                  minimumFontScale={0.78}
                  numberOfLines={10}
                >
                  {backText}
                </Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            pointerEvents="none"
            style={[
              styles.cardSide,
              { opacity: frontOpacity },
            ]}
          >
            <Image
              source={FRONT_TEMPLATE}
              defaultSource={FRONT_TEMPLATE}
              resizeMode="stretch"
              fadeDuration={0}
              style={styles.cardBackground}
              onLoad={() =>
                setFrontTemplateLoaded(true)
              }
              onError={() =>
                setFrontTemplateLoaded(true)
              }
              accessibilityIgnoresInvertColors
            />

            <View
              style={[
                styles.frontTextContainer,
                !frontTemplateLoaded &&
                  styles.hiddenContent,
              ]}
            >
              <Text
                style={[
                  styles.frontText,
                  {
                    fontSize: x(frontFontSize),
                    lineHeight: x(
                      frontFontSize * 1.3,
                    ),
                  },
                ]}
                adjustsFontSizeToFit
                minimumFontScale={0.72}
                numberOfLines={12}
              >
                {frontText}
              </Text>
            </View>
          </Animated.View>
        </View>
      </Pressable>

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
              router.replace("/rewards" as Href)
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
    backgroundColor: "transparent",
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
    backgroundColor: "transparent",
    zIndex: 20,
  },

  activityNumber: {
    position: "absolute",
    left: x(90),
    top: y(72),
    width: x(222),
    height: y(76),
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(50),
    lineHeight: y(70),
    textAlign: "center",
    includeFontPadding: false,
    paddingHorizontal: x(8),
    overflow: "visible",
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

  cardBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    width: x(CARD_WIDTH),
    height: y(CARD_HEIGHT),
  },

  frontTextContainer: {
    position: "absolute",
    left: x(30),
    right: x(30),
    top: y(78),
    bottom: y(72),
    alignItems: "center",
    justifyContent: "center",
  },

  frontText: {
    width: "100%",
    color: colors.primary,
    fontFamily: "OutfitSemiBold",
    textAlign: "center",
    includeFontPadding: false,
  },

  backContent: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  roleplayIllustration: {
    position: "absolute",
    left: x(36),
    top: y(67),
    width: x(308),
    height: y(165),
  },

  backTextContainer: {
    position: "absolute",
    left: x(40),
    right: x(40),
    top: y(245),
    bottom: y(48),
    alignItems: "center",
    justifyContent: "center",
  },

  backText: {
    width: "100%",
    color: colors.primary,
    fontFamily: "Literata",
    textAlign: "center",
    includeFontPadding: false,
  },

  hiddenContent: {
    opacity: 0,
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
    backgroundColor: NAV_BACKGROUND,
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
    fontFamily: "OutfitSemiBold",
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
});