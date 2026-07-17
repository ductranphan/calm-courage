/**
 * Child management screen.
 *
 * Displays all child profiles belonging to the current parent.
 *
 * Each child displays:
 * - name
 * - approximate age
 * - avatar
 * - latest mood
 *
 * No placeholder child data is displayed.
 */

import {
  router,
  useFocusEffect,
} from "expo-router";

import {
  useCallback,
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

import ParentBottomNav from "@/components/dashboard/ParentBottomNav";
import AppButton from "@/components/ui/AppButton";

import {
  avatarImages,
  normalizeAvatarId,
  type AvatarId,
} from "@/constants/avatars";

import { colors } from "@/constants/colors";

import {
  formatEmotionLabel,
  isEmotionId,
} from "@/constants/emotions";

import { useAuth } from "@/contexts/AuthContext";
import { listCheckIns } from "@/services/checkIns";

import {
  ageFromBirthdate,
  listChildren,
} from "@/services/children";

import { x, y } from "@/utils/scaling";

import AudioOffIcon from "../../assets/icons/audio-off.svg";
import AudioOnIcon from "../../assets/icons/audio-on.svg";

type ChildManagementData = {
  childId: string;
  name: string;
  age: number | null;
  avatarId: AvatarId;
  moodLabel: string | null;
};

function getMoodLabel(
  value: unknown,
): string | null {
  const emotionValue = Array.isArray(value)
    ? value[0]
    : value;

  if (!isEmotionId(emotionValue)) {
    return null;
  }

  return formatEmotionLabel(
    emotionValue,
  );
}

export default function ChildrenScreen() {
  const { user } = useAuth();

  const [audioEnabled, setAudioEnabled] =
    useState(false);

  const [
    childrenData,
    setChildrenData,
  ] = useState<ChildManagementData[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState<string | null>(null);

  const [reloadKey, setReloadKey] =
    useState(0);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function loadChildData() {
        setLoading(true);
        setLoadError(null);

        if (!user?.uid) {
          if (!cancelled) {
            setChildrenData([]);
            setLoading(false);
          }

          return;
        }

        try {
          const children = await listChildren(
            user.uid,
          );

          const loadedChildren =
            await Promise.all(
              children.map(
                async (
                  child,
                ): Promise<ChildManagementData> => {
                  let moodLabel:
                    | string
                    | null = null;

                  try {
                    const checkIns =
                      await listCheckIns(
                        user.uid,
                        child.id,
                      );

                    moodLabel = getMoodLabel(
                      checkIns[0]?.emotions,
                    );
                  } catch {
                    /*
                     * A check-in error must not prevent
                     * the child profile from appearing.
                     */
                    moodLabel = null;
                  }

                  return {
                    childId: child.id,
                    name: child.name,
                    age: ageFromBirthdate(
                      child.birthdate,
                    ),
                    avatarId:
                      normalizeAvatarId(
                        child.avatar,
                      ),
                    moodLabel,
                  };
                },
              ),
            );

          if (!cancelled) {
            setChildrenData(
              loadedChildren,
            );
          }
        } catch (error) {
          console.error(
            "Unable to load child profiles:",
            error,
          );

          if (!cancelled) {
            setChildrenData([]);

            setLoadError(
              "We couldn’t load the child profiles. Please try again.",
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      }

      void loadChildData();

      return () => {
        cancelled = true;
      };
    }, [user?.uid, reloadKey]),
  );

  function handleRetry() {
    setReloadKey(
      (current) => current + 1,
    );
  }

  function handleEditChild(
    child: ChildManagementData,
  ) {
    router.push({
      pathname: "/child-profile-info",
      params: {
        childId: child.childId,
      },
    });
  }

  function handleSwitchToChild(
    child: ChildManagementData,
  ) {
    router.push({
      pathname: "/switch-to-child",
      params: {
        childId: child.childId,
        childName: child.name,
        avatarId: child.avatarId,
      },
    });
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.scrollContent
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.audioRow}>
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
      </View>

      <Text style={styles.title}>
        Child Management
      </Text>

      <View style={styles.topLine} />

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text style={styles.loadingText}>
            Loading child profiles...
          </Text>
        </View>
      ) : loadError ? (
        <View style={styles.messageState}>
          <Text style={styles.messageTitle}>
            Unable to load profiles
          </Text>

          <Text style={styles.messageText}>
            {loadError}
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={handleRetry}
            accessibilityRole="button"
          >
            <Text
              style={
                styles.retryButtonText
              }
            >
              Try Again
            </Text>
          </Pressable>
        </View>
      ) : childrenData.length === 0 ? (
        <View style={styles.messageState}>
          <Text style={styles.messageTitle}>
            No child profiles yet
          </Text>

          <Text style={styles.messageText}>
            Add a child profile to begin
            their emotional learning journey.
          </Text>
        </View>
      ) : (
        <View style={styles.childrenList}>
          {childrenData.map((child) => {
            const avatarSource =
              avatarImages[
                child.avatarId
              ];

            return (
              <View
                key={child.childId}
                style={styles.childCard}
              >
                <View
                  style={
                    styles.childContentRow
                  }
                >
                  <View
                    style={styles.avatarCard}
                  >
                    <Image
                      source={avatarSource}
                      style={
                        styles.avatarImage
                      }
                      resizeMode="contain"
                      fadeDuration={0}
                    />
                  </View>

                  <View
                    style={
                      styles.childInfoWrapper
                    }
                  >
                    <Text
                      style={
                        styles.childNameText
                      }
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {child.name}
                    </Text>

                    <Text
                      style={
                        styles.childInfoText
                      }
                    >
                      Age:{" "}
                      {child.age ?? "—"}
                    </Text>

                    <Text
                      style={
                        styles.childInfoText
                      }
                    >
                      Today&apos;s Mood:
                    </Text>

                    <Text
                      style={
                        styles.childMoodText
                      }
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {child.moodLabel ??
                        "No check-in yet"}
                    </Text>
                  </View>
                </View>

                <View
                  style={
                    styles.childActions
                  }
                >
                  <AppButton
                    title="Edit"
                    onPress={() =>
                      handleEditChild(
                        child,
                      )
                    }
                    style={
                      styles.editButton
                    }
                  />

                  <Pressable
                    style={
                      styles.switchButton
                    }
                    onPress={() =>
                      handleSwitchToChild(
                        child,
                      )
                    }
                    accessibilityRole="button"
                  >
                    <Text
                      style={
                        styles.switchButtonText
                      }
                    >
                      Switch to Child Mode
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <Pressable
        style={styles.addChildCard}
        onPress={() =>
          router.push(
            "/child-profile-info",
          )
        }
        accessibilityRole="button"
      >
        <Text style={styles.addChildText}>
          + Add Another Child Profile
        </Text>
      </Pressable>

      <View style={styles.bottomNavWrapper}>
        <ParentBottomNav
          activeTab="children"
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
    minHeight: y(900),
    paddingHorizontal: x(20),
    paddingTop: y(48),
    paddingBottom: y(35),
    backgroundColor: colors.background,
  },

  audioRow: {
    width: "100%",
    height: x(35),
    alignItems: "flex-end",
  },

  audioButton: {
    width: x(35),
    height: x(35),
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    marginTop: y(40),
    width: "100%",
    color: colors.primary,
    fontFamily: "Quiche",
    fontSize: x(30),
    lineHeight: y(39),
    textAlign: "center",
  },

  topLine: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    marginTop: y(26),
    backgroundColor: colors.primary,
  },

  loadingState: {
    minHeight: y(180),
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: y(14),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(16),
    lineHeight: y(22),
    textAlign: "center",
  },

  messageState: {
    minHeight: y(180),
    paddingHorizontal: x(20),
    alignItems: "center",
    justifyContent: "center",
  },

  messageTitle: {
    color: colors.primary,
    fontFamily: "Quiche",
    fontSize: x(23),
    lineHeight: y(30),
    textAlign: "center",
  },

  messageText: {
    marginTop: y(10),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(16),
    lineHeight: y(23),
    textAlign: "center",
  },

  retryButton: {
    minWidth: x(120),
    minHeight: y(42),
    marginTop: y(16),
    paddingHorizontal: x(20),
    borderRadius: x(15),
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  retryButtonText: {
    color: colors.white,
    fontFamily: "Literata",
    fontSize: x(16),
    lineHeight: y(22),
  },

  childrenList: {
    width: "100%",
    marginTop: y(22),
    rowGap: y(20),
  },

  childCard: {
    width: "100%",
    minHeight: y(205),
    padding: x(14),
    borderRadius: x(20),
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: y(3),
    },
    shadowOpacity: 0.15,
    shadowRadius: x(4),
    elevation: 4,
  },

  childContentRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarCard: {
    width: x(125),
    height: y(125),
    borderRadius: x(15),
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  childInfoWrapper: {
    flex: 1,
    minHeight: y(125),
    marginLeft: x(16),
    justifyContent: "center",
  },

  childNameText: {
    color: colors.primary,
    fontFamily: "Quiche",
    fontSize: x(24),
    lineHeight: y(31),
  },

  childInfoText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(17),
    lineHeight: y(26),
  },

  childMoodText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(17),
    lineHeight: y(25),
    fontWeight: "700",
  },

  childActions: {
    minHeight: y(52),
    marginTop: y(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  editButton: {
    width: x(90),
    height: y(46),
    borderRadius: x(15),
  },

  switchButton: {
    minHeight: y(46),
    paddingHorizontal: x(8),
    alignItems: "center",
    justifyContent: "center",
  },

  switchButtonText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(16),
    lineHeight: y(22),
    textDecorationLine: "underline",
  },

  addChildCard: {
    width: "100%",
    minHeight: y(135),
    marginTop: y(28),
    borderRadius: x(20),
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.primary,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: y(3),
    },
    shadowOpacity: 0.12,
    shadowRadius: x(4),
    elevation: 3,
  },

  addChildText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(26),
    textAlign: "center",
  },

  bottomNavWrapper: {
    width: "100%",
    height: y(72),
    marginTop: y(35),
  },
});