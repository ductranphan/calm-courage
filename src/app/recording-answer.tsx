/**
 * Voice-answer screen for the emotion encouragement flow.
 *
 * Records a single response and keeps it in temporary storage until the
 * child chooses to save it. Saved recordings are copied to the app's
 * documents directory; backend upload and point rewards are not yet wired.
 */

import {
  getRecordingPermissionsAsync,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import {
  router,
  useLocalSearchParams,
  type Href,
} from "expo-router";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { x, y } from "@/utils/scaling";

import AudioOffIcon from "../../assets/icons/audio-off.svg";
import AudioOnIcon from "../../assets/icons/audio-on.svg";
import BackIcon from "../../assets/icons/back.svg";
import RecordingMicrophoneOffIcon from "../../assets/icons/recording-microphone-off.svg";
import RecordingMicrophoneOnIcon from "../../assets/icons/recording-microphone-on.svg";
import TrashIcon from "../../assets/icons/trash.svg";

const FIGMA_FRAME_HEIGHT = 874;
const RECORDINGS_DIRECTORY_NAME = "recording-answers";

function getLocalDateKey(
  date = new Date(),
): string {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function safeFilePart(value: string): string {
  return value.replace(
    /[^a-zA-Z0-9_-]/g,
    "-",
  );
}

function getFileExtension(
  uri: string,
): string {
  const cleanUri = uri.split("?")[0];
  const match =
    cleanUri.match(/\.[a-zA-Z0-9]+$/);

  return match?.[0] ?? ".m4a";
}

export default function RecordingAnswerScreen() {
  const { emotion, childId } =
    useLocalSearchParams<{
      emotion?: string;
      childId?: string;
    }>();

  const emotionId: EmotionId | null =
    isEmotionId(emotion)
      ? emotion
      : null;

  const audioRecorder = useAudioRecorder(
    RecordingPresets.HIGH_QUALITY,
  );

  /*
   * Refs hold the current native recording state between renders.
   * They also prevent rapid button presses from calling stop() twice.
   */
  const isRecordingRef = useRef(false);

  const recordingStartedAtRef =
    useRef<number | null>(null);

  const screenMountedRef = useRef(true);

  const [audioEnabled, setAudioEnabled] =
    useState(false);

  const [isRecording, setIsRecording] =
    useState(false);

  const [recordedUri, setRecordedUri] =
    useState<string | null>(null);

  const [
    liveDurationMillis,
    setLiveDurationMillis,
  ] = useState(0);

  const [
    recordedDurationMillis,
    setRecordedDurationMillis,
  ] = useState(0);

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const hasRecording =
    recordedUri !== null;

  /*
   * The progress bar uses 60 seconds as its display range only.
   * Recording continues normally after the indicator reaches the end.
   */
  const progressPosition = useMemo(() => {
    const visibleDuration = isRecording
      ? liveDurationMillis
      : recordedDurationMillis;

    const progress = Math.min(
      visibleDuration / 60_000,
      1,
    );

    const startPosition = 17;
    const availableTravel = 293;

    return (
      startPosition +
      availableTravel * progress
    );
  }, [
    isRecording,
    liveDurationMillis,
    recordedDurationMillis,
  ]);

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    const timer = setInterval(() => {
      const startedAt =
        recordingStartedAtRef.current;

      if (!startedAt) {
        return;
      }

      setLiveDurationMillis(
        Date.now() - startedAt,
      );
    }, 100);

    return () => {
      clearInterval(timer);
    };
  }, [isRecording]);

  /*
   * Stop any unfinished native recording when the screen unmounts.
   * State updates are avoided after unmount through screenMountedRef.
   */
  useEffect(() => {
    screenMountedRef.current = true;

    return () => {
      screenMountedRef.current = false;

      const recordingWasActive =
        isRecordingRef.current;

      isRecordingRef.current = false;
      recordingStartedAtRef.current = null;

      if (recordingWasActive) {
        void audioRecorder
          .stop()
          .catch((cleanupError) => {
            console.warn(
              "Unable to stop recording during cleanup:",
              cleanupError,
            );
          });
      }

      void setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      }).catch((audioModeError) => {
        console.warn(
          "Unable to reset audio mode:",
          audioModeError,
        );
      });
    };
  }, [audioRecorder]);

  async function ensureMicrophonePermission(): Promise<boolean> {
    const currentPermission =
      await getRecordingPermissionsAsync();

    if (currentPermission.granted) {
      return true;
    }

    const requestedPermission =
      await requestRecordingPermissionsAsync();

    return requestedPermission.granted;
  }

  async function removeFileIfPresent(
    uri: string | null,
  ): Promise<void> {
    if (!uri) {
      return;
    }

    await FileSystem.deleteAsync(uri, {
      idempotent: true,
    });
  }

  /*
   * Stops the native recorder and returns the temporary file URI.
   * Local state is changed before awaiting stop() so a second press
   * cannot start another stop operation.
   */
  async function stopRecording(): Promise<
    string | null
  > {
    if (!isRecordingRef.current) {
      return recordedUri;
    }

    const startedAt =
      recordingStartedAtRef.current;

    const finalDuration = startedAt
      ? Date.now() - startedAt
      : liveDurationMillis;

    isRecordingRef.current = false;
    recordingStartedAtRef.current = null;

    if (screenMountedRef.current) {
      setIsRecording(false);
      setLiveDurationMillis(
        finalDuration,
      );
      setRecordedDurationMillis(
        finalDuration,
      );
    }

    await audioRecorder.stop();

    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
    });

    /*
     * expo-audio exposes the completed file after stop() resolves.
     * Reading it earlier may return no URI.
     */
    const uri = audioRecorder.uri;

    if (!uri) {
      throw new Error(
        "The recording did not create a local file.",
      );
    }

    if (screenMountedRef.current) {
      setRecordedUri(uri);
    }

    return uri;
  }

  async function startRecording(): Promise<void> {
    const permissionGranted =
      await ensureMicrophonePermission();

    if (!permissionGranted) {
      setError(
        "Microphone access is needed to record your answer. Please allow it in your phone settings.",
      );

      return;
    }

    /*
     * Only one temporary answer is kept. Starting again replaces the
     * previous recording instead of leaving unused files behind.
     */
    await removeFileIfPresent(
      recordedUri,
    );

    setRecordedUri(null);
    setRecordedDurationMillis(0);
    setLiveDurationMillis(0);

    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    });

    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();

    const startedAt = Date.now();

    recordingStartedAtRef.current =
      startedAt;

    isRecordingRef.current = true;

    setIsRecording(true);
  }

  async function handleMicrophonePress() {
    if (busy) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      if (isRecordingRef.current) {
        await stopRecording();
      } else {
        await startRecording();
      }
    } catch (recordingError) {
      console.error(
        "Unable to update recording:",
        recordingError,
      );

      isRecordingRef.current = false;
      recordingStartedAtRef.current =
        null;

      setIsRecording(false);

      setError(
        "We couldn’t use the microphone. Please try again.",
      );

      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      }).catch(() => undefined);
    } finally {
      if (screenMountedRef.current) {
        setBusy(false);
      }
    }
  }

  async function handleDeleteRecording() {
    if (busy) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      let uriToDelete = recordedUri;

      /*
       * An active recording must be stopped before its file can be
       * deleted safely.
       */
      if (isRecordingRef.current) {
        uriToDelete =
          await stopRecording();
      }

      await removeFileIfPresent(
        uriToDelete,
      );

      setRecordedUri(null);
      setRecordedDurationMillis(0);
      setLiveDurationMillis(0);
    } catch (deleteError) {
      console.error(
        "Unable to delete recording:",
        deleteError,
      );

      setError(
        "We couldn’t delete the recording. Please try again.",
      );
    } finally {
      if (screenMountedRef.current) {
        setBusy(false);
      }
    }
  }

  /*
   * Copies the temporary expo-audio file into the app's documents
   * directory. A child has one saved answer per emotion and local date;
   * saving again replaces the existing file.
   */
  async function saveRecordingLocally(
    sourceUri: string,
  ): Promise<string> {
    if (!FileSystem.documentDirectory) {
      throw new Error(
        "The local documents directory is unavailable.",
      );
    }

    const recordingsDirectory =
      FileSystem.documentDirectory +
      `${RECORDINGS_DIRECTORY_NAME}/`;

    await FileSystem.makeDirectoryAsync(
      recordingsDirectory,
      {
        intermediates: true,
      },
    );

    const extension =
      getFileExtension(sourceUri);

    const childFilePart =
      safeFilePart(
        childId ?? "child",
      );

    const emotionFilePart =
      safeFilePart(
        emotionId ?? "emotion",
      );

    const targetUri =
      recordingsDirectory +
      `${childFilePart}_${getLocalDateKey()}_${emotionFilePart}${extension}`;

    await FileSystem.deleteAsync(
      targetUri,
      {
        idempotent: true,
      },
    );

    await FileSystem.copyAsync({
      from: sourceUri,
      to: targetUri,
    });

    if (sourceUri !== targetUri) {
      await FileSystem.deleteAsync(
        sourceUri,
        {
          idempotent: true,
        },
      );
    }

    return targetUri;
  }

  async function handleSaveAndContinue() {
    if (busy) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const uri =
        isRecordingRef.current
          ? await stopRecording()
          : recordedUri;

      if (!uri) {
        setError(
          "Please record your answer first.",
        );

        return;
      }

      const savedUri =
        await saveRecordingLocally(uri);

      console.log(
        "Recording answer saved locally:",
        savedUri,
      );

      router.replace(
        "/child-dashboard" as Href,
      );
    } catch (saveError) {
      console.error(
        "Unable to save recording:",
        saveError,
      );

      setError(
        "We couldn’t save your recording. Please try again.",
      );
    } finally {
      if (screenMountedRef.current) {
        setBusy(false);
      }
    }
  }

  /*
   * Recordings that have not been saved are temporary. Remove them when
   * the child leaves through Back or Let's Play Games.
   */
  async function leaveForRoute(
    href: Href,
  ): Promise<void> {
    if (busy) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      let temporaryUri = recordedUri;

      if (isRecordingRef.current) {
        temporaryUri =
          await stopRecording();
      }

      await removeFileIfPresent(
        temporaryUri,
      );

      router.replace(href);
    } catch (navigationError) {
      console.error(
        "Unable to leave recording screen:",
        navigationError,
      );

      if (screenMountedRef.current) {
        setError(
          "Something went wrong. Please try again.",
        );

        setBusy(false);
      }
    }
  }

  function handleBack() {
    if (!emotionId) {
      void leaveForRoute(
        "/child-dashboard" as Href,
      );

      return;
    }

    void leaveForRoute({
      pathname:
        "/emotion-encouragement",
      params: {
        emotion: emotionId,
        ...(childId
          ? { childId }
          : {}),
      },
    } as Href);
  }

  if (!emotionId) {
    return (
      <View style={styles.invalidScreen}>
        <ErrorMessage message="This emotion could not be found." />

        <Pressable
          style={styles.fallbackButton}
          onPress={() =>
            router.replace(
              "/child-dashboard" as Href,
            )
          }
          accessibilityRole="button"
          accessibilityLabel="Back to Home"
        >
          <Text
            style={
              styles.fallbackButtonText
            }
          >
            Back to Home
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.scrollContent
      }
      showsVerticalScrollIndicator={false}
      bounces={false}
      alwaysBounceVertical={false}
      overScrollMode="never"
    >
      <View style={styles.figmaFrame}>
        <Pressable
          style={styles.backButton}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          disabled={busy}
        >
          <BackIcon
            width={x(37.24)}
            height={y(22.18)}
          />
        </Pressable>

        <Pressable
          style={styles.audioButton}
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
          disabled={busy}
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

        <View
          style={
            styles.emotionImageClip
          }
        >
          <Image
            source={getEmotionImage(
              emotionId,
            )}
            style={styles.emotionImage}
            resizeMode="cover"
            fadeDuration={0}
          />
        </View>

        <Text
          style={styles.emotionLabel}
          numberOfLines={1}
        >
          {emotionId
            .charAt(0)
            .toUpperCase() +
            emotionId.slice(1)}
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.microphoneButton,
            pressed &&
              styles.controlPressed,
          ]}
          onPress={() =>
            void handleMicrophonePress()
          }
          accessibilityRole="button"
          accessibilityLabel={
            isRecording
              ? "Stop recording"
              : "Start recording"
          }
          accessibilityState={{
            selected: isRecording,
            disabled: busy,
          }}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />
          ) : isRecording ? (
            <RecordingMicrophoneOnIcon
              width={x(54)}
              height={y(77.9)}
            />
          ) : (
            <RecordingMicrophoneOffIcon
              width={x(54)}
              height={y(77.9)}
            />
          )}
        </Pressable>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressIndicator,
              {
                left: x(
                  progressPosition,
                ),
              },
              isRecording &&
                styles.recordingIndicator,
              hasRecording &&
                !isRecording &&
                styles.completedIndicator,
            ]}
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.trashButton,
            pressed &&
              styles.controlPressed,
          ]}
          onPress={() =>
            void handleDeleteRecording()
          }
          accessibilityRole="button"
          accessibilityLabel="Delete recording"
          accessibilityState={{
            disabled:
              busy ||
              (!hasRecording &&
                !isRecording),
          }}
          hitSlop={10}
          disabled={
            busy ||
            (!hasRecording &&
              !isRecording)
          }
        >
          <TrashIcon
            width={x(29)}
            height={x(29)}
            opacity={
              hasRecording ||
              isRecording
                ? 1
                : 0.45
            }
          />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed &&
              styles.buttonPressed,
            busy &&
              styles.buttonDisabled,
          ]}
          onPress={() =>
            void handleSaveAndContinue()
          }
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Save and earn points"
          accessibilityState={{
            disabled: busy,
          }}
        >
          <Text style={styles.buttonText}>
            Save &amp; Earn Points
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed &&
              styles.buttonPressed,
            busy &&
              styles.buttonDisabled,
          ]}
          onPress={() =>
            void leaveForRoute(
              "/child-dashboard" as Href,
            )
          }
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Let's play games"
          accessibilityState={{
            disabled: busy,
          }}
        >
          <Text style={styles.buttonText}>
            Let’s Play Games
          </Text>
        </Pressable>

        <ErrorMessage
          message={error}
          style={styles.error}
        />
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
    minHeight: y(
      FIGMA_FRAME_HEIGHT,
    ),
    backgroundColor: colors.background,
  },

  figmaFrame: {
    position: "relative",
    width: "100%",
    height: y(
      FIGMA_FRAME_HEIGHT,
    ),
    backgroundColor: colors.background,
  },

  backButton: {
    position: "absolute",
    left: x(20),
    top: y(48),
    width: x(37.24),
    height: y(35),
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

  microphoneButton: {
    position: "absolute",
    left: x(174),
    top: y(442),
    width: x(54),
    height: y(77.9),
    alignItems: "center",
    justifyContent: "center",
  },

  progressBar: {
    position: "absolute",
    left: x(20),
    top: y(536),
    width: x(362),
    height: y(52),
    borderRadius: x(100),
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.background,
    justifyContent: "center",
  },

  progressIndicator: {
    position: "absolute",
    top: y(9.5),
    width: x(33),
    height: x(33),
    borderRadius: x(5),
    backgroundColor: colors.primary,
  },

  recordingIndicator: {
    opacity: 1,
  },

  completedIndicator: {
    opacity: 0.82,
  },

  trashButton: {
    position: "absolute",
    left: x(39),
    top: y(596),
    width: x(29),
    height: x(29),
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButton: {
    position: "absolute",
    left: x(96),
    top: y(676),
    width: x(210),
    height: y(52),
    borderRadius: x(20),
    backgroundColor: "#E6D8EB",
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

  secondaryButton: {
    position: "absolute",
    left: x(96),
    top: y(752),
    width: x(210),
    height: y(52),
    borderRadius: x(20),
    backgroundColor: "#E6D8EB",
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

  buttonText: {
    width: x(194),
    color: colors.primary,
    fontFamily: "Quiche",
    fontSize: x(20),
    lineHeight: y(26),
    textAlign: "center",
  },

  buttonPressed: {
    opacity: 0.82,
  },

  buttonDisabled: {
    opacity: 0.62,
  },

  controlPressed: {
    opacity: 0.7,
  },

  error: {
    position: "absolute",
    left: x(20),
    top: y(820),
    width: x(362),
  },

  invalidScreen: {
    flex: 1,
    paddingHorizontal: x(20),
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  fallbackButton: {
    minWidth: x(170),
    minHeight: y(48),
    marginTop: y(22),
    paddingHorizontal: x(24),
    borderRadius: x(24),
    backgroundColor: "#E6D8EB",
    alignItems: "center",
    justifyContent: "center",
  },

  fallbackButtonText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(18),
  },
});