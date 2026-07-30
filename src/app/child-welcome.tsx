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
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  defaultAvatarId,
  normalizeAvatarId,
  type AvatarId,
} from "@/constants/avatars";
import { colors } from "@/constants/colors";
import { useActiveChild } from "@/contexts/ActiveChildContext";
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
  childId: string | null;
  childName: string;
  avatarId: AvatarId;
};

function formatScore(value: number): string {
  return value.toString().padStart(2, "0");
}

export default function ChildWelcomeScreen() {
  const { user } = useAuth();

  const {
    activeChild,
    selectActiveChild,
  } = useActiveChild();

  const {
    childId,
    childName,
    avatarId,
  } = useLocalSearchParams<{
    childId?: string;
    childName?: string;
    avatarId?: string;
  }>();

  /*
   * Context is the preferred source. Route parameters allow the screen
   * to render immediately after onboarding, before context is restored.
   */
  const hasImmediateData = Boolean(
    activeChild ||
      (childId && childName && avatarId),
  );

  const [audioEnabled, setAudioEnabled] =
    useState(false);

  const [loading, setLoading] = useState(
    !hasImmediateData,
  );

  const [
    checkingDailyCheckIn,
    setCheckingDailyCheckIn,
  ] = useState(false);

  const [childData, setChildData] =
    useState<ChildWelcomeData>({
      childId:
        activeChild?.id ?? childId ?? null,

      childName:
        activeChild?.name ?? childName ?? "",

      avatarId:
        activeChild?.avatarId ??
        normalizeAvatarId(
          avatarId ?? defaultAvatarId,
        ),
    });

  const rewards = useChildRewards(childData.childId);

  useEffect(() => {
    let isMounted = true;

    async function loadChild() {
      if (!user?.uid) {
        if (isMounted) {
          setLoading(false);
        }

        return;
      }

      /*
       * The selected child in context is authoritative and avoids an
       * unnecessary Firestore request when moving between child screens.
       */
      if (activeChild) {
        if (isMounted) {
          setChildData({
            childId: activeChild.id,
            childName: activeChild.name,
            avatarId: activeChild.avatarId,
          });

          setLoading(false);
        }

        return;
      }

      /*
       * Route parameters are used after profile creation or child
       * selection, then copied into context for the rest of child mode.
       */
      if (childId && childName && avatarId) {
        const routeChild = {
          id: childId,
          name: childName,
          avatarId:
            normalizeAvatarId(avatarId),
        };

        selectActiveChild(routeChild);

        if (isMounted) {
          setChildData({
            childId: routeChild.id,
            childName: routeChild.name,
            avatarId: routeChild.avatarId,
          });

          setLoading(false);
        }

        return;
      }

      setLoading(true);

      try {
        let child = null;

        if (childId) {
          child = await getChild(
            user.uid,
            childId,
          );
        } else {
          const children =
            await listChildren(user.uid);

          /*
           * Child mode must not choose a profile automatically when the
           * parent has more than one child.
           */
          if (children.length > 1) {
            router.replace(
              "/parent-verification",
            );

            return;
          }

          child = children[0] ?? null;
        }

        if (!child || !isMounted) {
          return;
        }

        const loadedChild = {
          id: child.id,
          name: child.name,
          avatarId: normalizeAvatarId(
            child.avatarId,
          ),
        };

        selectActiveChild(loadedChild);

        setChildData({
          childId: loadedChild.id,
          childName: loadedChild.name,
          avatarId: loadedChild.avatarId,
        });
      } catch (loadError) {
        console.error(
          "Unable to load the selected child:",
          loadError,
        );

        /*
         * Do not display a placeholder profile because it could show
         * another child's name or avatar.
         */
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadChild();

    return () => {
      isMounted = false;
    };
  }, [
    activeChild,
    avatarId,
    childId,
    childName,
    selectActiveChild,
    user?.uid,
  ]);

  const buddyImage =
    avatarImages[childData.avatarId];

  async function handleLetsGo() {
    if (checkingDailyCheckIn) {
      return;
    }

    if (!user?.uid || !childData.childId) {
      Alert.alert(
        "Child profile unavailable",
        "Please return to parent mode and select a child again.",
      );

      return;
    }

    setCheckingDailyCheckIn(true);

    try {
      const todayCheckIn =
        await getTodayCheckIn(
          user.uid,
          childData.childId,
        );

      /*
       * The emotion screen is required once per local day. Children who
       * already checked in can continue directly to their dashboard.
       */
      if (todayCheckIn) {
        router.replace(
          "/child-dashboard" as Href,
        );

        return;
      }

      router.replace({
        pathname: "/daily-emotion",
        params: {
          childId: childData.childId,
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
      setCheckingDailyCheckIn(false);
    }
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
        <BackButton fallback="/switch-to-child" />

        {loading ? (
          <ActivityIndicator
            color={colors.primary}
            style={styles.loader}
          />
        ) : (
          <>
            <Text style={styles.title}>
              Welcome back,{" "}
              {childData.childName ||
                "friend"}
              !{"\n"}
              Tap your character!
            </Text>

            <View style={styles.profileCard}>
              <Image
                source={buddyImage}
                style={styles.buddyImage}
                resizeMode="contain"
                fadeDuration={0}
              />

              <View style={styles.statsRow}>
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

              <Text style={styles.rewardText}>
                {rewards.stars === 0
                  ? "Complete today’s check-in to earn your first stars!"
                  : "Keep going — every brave step earns more rewards!"}
              </Text>
            </View>

            <Pressable
              onPress={() =>
                setAudioEnabled(
                  (current) => !current,
                )
              }
              style={({ pressed }) => [
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
                selected: audioEnabled,
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

            <View style={styles.buttonWrapper}>
              {checkingDailyCheckIn ? (
                <ActivityIndicator
                  size="large"
                  color={colors.primary}
                />
              ) : (
                <AppButton
                  title="Let’s Go!"
                  onPress={handleLetsGo}
                  style={styles.letsGoButton}
                />
              )}
            </View>
          </>
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
    minHeight: y(874),
    backgroundColor: colors.background,
  },

  figmaFrame: {
    position: "relative",
    width: "100%",
    height: y(874),
    backgroundColor: colors.background,
  },

  loader: {
    marginTop: y(420),
  },

  title: {
    position: "absolute",
    left: x(20),
    top: y(123),
    width: x(362),
    height: y(78),
    color: colors.primary,
    fontFamily: "Quiche",
    fontSize: x(30),
    lineHeight: y(39),
  },

  profileCard: {
    position: "absolute",
    left: x(20),
    top: y(266),
    width: x(362),
    height: y(350.42),
    borderRadius: x(20),
    backgroundColor: colors.white,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 5,
  },

  buddyImage: {
    position: "absolute",
    left: x(52),
    top: y(34),
    width: x(258),
    height: y(141),
  },

  statsRow: {
    position: "absolute",
    left: x(75),
    top: y(198),
    width: x(212),
    height: y(32),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: x(8),
  },

  statText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    marginRight: x(6),
  },

  rewardText: {
    position: "absolute",
    left: x(49),
    top: y(254),
    width: x(265),
    height: y(48),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textAlign: "center",
  },

  audioWrapper: {
    position: "absolute",
    left: x(166),
    top: y(653),
    width: x(70),
    height: x(70),
    alignItems: "center",
    justifyContent: "center",
  },

  audioPressed: {
    opacity: 0.65,
  },

  buttonWrapper: {
    position: "absolute",
    left: x(96),
    top: y(759),
    width: x(210),
    height: y(52),
    alignItems: "center",
    justifyContent: "center",
  },

  letsGoButton: {
    width: x(210),
    height: y(52),
    borderRadius: x(20),
  },
});