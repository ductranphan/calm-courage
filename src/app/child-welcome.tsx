/**
 * Child welcome screen shown after a child profile is selected.
 *
 * Resolves the active child from context, route parameters, or Firestore.
 * Before entering the child dashboard, it checks whether the child has
 * already completed today's emotion check-in.
 */

import {
  router,
  useLocalSearchParams,
  type Href,
} from "expo-router";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppButton from "@/components/ui/AppButton";
import BackButton from "@/components/ui/BackButton";
import {
  avatarImages,
  normalizeAvatarId,
  type AvatarId,
} from "@/constants/avatars";
import { colors } from "@/constants/colors";
import {
  useActiveChild,
  type ActiveChild,
} from "@/contexts/ActiveChildContext";
import { useAuth } from "@/contexts/AuthContext";
import { useChildRewards } from "@/hooks/useChildRewards";
import { getTodayCheckIn } from "@/services/checkIns";
import {
  getChild,
  listChildren,
} from "@/services/children";
import { x, y } from "@/utils/scaling";

import AudioOffIcon from "../../assets/icons/audio-off.svg";
import AudioOnIcon from "../../assets/icons/audio-on.svg";
import BadgeIcon from "../../assets/icons/certificate-badge.svg";
import DiamondIcon from "../../assets/icons/diamond.svg";
import StarIcon from "../../assets/icons/star.svg";

type ChildWelcomeData = {
  childId: string;
  childName: string;
  avatarId: AvatarId;
};

type DailyCheckInStatus =
  | "unknown"
  | "checked"
  | "not-checked";

const dailyCheckInCache =
  new Map<string, boolean>();

function getLocalDateKey(
  date = new Date(),
): string {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(
      2,
      "0",
    );

  const day =
    String(
      date.getDate(),
    ).padStart(
      2,
      "0",
    );

  return `${year}-${month}-${day}`;
}

function getDailyCheckInCacheKey(
  parentUid: string,
  childId: string,
): string {
  return `${parentUid}:${childId}:${getLocalDateKey()}`;
}

function createRouteChild(
  childId: string | undefined,
  childName: string | undefined,
  avatarId: string | undefined,
): ActiveChild | null {
  if (
    !childId ||
    !childName ||
    !avatarId
  ) {
    return null;
  }

  return {
    id: childId,
    name: childName,
    avatarId:
      normalizeAvatarId(
        avatarId,
      ),
  };
}

function formatScore(
  value: number,
): string {
  return value
    .toString()
    .padStart(
      2,
      "0",
    );
}

export default function ChildWelcomeScreen() {
  const { user } =
    useAuth();

  const {
    activeChild,
    selectActiveChild,
  } =
    useActiveChild();

  const {
    childId,
    childName,
    avatarId,
  } =
    useLocalSearchParams<{
      childId?: string;
      childName?: string;
      avatarId?: string;
    }>();

  const routeChild =
    useMemo(
      () =>
        createRouteChild(
          childId,
          childName,
          avatarId,
        ),
      [
        avatarId,
        childId,
        childName,
      ],
    );

  const initialChild =
    useMemo(() => {
      if (routeChild) {
        return {
          childId:
            routeChild.id,

          childName:
            routeChild.name,

          avatarId:
            routeChild.avatarId,
        };
      }

      if (
        activeChild &&
        (
          !childId ||
          activeChild.id ===
            childId
        )
      ) {
        return {
          childId:
            activeChild.id,

          childName:
            activeChild.name,

          avatarId:
            activeChild.avatarId,
        };
      }

      return null;
    }, [
      activeChild,
      childId,
      routeChild,
    ]);

  const [
    audioEnabled,
    setAudioEnabled,
  ] =
    useState(false);

  const [
    childData,
    setChildData,
  ] =
    useState<ChildWelcomeData | null>(
      initialChild,
    );

  const [
    dailyCheckInStatus,
    setDailyCheckInStatus,
  ] =
    useState<DailyCheckInStatus>(
      "unknown",
    );

  const [
    checkingDailyCheckIn,
    setCheckingDailyCheckIn,
  ] =
    useState(false);

  const rewards =
    useChildRewards(
      childData?.childId,
    );

  useEffect(() => {
    let isMounted =
      true;

    async function loadChild() {
      if (!user?.uid) {
        return;
      }

      if (routeChild) {
        selectActiveChild(
          routeChild,
        );

        if (
          isMounted
        ) {
          setChildData({
            childId:
              routeChild.id,

            childName:
              routeChild.name,

            avatarId:
              routeChild.avatarId,
          });
        }

        return;
      }

      if (
        activeChild &&
        (
          !childId ||
          activeChild.id ===
            childId
        )
      ) {
        if (
          isMounted
        ) {
          setChildData({
            childId:
              activeChild.id,

            childName:
              activeChild.name,

            avatarId:
              activeChild.avatarId,
          });
        }

        return;
      }

      try {
        let child =
          null;

        if (childId) {
          child =
            await getChild(
              user.uid,
              childId,
            );
        } else {
          const children =
            await listChildren(
              user.uid,
            );

          /*
           * Never choose an arbitrary child when more than one exists.
           */
          if (
            children.length >
            1
          ) {
            router.replace(
              "/parent-verification",
            );

            return;
          }

          child =
            children[0] ??
            null;
        }

        if (
          !child ||
          !isMounted
        ) {
          return;
        }

        const loadedChild: ActiveChild =
          {
            id:
              child.id,

            name:
              child.name,

            avatarId:
              normalizeAvatarId(
                child.avatarId,
              ),
          };

        selectActiveChild(
          loadedChild,
        );

        setChildData({
          childId:
            loadedChild.id,

          childName:
            loadedChild.name,

          avatarId:
            loadedChild.avatarId,
        });
      } catch (loadError) {
        console.error(
          "Unable to load the selected child:",
          loadError,
        );
      }
    }

    void loadChild();

    return () => {
      isMounted =
        false;
    };
  }, [
    activeChild,
    childId,
    routeChild,
    selectActiveChild,
    user?.uid,
  ]);

  useEffect(() => {
    let stillMounted =
      true;

    async function prefetchDailyCheckIn() {
      if (
        !user?.uid ||
        !childData?.childId
      ) {
        if (
          stillMounted
        ) {
          setDailyCheckInStatus(
            "unknown",
          );
        }

        return;
      }

      const cacheKey =
        getDailyCheckInCacheKey(
          user.uid,
          childData.childId,
        );

      const cached =
        dailyCheckInCache.get(
          cacheKey,
        );

      if (
        cached !==
        undefined
      ) {
        if (
          stillMounted
        ) {
          setDailyCheckInStatus(
            cached
              ? "checked"
              : "not-checked",
          );
        }

        return;
      }

      setDailyCheckInStatus(
        "unknown",
      );

      try {
        const todayCheckIn =
          await getTodayCheckIn(
            user.uid,
            childData.childId,
          );

        if (
          !stillMounted
        ) {
          return;
        }

        const hasCheckIn =
          Boolean(
            todayCheckIn,
          );

        dailyCheckInCache.set(
          cacheKey,
          hasCheckIn,
        );

        setDailyCheckInStatus(
          hasCheckIn
            ? "checked"
            : "not-checked",
        );
      } catch (checkInError) {
        console.warn(
          "Unable to prefetch today's emotion check-in:",
          checkInError,
        );
      }
    }

    void prefetchDailyCheckIn();

    return () => {
      stillMounted =
        false;
    };
  }, [
    childData?.childId,
    user?.uid,
  ]);

  async function handleLetsGo() {
    if (
      checkingDailyCheckIn
    ) {
      return;
    }

    if (
      !user?.uid ||
      !childData?.childId
    ) {
      Alert.alert(
        "Child profile unavailable",
        "Please return to parent mode and select a child again.",
      );

      return;
    }

    if (
      dailyCheckInStatus ===
      "checked"
    ) {
      router.replace(
        "/child-dashboard" as Href,
      );

      return;
    }

    if (
      dailyCheckInStatus ===
      "not-checked"
    ) {
      router.replace({
        pathname:
          "/daily-emotion",

        params: {
          childId:
            childData.childId,
        },
      });

      return;
    }

    setCheckingDailyCheckIn(
      true,
    );

    try {
      const todayCheckIn =
        await getTodayCheckIn(
          user.uid,
          childData.childId,
        );

      const cacheKey =
        getDailyCheckInCacheKey(
          user.uid,
          childData.childId,
        );

      const hasCheckIn =
        Boolean(
          todayCheckIn,
        );

      dailyCheckInCache.set(
        cacheKey,
        hasCheckIn,
      );

      setDailyCheckInStatus(
        hasCheckIn
          ? "checked"
          : "not-checked",
      );

      if (hasCheckIn) {
        router.replace(
          "/child-dashboard" as Href,
        );

        return;
      }

      router.replace({
        pathname:
          "/daily-emotion",

        params: {
          childId:
            childData.childId,
        },
      });
    } catch (checkInError) {
      console.error(
        "Unable to check today's emotion check-in:",
        checkInError,
      );

      Alert.alert(
        "Unable to continue",
        "We couldn’t check today’s progress. Please try again.",
      );
    } finally {
      setCheckingDailyCheckIn(
        false,
      );
    }
  }

  const buddyImage =
    childData
      ? avatarImages[
          childData.avatarId
        ]
      : null;

  return (
    <ScrollView
      style={
        styles.screen
      }
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
        <BackButton
          fallback="/switch-to-child"
        />

        <Text
          style={
            styles.title
          }
        >
          Welcome back,{" "}
          {childData?.childName ||
            "friend"}
          !{"\n"}
          Tap your character!
        </Text>

        {childData &&
        buddyImage ? (
          <View
            style={
              styles.profileCard
            }
          >
            <Image
              source={
                buddyImage
              }
              style={
                styles.buddyImage
              }
              resizeMode="contain"
              fadeDuration={0}
            />

            <View
              style={
                styles.statsRow
              }
            >
              <StarIcon
                width={x(32)}
                height={x(32)}
              />

              <Text
                style={
                  styles.statText
                }
              >
                {rewards.stars}
              </Text>

              <DiamondIcon
                width={x(20)}
                height={x(20)}
              />

              <Text
                style={
                  styles.statText
                }
              >
                {formatScore(
                  rewards.gems,
                )}
              </Text>

              <BadgeIcon
                width={x(28)}
                height={x(28)}
              />

              <Text
                style={
                  styles.statText
                }
              >
                {formatScore(
                  rewards.badges
                    .length,
                )}
              </Text>
            </View>

            <Text
              style={
                styles.rewardText
              }
            >
              {rewards.stars ===
              0
                ? "Complete today’s check-in to earn your first stars!"
                : "Keep going — every brave step earns more rewards!"}
            </Text>
          </View>
        ) : null}

        <Pressable
          onPress={() =>
            setAudioEnabled(
              (current) =>
                !current,
            )
          }
          style={({
            pressed,
          }) => [
            styles.audioWrapper,

            pressed &&
              styles.audioPressed,
          ]}
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
        >
          {audioEnabled ? (
            <AudioOnIcon
              width={x(70)}
              height={x(70)}
            />
          ) : (
            <AudioOffIcon
              width={x(70)}
              height={x(70)}
            />
          )}
        </Pressable>

        <View
          style={
            styles.buttonWrapper
          }
        >
          <AppButton
            title="Let’s Go!"
            onPress={
              handleLetsGo
            }
            style={[
              styles.letsGoButton,

              checkingDailyCheckIn &&
                styles.letsGoButtonBusy,
            ]}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,

      backgroundColor:
        colors.background,
    },

    scrollContent: {
      minHeight:
        y(874),

      backgroundColor:
        colors.background,
    },

    figmaFrame: {
      position:
        "relative",

      width:
        "100%",

      height:
        y(874),

      backgroundColor:
        colors.background,
    },

    title: {
      position:
        "absolute",

      left:
        x(20),

      top:
        y(123),

      width:
        x(362),

      height:
        y(78),

      color:
        colors.primary,

      fontFamily:
        "Outfit",

      fontSize:
        x(30),

      lineHeight:
        y(39),
    },

    profileCard: {
      position:
        "absolute",

      left:
        x(20),

      top:
        y(266),

      width:
        x(362),

      height:
        y(350.42),

      borderRadius:
        x(20),

      backgroundColor:
        colors.white,

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

    buddyImage: {
      position:
        "absolute",

      left:
        x(52),

      top:
        y(34),

      width:
        x(258),

      height:
        y(141),
    },

    statsRow: {
      position:
        "absolute",

      left:
        x(75),

      top:
        y(198),

      width:
        x(212),

      height:
        y(32),

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      columnGap:
        x(8),
    },

    statText: {
      color:
        colors.primary,

      fontFamily:
        "Literata",

      fontSize:
        x(20),

      lineHeight:
        y(24),

      marginRight:
        x(6),
    },

    rewardText: {
      position:
        "absolute",

      left:
        x(49),

      top:
        y(254),

      width:
        x(265),

      height:
        y(48),

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
    },

    audioWrapper: {
      position:
        "absolute",

      left:
        x(166),

      top:
        y(653),

      width:
        x(70),

      height:
        x(70),

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    audioPressed: {
      opacity:
        0.65,
    },

    buttonWrapper: {
      position:
        "absolute",

      left:
        x(96),

      top:
        y(759),

      width:
        x(210),

      height:
        y(52),

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    letsGoButton: {
      width:
        x(210),

      height:
        y(52),

      borderRadius:
        x(20),
    },

    letsGoButtonBusy: {
      opacity:
        0.72,
    },
  });