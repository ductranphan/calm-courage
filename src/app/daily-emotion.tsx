/**
 * Daily Emotion screen.
 *
 * Matches Figma Screen 6.0: Daily Emotion Check-In.
 * Shows emotion images from assets/images.
 * Saves the selected emotion as a Firebase check-in.
 *
 * Waits for Firebase to save one check-in for the current local day before
 * leaving the screen, so failed writes are never shown as successful.
 */

import {
  router,
  useLocalSearchParams,
  type Href,
} from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import BackButton from "@/components/ui/BackButton";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { colors } from "@/constants/colors";
import {
  emotions,
  isEmotionId,
  type EmotionId,
} from "@/constants/emotions";
import { useActiveChild } from "@/contexts/ActiveChildContext";
import { useAuth } from "@/contexts/AuthContext";
import { completeActivityById } from "@/services/activityAttempts";
import { saveDailyCheckIn } from "@/services/checkIns";
import { getChild } from "@/services/children";
import { x, y } from "@/utils/scaling";

import AudioOffIcon from "../../assets/icons/audio-off.svg";
import AudioOnIcon from "../../assets/icons/audio-on.svg";

const LogoImage = require("../../assets/images/logo.png");

/*
 * The last emotion card begins at 1054 and has a height of 171.
 * A small bottom gap is added after it, avoiding excessive empty scrolling.
 */
const CONTENT_HEIGHT = 1245;

const emotionPositions: Record<
  EmotionId,
  {
    left: number;
    top: number;
  }
> = {
  happy: {
    left: 20,
    top: 379,
  },
  nervous: {
    left: 211,
    top: 379,
  },

  excited: {
    left: 20,
    top: 604,
  },
  sad: {
    left: 211,
    top: 604,
  },

  frustrated: {
    left: 20,
    top: 829,
  },
  calm: {
    left: 211,
    top: 829,
  },

  proud: {
    left: 20,
    top: 1054,
  },
};

export default function DailyEmotionScreen() {
  const { user } = useAuth();

  const {
    activeChild,
    selectActiveChild,
  } = useActiveChild();

  const { childId } =
    useLocalSearchParams<{
      childId?: string;
    }>();

  const activeChildId =
    activeChild?.id ??
    childId ??
    null;

  const [
    audioEnabled,
    setAudioEnabled,
  ] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [
    savingEmotion,
    setSavingEmotion,
  ] = useState<EmotionId | null>(
    null,
  );

  useEffect(() => {
    let stillMounted = true;

    async function restoreSelectedChild() {
      if (
        activeChild ||
        !childId ||
        !user?.uid
      ) {
        return;
      }

      try {
        const child = await getChild(
          user.uid,
          childId,
        );

        if (
          stillMounted &&
          child
        ) {
          selectActiveChild({
            id: child.id,
            name: child.name,
            avatarId:
              child.avatarId,
          });
        }
      } catch {
        /*
         * The existing error message is shown
         * if an emotion is selected.
         */
      }
    }

    void restoreSelectedChild();

    return () => {
      stillMounted = false;
    };
  }, [
    activeChild,
    childId,
    user?.uid,
    selectActiveChild,
  ]);

  async function handleSelectEmotion(
    emotionId: EmotionId,
  ) {
    if (savingEmotion) {
      return;
    }

    setError(null);

    if (
      !user?.uid ||
      !activeChildId
    ) {
      setError(
        "No child profile found.",
      );

      return;
    }

    setSavingEmotion(emotionId);

    try {
      /*
       * Wait for Firestore before leaving the screen.
       * The service also refuses to create a second
       * check-in for the same child and date.
       */
      const savedCheckIn =
        await saveDailyCheckIn(
          user.uid,
          activeChildId,
          {
            emotion: emotionId,
          },
        );

      /*
       * If an older check-in already existed, use its
       * saved emotion rather than the newly selected card.
       */
      const savedEmotion =
        isEmotionId(
          savedCheckIn.emotion,
        )
          ? savedCheckIn.emotion
          : emotionId;

      /*
       * The daily emotion check-in completes the first Phase 1 activity.
       * The service prevents duplicate rewards if this activity was already
       * completed for the child.
       */
      await completeActivityById(
        user.uid,
        activeChildId,
        "phase1_name_the_feeling",
      );

      router.replace({
        pathname:
          "/emotion-encouragement",
        params: {
          emotion: savedEmotion,
          childId: activeChildId,
        },
      } as Href);
    } catch (saveError) {
      console.error(
        "Unable to save daily emotion:",
        saveError,
      );

      setError(
        "We couldn’t save your feeling. Please try again.",
      );
    } finally {
      setSavingEmotion(null);
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.scrollContent
      }
      showsVerticalScrollIndicator={
        false
      }
      bounces={false}
      alwaysBounceVertical={false}
      overScrollMode="never"
      contentInsetAdjustmentBehavior="never"
    >
      <View style={styles.figmaFrame}>
        <BackButton
          fallback="/child-welcome"
        />

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

        <Text style={styles.title}>
          How are you feeling{"\n"}
          today?
        </Text>

        <Text style={styles.subtitle}>
          Select the emotion that best
          matches{"\n"}
          your heart right now to open
          your{"\n"}
          daily courage map.
        </Text>

        <ErrorMessage
          message={error}
          style={styles.error}
        />

        {emotions.map(
          (emotionOption) => {
            const position =
              emotionPositions[
                emotionOption.id
              ];

            return (
              <Pressable
                key={emotionOption.id}
                style={[
                  styles.emotionBlock,
                  {
                    left: x(
                      position.left,
                    ),
                    top: y(
                      position.top,
                    ),
                  },
                  savingEmotion &&
                    styles.disabledEmotion,
                ]}
                onPress={() =>
                  void handleSelectEmotion(
                    emotionOption.id,
                  )
                }
                disabled={
                  savingEmotion !== null
                }
                accessibilityRole="button"
                accessibilityLabel={`Select ${emotionOption.label}`}
                accessibilityState={{
                  disabled:
                    savingEmotion !==
                    null,
                }}
              >
                <View
                  style={
                    styles.emotionCardShadow
                  }
                >
                  <View
                    style={
                      styles.emotionImageClip
                    }
                  >
                    <Image
                      source={
                        emotionOption.image
                      }
                      style={
                        styles.emotionImage
                      }
                      resizeMode="cover"
                      fadeDuration={0}
                    />

                    {savingEmotion ===
                    emotionOption.id ? (
                      <View
                        style={
                          styles.savingOverlay
                        }
                      >
                        <ActivityIndicator
                          size="large"
                          color={
                            colors.primary
                          }
                        />
                      </View>
                    ) : null}
                  </View>
                </View>

                <Text
                  style={
                    styles.emotionLabel
                  }
                >
                  {
                    emotionOption.label
                  }
                </Text>
              </Pressable>
            );
          },
        )}

        <View style={styles.logoWrapper}>
          <Image
            source={LogoImage}
            style={styles.logoImage}
            resizeMode="contain"
            fadeDuration={0}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  scrollContent: {
    flexGrow: 1,
    backgroundColor:
      colors.background,
  },

  figmaFrame: {
    position: "relative",
    width: "100%",
    height: y(CONTENT_HEIGHT),
    backgroundColor:
      colors.background,
  },

  audioButton: {
    position: "absolute",
    left: x(347),
    top: y(90),
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
    width: x(323),
    minHeight: y(78),
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(30),
    lineHeight: y(33),
  },

  subtitle: {
    position: "absolute",
    left: x(20),
    top: y(242),
    width: x(362),
    minHeight: y(72),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(20),
  },

  error: {
    position: "absolute",
    left: x(20),
    top: y(326),
    width: x(362),
    zIndex: 20,
  },

  emotionBlock: {
    position: "absolute",
    width: x(171),
    height: y(171),
    alignItems: "center",
  },

  emotionCardShadow: {
    width: x(171),
    height: y(138),
    borderRadius: x(20),
    backgroundColor:
      colors.white,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 6,
  },

  emotionImageClip: {
    width: x(171),
    height: y(138),
    borderRadius: x(20),
    backgroundColor:
      colors.white,
    overflow: "hidden",
  },

  emotionImage: {
    width: x(171),
    height: y(138),
  },

  savingOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255, 255, 255, 0.72)",
  },

  disabledEmotion: {
    opacity: 0.7,
  },

  emotionLabel: {
    width: x(168.52),
    height: y(33),
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(25),
    lineHeight: y(33),
    textAlign: "center",

    textShadowColor:
      "rgba(0, 0, 0, 0.25)",
    textShadowOffset: {
      width: 0,
      height: y(4),
    },
    textShadowRadius: x(4),
  },

  logoWrapper: {
    position: "absolute",
    left: x(232),
    top: y(1098),
    width: x(134),
    height: y(50),
  },

  logoImage: {
    width: x(134),
    height: y(50),
    opacity: 1,
  },

  controlPressed: {
    opacity: 0.65,
  },
});