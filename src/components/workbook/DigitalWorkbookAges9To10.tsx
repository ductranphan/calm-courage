/**
 * Digital Workbook for children aged 9–10.
 *
 * The reward totals and Save action are temporary frontend values.
 * Firestore persistence and reward updates will be connected later.
 */

import { router, type Href } from "expo-router";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from "react-native-svg";

import { colors } from "@/constants/colors";
import { useActiveChild } from "@/contexts/ActiveChildContext";
import { x, y } from "@/utils/scaling";

import AudioOffIcon from "../../../assets/icons/audio-off.svg";
import AudioOnIcon from "../../../assets/icons/audio-on.svg";
import BadgeIcon from "../../../assets/icons/certificate-badge.svg";
import DiamondIcon from "../../../assets/icons/diamond.svg";
import HouseIcon from "../../../assets/icons/house.svg";
import StarIcon from "../../../assets/icons/star.svg";
import SaveStarIcon from "../../../assets/icons/star-save.svg";
import WorkbookDashboardIcon from "../../../assets/icons/workbook-dashboard.svg";

const PAGE_BACKGROUND = "#F1F3F5";
const INPUT_PLACEHOLDER = "#A8ABD8";
const INTENSE_COLOR = "#861EB3";

const FIGMA_FRAME_HEIGHT = 874;

const SLIDER_LEFT = 35;
const SLIDER_TOP = 245;
const SLIDER_WIDTH = 332;
const SLIDER_HEIGHT = 28;
const THUMB_SIZE = 48;
const SCALE_TOP = 286;

const INTENSITY_BUBBLE_LEFT = 132;
const INTENSITY_BUBBLE_WIDTH = 168;

const SCALE_VALUES = Array.from(
  { length: 10 },
  (_, index) => index + 1,
);

function formatScore(value: number): string {
  return value.toString().padStart(2, "0");
}

function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.min(
    Math.max(value, minimum),
    maximum,
  );
}

type Props = {
  stars: number;
  gems: number;
  badgeCount: number;
};

export default function DigitalWorkbookAges9To10({
  stars,
  gems,
  badgeCount,
}: Props) {
  const { activeChild } = useActiveChild();

  const scrollViewRef =
    useRef<ScrollView | null>(null);

  const saveMessageTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );

  const sliderPositionRef = useRef(
    (6 / 9) * x(SLIDER_WIDTH),
  );

  const [audioEnabled, setAudioEnabled] =
    useState(false);

  const [intensity, setIntensity] =
    useState(7);

  const [sliderPosition, setSliderPosition] =
    useState((6 / 9) * x(SLIDER_WIDTH));

  const [response, setResponse] =
    useState("");

  const [savedMessage, setSavedMessage] =
    useState(false);

  const [keyboardVisible, setKeyboardVisible] =
    useState(false);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios"
        ? "keyboardWillShow"
        : "keyboardDidShow";

    const hideEvent =
      Platform.OS === "ios"
        ? "keyboardWillHide"
        : "keyboardDidHide";

    const showSubscription =
      Keyboard.addListener(showEvent, () => {
        setKeyboardVisible(true);
      });

    const hideSubscription =
      Keyboard.addListener(hideEvent, () => {
        setKeyboardVisible(false);
      });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();

      if (saveMessageTimerRef.current) {
        clearTimeout(
          saveMessageTimerRef.current,
        );
      }
    };
  }, []);

  function updateSliderFromPosition(
    position: number,
  ) {
    const boundedPosition = clamp(
      position,
      0,
      x(SLIDER_WIDTH),
    );

    sliderPositionRef.current =
      boundedPosition;

    setSliderPosition(boundedPosition);

    const nextIntensity =
      Math.round(
        (boundedPosition /
          x(SLIDER_WIDTH)) *
          9,
      ) + 1;

    setIntensity(nextIntensity);
  }

  function selectIntensity(value: number) {
    const position =
      ((value - 1) / 9) *
      x(SLIDER_WIDTH);

    sliderPositionRef.current = position;
    setSliderPosition(position);
    setIntensity(value);
  }

  function snapSliderToNearestValue() {
    const nearestIntensity =
      Math.round(
        (sliderPositionRef.current /
          x(SLIDER_WIDTH)) *
          9,
      ) + 1;

    selectIntensity(nearestIntensity);
  }

  const sliderPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder:
          () => true,
        onMoveShouldSetPanResponder:
          () => true,
        onPanResponderTerminationRequest:
          () => false,

        onPanResponderGrant: (
          _event,
          gestureState,
        ) => {
          updateSliderFromPosition(
            gestureState.x0 -
              x(SLIDER_LEFT),
          );
        },

        onPanResponderMove: (
          _event,
          gestureState,
        ) => {
          updateSliderFromPosition(
            gestureState.moveX -
              x(SLIDER_LEFT),
          );
        },

        onPanResponderRelease: () => {
          snapSliderToNearestValue();
        },

        onPanResponderTerminate: () => {
          snapSliderToNearestValue();
        },
      }),
    [],
  );

  const thumbLeft =
    sliderPosition - x(THUMB_SIZE) / 2;

  const thumbCenterOnScreen =
    x(SLIDER_LEFT) + sliderPosition;

  const intensityTailLeft = clamp(
    thumbCenterOnScreen -
      x(INTENSITY_BUBBLE_LEFT) -
      x(12),
    x(12),
    x(INTENSITY_BUBBLE_WIDTH - 36),
  );

  function handleInputFocus() {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: y(400),
        animated: true,
      });
    }, 180);
  }

  function handleSave() {
    Keyboard.dismiss();

    console.log(
      "Static 9–10 workbook response:",
      {
        childId: activeChild?.id,
        intensity,
        response: response.trim(),
      },
    );

    setSavedMessage(true);

    if (saveMessageTimerRef.current) {
      clearTimeout(
        saveMessageTimerRef.current,
      );
    }

    saveMessageTimerRef.current =
      setTimeout(() => {
        setSavedMessage(false);
      }, 1200);
  }

  function handleParentMode() {
    Keyboard.dismiss();

    router.push(
      "/parent-verification" as Href,
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
      keyboardVerticalOffset={0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          keyboardVisible &&
            styles.scrollContentWithKeyboard,
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={
          Platform.OS === "ios"
            ? "interactive"
            : "on-drag"
        }
      >
        <View style={styles.figmaFrame}>
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
                height={y(35)}
              />
            ) : (
              <AudioOffIcon
                width={x(35)}
                height={y(35)}
              />
            )}
          </Pressable>

          <View style={styles.statistics}>
            <StarIcon
              width={x(32)}
              height={y(32)}
            />

            <Text style={styles.statText}>
              {stars}
            </Text>

            <DiamondIcon
              width={x(20)}
              height={y(20)}
            />

            <Text style={styles.statText}>
              {formatScore(
                gems,
              )}
            </Text>

            <BadgeIcon
              width={x(28)}
              height={y(28)}
            />

            <Text style={styles.statText}>
              {formatScore(
                badgeCount,
              )}
            </Text>
          </View>

          <Text style={styles.title}>
            Digital Workbook
          </Text>

          <View
            style={styles.intensityBubble}
          >
            <Text
              style={styles.intensityBubbleText}
            >
              Your Intensity : {intensity}
            </Text>

            <View
              style={[
                styles.intensityBubbleTail,
                {
                  left: intensityTailLeft,
                },
              ]}
            />
          </View>

          <Text style={styles.calmLabel}>
            Calm
          </Text>

          <Text style={styles.intenseLabel}>
            Intense
          </Text>

          <View
            style={styles.sliderTouchArea}
            {...sliderPanResponder.panHandlers}
            accessibilityRole="adjustable"
            accessibilityLabel="Feeling intensity"
            accessibilityValue={{
              min: 1,
              max: 10,
              now: intensity,
              text: `${intensity} out of 10`,
            }}
            accessibilityActions={[
              { name: "increment" },
              { name: "decrement" },
            ]}
            onAccessibilityAction={(event) => {
              if (
                event.nativeEvent.actionName ===
                "increment"
              ) {
                selectIntensity(
                  clamp(
                    intensity + 1,
                    1,
                    10,
                  ),
                );
              }

              if (
                event.nativeEvent.actionName ===
                "decrement"
              ) {
                selectIntensity(
                  clamp(
                    intensity - 1,
                    1,
                    10,
                  ),
                );
              }
            }}
          >
            <View style={styles.sliderTrack}>
              <Svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${SLIDER_WIDTH} ${SLIDER_HEIGHT}`}
              >
                <Defs>
                  <LinearGradient
                    id="intensityGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <Stop
                      offset="0"
                      stopColor={
                        colors.primary
                      }
                    />

                    <Stop
                      offset="1"
                      stopColor="#C6A4D8"
                    />
                  </LinearGradient>
                </Defs>

                <Rect
                  x="0"
                  y="0"
                  width={SLIDER_WIDTH}
                  height={SLIDER_HEIGHT}
                  rx={SLIDER_HEIGHT / 2}
                  fill="url(#intensityGradient)"
                />
              </Svg>
            </View>

            <View
              style={[
                styles.sliderThumb,
                {
                  left: thumbLeft,
                },
              ]}
            />
          </View>

          <View style={styles.scaleContainer}>
            {SCALE_VALUES.map((value) => {
              const markerPosition =
                ((value - 1) / 9) *
                x(SLIDER_WIDTH);

              const numberWidth = x(44);

              const numberLeft =
                markerPosition -
                numberWidth / 2;

              return (
                <View
                  key={value}
                  pointerEvents="box-none"
                  style={StyleSheet.absoluteFill}
                >
                  <View
                    style={[
                      styles.scaleTick,
                      {
                        left: markerPosition,
                      },
                    ]}
                  />

                  <Pressable
                    style={[
                      styles.scaleNumberButton,
                      {
                        left: numberLeft,
                      },
                    ]}
                    onPress={() =>
                      selectIntensity(value)
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Set intensity to ${value}`}
                    accessibilityState={{
                      selected:
                        value === intensity,
                    }}
                    hitSlop={4}
                  >
                    <Text
                      style={[
                        styles.scaleNumber,
                        value === intensity &&
                          styles.selectedScaleNumber,
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit={false}
                    >
                      {value}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>

          <View style={styles.questionBubble}>
            <View
              style={styles.questionBubbleTail}
            />

            <Text
              style={styles.questionTitle}
            >
              HOW DEEP IS YOUR{"\n"}
              FEELING?
            </Text>

            <Text
              style={styles.questionSubtitle}
            >
              (from 1 to 10)
            </Text>
          </View>

          <Text style={styles.inputLabel}>
            Describe what happened...
          </Text>

          <TextInput
            value={response}
            onChangeText={setResponse}
            onFocus={handleInputFocus}
            style={styles.responseInput}
            placeholder="I felt strong even though I didn’t get invited because I used my breathing exercise."
            placeholderTextColor={
              INPUT_PLACEHOLDER
            }
            multiline
            maxLength={600}
            textAlignVertical="top"
            returnKeyType="default"
            blurOnSubmit={false}
            scrollEnabled
            accessibilityLabel="Describe what happened"
          />

          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed &&
                styles.saveButtonPressed,
            ]}
            onPress={handleSave}
            accessibilityRole="button"
            accessibilityLabel="Save workbook answer"
          >
            <Text
              style={styles.saveButtonText}
            >
              {savedMessage
                ? "Saved"
                : "Save &"}
            </Text>

            <SaveStarIcon
              width={x(23)}
              height={y(23)}
            />
          </Pressable>
        </View>
      </ScrollView>

      {!keyboardVisible ? (
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
            <Text
              style={styles.parentModeText}
            >
              Switch to Parent Mode
            </Text>
          </Pressable>

          <View style={styles.bottomNav}>
            <Pressable
              style={styles.navItem}
              onPress={() => {
                // Already on Workbook.
              }}
              accessibilityRole="button"
              accessibilityLabel="Workbook"
              accessibilityState={{
                selected: true,
              }}
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
              <View
                style={styles.inactiveNavIcon}
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
              onPress={() =>
                router.replace(
                  "/rewards" as Href,
                )
              }
              accessibilityRole="button"
              accessibilityLabel="Rewards"
            >
              <View
                style={styles.inactiveNavIcon}
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
      ) : null}
    </KeyboardAvoidingView>
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
    minHeight: y(FIGMA_FRAME_HEIGHT),
    backgroundColor: PAGE_BACKGROUND,
  },

  scrollContentWithKeyboard: {
    paddingBottom: y(260),
  },

  figmaFrame: {
    position: "relative",
    width: "100%",
    height: y(FIGMA_FRAME_HEIGHT),
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
    zIndex: 20,
  },

  statistics: {
    position: "absolute",
    left: x(93),
    top: y(75),
    width: x(253),
    height: y(32),
    flexDirection: "row",
    alignItems: "center",
    columnGap: x(8),
  },

  statText: {
    marginRight: x(6),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
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

  intensityBubble: {
    position: "absolute",
    left: x(INTENSITY_BUBBLE_LEFT),
    top: y(174),
    width: x(INTENSITY_BUBBLE_WIDTH),
    height: y(56),
    borderRadius: x(12),
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,

    shadowColor: colors.black,
    shadowOffset: {
      width: x(4),
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 5,
  },

  intensityBubbleText: {
    color: colors.primary,
    fontFamily: "OutfitSemiBold",
    fontSize: x(18),
    lineHeight: y(22),
    textAlign: "center",
  },

  intensityBubbleTail: {
    position: "absolute",
    top: y(52),
    width: 0,
    height: 0,
    borderLeftWidth: x(12),
    borderRightWidth: x(12),
    borderTopWidth: y(18),
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: colors.white,
  },

  calmLabel: {
    position: "absolute",
    left: x(35),
    top: y(220),
    width: x(42),
    height: y(15),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(12),
    lineHeight: y(15),
  },

  intenseLabel: {
    position: "absolute",
    left: x(334),
    top: y(220),
    width: x(48),
    height: y(15),
    color: INTENSE_COLOR,
    fontFamily: "Literata",
    fontSize: x(12),
    lineHeight: y(15),
    textAlign: "right",
  },

  sliderTouchArea: {
    position: "absolute",
    left: x(SLIDER_LEFT),
    top: y(SLIDER_TOP),
    width: x(SLIDER_WIDTH),
    height: y(THUMB_SIZE),
    justifyContent: "center",
    overflow: "visible",
    zIndex: 8,
  },

  sliderTrack: {
    width: x(SLIDER_WIDTH),
    height: y(SLIDER_HEIGHT),
    borderRadius: x(SLIDER_HEIGHT / 2),
    overflow: "hidden",
  },

  sliderThumb: {
    position: "absolute",
    top: 0,
    width: x(THUMB_SIZE),
    height: y(THUMB_SIZE),
    borderRadius: x(THUMB_SIZE / 2),
    borderWidth: x(3),
    borderColor: colors.white,
    backgroundColor: "#DDE2EC",

    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 5,
  },

  scaleContainer: {
    position: "absolute",
    left: x(SLIDER_LEFT),
    top: y(SCALE_TOP),
    width: x(SLIDER_WIDTH),
    height: y(60),
    overflow: "visible",
  },

  scaleTick: {
    position: "absolute",
    top: 0,
    width: StyleSheet.hairlineWidth,
    height: y(16),
    backgroundColor: "#A7AFCC",
    transform: [
      {
        translateX:
          -StyleSheet.hairlineWidth / 2,
      },
    ],
  },

  scaleNumberButton: {
    position: "absolute",
    top: y(18),
    width: x(44),
    minHeight: y(38),
    alignItems: "center",
    justifyContent: "flex-start",
  },

  scaleNumber: {
    width: "100%",
    color: "#7E7E7E",
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textAlign: "center",
    includeFontPadding: false,
  },

  selectedScaleNumber: {
    color: colors.primary,
    fontFamily: "LiterataBold",
    fontSize: x(30),
    lineHeight: y(34),
  },

  questionBubble: {
    position: "absolute",
    left: x(110),
    top: y(357),
    width: x(182),
    height: y(104),
    borderRadius: x(12),
    backgroundColor: "#DCE2ED",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: colors.black,
    shadowOffset: {
      width: x(4),
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 5,
  },

  questionBubbleTail: {
    position: "absolute",
    left: x(80),
    top: y(-16),
    width: 0,
    height: 0,
    borderLeftWidth: x(11),
    borderRightWidth: x(11),
    borderBottomWidth: y(17),
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#DCE2ED",
  },

  questionTitle: {
    color: colors.primary,
    fontFamily: "OutfitSemiBold",
    fontSize: x(18),
    lineHeight: y(22),
    textAlign: "center",
  },

  questionSubtitle: {
    marginTop: y(2),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(17),
    lineHeight: y(21),
    textAlign: "center",
  },

  inputLabel: {
    position: "absolute",
    left: x(39),
    top: y(495),
    width: x(324),
    height: y(26),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(26),
  },

  responseInput: {
    position: "absolute",
    left: x(39),
    top: y(532),
    width: x(324),
    height: y(176),
    paddingHorizontal: x(26),
    paddingTop: y(21),
    paddingBottom: y(18),
    borderWidth: x(1),
    borderColor: colors.primary,
    borderRadius: x(20),
    backgroundColor: colors.white,
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(26),
  },

  saveButton: {
    position: "absolute",
    left: x(249),
    top: y(718),
    width: x(133),
    height: y(33),
    borderRadius: x(20),
    backgroundColor: "#E6D8EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: x(7),

    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 5,
  },

  saveButtonPressed: {
    opacity: 0.75,
  },

  saveButtonText: {
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(20),
    lineHeight: y(26),
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
  },

  controlPressed: {
    opacity: 0.65,
  },
});