/**
 * Emotion encouragement screen.
 *
 * Matches Figma Screen 6.5.
 * Loads the selected emotion text from Firestore and combines it with the
 * matching local emotion image. The CTA opens the recording-answer screen.
 */

import { router, useLocalSearchParams, type Href } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import ErrorMessage from "@/components/ui/ErrorMessage";
import { colors } from "@/constants/colors";
import {
  getEmotionImage,
  isEmotionId,
  type EmotionId,
} from "@/constants/emotions";
import {
  getEmotionPrompt,
  type EmotionPrompt,
} from "@/services/emotionPrompts";
import { x, y } from "@/utils/scaling";

import AudioOffIcon from "../../assets/icons/audio-off.svg";
import AudioOnIcon from "../../assets/icons/audio-on.svg";
import BackIcon from "../../assets/icons/back.svg";

const FIGMA_FRAME_HEIGHT = 874;

export default function EmotionEncouragementScreen() {
  const { emotion, childId } = useLocalSearchParams<{
    emotion?: string;
    childId?: string;
  }>();

  const emotionId: EmotionId | null = isEmotionId(emotion)
    ? emotion
    : null;

  const [prompt, setPrompt] = useState<EmotionPrompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const bodyText = useMemo(
    () => prompt?.body.filter(Boolean).join("\n") ?? "",
    [prompt],
  );

  const loadPrompt = useCallback(async () => {
    if (!emotionId) {
      setPrompt(null);
      setError("This emotion could not be found.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const loadedPrompt = await getEmotionPrompt(emotionId);

      if (!loadedPrompt) {
        setPrompt(null);
        setError("This encouragement message is not available yet.");
        return;
      }

      if (!loadedPrompt.enabled) {
        router.replace("/child-dashboard" as Href);
        return;
      }

      setPrompt(loadedPrompt);
    } catch (loadError) {
      console.error("Unable to load emotion prompt:", loadError);
      setPrompt(null);
      setError(
        "We couldn’t load your encouragement message. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [emotionId]);

  useEffect(() => {
    void loadPrompt();
  }, [loadPrompt]);

  function handleContinue() {
    if (!emotionId) {
      return;
    }

    router.push({
      pathname: "/recording-answer",
      params: {
        emotion: emotionId,
        ...(childId ? { childId } : {}),
      },
    } as Href);
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <View style={styles.figmaFrame}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.replace("/child-dashboard" as Href)}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
        >
          <BackIcon width={x(37.24)} height={y(22.18)} />
        </Pressable>

        <Pressable
          style={styles.audioButton}
          onPress={() => setAudioEnabled((current) => !current)}
          hitSlop={8}
        >
          {audioEnabled ? (
            <AudioOnIcon width={x(35)} height={x(35)} />
          ) : (
            <AudioOffIcon width={x(35)} height={x(35)} />
          )}
        </Pressable>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : prompt && emotionId ? (
          <>
            <View style={styles.emotionImageClip}>
              <Image
                source={getEmotionImage(emotionId)}
                style={styles.emotionImage}
                resizeMode="cover"
                fadeDuration={0}
              />
            </View>

            <Text
              style={styles.emotionLabel}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              {prompt.title}
            </Text>

            <Text
              style={styles.bodyText}
              adjustsFontSizeToFit
              minimumFontScale={0.82}
            >
              {bodyText}
            </Text>

            <Text
              style={styles.questionText}
              adjustsFontSizeToFit
              minimumFontScale={0.86}
            >
              {prompt.question}
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.ctaButton,
                pressed && styles.ctaButtonPressed,
              ]}
              onPress={handleContinue}
            >
              <Text
                style={styles.ctaText}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {prompt.ctaLabel}
              </Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.errorContainer}>
            <ErrorMessage message={error} />

            <Pressable
              style={styles.retryButton}
              onPress={() => void loadPrompt()}
            >
              <Text style={styles.retryText}>Try Again</Text>
            </Pressable>
          </View>
        )}
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
    minHeight: y(FIGMA_FRAME_HEIGHT),
    backgroundColor: colors.background,
  },

  figmaFrame: {
    width: "100%",
    height: y(FIGMA_FRAME_HEIGHT),
    position: "relative",
    backgroundColor: colors.background,
  },

  backButton: {
    position: "absolute",
    left: x(20),
    top: y(48),
    width: x(37.24),
    height: y(22.18),
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

  loadingContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  emotionImageClip: {
    position: "absolute",
    left: x(96),
    top: y(150),
    width: x(210),
    height: y(210),
    borderRadius: x(20),
    overflow: "hidden",
    backgroundColor: "#FFFDF4",
  },

  emotionImage: {
    width: x(210),
    height: y(210),
  },

  emotionLabel: {
    position: "absolute",
    left: x(98),
    top: y(319),
    width: x(206),
    height: y(40),
    color: colors.primary,
    fontFamily: "Quiche",
    fontSize: x(25),
    lineHeight: y(40),
    textAlign: "center",
    textAlignVertical: "center",
  },

  bodyText: {
    position: "absolute",
    left: x(20),
    top: y(402),
    width: x(362),
    height: y(195),
    color: colors.primary,
    fontFamily: "Quiche",
    fontSize: x(30),
    lineHeight: y(39),
    textAlign: "center",
    textAlignVertical: "center",
  },

  questionText: {
    position: "absolute",
    left: x(20),
    top: y(639),
    width: x(362),
    height: y(72),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textAlign: "center",
    textAlignVertical: "center",
  },

  ctaButton: {
    position: "absolute",
    left: x(96),
    top: y(752),
    width: x(210),
    height: y(52),
    borderRadius: x(20),
    backgroundColor: "#E8D6EC",
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

  ctaButtonPressed: {
    opacity: 0.82,
  },

  ctaText: {
    width: x(190),
    color: colors.primary,
    fontFamily: "Quiche",
    fontSize: x(20),
    lineHeight: y(26),
    textAlign: "center",
  },

  errorContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    paddingHorizontal: x(20),
    alignItems: "center",
    justifyContent: "center",
  },

  retryButton: {
    minWidth: x(150),
    minHeight: y(48),
    marginTop: y(22),
    paddingHorizontal: x(24),
    borderRadius: x(24),
    backgroundColor: "#E8D6EC",
    alignItems: "center",
    justifyContent: "center",
  },

  retryText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(18),
  },
});