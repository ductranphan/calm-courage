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

import { router, useLocalSearchParams, type Href } from "expo-router";
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
import { saveDailyCheckIn } from "@/services/checkIns";
import { getChild } from "@/services/children";
import { completeActivityById } from "@/services/activityAttempts";
import { x, y } from "@/utils/scaling";

import AudioOffIcon from "../../assets/icons/audio-off.svg";
import AudioOnIcon from "../../assets/icons/audio-on.svg";
const LogoImage = require("../../assets/images/logo.png");

const emotionPositions: Record<EmotionId, { left: number; top: number }> = {
  happy: { left: 20, top: 379 },
  nervous: { left: 211, top: 379 },

  excited: { left: 20, top: 604 },
  sad: { left: 211, top: 604 },

  frustrated: { left: 20, top: 829 },
  calm: { left: 211, top: 829 },

  proud: { left: 20, top: 1054 },
};

export default function DailyEmotionScreen() {
  const { user } = useAuth();
  const { activeChild, selectActiveChild } = useActiveChild();
  const { childId } = useLocalSearchParams<{ childId?: string }>();

  const activeChildId = activeChild?.id ?? childId ?? null;
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingEmotion, setSavingEmotion] =
    useState<EmotionId | null>(null);

  useEffect(() => {
    let stillMounted = true;

    async function restoreSelectedChild() {
      if (activeChild || !childId || !user?.uid) {
        return;
      }

      try {
        const child = await getChild(user.uid, childId);

        if (stillMounted && child) {
          selectActiveChild({
            id: child.id,
            name: child.name,
            avatarId: child.avatarId,
          });
        }
      } catch {
        // The existing error message is shown if an emotion is tapped.
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

  async function handleSelectEmotion(emotionId: EmotionId) {
    if (savingEmotion) {
      return;
    }

    setError(null);

    if (!user?.uid || !activeChildId) {
      setError("No child profile found.");
      return;
    }

    setSavingEmotion(emotionId);

    try {
      /*
       * Wait for Firestore before leaving the screen. The service also
       * refuses to create a second check-in for the same child and date.
       */
      const savedCheckIn = await saveDailyCheckIn(
        user.uid,
        activeChildId,
        {
          emotion: emotionId,
        },
      );

      /*
       * Daily check-in completes the Phase 1 "Name the Feeling" activity.
       * completeActivityById is idempotent if already completed today.
       */
      try {
        await completeActivityById(
          user.uid,
          activeChildId,
          "phase1_name_the_feeling",
        );
      } catch (rewardError) {
        console.error(
          "Unable to complete Name the Feeling activity:",
          rewardError,
        );
      }

      /*
       * If an older check-in already existed, use its saved emotion rather
       * than the newly tapped card. This keeps the encouragement page and
       * Firestore consistent.
       */
      const savedEmotion = isEmotionId(savedCheckIn.emotion)
        ? savedCheckIn.emotion
        : emotionId;

      router.replace({
        pathname: "/emotion-encouragement",
        params: {
          emotion: savedEmotion,
          childId: activeChildId,
        },
      } as Href);
    } catch (saveError) {
      console.error("Unable to save daily emotion:", saveError);

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
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.figmaFrame}>
        <BackButton fallback="/child-welcome" />

        <Pressable
          style={styles.audioButton}
          onPress={() => setAudioEnabled((current) => !current)}
        >
          {audioEnabled ? (
            <AudioOnIcon width={x(35)} height={x(35)} />
          ) : (
            <AudioOffIcon width={x(35)} height={x(35)} />
          )}
        </Pressable>

        <Text style={styles.title}>How are you feeling{"\n"}today?</Text>

        <Text style={styles.subtitle}>
          Select the emotion that best matches{"\n"}
          your heart right now to open your{"\n"}
          daily courage map.
        </Text>

        {emotions.map((emotionOption) => {
          const position = emotionPositions[emotionOption.id];

          return (
            <Pressable
              key={emotionOption.id}
              style={[
                styles.emotionBlock,
                {
                  left: x(position.left),
                  top: y(position.top),
                },
                savingEmotion && styles.disabledEmotion,
              ]}
              onPress={() =>
                void handleSelectEmotion(emotionOption.id)
              }
              disabled={savingEmotion !== null}
            >
              <View style={styles.emotionCardShadow}>
                <View style={styles.emotionImageClip}>
                  <Image
                    source={emotionOption.image}
                    style={styles.emotionImage}
                    resizeMode="cover"
                    fadeDuration={0}
                  />

                  {savingEmotion === emotionOption.id ? (
                    <View style={styles.savingOverlay}>
                      <ActivityIndicator
                        size="large"
                        color={colors.primary}
                      />
                    </View>
                  ) : null}
                </View>
              </View>

              <Text style={styles.emotionLabel}>
                {emotionOption.label}
              </Text>
            </Pressable>
          );
        })}

        <View style={styles.logoWrapper}>
          <Image
            source={LogoImage}
            style={styles.logoImage}
            resizeMode="contain"
            fadeDuration={0}
          />
        </View>

        <ErrorMessage message={error} style={styles.error} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    minHeight: y(1358),
    backgroundColor: colors.background,
  },

  figmaFrame: {
    width: "100%",
    height: y(1358),
    position: "relative",
    backgroundColor: colors.background,
  },

  audioButton: {
    position: "absolute",
    left: x(347),
    top: y(90),
    width: x(35),
    height: x(35),
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    position: "absolute",
    left: x(20),
    top: y(123),
    width: x(323),
    height: y(78),
    color: colors.primary,
    fontFamily: "Quiche",
    fontSize: x(30),
    lineHeight: y(33),
  },

  subtitle: {
    position: "absolute",
    left: x(20),
    top: y(242),
    width: x(362),
    height: y(72),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(20),
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
    backgroundColor: colors.white,

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
    backgroundColor: colors.white,
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
    backgroundColor: "rgba(255, 255, 255, 0.72)",
  },

  disabledEmotion: {
    opacity: 0.7,
  },

  emotionLabel: {
    width: x(168.52),
    height: y(33),
    color: colors.primary,
    fontFamily: "Quiche",
    fontSize: x(25),
    lineHeight: y(33),
    textAlign: "center",

    textShadowColor: "rgba(0, 0, 0, 0.25)",
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

  error: {
    position: "absolute",
    left: x(20),
    top: y(1280),
  },
});