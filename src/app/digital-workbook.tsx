/**
 * Digital Confidence Workbook.
 *
 * Matches Figma Screen 8.0:
 * - three separate workbook pages
 * - page-specific prompts and drawings
 * - Figma brush, pencil and eraser assets
 * - real microphone recording
 * - locally saved audio for each workbook page
 * - selected tool indicated using a shadow
 * - fixed child-mode footer
 *
 * Save uploads audio to Firebase Storage and stores drawing JSON in
 * Firestore. Saving enough pages completes the Proud Moment activity.
 */

import {
  getRecordingPermissionsAsync,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import { router, type Href } from "expo-router";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, {
  Path as SvgPath,
  Polygon,
} from "react-native-svg";

import ErrorStateScreen from "@/components/ui/ErrorStateScreen";
import DigitalWorkbookAges9To10 from "@/components/workbook/DigitalWorkbookAges9To10";
import { colors } from "@/constants/colors";
import { useActiveChild } from "@/contexts/ActiveChildContext";
import { useAuth } from "@/contexts/AuthContext";
import { useParentAccess } from "@/contexts/ParentAccessContext";
import { useChildRewards } from "@/hooks/useChildRewards";
import { saveWorkbookPage } from "@/services/childMedia";
import { getChild } from "@/services/children";
import { x, y } from "@/utils/scaling";

import AudioOffIcon from "../../assets/icons/audio-off.svg";
import AudioOnIcon from "../../assets/icons/audio-on.svg";
import BadgeIcon from "../../assets/icons/certificate-badge.svg";
import DiamondIcon from "../../assets/icons/diamond.svg";
import HouseIcon from "../../assets/icons/house.svg";
import RecordingMicrophoneOffIcon from "../../assets/icons/recording-microphone-off.svg";
import RecordingMicrophoneOnIcon from "../../assets/icons/recording-microphone-on.svg";
import StarIcon from "../../assets/icons/star.svg";
import SaveStarIcon from "../../assets/icons/star-save.svg";
import WorkbookBrushIcon from "../../assets/icons/workbook-brush.svg";
import WorkbookDashboardIcon from "../../assets/icons/workbook-dashboard.svg";
import WorkbookEraserIcon from "../../assets/icons/workbook-eraser.svg";
import WorkbookPencilIcon from "../../assets/icons/workbook-pencil.svg";

const PAGE_BACKGROUND = "#F1F3F5";
const CANVAS_BACKGROUND = "#FFFFFF";

const FIGMA_FRAME_HEIGHT = 874;
const WORKBOOK_AUDIO_DIRECTORY = "workbook-audio";

const WORKBOOK_PAGES = [
  {
    id: "proud",
    prompt: '" What made you proud today? "',
  },
  {
    id: "hard",
    prompt: '" What was hard today? "',
  },
  {
    id: "learned",
    prompt: '" What did you learn? "',
  },
] as const;

const PAGE_COUNT = WORKBOOK_PAGES.length;

type DrawingTool =
  | "brush"
  | "pencil"
  | "eraser";

type DrawingPoint = {
  x: number;
  y: number;
};

type DrawingStroke = {
  id: string;
  color: string;
  width: number;
  points: DrawingPoint[];
};

type WorkbookDrawingPages =
  DrawingStroke[][];

type WorkbookAudioPages =
  Array<string | null>;

type WorkbookVariant =
  | "loading"
  | "error"
  | "drawing"
  | "ages-9-10";

function createEmptyDrawingPages(): WorkbookDrawingPages {
  return Array.from(
    { length: PAGE_COUNT },
    () => [],
  );
}

function createEmptyAudioPages(): WorkbookAudioPages {
  return Array.from(
    { length: PAGE_COUNT },
    () => null,
  );
}

function formatScore(value: number): string {
  return value.toString().padStart(2, "0");
}

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

  const extensionMatch =
    cleanUri.match(/\.[a-zA-Z0-9]+$/);

  return extensionMatch?.[0] ?? ".m4a";
}

function pointsToPath(
  points: DrawingPoint[],
): string {
  const firstPoint = points[0];

  if (!firstPoint) {
    return "";
  }

  const remainingPoints =
    points.slice(1);

  return [
    `M ${firstPoint.x} ${firstPoint.y}`,
    ...remainingPoints.map(
      (point) =>
        `L ${point.x} ${point.y}`,
    ),
  ].join(" ");
}

function getToolStrokeWidth(
  tool: DrawingTool,
): number {
  switch (tool) {
    case "brush":
      return 12;

    case "pencil":
      return 5;

    case "eraser":
      return 25;

    default:
      return 5;
  }
}

function ArrowIcon({
  direction,
}: {
  direction: "left" | "right";
}) {
  const points =
    direction === "left"
      ? "24,4 4,14 24,24"
      : "4,4 24,14 4,24";

  return (
    <Svg
      width={x(28)}
      height={x(28)}
      viewBox="0 0 28 28"
    >
      <Polygon
        points={points}
        fill={colors.primary}
      />
    </Svg>
  );
}

export default function DigitalWorkbookScreen() {
  const { user } = useAuth();

  const { activeChild } =
    useActiveChild();

  const { childModeActive } =
    useParentAccess();

  const rewards = useChildRewards(
    activeChild?.id,
  );

  const audioRecorder = useAudioRecorder(
    RecordingPresets.HIGH_QUALITY,
  );

  const activeStrokeIdRef =
    useRef<string | null>(null);

  const recordingPageRef =
    useRef<number | null>(null);

  const recordingActiveRef =
    useRef(false);

  const recordingBusyRef =
    useRef(false);

  const saveMessageTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );

  const [workbookVariant, setWorkbookVariant] =
    useState<WorkbookVariant>("loading");

  const [
    workbookReloadKey,
    setWorkbookReloadKey,
  ] = useState(0);

  const [audioEnabled, setAudioEnabled] =
    useState(false);

  const [activePage, setActivePage] =
    useState(0);

  const [selectedTool, setSelectedTool] =
    useState<DrawingTool>("brush");

  const [
    recordingActive,
    setRecordingActive,
  ] = useState(false);

  const [
    recordingBusy,
    setRecordingBusy,
  ] = useState(false);

  const [
    drawingPages,
    setDrawingPages,
  ] = useState<WorkbookDrawingPages>(
    createEmptyDrawingPages,
  );

  const [
    savedAudioUris,
    setSavedAudioUris,
  ] = useState<WorkbookAudioPages>(
    createEmptyAudioPages,
  );

  const [savedMessage, setSavedMessage] =
    useState(false);

  function retryWorkbookLoad() {
    setWorkbookReloadKey(
      (currentKey) => currentKey + 1,
    );
  }

  useEffect(() => {
    if (!childModeActive || !activeChild) {
      router.replace(
        "/parent-verification" as Href,
      );
    }
  }, [activeChild, childModeActive]);

  useEffect(() => {
    let stillMounted = true;

    async function resolveWorkbookVariant() {
      if (
        !childModeActive ||
        !activeChild ||
        !user?.uid
      ) {
        if (stillMounted) {
          setWorkbookVariant("drawing");
        }

        return;
      }

      setWorkbookVariant("loading");

      try {
        const child = await getChild(
          user.uid,
          activeChild.id,
        );

        if (!stillMounted) {
          return;
        }

        const childAge = Number(child?.age);

        const usesAges9To10Workbook =
          Number.isInteger(childAge) &&
          childAge >= 9 &&
          childAge <= 10;

        console.log(
          "Resolved workbook variant:",
          {
            childId: activeChild.id,
            storedAge: child?.age,
            normalizedAge: childAge,
            variant:
              usesAges9To10Workbook
                ? "ages-9-10"
                : "drawing",
          },
        );

        setWorkbookVariant(
          usesAges9To10Workbook
            ? "ages-9-10"
            : "drawing",
        );
      } catch (loadError) {
        console.error(
          "Unable to load child age for the workbook:",
          loadError,
        );

        if (stillMounted) {
          setWorkbookVariant("error");
        }
      }
    }

    void resolveWorkbookVariant();

    return () => {
      stillMounted = false;
    };
  }, [
    activeChild?.id,
    childModeActive,
    user?.uid,
    workbookReloadKey,
  ]);

  useEffect(() => {
    return () => {
      if (saveMessageTimerRef.current) {
        clearTimeout(
          saveMessageTimerRef.current,
        );
      }

      if (recordingActiveRef.current) {
        recordingActiveRef.current = false;

        void audioRecorder
          .stop()
          .catch((cleanupError) => {
            console.warn(
              "Unable to stop workbook recording during cleanup:",
              cleanupError,
            );
          });
      }

      void setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      }).catch((audioModeError) => {
        console.warn(
          "Unable to reset workbook audio mode:",
          audioModeError,
        );
      });
    };
  }, [audioRecorder]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder:
          () =>
            !recordingActive &&
            !recordingBusy,

        onMoveShouldSetPanResponder:
          () =>
            !recordingActive &&
            !recordingBusy,

        onPanResponderGrant: (event) => {
          if (
            recordingActive ||
            recordingBusy
          ) {
            return;
          }

          const point: DrawingPoint = {
            x: event.nativeEvent.locationX,
            y: event.nativeEvent.locationY,
          };

          const strokeId =
            `${Date.now()}-${Math.random()}`;

          const stroke: DrawingStroke = {
            id: strokeId,
            color:
              selectedTool === "eraser"
                ? CANVAS_BACKGROUND
                : colors.primary,
            width:
              getToolStrokeWidth(
                selectedTool,
              ),
            points: [point],
          };

          activeStrokeIdRef.current =
            strokeId;

          setDrawingPages(
            (currentPages) =>
              currentPages.map(
                (page, pageIndex) =>
                  pageIndex === activePage
                    ? [...page, stroke]
                    : page,
              ),
          );
        },

        onPanResponderMove: (event) => {
          const activeStrokeId =
            activeStrokeIdRef.current;

          if (
            !activeStrokeId ||
            recordingActive ||
            recordingBusy
          ) {
            return;
          }

          const point: DrawingPoint = {
            x: event.nativeEvent.locationX,
            y: event.nativeEvent.locationY,
          };

          setDrawingPages(
            (currentPages) =>
              currentPages.map(
                (page, pageIndex) => {
                  if (
                    pageIndex !== activePage
                  ) {
                    return page;
                  }

                  return page.map(
                    (stroke) =>
                      stroke.id ===
                      activeStrokeId
                        ? {
                            ...stroke,
                            points: [
                              ...stroke.points,
                              point,
                            ],
                          }
                        : stroke,
                  );
                },
              ),
          );
        },

        onPanResponderRelease: () => {
          activeStrokeIdRef.current =
            null;
        },

        onPanResponderTerminate: () => {
          activeStrokeIdRef.current =
            null;
        },
      }),
    [
      activePage,
      recordingActive,
      recordingBusy,
      selectedTool,
    ],
  );

  const currentWorkbookPage =
    WORKBOOK_PAGES[activePage] ??
    WORKBOOK_PAGES[0];

  const currentDrawingStrokes =
    drawingPages[activePage] ?? [];

  const currentPageHasSavedAudio =
    Boolean(savedAudioUris[activePage]);

  function setRecordingActiveValue(
    value: boolean,
  ) {
    recordingActiveRef.current = value;
    setRecordingActive(value);
  }

  function setRecordingBusyValue(
    value: boolean,
  ) {
    recordingBusyRef.current = value;
    setRecordingBusy(value);
  }

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

  async function saveRecordingLocally(
    sourceUri: string,
    pageIndex: number,
    childId: string,
  ): Promise<string> {
    if (!FileSystem.documentDirectory) {
      throw new Error(
        "The local documents directory is unavailable.",
      );
    }

    const workbookPage =
      WORKBOOK_PAGES[pageIndex] ??
      WORKBOOK_PAGES[0];

    const recordingDirectory =
      FileSystem.documentDirectory +
      `${WORKBOOK_AUDIO_DIRECTORY}/`;

    await FileSystem.makeDirectoryAsync(
      recordingDirectory,
      {
        intermediates: true,
      },
    );

    const extension =
      getFileExtension(sourceUri);

    const safeChildId =
      safeFilePart(childId);

    const safePageId =
      safeFilePart(workbookPage.id);

    const targetUri =
      recordingDirectory +
      `${safeChildId}_${getLocalDateKey()}_${safePageId}${extension}`;

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

  async function startRecording(): Promise<void> {
    if (
      recordingBusyRef.current ||
      recordingActiveRef.current
    ) {
      return;
    }

    setRecordingBusyValue(true);

    try {
      const permissionGranted =
        await ensureMicrophonePermission();

      if (!permissionGranted) {
        Alert.alert(
          "Microphone permission needed",
          "Please allow microphone access to record a workbook answer.",
        );
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await audioRecorder.prepareToRecordAsync();

      recordingPageRef.current =
        activePage;

      audioRecorder.record();

      setRecordingActiveValue(true);
    } catch (recordingError) {
      console.error(
        "Unable to start workbook recording:",
        recordingError,
      );

      recordingPageRef.current = null;
      setRecordingActiveValue(false);

      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      }).catch(() => undefined);

      Alert.alert(
        "Recording error",
        "The microphone could not start. Please try again.",
      );
    } finally {
      setRecordingBusyValue(false);
    }
  }

  async function stopAndSaveRecording(): Promise<string | null> {
    if (!recordingActiveRef.current) {
      const pageIndex =
        recordingPageRef.current ??
        activePage;

      return (
        savedAudioUris[pageIndex] ??
        null
      );
    }

    if (recordingBusyRef.current) {
      return null;
    }

    setRecordingBusyValue(true);

    const recordingPage =
      recordingPageRef.current ??
      activePage;

    setRecordingActiveValue(false);

    try {
      await audioRecorder.stop();

      const sourceUri =
        audioRecorder.uri;

      if (!sourceUri) {
        throw new Error(
          "The recording did not create a local file.",
        );
      }

      const childId =
        activeChild?.id;

      if (!childId) {
        throw new Error(
          "No active child was found.",
        );
      }

      const savedUri =
        await saveRecordingLocally(
          sourceUri,
          recordingPage,
          childId,
        );

      setSavedAudioUris(
        (currentAudioUris) =>
          currentAudioUris.map(
            (uri, pageIndex) =>
              pageIndex === recordingPage
                ? savedUri
                : uri,
          ),
      );

      console.log(
        "Workbook audio saved locally:",
        {
          childId,
          page:
            WORKBOOK_PAGES[
              recordingPage
            ]?.id,
          uri: savedUri,
        },
      );

      return savedUri;
    } catch (recordingError) {
      console.error(
        "Unable to stop or save workbook recording:",
        recordingError,
      );

      Alert.alert(
        "Recording error",
        "Your recording could not be saved. Please try again.",
      );

      return null;
    } finally {
      recordingPageRef.current = null;

      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      }).catch(() => undefined);

      setRecordingBusyValue(false);
    }
  }

  async function handleMicrophonePress(): Promise<void> {
    if (recordingBusyRef.current) {
      return;
    }

    if (recordingActiveRef.current) {
      await stopAndSaveRecording();
      return;
    }

    await startRecording();
  }

  function selectDrawingTool(
    tool: DrawingTool,
  ) {
    if (
      recordingActiveRef.current ||
      recordingBusyRef.current
    ) {
      return;
    }

    activeStrokeIdRef.current = null;
    setSelectedTool(tool);
  }

  async function openWorkbookPage(
    pageIndex: number,
  ): Promise<void> {
    if (
      recordingBusyRef.current ||
      pageIndex === activePage
    ) {
      return;
    }

    if (recordingActiveRef.current) {
      await stopAndSaveRecording();
    }

    activeStrokeIdRef.current = null;
    setActivePage(pageIndex);
  }

  async function handlePreviousPage(): Promise<void> {
    const previousPage =
      activePage === 0
        ? PAGE_COUNT - 1
        : activePage - 1;

    await openWorkbookPage(previousPage);
  }

  async function handleNextPage(): Promise<void> {
    const nextPage =
      activePage === PAGE_COUNT - 1
        ? 0
        : activePage + 1;

    await openWorkbookPage(nextPage);
  }

  /**
   * Saves drawing (+ optional local audio) to Firebase for this page.
   */
  async function handleSaveDrawing(): Promise<void> {
    if (!user?.uid || !activeChild?.id) {
      setSavedMessage(true);
      return;
    }

    try {
      await saveWorkbookPage(
        user.uid,
        activeChild.id,
        {
          pageIndex: activePage,
          pageId: currentWorkbookPage.id,
          audioLocalUri:
            savedAudioUris[activePage] ?? null,
          drawingPayload: JSON.stringify(
            drawingPages[activePage] ?? [],
          ),
          tryCompleteProudMoment: true,
          requiredPageCount: PAGE_COUNT,
        },
      );

      console.log("Workbook page saved:", {
        childId: activeChild.id,
        pageId: currentWorkbookPage.id,
      });
    } catch (saveError) {
      console.error(
        "Unable to save workbook page:",
        saveError,
      );
      Alert.alert(
        "Save failed",
        "Your drawing is still on this device, but cloud save failed. Please try again.",
      );
    }

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

  async function leaveForRoute(
    href: Href,
  ): Promise<void> {
    if (recordingBusyRef.current) {
      return;
    }

    if (recordingActiveRef.current) {
      await stopAndSaveRecording();
    }

    router.replace(href);
  }

  async function handleParentMode(): Promise<void> {
    if (recordingBusyRef.current) {
      return;
    }

    if (recordingActiveRef.current) {
      await stopAndSaveRecording();
    }

    router.push(
      "/parent-verification" as Href,
    );
  }

  if (!childModeActive || !activeChild) {
    return null;
  }

  if (workbookVariant === "loading") {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.loadingText}>
          Loading workbook...
        </Text>
      </View>
    );
  }

  if (workbookVariant === "error") {
    return (
      <ErrorStateScreen
        activeTab="workbook"
        onRetry={retryWorkbookLoad}
      />
    );
  }

  if (workbookVariant === "ages-9-10") {
    return (
      <DigitalWorkbookAges9To10
        stars={rewards.stars}
        gems={rewards.gems}
        badgeCount={rewards.badges.length}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
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

          <View style={styles.statistics}>
            <StarIcon
              width={x(32)}
              height={x(32)}
            />

            <Text style={styles.statText}>
              {rewards.stars}
            </Text>

            <DiamondIcon
              width={x(20)}
              height={x(20)}
            />

            <Text style={styles.statText}>
              {formatScore(
                rewards.gems,
              )}
            </Text>

            <BadgeIcon
              width={x(28)}
              height={x(28)}
            />

            <Text style={styles.statText}>
              {formatScore(
                rewards.badges.length,
              )}
            </Text>
          </View>

          <Text style={styles.title}>
            Digital Workbook
          </Text>

          <Text style={styles.prompt}>
            {currentWorkbookPage.prompt}
          </Text>

          <View
            style={styles.canvas}
            {...panResponder.panHandlers}
          >
            <Svg
              width="100%"
              height="100%"
              style={StyleSheet.absoluteFill}
            >
              {currentDrawingStrokes.map(
                (stroke) => (
                  <SvgPath
                    key={stroke.id}
                    d={pointsToPath(
                      stroke.points,
                    )}
                    fill="none"
                    stroke={stroke.color}
                    strokeWidth={
                      stroke.width
                    }
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ),
              )}
            </Svg>
          </View>

          <Pressable
            style={styles.leftArrow}
            onPress={() =>
              void handlePreviousPage()
            }
            accessibilityRole="button"
            accessibilityLabel="Previous workbook page"
            hitSlop={8}
            disabled={recordingBusy}
          >
            <ArrowIcon direction="left" />
          </Pressable>

          <Pressable
            style={styles.rightArrow}
            onPress={() =>
              void handleNextPage()
            }
            accessibilityRole="button"
            accessibilityLabel="Next workbook page"
            hitSlop={8}
            disabled={recordingBusy}
          >
            <ArrowIcon direction="right" />
          </Pressable>

          <View style={styles.toolRow}>
            <Pressable
              style={({ pressed }) => [
                styles.toolButton,
                selectedTool === "brush" &&
                  !recordingActive &&
                  styles.selectedToolButton,
                pressed &&
                  styles.toolButtonPressed,
              ]}
              onPress={() =>
                selectDrawingTool("brush")
              }
              accessibilityRole="button"
              accessibilityLabel="Brush"
              accessibilityState={{
                selected:
                  selectedTool === "brush" &&
                  !recordingActive,
                disabled:
                  recordingActive ||
                  recordingBusy,
              }}
              disabled={
                recordingActive ||
                recordingBusy
              }
            >
              <WorkbookBrushIcon
                width={x(50)}
                height={x(50)}
              />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.toolButton,
                selectedTool === "pencil" &&
                  !recordingActive &&
                  styles.selectedToolButton,
                pressed &&
                  styles.toolButtonPressed,
              ]}
              onPress={() =>
                selectDrawingTool("pencil")
              }
              accessibilityRole="button"
              accessibilityLabel="Pencil"
              accessibilityState={{
                selected:
                  selectedTool === "pencil" &&
                  !recordingActive,
                disabled:
                  recordingActive ||
                  recordingBusy,
              }}
              disabled={
                recordingActive ||
                recordingBusy
              }
            >
              <WorkbookPencilIcon
                width={x(50)}
                height={x(50)}
              />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.toolButton,
                selectedTool === "eraser" &&
                  !recordingActive &&
                  styles.selectedToolButton,
                pressed &&
                  styles.toolButtonPressed,
              ]}
              onPress={() =>
                selectDrawingTool("eraser")
              }
              accessibilityRole="button"
              accessibilityLabel="Eraser"
              accessibilityState={{
                selected:
                  selectedTool === "eraser" &&
                  !recordingActive,
                disabled:
                  recordingActive ||
                  recordingBusy,
              }}
              disabled={
                recordingActive ||
                recordingBusy
              }
            >
              <WorkbookEraserIcon
                width={x(50)}
                height={x(50)}
              />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.microphoneButton,
                recordingActive &&
                  styles.selectedToolButton,
                pressed &&
                  styles.toolButtonPressed,
                recordingBusy &&
                  styles.toolButtonBusy,
              ]}
              onPress={() =>
                void handleMicrophonePress()
              }
              accessibilityRole="button"
              accessibilityLabel={
                recordingActive
                  ? "Stop and save recording"
                  : currentPageHasSavedAudio
                    ? "Replace saved recording"
                    : "Start recording"
              }
              accessibilityState={{
                selected:
                  recordingActive,
                disabled:
                  recordingBusy,
              }}
              disabled={recordingBusy}
            >
              {recordingActive ? (
                <RecordingMicrophoneOnIcon
                  width={x(46)}
                  height={x(46)}
                />
              ) : (
                <RecordingMicrophoneOffIcon
                  width={x(46)}
                  height={x(46)}
                />
              )}
            </Pressable>
          </View>

          <View style={styles.pageIndicators}>
            {WORKBOOK_PAGES.map(
              (page, pageIndex) => {
                const selected =
                  activePage === pageIndex;

                return (
                  <Pressable
                    key={page.id}
                    style={[
                      styles.pageIndicator,
                      selected
                        ? styles.activePageIndicator
                        : styles.inactivePageIndicator,
                    ]}
                    onPress={() =>
                      void openWorkbookPage(
                        pageIndex,
                      )
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Open workbook page ${
                      pageIndex + 1
                    }`}
                    accessibilityState={{
                      selected,
                      disabled:
                        recordingBusy,
                    }}
                    disabled={recordingBusy}
                    hitSlop={6}
                  />
                );
              },
            )}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed &&
                styles.saveButtonPressed,
            ]}
            onPress={() => {
              void handleSaveDrawing();
            }}
            accessibilityRole="button"
            accessibilityLabel="Save workbook drawing and earn a star"
          >
            <Text style={styles.saveButtonText}>
              {savedMessage
                ? "Saved"
                : "Save &"}
            </Text>

            <SaveStarIcon
              width={x(23)}
              height={x(23)}
            />
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.fixedFooter}>
        <Pressable
          style={styles.parentModeLink}
          onPress={() =>
            void handleParentMode()
          }
          accessibilityRole="button"
          accessibilityLabel="Switch to Parent Mode"
          disabled={recordingBusy}
        >
          <Text style={styles.parentModeText}>
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
              void leaveForRoute(
                "/child-dashboard" as Href,
              )
            }
            accessibilityRole="button"
            accessibilityLabel="Home"
            disabled={recordingBusy}
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
              void leaveForRoute(
                "/rewards" as Href,
              )
            }
            accessibilityRole="button"
            accessibilityLabel="Rewards"
            disabled={recordingBusy}
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
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PAGE_BACKGROUND,
  },

  loadingText: {
    marginTop: y(14),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(17),
    lineHeight: y(24),
  },

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

  figmaFrame: {
    width: "100%",
    height: y(FIGMA_FRAME_HEIGHT),
    position: "relative",
    backgroundColor: PAGE_BACKGROUND,
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

  statistics: {
    position: "absolute",
    left: x(13),
    top: y(75),
    width: x(230),
    height: y(32),
    flexDirection: "row",
    alignItems: "center",
    columnGap: x(8),
  },

  statText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    marginRight: x(6),
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

  prompt: {
    position: "absolute",
    left: x(20),
    top: y(173),
    width: x(362),
    minHeight: y(28),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textAlign: "center",
  },

  canvas: {
    position: "absolute",
    left: x(58),
    top: y(220),
    width: x(286),
    height: y(343),
    borderRadius: x(20),
    overflow: "hidden",
    backgroundColor: CANVAS_BACKGROUND,
  },

  leftArrow: {
    position: "absolute",
    left: x(20),
    top: y(375),
    width: x(28),
    height: x(28),
    alignItems: "center",
    justifyContent: "center",
  },

  rightArrow: {
    position: "absolute",
    left: x(354),
    top: y(375),
    width: x(28),
    height: x(28),
    alignItems: "center",
    justifyContent: "center",
  },

  toolRow: {
    position: "absolute",
    left: x(53),
    top: y(585),
    width: x(306),
    height: y(56),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  toolButton: {
    width: x(56),
    height: x(56),
    borderRadius: x(12),
    alignItems: "center",
    justifyContent: "center",
  },

  microphoneButton: {
    width: x(56),
    height: x(56),
    borderRadius: x(12),
    alignItems: "center",
    justifyContent: "center",
  },

  selectedToolButton: {
    backgroundColor: PAGE_BACKGROUND,

    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.38,
    shadowRadius: x(5),

    elevation: 8,
    zIndex: 5,
  },

  toolButtonPressed: {
    opacity: 0.65,
  },

  toolButtonBusy: {
    opacity: 0.55,
  },

  pageIndicators: {
    position: "absolute",
    left: x(141),
    top: y(655),
    width: x(120),
    height: y(22),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  pageIndicator: {
    height: y(22),
  },

  activePageIndicator: {
    width: x(44),
    borderRadius: x(12),
    backgroundColor: colors.primary,
  },

  inactivePageIndicator: {
    width: x(22),
    borderRadius: x(11),
    backgroundColor: "#D9D9D9",
  },

  saveButton: {
    position: "absolute",
    left: x(249),
    top: y(690),
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

  navLabel: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(10),
    lineHeight: y(12),
    marginTop: y(1),
    textAlign: "center",
  },
});