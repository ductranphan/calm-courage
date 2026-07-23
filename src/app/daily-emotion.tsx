/**
 * Daily Emotion screen.
 *
 * Matches Figma Screen 6.0: Daily Emotion Check-In.
 * Shows emotion images from assets/images.
 * Saves the selected emotion as a Firebase check-in.
 *
 * The screen navigates instantly after tapping an emotion.
 * Firebase saves the mood in the background.
 */

import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
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
import { emotions, type EmotionId } from "@/constants/emotions";
import { useAuth } from "@/contexts/AuthContext";
import { createCheckIn } from "@/services/checkIns";
import { awardRewards, listChildren } from "@/services/children";
import { ACTIVITIES_BY_ID } from "@/constants/activities";
import { completeActivityAttempt } from "@/services/activityAttempts";
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
  const { childId } = useLocalSearchParams<{ childId?: string }>();

  const [activeChildId, setActiveChildId] = useState<string | null>(
    childId || null,
  );
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    let stillMounted = true;

    async function loadFallbackChild() {
      if (childId || !user?.uid) return;

      try {
        const children = await listChildren(user.uid);

        if (stillMounted && children[0]) {
          setActiveChildId(children[0].id);
        }
      } catch {
        // Error will show only if the child taps an emotion.
      }
    }

    loadFallbackChild();

    return () => {
      stillMounted = false;
    };
  }, [childId, user?.uid]);

  function handleSelectEmotion(emotionId: EmotionId) {
    setError(null);

    if (!user?.uid || !activeChildId) {
      setError("No child profile found.");
      return;
    }

    /**
     * Navigate immediately so the child does not wait on Firebase.
     * The parent dashboard receives the mood instantly through params.
     */
    router.replace({
      pathname: "/home",
      params: {
        mood: emotionId,
      },
    });

    /**
     * Save check-in and activity progress in the background.
     */
    void (async () => {
      try {
        await createCheckIn(user.uid, activeChildId, {
          emotion: emotionId,
        });

        const nameFeeling = ACTIVITIES_BY_ID.phase1_name_the_feeling;

        if (nameFeeling) {
          await completeActivityAttempt(user.uid, activeChildId, nameFeeling);
        } else {
          await awardRewards(user.uid, activeChildId, { stars: 1 });
        }
      } catch {
        console.log("Unable to save emotion progress.");
      }
    })();
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

        {emotions.map((emotion) => {
          const position = emotionPositions[emotion.id];

          return (
            <Pressable
              key={emotion.id}
              style={[
                styles.emotionBlock,
                {
                  left: x(position.left),
                  top: y(position.top),
                },
              ]}
              onPress={() => handleSelectEmotion(emotion.id)}
            >
              <View style={styles.emotionCardShadow}>
                <View style={styles.emotionImageClip}>
                  <Image
                    source={emotion.image}
                    style={styles.emotionImage}
                    resizeMode="cover"
                    fadeDuration={0}
                  />
                </View>
              </View>

              <Text style={styles.emotionLabel}>{emotion.label}</Text>
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