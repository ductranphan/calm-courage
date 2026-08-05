/**
 * Parent Dashboard screen.
 *
 * Displays the selected child's real Firebase profile,
 * emotion check-in, activity progress, and evening prompt.
 *
 * Parents with multiple children can press "Next" to cycle
 * through each child's dashboard.
 *
 * The "Switch to Child Mode" link and parent navbar remain
 * fixed at the bottom of the screen.
 */

import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Image,
  type LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import InsightPromptCard from "@/components/dashboard/InsightPromptCard";
import ParentBottomNav from "@/components/dashboard/ParentBottomNav";
import ProgressBar from "@/components/dashboard/ProgressBar";
import AppButton from "@/components/ui/AppButton";
import {
  avatarImages,
  normalizeAvatarId,
  type AvatarId,
} from "@/constants/avatars";
import { colors } from "@/constants/colors";
import { getEmotionImage } from "@/constants/emotions";
import { useActiveChild } from "@/contexts/ActiveChildContext";
import { useAuth } from "@/contexts/AuthContext";
import { useParentDashboardData } from "@/hooks/useParentDashboardData";
import { listChildren } from "@/services/children";
import { x, y } from "@/utils/scaling";

import AudioOffIcon from "../../assets/icons/audio-off.svg";
import AudioOnIcon from "../../assets/icons/audio-on.svg";

const PROMPT_CARD_TOP = 666;
const DEFAULT_PROMPT_CARD_HEIGHT = 271;
const CONTENT_BOTTOM_GAP = 20;

const FIXED_FOOTER_HEIGHT = 105;
const FOOTER_BOTTOM = 20;
const FOOTER_SCROLL_SPACE = 125;

type DashboardChild = {
  id: string;
  name: string;
  age: number;
  avatarId: AvatarId;
};

export default function ParentDashboardScreen() {
  const { user } = useAuth();

  const {
    activeChild,
    selectActiveChild,
  } = useActiveChild();

  const { childId, mood } =
    useLocalSearchParams<{
      childId?: string;
      mood?: string;
    }>();

  const [
    selectedChildId,
    setSelectedChildId,
  ] = useState<string | null>(
    childId ?? activeChild?.id ?? null,
  );

  const [children, setChildren] =
    useState<DashboardChild[]>([]);

  const [
    childrenLoading,
    setChildrenLoading,
  ] = useState(true);

  const [
    childrenError,
    setChildrenError,
  ] = useState<string | null>(null);

  const [
    audioEnabled,
    setAudioEnabled,
  ] = useState(false);

  const [
    promptCardHeight,
    setPromptCardHeight,
  ] = useState(
    y(DEFAULT_PROMPT_CARD_HEIGHT),
  );

  const dashboardData =
    useParentDashboardData({
      childId:
        selectedChildId ??
        childId,
      moodOverride: mood,
    });

  /*
   * When navigation provides a childId, display that
   * child on the dashboard.
   */
  useEffect(() => {
    if (childId) {
      setSelectedChildId(childId);
    }
  }, [childId]);

  /*
   * Reload all child profiles whenever the screen
   * receives focus.
   */
  useFocusEffect(
    useCallback(() => {
      let stillMounted = true;

      async function loadParentChildren() {
        setChildrenError(null);

        if (!user?.uid) {
          if (stillMounted) {
            setChildren([]);
            setChildrenLoading(false);
          }

          return;
        }

        setChildrenLoading(true);

        try {
          const loadedChildren =
            await listChildren(user.uid);

          const normalizedChildren: DashboardChild[] =
            loadedChildren.map(
              (child) => ({
                id: child.id,
                name: child.name,
                age: child.age,
                avatarId:
                  normalizeAvatarId(
                    child.avatarId,
                  ),
              }),
            );

          if (!stillMounted) {
            return;
          }

          setChildren(
            normalizedChildren,
          );

          if (
            normalizedChildren.length ===
            0
          ) {
            setSelectedChildId(null);
            return;
          }

          /*
           * This state updater now only returns the next
           * selected ID. It does not update another context.
           */
          setSelectedChildId(
            (currentChildId) => {
              const currentChildExists =
                Boolean(
                  currentChildId &&
                    normalizedChildren.some(
                      (child) =>
                        child.id ===
                        currentChildId,
                    ),
                );

              if (
                currentChildExists &&
                currentChildId
              ) {
                return currentChildId;
              }

              const routeChild =
                childId
                  ? normalizedChildren.find(
                      (child) =>
                        child.id ===
                        childId,
                    )
                  : undefined;

              return (
                routeChild?.id ??
                normalizedChildren[0].id
              );
            },
          );
        } catch (loadError) {
          console.error(
            "Unable to load children for parent dashboard:",
            loadError,
          );

          if (stillMounted) {
            setChildren([]);

            setChildrenError(
              "We couldn’t load the child profiles.",
            );
          }
        } finally {
          if (stillMounted) {
            setChildrenLoading(false);
          }
        }
      }

      void loadParentChildren();

      return () => {
        stillMounted = false;
      };
    }, [user?.uid, childId]),
  );

  const selectedChild =
    useMemo(
      () =>
        children.find(
          (child) =>
            child.id ===
            selectedChildId,
        ) ?? null,
      [
        children,
        selectedChildId,
      ],
    );

  useEffect(() => {
    if (!selectedChild) {
      return;
    }

    const selectionAlreadyMatches =
      activeChild?.id ===
        selectedChild.id &&
      activeChild?.name ===
        selectedChild.name &&
      activeChild?.avatarId ===
        selectedChild.avatarId;

    if (selectionAlreadyMatches) {
      return;
    }

    selectActiveChild({
      id: selectedChild.id,
      name: selectedChild.name,
      avatarId:
        selectedChild.avatarId,
    });
  }, [
    selectedChild,
    activeChild?.id,
    activeChild?.name,
    activeChild?.avatarId,
    selectActiveChild,
  ]);

  const selectedChildIndex =
    useMemo(
      () =>
        children.findIndex(
          (child) =>
            child.id ===
            selectedChildId,
        ),
      [
        children,
        selectedChildId,
      ],
    );

  const contentHeight =
    useMemo(
      () =>
        y(PROMPT_CARD_TOP) +
        promptCardHeight +
        y(CONTENT_BOTTOM_GAP),
      [promptCardHeight],
    );

  function handlePromptCardLayout(
    event: LayoutChangeEvent,
  ) {
    const measuredHeight =
      event.nativeEvent.layout.height;

    if (
      measuredHeight > 0 &&
      Math.abs(
        measuredHeight -
          promptCardHeight,
      ) > 0.5
    ) {
      setPromptCardHeight(
        measuredHeight,
      );
    }
  }

  function handleNextChild() {
    if (children.length <= 1) {
      return;
    }

    const currentIndex =
      selectedChildIndex >= 0
        ? selectedChildIndex
        : 0;

    const nextIndex =
      (currentIndex + 1) %
      children.length;

    setSelectedChildId(
      children[nextIndex].id,
    );
  }

  function handleSwitchToChildMode() {
    const currentChild =
      selectedChild ??
      (dashboardData.childId &&
      dashboardData.childName &&
      dashboardData.avatarId
        ? {
            id: dashboardData.childId,
            name:
              dashboardData.childName,
            avatarId:
              normalizeAvatarId(
                dashboardData.avatarId,
              ),
            age: 0,
          }
        : null);

    if (!currentChild) {
      return;
    }

    router.push({
      pathname: "/switch-to-child",
      params: {
        childId: currentChild.id,
        childName:
          currentChild.name,
        avatarId:
          currentChild.avatarId,
      },
    });
  }

  if (
    childrenLoading ||
    dashboardData.loading
  ) {
    return (
      <View style={styles.statusScreen}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.statusText}>
          Loading dashboard...
        </Text>
      </View>
    );
  }

  if (
    childrenError &&
    children.length === 0
  ) {
    return (
      <View style={styles.statusScreen}>
        <Text style={styles.statusTitle}>
          Unable to load dashboard
        </Text>

        <Text style={styles.statusText}>
          {childrenError}
        </Text>
      </View>
    );
  }

  if (dashboardData.error) {
    return (
      <View style={styles.statusScreen}>
        <Text style={styles.statusTitle}>
          Unable to load dashboard
        </Text>

        <Text style={styles.statusText}>
          {dashboardData.error}
        </Text>
      </View>
    );
  }

  if (
    dashboardData.empty ||
    !dashboardData.childId ||
    !dashboardData.childName ||
    !dashboardData.avatarId
  ) {
    return (
      <View style={styles.statusScreen}>
        <Text style={styles.statusTitle}>
          No child profile found
        </Text>

        <Text style={styles.statusText}>
          Add a child profile to view the
          parent dashboard.
        </Text>

        <Pressable
          onPress={() =>
            router.replace({
              pathname:
                "/child-profile-info",
              params: {
                source: "children",
              },
            })
          }
          accessibilityRole="button"
          accessibilityLabel="Add child profile"
        >
          <Text style={styles.statusLink}>
            Add Child Profile
          </Text>
        </Pressable>
      </View>
    );
  }

  const displayedChild =
    selectedChild ?? {
      id: dashboardData.childId,
      name:
        dashboardData.childName,
      age: 0,
      avatarId:
        normalizeAvatarId(
          dashboardData.avatarId,
        ),
    };

  const moodImage =
    dashboardData.todaysMood
      ? getEmotionImage(
          dashboardData.todaysMood,
        )
      : null;

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
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
        <View
          style={[
            styles.figmaFrame,
            {
              height: contentHeight,
            },
          ]}
        >
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
            Parent Dashboard
          </Text>

          <View
            style={styles.dividerTop}
          />

          <View
            style={styles.childSelector}
          >
            <View
              style={styles.avatarCard}
            >
              <Image
                source={
                  avatarImages[
                    displayedChild.avatarId
                  ]
                }
                style={styles.avatarImage}
                resizeMode="contain"
                fadeDuration={0}
              />
            </View>

            <View
              style={
                styles.childDetails
              }
            >
              <Text
                style={styles.childName}
                numberOfLines={1}
              >
                Name:{" "}
                {displayedChild.name}
              </Text>

              <Text style={styles.childAge}>
                Age:{" "}
                {displayedChild.age > 0
                  ? displayedChild.age
                  : "—"}
              </Text>
            </View>

            <View
              style={
                styles.nextButtonWrapper
              }
            >
              <AppButton
                title="Next"
                onPress={
                  handleNextChild
                }
                style={[
                  styles.nextButton,
                  children.length <= 1 &&
                    styles.nextButtonDisabled,
                ]}
              />
            </View>
          </View>

          <Text
            style={
              styles.progressReportTitle
            }
          >
            Emotion &amp; Activity
            Progress Report
          </Text>

          <Text style={styles.moodText}>
            Today&apos;s Mood:{" "}
            {dashboardData.todaysMood
              ? `"${dashboardData.moodLabel}"`
              : dashboardData.moodLabel}
          </Text>

          {moodImage ? (
            <View
              style={
                styles.moodImageWrapper
              }
            >
              <Image
                source={moodImage}
                style={styles.moodImage}
                resizeMode="contain"
                fadeDuration={0}
              />
            </View>
          ) : null}

          {dashboardData.progressAvailable ? (
            <>
              <View
                style={
                  styles.progressBarWrapper
                }
              >
                <ProgressBar
                  progress={
                    dashboardData.progressPercent
                  }
                />
              </View>

              <Text
                style={styles.phaseText}
              >
                {
                  dashboardData.progressLabel
                }
              </Text>

              <Text
                style={
                  styles.activitiesText
                }
              >
                {
                  dashboardData.activitiesLabel
                }
              </Text>

              <Text
                style={
                  styles.recentCompletionsLabel
                }
              >
                Recent:{" "}
                {
                  dashboardData.recentCompletionsLabel
                }
              </Text>
            </>
          ) : (
            <Text
              style={
                styles.progressUnavailableText
              }
            >
              Progress tracking is not
              available yet.
            </Text>
          )}

          <View
            style={styles.dividerMiddle}
          />

          <Text
            style={styles.promptTitle}
          >
            Evening Conversation Prompt
          </Text>

          <View
            style={
              styles.promptCardWrapper
            }
            onLayout={
              handlePromptCardLayout
            }
          >
            <InsightPromptCard
              childName={
                dashboardData.childName
              }
              moodLabel={
                dashboardData.moodLabel
              }
              hasMood={Boolean(
                dashboardData.todaysMood,
              )}
              onViewMore={() => {
                // Add the parent insights route later.
              }}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.fixedFooter}>
        <Pressable
          onPress={
            handleSwitchToChildMode
          }
          style={({ pressed }) => [
            styles.switchWrapper,
            pressed &&
              styles.controlPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Switch to ${displayedChild.name}'s child mode`}
        >
          <Text
            style={styles.switchText}
          >
            Switch to Child Mode
          </Text>
        </Pressable>

        <View
          style={styles.bottomNavWrapper}
        >
          <ParentBottomNav
            activeTab="dashboard"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: "relative",
    backgroundColor:
      colors.background,
  },

  scrollView: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  statusScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: x(30),
    backgroundColor:
      colors.background,
  },

  statusTitle: {
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(28),
    lineHeight: y(36),
    textAlign: "center",
  },

  statusText: {
    marginTop: y(16),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(18),
    lineHeight: y(26),
    textAlign: "center",
  },

  statusLink: {
    marginTop: y(24),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(26),
    textAlign: "center",
    textDecorationLine: "underline",
  },

  scrollContent: {
    paddingBottom: y(
      FOOTER_SCROLL_SPACE,
    ),
    backgroundColor:
      colors.background,
  },

  figmaFrame: {
    position: "relative",
    width: "100%",
    backgroundColor:
      colors.background,
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

  dividerTop: {
    position: "absolute",
    left: x(20),
    top: y(188),
    width: x(362),
    height:
      StyleSheet.hairlineWidth,
    backgroundColor: colors.primary,
  },

  childSelector: {
    position: "absolute",
    left: x(20),
    top: y(210),
    width: x(362),
    height: y(145),
  },

  avatarCard: {
    position: "absolute",
    left: 0,
    top: 0,
    width: x(138),
    height: y(138),
    borderRadius: x(20),
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  avatarImage: {
    width: x(138),
    height: y(138),
  },

  childDetails: {
    position: "absolute",
    left: x(153),
    top: y(43),
    width: x(132),
    minHeight: y(60),
    justifyContent: "center",
  },

  childName: {
    color: colors.primary,
    fontFamily: "LiterataBold",
    fontSize: x(20),
    lineHeight: y(28),
  },

  childAge: {
    color: colors.primary,
    fontFamily: "LiterataBold",
    fontSize: x(20),
    lineHeight: y(28),
  },

  nextButtonWrapper: {
    position: "absolute",
    right: 0,
    top: y(74),
    width: x(82),
    height: y(52),
  },

  nextButton: {
    width: x(82),
    height: y(52),
    borderRadius: x(20),
  },

  nextButtonDisabled: {
    opacity: 0.6,
  },

  progressReportTitle: {
    position: "absolute",
    left: x(20),
    top: y(377),
    width: x(362),
    color: colors.primary,
    fontFamily: "LiterataBold",
    fontSize: x(20),
    lineHeight: y(30),
    textAlign: "center",
  },

  moodText: {
    position: "absolute",
    left: x(20),
    top: y(412),
    width: x(362),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(35),
    textAlign: "center",
    textDecorationLine: "underline",
  },

  moodImageWrapper: {
    position: "absolute",
    left: x(171),
    top: y(453),
    width: x(60),
    height: x(60),
    alignItems: "center",
    justifyContent: "center",
  },

  moodImage: {
    width: x(60),
    height: x(60),
  },

  progressBarWrapper: {
    position: "absolute",
    left: x(20),
    top: y(512),
    width: x(362),
    height: y(19),
  },

  phaseText: {
    position: "absolute",
    left: x(20),
    top: y(535),
    width: x(218),
    height: y(35),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(35),
  },

  activitiesText: {
    position: "absolute",
    left: x(249),
    top: y(538),
    width: x(133),
    height: y(35),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(12),
    lineHeight: y(35),
    textAlign: "right",
  },

  recentCompletionsLabel: {
    position: "absolute",
    left: x(20),
    top: y(568),
    width: x(362),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(13),
    lineHeight: y(18),
    textAlign: "center",
  },

  progressUnavailableText: {
    position: "absolute",
    left: x(20),
    top: y(521),
    width: x(362),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(17),
    lineHeight: y(24),
    textAlign: "center",
  },

  dividerMiddle: {
    position: "absolute",
    left: x(20),
    top: y(600),
    width: x(362),
    height:
      StyleSheet.hairlineWidth,
    backgroundColor: colors.primary,
  },

  promptTitle: {
    position: "absolute",
    left: x(20),
    top: y(598),
    width: x(362),
    height: y(35),
    color: colors.primary,
    fontFamily: "LiterataBold",
    fontSize: x(20),
    lineHeight: y(35),
  },

  promptCardWrapper: {
    position: "absolute",
    left: x(20),
    top: y(PROMPT_CARD_TOP),
    width: x(362),
    minHeight: y(
      DEFAULT_PROMPT_CARD_HEIGHT,
    ),
  },

  fixedFooter: {
    position: "absolute",
    left: x(20),
    bottom: y(FOOTER_BOTTOM),
    width: x(362),
    height: y(
      FIXED_FOOTER_HEIGHT,
    ),
    backgroundColor: "transparent",
    zIndex: 50,
  },

  switchWrapper: {
    position: "absolute",
    left: 0,
    top: 0,
    width: x(226),
    height: y(24),
    justifyContent: "center",
  },

  switchText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textDecorationLine: "underline",
  },

  bottomNavWrapper: {
    position: "absolute",
    left: 0,
    top: y(33),
    width: x(362),
    height: y(72),
    borderRadius: x(50),
    backgroundColor:
      colors.background,
    overflow: "hidden",
  },

  controlPressed: {
    opacity: 0.65,
  },
});