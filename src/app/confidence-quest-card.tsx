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
  ActivityIndicator,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

import { GAME_HUB_ACTIVITY_IDS } from "@/constants/activities";
import { colors } from "@/constants/colors";
import {
  CONFIDENCE_QUEST_TOTAL_LEVELS,
  getConfidenceQuest,
} from "@/constants/confidenceQuests";
import { useActiveChild } from "@/contexts/ActiveChildContext";
import { useAuth } from "@/contexts/AuthContext";
import { useParentAccess } from "@/contexts/ParentAccessContext";
import { completeConfidenceQuestLevel } from "@/services/confidenceQuestProgress";
import { startHubLevel } from "@/services/hubLevelProgress";
import { x, y } from "@/utils/scaling";

import AudioOffIcon from "../../assets/icons/audio-off.svg";
import AudioOnIcon from "../../assets/icons/audio-on.svg";
import BackIcon from "../../assets/icons/back.svg";
import DiamondIcon from "../../assets/icons/diamond.svg";
import HouseIcon from "../../assets/icons/house.svg";
import StarIcon from "../../assets/icons/star.svg";
import WorkbookDashboardIcon from "../../assets/icons/workbook-dashboard.svg";

const PAGE_BACKGROUND = "#F1F3F5";
const PRIMARY = "#2F448B";
const SUCCESS_GREEN = "#28B775";
const SAVE_BACKGROUND = "#E5D3E8";

const CARD_WIDTH = 380;
const CARD_HEIGHT = 532;
const CARD_LEFT = 11;
const CARD_TOP = 171;
const CARD_RADIUS = 60;

const TRANSITION_OUT = 140;
const TRANSITION_IN = 180;
const SAVE_TRANSITION = 300;

type ScreenMode = "quest" | "complete";

type ConfidenceFooterProps = {
  onParentMode: () => void;
};

function ConfidenceGradientBackground() {
  return (
    <Svg
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      width="100%"
      height="100%"
      viewBox="0 0 402 874"
      preserveAspectRatio="none"
    >
      <Defs>
        <LinearGradient
          id="confidence-background"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <Stop
            offset="0%"
            stopColor="#2F448B"
          />

          <Stop
            offset="50%"
            stopColor="#F1F3F5"
          />

          <Stop
            offset="100%"
            stopColor="#2F448B"
          />
        </LinearGradient>
      </Defs>

      <Rect
        x="0"
        y="0"
        width="402"
        height="874"
        fill="url(#confidence-background)"
      />
    </Svg>
  );
}

function CompletionCheckIcon() {
  return (
    <Svg
      width={x(48)}
      height={x(48)}
      viewBox="0 0 48 48"
      fill="none"
    >
      <Circle
        cx="24"
        cy="24"
        r="21.5"
        stroke={SUCCESS_GREEN}
        strokeWidth="5"
      />

      <Path
        d="M14.5 24.5L21.3 31.2L34 16.8"
        stroke={SUCCESS_GREEN}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ConfidenceFooter({
  onParentMode,
}: ConfidenceFooterProps) {
  return (
    <View style={styles.fixedFooter}>
      <Pressable
        style={({ pressed }) => [
          styles.parentModeLink,
          pressed && styles.controlPressed,
        ]}
        onPress={onParentMode}
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
  );
}

export default function ConfidenceQuestCardScreen() {
  const { user } = useAuth();
  const { activeChild } = useActiveChild();
  const { childModeActive } = useParentAccess();

  const { questId } =
    useLocalSearchParams<{
      questId?: string | string[];
    }>();

  const [
    audioEnabled,
    setAudioEnabled,
  ] = useState(false);

  const [
    mode,
    setMode,
  ] = useState<ScreenMode>("quest");

  const [
    reflection,
    setReflection,
  ] = useState("");

  const [
    reflectionFocused,
    setReflectionFocused,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    saveError,
    setSaveError,
  ] = useState<string | null>(null);

  const hasStartedRef =
    useRef(false);

  const isTransitioningRef =
    useRef(false);

  const completionScrollRef =
    useRef<ScrollView | null>(null);

  const contentOpacity = useRef(
    new Animated.Value(1),
  ).current;

  const parsedQuestId =
    useMemo(() => {
      const rawId =
        Array.isArray(questId)
          ? questId[0]
          : questId;

      if (!rawId) {
        return Number.NaN;
      }

      return Number.parseInt(
        rawId,
        10,
      );
    }, [questId]);

  const quest = useMemo(
    () =>
      getConfidenceQuest(
        parsedQuestId,
      ),
    [parsedQuestId],
  );

  /*
   * Reflection is required.
   * Spaces alone do not count.
   */
  const canSave =
    reflection.trim().length > 0;

  useEffect(() => {
    setMode("quest");
    setReflection("");
    setReflectionFocused(false);
    setSaving(false);
    setSaveError(null);

    hasStartedRef.current =
      false;

    isTransitioningRef.current =
      false;

    contentOpacity.setValue(1);
  }, [
    contentOpacity,
    parsedQuestId,
  ]);

  useEffect(() => {
    const subscription =
      Keyboard.addListener(
        "keyboardDidHide",
        () => {
          setReflectionFocused(false);

          completionScrollRef.current?.scrollTo(
            {
              y: 0,
              animated: true,
            },
          );
        },
      );

    return () => {
      subscription.remove();
    };
  }, []);

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

  useEffect(() => {
    if (
      !user?.uid ||
      !activeChild?.id ||
      !quest ||
      hasStartedRef.current
    ) {
      return;
    }

    hasStartedRef.current =
      true;

    void startHubLevel(
      user.uid,
      activeChild.id,
      GAME_HUB_ACTIVITY_IDS.confidence,
      quest.id,
      CONFIDENCE_QUEST_TOTAL_LEVELS,
      {
        source:
          "confidence_quest",

        confidenceQuestId:
          quest.id,

        confidenceLevel:
          quest.level,
      },
    ).catch(
      (error: unknown) => {
        console.warn(
          "Unable to start Confidence Quest:",
          error,
        );

        hasStartedRef.current =
          false;

        router.replace(
          "/confidence-quests" as Href,
        );
      },
    );
  }, [
    activeChild?.id,
    quest,
    user?.uid,
  ]);

  function handleBack() {
    Keyboard.dismiss();

    router.replace(
      "/confidence-quests" as Href,
    );
  }

  function handleParentMode() {
    Keyboard.dismiss();

    router.push(
      "/parent-verification" as Href,
    );
  }

  function toggleAudio() {
    setAudioEnabled(
      (current) => !current,
    );
  }

  function dismissKeyboard() {
    Keyboard.dismiss();
  }

  function handleReflectionFocus() {
    setReflectionFocused(true);

    setTimeout(() => {
      completionScrollRef.current?.scrollTo(
        {
          y: y(275),
          animated: true,
        },
      );
    }, 250);
  }

  function handleReflectionBlur() {
    setReflectionFocused(false);
  }

  function handleReflectionChange(
    value: string,
  ) {
    setReflection(value);

    if (
      value.trim().length > 0 &&
      saveError
    ) {
      setSaveError(null);
    }
  }

  function showCompletion() {
    if (
      mode === "complete" ||
      isTransitioningRef.current
    ) {
      return;
    }

    isTransitioningRef.current =
      true;

    Animated.timing(
      contentOpacity,
      {
        toValue: 0,
        duration:
          TRANSITION_OUT,
        useNativeDriver: true,
      },
    ).start(() => {
      setMode("complete");

      requestAnimationFrame(() => {
        Animated.timing(
          contentOpacity,
          {
            toValue: 1,
            duration:
              TRANSITION_IN,
            useNativeDriver: true,
          },
        ).start(() => {
          isTransitioningRef.current =
            false;
        });
      });
    });
  }

  async function handleSave() {
    /*
     * Do not allow completion until
     * something has been written.
     */
    if (!canSave) {
      setSaveError(
        "Please write a reflection before completing this quest.",
      );

      return;
    }

    if (
      saving ||
      !user?.uid ||
      !activeChild?.id ||
      !quest
    ) {
      return;
    }

    Keyboard.dismiss();

    setSaving(true);
    setSaveError(null);

    try {
      await completeConfidenceQuestLevel({
        parentUid:
          user.uid,

        childId:
          activeChild.id,

        baseActivityId:
          GAME_HUB_ACTIVITY_IDS.confidence,

        levelNumber:
          quest.id,

        totalLevels:
          CONFIDENCE_QUEST_TOTAL_LEVELS,

        starsReward:
          quest.starsReward,

        gemsReward:
          quest.gemsReward,

        reflection:
          reflection.trim(),

        metadata: {
          source:
            "confidence_quest",

          confidenceQuestId:
            quest.id,

          confidenceLevel:
            quest.level,

          questPrompt:
            quest.prompt,
        },
      });

      Animated.timing(
        contentOpacity,
        {
          toValue: 0,
          duration:
            SAVE_TRANSITION,
          useNativeDriver: true,
        },
      ).start(() => {
        router.replace(
          "/confidence-quests" as Href,
        );
      });
    } catch (error) {
      console.warn(
        "Unable to save Confidence Quest:",
        error,
      );

      setSaveError(
        "We couldn't save this quest. Please try again.",
      );

      setSaving(false);
    }
  }

  if (
    !childModeActive ||
    !activeChild
  ) {
    return null;
  }

  if (!quest) {
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
          This Confidence Quest was
          not found.
        </Text>

        <Pressable
          style={
            styles.missingButton
          }
          onPress={handleBack}
          accessibilityRole="button"
        >
          <Text
            style={
              styles.missingButtonText
            }
          >
            Back to Confidence Quests
          </Text>
        </Pressable>
      </View>
    );
  }

  /*
   * COMPLETE SCREEN
   */
  if (mode === "complete") {
    return (
      <KeyboardAvoidingView
        style={
          styles.completionScreen
        }
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
        keyboardVerticalOffset={0}
      >
        <ConfidenceGradientBackground />

        <TouchableWithoutFeedback
          onPress={dismissKeyboard}
          accessible={false}
        >
          <View
            style={
              styles.completionTouchableArea
            }
          >
            <ScrollView
              ref={completionScrollRef}
              style={
                styles.completionScroll
              }
              contentContainerStyle={
                styles.completionScrollContent
              }
              showsVerticalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={
                Platform.OS === "ios"
                  ? "interactive"
                  : "on-drag"
              }
              onScrollBeginDrag={
                dismissKeyboard
              }
              bounces={false}
            >
              <Animated.View
                style={[
                  styles.completionCanvas,
                  {
                    opacity:
                      contentOpacity,
                  },
                ]}
              >
                <Pressable
                  style={({
                    pressed,
                  }) => [
                    styles.completionBackButton,

                    pressed &&
                      styles.controlPressed,
                  ]}
                  onPress={
                    handleBack
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Back to Confidence Quests"
                  hitSlop={8}
                >
                  <BackIcon
                    width={x(37.24)}
                    height={y(22.18)}
                  />
                </Pressable>

                <Pressable
                  style={({
                    pressed,
                  }) => [
                    styles.completionAudioButton,

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

                <Text
                  style={
                    styles.completionQuestNumber
                  }
                >
                  {quest.id}.
                </Text>

                <View
                  style={
                    styles.completeCard
                  }
                >
                  <View
                    style={
                      styles.completeIcon
                    }
                  >
                    <CompletionCheckIcon />
                  </View>

                  <Text
                    style={
                      styles.completeTitle
                    }
                  >
                    QUEST COMPLETE!
                  </Text>

                  <Text
                    style={
                      styles.completeSubtitle
                    }
                  >
                    Keep going, Confidence
                    Builder!
                  </Text>

                  <Text
                    style={
                      styles.youEarned
                    }
                  >
                    You earned:
                  </Text>

                  <View
                    style={
                      styles.completeStarIcon
                    }
                  >
                    <StarIcon
                      width={x(40)}
                      height={x(40)}
                    />
                  </View>

                  <Text
                    style={
                      styles.completeStarText
                    }
                  >
                    + {quest.starsReward}{" "}
                    Stars
                  </Text>

                  <View
                    style={
                      styles.completeGemIcon
                    }
                  >
                    <DiamondIcon
                      width={x(38)}
                      height={x(38)}
                    />
                  </View>

                  <Text
                    style={
                      styles.completeGemText
                    }
                  >
                    + {quest.gemsReward}{" "}
                    Gem
                    {quest.gemsReward === 1
                      ? ""
                      : "s"}
                  </Text>
                </View>

                <View
                  style={
                    styles.reflectionCard
                  }
                >
                  <Text
                    style={
                      styles.reflectionTitle
                    }
                  >
                    What made you feel
                    proud today?
                  </Text>

                  <TextInput
                    style={[
                      styles.reflectionInput,

                      !canSave &&
                        saveError &&
                        styles.reflectionInputError,
                    ]}
                    value={reflection}
                    onChangeText={
                      handleReflectionChange
                    }
                    multiline
                    textAlignVertical="top"
                    maxLength={280}
                    accessibilityLabel="Required reflection"
                    onFocus={
                      handleReflectionFocus
                    }
                    onBlur={
                      handleReflectionBlur
                    }
                    returnKeyType="default"
                    blurOnSubmit={false}
                  />

                  {reflection.length ===
                    0 &&
                  !reflectionFocused ? (
                    <Text
                      pointerEvents="none"
                      style={
                        styles.reflectionPlaceholder
                      }
                    >
                      Optional reflection:
                      {"\n"}• I was brave
                      because...
                      {"\n"}• I learned...
                      {"\n"}• Next time I
                      will...
                    </Text>
                  ) : null}
                </View>

                {saveError ? (
                  <Text
                    style={
                      styles.saveError
                    }
                  >
                    {saveError}
                  </Text>
                ) : null}

                <Pressable
                  style={({
                    pressed,
                  }) => [
                    styles.saveButton,

                    pressed &&
                      canSave &&
                      !saving &&
                      styles.saveButtonPressed,

                    (!canSave ||
                      saving) &&
                      styles.saveButtonDisabled,
                  ]}
                  /*
                   * We don't use disabled={!canSave}
                   * here because this lets us show
                   * the validation message if the
                   * user taps SAVE while empty.
                   */
                  onPress={() => {
                    void handleSave();
                  }}
                  disabled={saving}
                  accessibilityRole="button"
                  accessibilityLabel="Save Confidence Quest"
                  accessibilityState={{
                    disabled:
                      !canSave ||
                      saving,
                  }}
                >
                  {saving ? (
                    <ActivityIndicator
                      size="small"
                      color={PRIMARY}
                    />
                  ) : (
                    <Text
                      style={
                        styles.saveButtonText
                      }
                    >
                      SAVE
                    </Text>
                  )}
                </Pressable>
              </Animated.View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>

        <ConfidenceFooter
          onParentMode={
            handleParentMode
          }
        />
      </KeyboardAvoidingView>
    );
  }

  /*
   * NORMAL QUEST SCREEN
   */
  return (
    <View style={styles.screen}>
      <ConfidenceGradientBackground />

      <Pressable
        style={({ pressed }) => [
          styles.backButton,
          pressed &&
            styles.controlPressed,
        ]}
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel="Back to Confidence Quests"
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
        onPress={toggleAudio}
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

      <Text
        style={
          styles.questNumber
        }
      >
        {quest.id}.
      </Text>

      <Animated.View
        style={[
          styles.questCardWrapper,
          {
            opacity:
              contentOpacity,
          },
        ]}
      >
        <Pressable
          style={({
            pressed,
          }) => [
            styles.questCard,

            pressed &&
              styles.questCardPressed,
          ]}
          onPress={
            showCompletion
          }
          accessibilityRole="button"
          accessibilityLabel={`${quest.prompt} Tap when you have completed this quest.`}
        >
          <Text
            style={
              styles.levelLabel
            }
          >
            Level {quest.level}.
            {"\n"}
            {quest.levelTitle}
          </Text>

          <View
            style={
              styles.promptArea
            }
          >
            <Text
              style={
                styles.questPrompt
              }
              adjustsFontSizeToFit
              minimumFontScale={
                0.72
              }
              numberOfLines={5}
            >
              {quest.prompt}
            </Text>
          </View>

          <View
            style={
              styles.rewardDivider
            }
          />

          <Text
            style={
              styles.rewardsTitle
            }
          >
            Rewards
          </Text>

          <View
            style={
              styles.starRewardIcon
            }
          >
            <StarIcon
              width={x(40)}
              height={x(40)}
            />
          </View>

          <Text
            style={
              styles.starRewardText
            }
          >
            + {quest.starsReward}{" "}
            Stars
          </Text>

          <View
            style={
              styles.gemRewardIcon
            }
          >
            <DiamondIcon
              width={x(38)}
              height={x(38)}
            />
          </View>

          <Text
            style={
              styles.gemRewardText
            }
          >
            + {quest.gemsReward}{" "}
            Gem
            {quest.gemsReward === 1
              ? ""
              : "s"}
          </Text>
        </Pressable>
      </Animated.View>

      <ConfidenceFooter
        onParentMode={
          handleParentMode
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: "relative",
    backgroundColor: PRIMARY,
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

  questNumber: {
    position: "absolute",
    left: x(75),
    top: y(72),
    width: x(252),
    height: y(78),
    color: colors.white,
    fontFamily: "Outfit",
    fontSize: x(50),
    lineHeight: y(63),
    textAlign: "center",
    includeFontPadding: false,
    paddingHorizontal: x(8),
    overflow: "visible",
  },

  questCardWrapper: {
    position: "absolute",
    left: x(CARD_LEFT),
    top: y(CARD_TOP),
    width: x(CARD_WIDTH),
    height: y(CARD_HEIGHT),
  },

  questCard: {
    width: "100%",
    height: "100%",
    position: "relative",
    borderWidth: x(1),
    borderColor: PRIMARY,
    borderRadius: x(CARD_RADIUS),
    backgroundColor:
      PAGE_BACKGROUND,
    overflow: "hidden",
  },

  questCardPressed: {
    opacity: 0.88,
  },

  levelLabel: {
    position: "absolute",
    left: x(33),
    top: y(37),
    width: x(270),
    minHeight: y(60),
    color: PRIMARY,
    fontFamily: "LiterataBold",
    fontSize: x(20),
    lineHeight: y(30),
    includeFontPadding: false,
  },

  promptArea: {
    position: "absolute",
    left: x(12),
    top: y(178),
    width: x(356),
    height: y(145),
    alignItems: "center",
    justifyContent: "center",
  },

  questPrompt: {
    width: "100%",
    color: PRIMARY,
    fontFamily: "OutfitBold",
    fontSize: x(40),
    lineHeight: y(45),
    textAlign: "center",
    includeFontPadding: false,
  },

  rewardDivider: {
    position: "absolute",
    left: x(23),
    top: y(387),
    width: x(336),
    height: y(1),
    backgroundColor:
      PRIMARY,
  },

  rewardsTitle: {
    position: "absolute",
    left: x(22),
    top: y(407),
    minWidth: x(90),
    height: y(30),
    color: PRIMARY,
    fontFamily: "LiterataBold",
    fontSize: x(20),
    lineHeight: y(30),
    includeFontPadding: false,
  },

  starRewardIcon: {
    position: "absolute",
    left: x(23),
    top: y(430),
    width: x(65),
    height: x(65),
    alignItems: "center",
    justifyContent: "center",
  },

  starRewardText: {
    position: "absolute",
    left: x(88),
    top: y(451),
    minWidth: x(112),
    height: y(30),
    color: PRIMARY,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(30),
    includeFontPadding: false,
  },

  gemRewardIcon: {
    position: "absolute",
    left: x(220),
    top: y(446),
    width: x(38),
    height: x(38),
    alignItems: "center",
    justifyContent: "center",
  },

  gemRewardText: {
    position: "absolute",
    left: x(269),
    top: y(451),
    minWidth: x(95),
    height: y(30),
    color: PRIMARY,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(30),
    includeFontPadding: false,
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
    backgroundColor:
      "transparent",
    zIndex: 50,
  },

  parentModeLink: {
    position: "absolute",
    left: 0,
    top: 0,
    width: x(240),
    height: y(24),
    justifyContent: "center",
  },

  parentModeText: {
    color: PRIMARY,
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
    borderColor: PRIMARY,
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
    color: PRIMARY,
    fontFamily: "Literata",
    fontSize: x(10),
    lineHeight: y(12),
    marginTop: y(1),
    textAlign: "center",
  },

  completionScreen: {
    flex: 1,
    position: "relative",
    backgroundColor: PRIMARY,
  },

  completionTouchableArea: {
    flex: 1,
  },

  completionScroll: {
    flex: 1,
    backgroundColor:
      "transparent",
  },

  completionScrollContent: {
    flexGrow: 1,
  },

  completionCanvas: {
    position: "relative",
    width: "100%",
    minHeight: y(874),
    backgroundColor:
      "transparent",
    paddingBottom: y(140),
  },

  completionBackButton: {
    position: "absolute",
    left: x(20),
    top: y(48),
    width: x(37.24),
    height: y(35),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "transparent",
    zIndex: 20,
  },

  completionAudioButton: {
    position: "absolute",
    left: x(347),
    top: y(48),
    width: x(35),
    height: x(35),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "transparent",
    zIndex: 20,
  },

  completionQuestNumber: {
    position: "absolute",
    left: x(75),
    top: y(72),
    width: x(252),
    height: y(78),
    color: colors.white,
    fontFamily: "Outfit",
    fontSize: x(50),
    lineHeight: y(63),
    textAlign: "center",
    includeFontPadding: false,
    paddingHorizontal: x(8),
    overflow: "visible",
    zIndex: 10,
  },

  completeCard: {
    position: "absolute",
    left: x(11),
    top: y(171),
    width: x(380),
    height: y(236),
    borderWidth: x(1),
    borderColor: PRIMARY,
    borderRadius: x(60),
    backgroundColor:
      PAGE_BACKGROUND,
  },

  completeIcon: {
    position: "absolute",
    left: x(31),
    top: y(38),
    width: x(48),
    height: x(48),
  },

  completeTitle: {
    position: "absolute",
    left: x(99),
    top: y(30),
    width: x(242),
    height: y(30),
    color: PRIMARY,
    fontFamily: "LiterataBold",
    fontSize: x(25),
    lineHeight: y(30),
    includeFontPadding: false,
  },

  completeSubtitle: {
    position: "absolute",
    left: x(91),
    top: y(60),
    width: x(270),
    minHeight: y(30),
    color: PRIMARY,
    fontFamily:
      "LiterataItalic",
    fontSize: x(18),
    lineHeight: y(30),
    includeFontPadding: false,
  },

  youEarned: {
    position: "absolute",
    left: x(22),
    top: y(126),
    width: x(140),
    height: y(30),
    color: PRIMARY,
    fontFamily: "LiterataBold",
    fontSize: x(20),
    lineHeight: y(30),
    includeFontPadding: false,
  },

  completeStarIcon: {
    position: "absolute",
    left: x(23),
    top: y(151),
    width: x(65),
    height: x(65),
    alignItems: "center",
    justifyContent: "center",
  },

  completeStarText: {
    position: "absolute",
    left: x(88),
    top: y(166),
    minWidth: x(120),
    height: y(30),
    color: PRIMARY,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(30),
    includeFontPadding: false,
  },

  completeGemIcon: {
    position: "absolute",
    left: x(220),
    top: y(162),
    width: x(38),
    height: x(38),
    alignItems: "center",
    justifyContent: "center",
  },

  completeGemText: {
    position: "absolute",
    left: x(269),
    top: y(166),
    minWidth: x(96),
    height: y(30),
    color: PRIMARY,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(30),
    includeFontPadding: false,
  },

  reflectionCard: {
    position: "absolute",
    left: x(11),
    top: y(418),
    width: x(380),
    height: y(248),
    borderWidth: x(1),
    borderColor: PRIMARY,
    borderRadius: x(60),
    backgroundColor:
      PAGE_BACKGROUND,
  },

  reflectionTitle: {
    position: "absolute",
    left: x(28),
    top: y(20),
    width: x(325),
    minHeight: y(30),
    color: PRIMARY,
    fontFamily: "LiterataBold",
    fontSize: x(20),
    lineHeight: y(30),
    includeFontPadding: false,
  },

  reflectionInput: {
    position: "absolute",
    left: x(27),
    top: y(66),
    width: x(327),
    height: y(155),
    borderWidth: x(1),
    borderColor: PRIMARY,
    borderRadius: x(20),
    backgroundColor:
      colors.white,
    paddingHorizontal: x(12),
    paddingVertical: y(9),
    color: PRIMARY,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(30),
    includeFontPadding: false,
  },

  reflectionInputError: {
    borderColor: "#A83232",
  },

  /*
   * This is the visible instructional
   * text before the child taps the field.
   */
  reflectionPlaceholder: {
    position: "absolute",
    left: x(39),
    top: y(75),
    width: x(300),
    color:
      "rgba(47,68,139,0.72)",
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(30),
    includeFontPadding: false,
    zIndex: 5,
  },

  saveButton: {
    position: "absolute",
    left: x(96),
    top: y(677),
    width: x(210),
    height: y(52),
    borderRadius: x(20),
    backgroundColor:
      SAVE_BACKGROUND,
    alignItems: "center",
    justifyContent: "center",

    shadowColor:
      colors.black,

    shadowOffset: {
      width: 0,
      height: y(4),
    },

    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 4,
  },

  saveButtonPressed: {
    opacity: 0.82,
  },

  /*
   * Before anything is written,
   * SAVE appears inactive.
   */
  saveButtonDisabled: {
    opacity: 0.5,
  },

  saveButtonText: {
    color: PRIMARY,
    fontFamily: "Outfit",
    fontSize: x(20),
    lineHeight: y(26),
  },

  saveError: {
    position: "absolute",
    left: x(40),
    top: y(735),
    width: x(322),
    color: "#A83232",
    fontFamily: "Literata",
    fontSize: x(13),
    lineHeight: y(18),
    textAlign: "center",
  },

  missingScreen: {
    flex: 1,
    paddingHorizontal: x(30),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      PAGE_BACKGROUND,
  },

  missingTitle: {
    color: PRIMARY,
    fontFamily:
      "OutfitSemiBold",
    fontSize: x(24),
    lineHeight: y(31),
    textAlign: "center",
  },

  missingButton: {
    width: x(260),
    height: y(52),
    marginTop: y(24),
    borderRadius: x(20),
    backgroundColor:
      SAVE_BACKGROUND,
    alignItems: "center",
    justifyContent: "center",
  },

  missingButtonText: {
    color: PRIMARY,
    fontFamily: "Outfit",
    fontSize: x(18),
    textAlign: "center",
  },
});