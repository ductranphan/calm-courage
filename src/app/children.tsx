/**
 * Child Management screen.
 *
 * Shows every child profile saved under the authenticated parent and lets
 * the parent edit a specific child or hand the device to that exact child.
 */

import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
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
import ErrorMessage from "@/components/ui/ErrorMessage";
import {
  avatarImages,
  normalizeAvatarId,
  type AvatarId,
} from "@/constants/avatars";
import { colors } from "@/constants/colors";
import {
  formatEmotionLabel,
  normalizeEmotionId,
} from "@/constants/emotions";
import { useAuth } from "@/contexts/AuthContext";
import { getTodayCheckIn } from "@/services/checkIns";
import { listChildren } from "@/services/children";
import { x, y } from "@/utils/scaling";

import AudioOffIcon from "../../assets/icons/audio-off.svg";
import AudioOnIcon from "../../assets/icons/audio-on.svg";

type ChildManagementData = {
  childId: string;
  name: string;
  age: number;
  avatarId: AvatarId;
  moodLabel: string;
};

export default function ChildrenScreen() {
  const { user } = useAuth();

  const [audioEnabled, setAudioEnabled] = useState(false);
  const [childrenData, setChildrenData] = useState<ChildManagementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let stillMounted = true;

      async function loadChildrenData() {
        setError(null);

        if (!user?.uid) {
          if (stillMounted) {
            setChildrenData([]);
            setLoading(false);
          }
          return;
        }

        setLoading(true);

        try {
          const children = await listChildren(user.uid);

          const loadedChildren = await Promise.all(
            children.map(async (child): Promise<ChildManagementData> => {
              let moodLabel = "Not checked in yet";

              try {
                const todayCheckIn = await getTodayCheckIn(
                  user.uid,
                  child.id,
                );

                if (todayCheckIn) {
                  moodLabel = formatEmotionLabel(
                    normalizeEmotionId(todayCheckIn.emotion),
                  );
                }
              } catch (checkInError) {
                console.error(
                  `Unable to load today's check-in for child ${child.id}:`,
                  checkInError,
                );
                moodLabel = "Unavailable";
              }

              return {
                childId: child.id,
                name: child.name,
                age: child.age,
                avatarId: normalizeAvatarId(child.avatarId),
                moodLabel,
              };
            }),
          );

          if (stillMounted) {
            setChildrenData(loadedChildren);
          }
        } catch (loadError) {
          console.error("Unable to load child profiles:", loadError);

          if (stillMounted) {
            setChildrenData([]);
            setError(
              "We couldn’t load the child profiles. Please try again.",
            );
          }
        } finally {
          if (stillMounted) {
            setLoading(false);
          }
        }
      }

      void loadChildrenData();

      return () => {
        stillMounted = false;
      };
    }, [user?.uid]),
  );

  function openAddChild() {
    router.push({
      pathname: "/child-profile-info",
      params: {
        source: "children",
      },
    });
  }

  function openEditChild(childId: string) {
    router.push({
      pathname: "/child-profile-info",
      params: {
        childId,
        source: "children",
      },
    });
  }

  function openChildMode(child: ChildManagementData) {
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
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Pressable
        style={styles.audioButton}
        onPress={() => setAudioEnabled((current) => !current)}
        accessibilityRole="button"
        accessibilityLabel={
          audioEnabled ? "Turn audio off" : "Turn audio on"
        }
      >
        {audioEnabled ? (
          <AudioOnIcon width={x(35)} height={x(35)} />
        ) : (
          <AudioOffIcon width={x(35)} height={x(35)} />
        )}
      </Pressable>

      <Text style={styles.title}>Child Management</Text>
      <View style={styles.topLine} />

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loader}
        />
      ) : (
        <>
          <ErrorMessage message={error} style={styles.error} />

          {!error && childrenData.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No child profiles yet</Text>
              <Text style={styles.emptyText}>
                Add a child profile to begin their courage journey.
              </Text>
            </View>
          ) : null}

          {childrenData.map((child) => (
            <View key={child.childId} style={styles.childCard}>
              <View style={styles.profileRow}>
                <View style={styles.avatarCard}>
                  <Image
                    source={avatarImages[child.avatarId]}
                    style={styles.avatarImage}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.childInfoWrapper}>
                  <Text style={styles.childInfoText} numberOfLines={1}>
                    Name: {child.name}
                  </Text>
                  <Text style={styles.childInfoText}>Age: {child.age}</Text>
                  <Text style={styles.moodTitle}>Today’s Mood:</Text>
                  <Text style={styles.moodText}>{child.moodLabel}</Text>
                </View>

                <View style={styles.actionsColumn}>
                  <AppButton
                    title="Edit"
                    onPress={() => openEditChild(child.childId)}
                    style={styles.editButton}
                  />

                  <Pressable
                    onPress={() => openChildMode(child)}
                    style={styles.childModeButton}
                    accessibilityRole="button"
                    accessibilityLabel={`Switch to ${child.name}'s child mode`}
                  >
                    <Text style={styles.childModeText}>Child Mode</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}

          <Pressable style={styles.addChildCard} onPress={openAddChild}>
            <Text style={styles.addChildText}>+ Add Another Child Profile</Text>
          </Pressable>
        </>
      )}

      <View style={styles.bottomNavWrapper}>
        <ParentBottomNav activeTab="children" />
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
    paddingTop: y(123),
    paddingBottom: y(45),
    backgroundColor: colors.background,
  },

  audioButton: {
    position: "absolute",
    right: x(20),
    top: y(48),
    width: x(35),
    height: x(35),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  title: {
    width: x(362),
    minHeight: y(39),
    color: colors.primary,
    fontFamily: "Quiche",
    fontSize: x(30),
    lineHeight: y(39),
    textAlign: "center",
  },

  topLine: {
    width: x(362),
    height: StyleSheet.hairlineWidth,
    marginTop: y(26),
    marginBottom: y(23),
    backgroundColor: colors.primary,
  },

  loader: {
    marginTop: y(90),
    marginBottom: y(180),
  },

  error: {
    marginBottom: y(20),
  },

  emptyCard: {
    width: x(362),
    minHeight: y(150),
    borderRadius: x(20),
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    paddingHorizontal: x(24),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: y(24),
  },

  emptyTitle: {
    color: colors.primary,
    fontFamily: "Quiche",
    fontSize: x(24),
    lineHeight: y(31),
    textAlign: "center",
  },

  emptyText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(17),
    lineHeight: y(23),
    textAlign: "center",
    marginTop: y(10),
  },

  childCard: {
    width: x(362),
    paddingVertical: y(22),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.primary,
  },

  profileRow: {
    width: "100%",
    minHeight: y(140),
    flexDirection: "row",
    alignItems: "center",
  },

  avatarCard: {
    width: x(118),
    height: y(118),
    borderRadius: x(15),
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  avatarImage: {
    width: x(118),
    height: y(118),
  },

  childInfoWrapper: {
    width: x(150),
    minHeight: y(118),
    marginLeft: x(14),
    justifyContent: "center",
  },

  childInfoText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(17),
    lineHeight: y(27),
  },

  moodTitle: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(16),
    lineHeight: y(24),
    marginTop: y(2),
  },

  moodText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(16),
    lineHeight: y(22),
  },

  actionsColumn: {
    width: x(70),
    minHeight: y(118),
    alignItems: "center",
    justifyContent: "center",
  },

  editButton: {
    width: x(62),
    height: y(48),
    borderRadius: x(15),
  },

  childModeButton: {
    width: x(70),
    minHeight: y(42),
    marginTop: y(12),
    alignItems: "center",
    justifyContent: "center",
  },

  childModeText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(14),
    lineHeight: y(18),
    textAlign: "center",
    textDecorationLine: "underline",
  },

  addChildCard: {
    width: x(362),
    minHeight: y(150),
    borderRadius: x(20),
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.primary,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginTop: y(34),
    marginBottom: y(35),

    shadowColor: "#000000",
    shadowOffset: { width: 0, height: y(4) },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 5,
  },

  addChildText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textAlign: "center",
  },

  bottomNavWrapper: {
    width: x(362),
    height: y(72),
    marginTop: "auto",
  },
});