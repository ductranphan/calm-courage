/**
 * Emotion encouragement screen.
 *
 * Matches Figma Screen 6.5.
 *
 * The selected local emotion image is shown immediately.
 * Firestore prompt content refreshes silently in the background,
 * and previously loaded prompts are cached for the current app session.
 *
 * This avoids showing a loading spinner between the Daily Emotion
 * screen and the encouragement screen.
 */

import {
  router,
  type Href,
  useLocalSearchParams,
} from "expo-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
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
  formatEmotionLabel,
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

/**
 * Runtime-only prompt cache.
 *
 * Firestore remains the source of truth. This cache simply means that
 * revisiting an emotion during the same app session can render its
 * encouragement content immediately.
 */
const emotionPromptCache =
  new Map<EmotionId, EmotionPrompt>();

export default function EmotionEncouragementScreen() {
  const {
    emotion,
    childId,
  } =
    useLocalSearchParams<{
      emotion?: string;
      childId?: string;
    }>();

  const emotionId: EmotionId | null =
    isEmotionId(emotion)
      ? emotion
      : null;

  const cachedPrompt =
    emotionId
      ? emotionPromptCache.get(
          emotionId,
        ) ?? null
      : null;

  const [
    prompt,
    setPrompt,
  ] =
    useState<EmotionPrompt | null>(
      cachedPrompt,
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      emotionId
        ? null
        : "This emotion could not be found.",
    );

  const [
    audioEnabled,
    setAudioEnabled,
  ] = useState(false);

  const bodyText = useMemo(
    () =>
      prompt?.body
        .filter(Boolean)
        .join("\n") ??
      "",
    [prompt],
  );

  const fallbackTitle =
    useMemo(
      () =>
        emotionId
          ? formatEmotionLabel(
              emotionId,
            )
          : "",
      [emotionId],
    );

  const loadPrompt =
    useCallback(
      async () => {
        if (!emotionId) {
          setPrompt(null);
          setError(
            "This emotion could not be found.",
          );
          return;
        }

        /*
         * Keep cached/current content visible while Firestore refreshes.
         * Do not clear the prompt and do not show a loading state.
         */
        setError(null);

        try {
          const loadedPrompt =
            await getEmotionPrompt(
              emotionId,
            );

          if (!loadedPrompt) {
            /*
             * If cached content exists, leave it visible even if the
             * refresh returns no document.
             */
            if (!prompt) {
              setError(
                "This encouragement message is not available yet.",
              );
            }

            return;
          }

          if (!loadedPrompt.enabled) {
            router.replace(
              "/child-dashboard" as Href,
            );
            return;
          }

          emotionPromptCache.set(
            emotionId,
            loadedPrompt,
          );

          setPrompt(
            loadedPrompt,
          );
        } catch (loadError) {
          console.error(
            "Unable to load emotion prompt:",
            loadError,
          );

          /*
           * A failed background refresh should not remove cached
           * encouragement text that is already visible.
           */
          if (!prompt) {
            setError(
              "We couldn’t load your encouragement message. Please try again.",
            );
          }
        }
      },
      [
        emotionId,
        prompt,
      ],
    );

  useEffect(() => {
    /*
     * If the route changes to another emotion while this screen is
     * mounted, immediately use that emotion's cached prompt if one exists.
     */
    if (!emotionId) {
      setPrompt(null);
      setError(
        "This emotion could not be found.",
      );
      return;
    }

    const nextCachedPrompt =
      emotionPromptCache.get(
        emotionId,
      ) ?? null;

    setPrompt(
      nextCachedPrompt,
    );

    setError(null);
  }, [emotionId]);

  useEffect(() => {
    void loadPrompt();
  }, [loadPrompt]);

  function handleContinue() {
    if (
      !emotionId ||
      !prompt
    ) {
      return;
    }

    router.push({
      pathname:
        "/recording-answer",

      params: {
        emotion:
          emotionId,

        ...(childId
          ? {
              childId,
            }
          : {}),
      },
    } as Href);
  }

  const showPromptContent =
    Boolean(
      prompt &&
        emotionId &&
        !error,
    );

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
      alwaysBounceVertical={
        false
      }
      overScrollMode="never"
      contentInsetAdjustmentBehavior="never"
    >
      <View
        style={
          styles.figmaFrame
        }
      >
        <Pressable
          style={styles.backButton}
          onPress={() =>
            router.replace(
              "/child-dashboard" as Href,
            )
          }
          accessibilityRole="button"
          accessibilityLabel="Back"
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

        {/*
         * The emotion image is local and preloaded globally, so show
         * it immediately rather than waiting for the Firestore prompt.
         */}
        {emotionId ? (
          <>
            <View
              style={
                styles.emotionImageClip
              }
            >
              <Image
                source={
                  getEmotionImage(
                    emotionId,
                  )
                }
                style={
                  styles.emotionImage
                }
                resizeMode="cover"
                fadeDuration={0}
              />
            </View>

            <Text
              style={
                styles.emotionLabel
              }
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              {prompt?.title ??
                fallbackTitle}
            </Text>
          </>
        ) : null}

        {showPromptContent ? (
          <>
            <Text
              style={
                styles.bodyText
              }
              adjustsFontSizeToFit
              minimumFontScale={0.82}
            >
              {bodyText}
            </Text>

            <Text
              style={
                styles.questionText
              }
              adjustsFontSizeToFit
              minimumFontScale={0.86}
            >
              {prompt?.question}
            </Text>

            <Pressable
              style={({
                pressed,
              }) => [
                styles.ctaButton,

                pressed &&
                  styles.ctaButtonPressed,
              ]}
              onPress={
                handleContinue
              }
              accessibilityRole="button"
              accessibilityLabel={
                prompt?.ctaLabel ??
                "Continue"
              }
            >
              <Text
                style={
                  styles.ctaText
                }
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {
                  prompt?.ctaLabel
                }
              </Text>
            </Pressable>
          </>
        ) : null}

        {error ? (
          <View
            style={
              styles.errorContainer
            }
          >
            <ErrorMessage
              message={error}
            />

            {emotionId ? (
              <Pressable
                style={({
                  pressed,
                }) => [
                  styles.retryButton,

                  pressed &&
                    styles.ctaButtonPressed,
                ]}
                onPress={() =>
                  void loadPrompt()
                }
                accessibilityRole="button"
                accessibilityLabel="Try loading encouragement again"
              >
                <Text
                  style={
                    styles.retryText
                  }
                >
                  Try Again
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
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
    minHeight:
      y(
        FIGMA_FRAME_HEIGHT,
      ),

    backgroundColor:
      colors.background,
  },

  figmaFrame: {
    width: "100%",

    height:
      y(
        FIGMA_FRAME_HEIGHT,
      ),

    position:
      "relative",

    backgroundColor:
      colors.background,
  },

  backButton: {
    position:
      "absolute",

    left:
      x(20),

    top:
      y(48),

    width:
      x(37.24),

    height:
      y(22.18),

    alignItems:
      "center",

    justifyContent:
      "center",

    zIndex:
      10,
  },

  audioButton: {
    position:
      "absolute",

    left:
      x(347),

    top:
      y(48),

    width:
      x(35),

    height:
      x(35),

    alignItems:
      "center",

    justifyContent:
      "center",

    zIndex:
      10,
  },

  emotionImageClip: {
    position:
      "absolute",

    left:
      x(96),

    top:
      y(150),

    width:
      x(210),

    height:
      y(210),

    borderRadius:
      x(20),

    overflow:
      "hidden",

    backgroundColor:
      "#FFFDF4",
  },

  emotionImage: {
    width:
      x(210),

    height:
      y(210),
  },

  emotionLabel: {
    position:
      "absolute",

    left:
      x(98),

    top:
      y(319),

    width:
      x(206),

    height:
      y(40),

    color:
      colors.primary,

    fontFamily:
      "Outfit",

    fontSize:
      x(25),

    lineHeight:
      y(40),

    textAlign:
      "center",

    textAlignVertical:
      "center",
  },

  bodyText: {
    position:
      "absolute",

    left:
      x(20),

    top:
      y(402),

    width:
      x(362),

    height:
      y(195),

    color:
      colors.primary,

    fontFamily:
      "Outfit",

    fontSize:
      x(30),

    lineHeight:
      y(39),

    textAlign:
      "center",

    textAlignVertical:
      "center",
  },

  questionText: {
    position:
      "absolute",

    left:
      x(20),

    top:
      y(639),

    width:
      x(362),

    height:
      y(72),

    color:
      colors.primary,

    fontFamily:
      "Literata",

    fontSize:
      x(20),

    lineHeight:
      y(24),

    textAlign:
      "center",

    textAlignVertical:
      "center",
  },

  ctaButton: {
    position:
      "absolute",

    left:
      x(96),

    top:
      y(752),

    width:
      x(210),

    height:
      y(52),

    borderRadius:
      x(20),

    backgroundColor:
      "#E8D6EC",

    alignItems:
      "center",

    justifyContent:
      "center",

    shadowColor:
      "#000000",

    shadowOffset: {
      width: 0,
      height:
        y(4),
    },

    shadowOpacity:
      0.25,

    shadowRadius:
      x(4),

    elevation:
      5,
  },

  ctaButtonPressed: {
    opacity:
      0.82,
  },

  ctaText: {
    width:
      x(190),

    color:
      colors.primary,

    fontFamily:
      "Outfit",

    fontSize:
      x(20),

    lineHeight:
      y(26),

    textAlign:
      "center",
  },

  errorContainer: {
    position:
      "absolute",

    left:
      x(20),

    top:
      y(390),

    width:
      x(362),

    minHeight:
      y(200),

    alignItems:
      "center",

    justifyContent:
      "center",

    zIndex:
      20,
  },

  retryButton: {
    minWidth:
      x(150),

    minHeight:
      y(48),

    marginTop:
      y(22),

    paddingHorizontal:
      x(24),

    borderRadius:
      x(24),

    backgroundColor:
      "#E8D6EC",

    alignItems:
      "center",

    justifyContent:
      "center",
  },

  retryText: {
    color:
      colors.primary,

    fontFamily:
      "Literata",

    fontSize:
      x(18),
  },

  controlPressed: {
    opacity:
      0.65,
  },
});