/**
 * Parent-facing child management screen.
 *
 * Lists every child under the authenticated parent.
 * Selecting a profile opens that child's parent dashboard,
 * while Edit and Child Mode remain separate actions.
 *
 * Child profiles are cached during the current app session
 * so returning to this page does not show a loading spinner.
 * Firestore still refreshes the data whenever the screen
 * receives focus.
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
  Alert,
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

import { useActiveChild } from "@/contexts/ActiveChildContext";
import { useAuth } from "@/contexts/AuthContext";

import { getTodayCheckIn } from "@/services/checkIns";
import {
  deleteChild,
  listChildren,
} from "@/services/children";

import { x, y } from "@/utils/scaling";

import AudioOffIcon from "../../assets/icons/audio-off.svg";
import AudioOnIcon from "../../assets/icons/audio-on.svg";
import TrashIcon from "../../assets/icons/trash.svg";

const FIXED_NAV_HEIGHT = 72;
const FIXED_NAV_BOTTOM = 20;
const SCROLL_BOTTOM_SPACE = 125;

type ChildManagementData = {
  childId: string;
  name: string;
  age: number;
  avatarId: AvatarId;
  moodLabel: string;
};

const childrenScreenCache =
  new Map<
    string,
    ChildManagementData[]
  >();

export default function ChildrenScreen() {
  const { user } =
    useAuth();

  const {
    selectActiveChild,
  } = useActiveChild();

  const cachedChildren =
    user?.uid
      ? childrenScreenCache.get(
          user.uid,
        )
      : undefined;

  const [
    audioEnabled,
    setAudioEnabled,
  ] = useState(false);

  const [
    childrenData,
    setChildrenData,
  ] =
    useState<
      ChildManagementData[]
    >(
      cachedChildren ?? [],
    );

  const [
    hasLoadedOnce,
    setHasLoadedOnce,
  ] = useState(
    cachedChildren !==
      undefined,
  );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  useFocusEffect(
    useCallback(() => {
      let stillMounted =
        true;

      async function loadChildrenData() {
        setError(null);

        if (!user?.uid) {
          if (stillMounted) {
            setChildrenData(
              [],
            );

            setHasLoadedOnce(
              true,
            );
          }

          return;
        }

        try {
          const children =
            await listChildren(
              user.uid,
            );

          const loadedChildren =
            await Promise.all(
              children.map(
                async (
                  child,
                ): Promise<ChildManagementData> => {
                  let moodLabel =
                    "Not checked in yet";

                  try {
                    const todayCheckIn =
                      await getTodayCheckIn(
                        user.uid,
                        child.id,
                      );

                    if (
                      todayCheckIn
                    ) {
                      moodLabel =
                        formatEmotionLabel(
                          normalizeEmotionId(
                            todayCheckIn.emotion,
                          ),
                        );
                    }
                  } catch (
                    checkInError
                  ) {
                    console.error(
                      `Unable to load today's check-in for child ${child.id}:`,
                      checkInError,
                    );

                    moodLabel =
                      "Unavailable";
                  }

                  return {
                    childId:
                      child.id,

                    name:
                      child.name,

                    age:
                      child.age,

                    avatarId:
                      normalizeAvatarId(
                        child.avatarId,
                      ),

                    moodLabel,
                  };
                },
              ),
            );

          if (
            !stillMounted
          ) {
            return;
          }

          childrenScreenCache.set(
            user.uid,
            loadedChildren,
          );

          setChildrenData(
            loadedChildren,
          );

          setHasLoadedOnce(
            true,
          );
        } catch (
          loadError
        ) {
          console.error(
            "Unable to load child profiles:",
            loadError,
          );

          if (
            stillMounted
          ) {
            setError(
              "We couldn’t refresh the child profiles. Please try again.",
            );

            setHasLoadedOnce(
              true,
            );
          }
        }
      }

      void loadChildrenData();

      return () => {
        stillMounted =
          false;
      };
    }, [
      user?.uid,
    ]),
  );

  function openAddChild() {
    router.push({
      pathname:
        "/child-profile-info",

      params: {
        source:
          "children",
      },
    });
  }

  function openEditChild(
    childId: string,
  ) {
    router.push({
      pathname:
        "/child-profile-info",

      params: {
        childId,

        source:
          "children",
      },
    });
  }

  function confirmDeleteChild(
    child: ChildManagementData,
  ) {
    if (!user?.uid) {
      return;
    }

    Alert.alert(
      "Delete child profile",
      `Permanently delete ${child.name}'s profile, check-ins, progress, and media? This cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void handleDeleteChild(child);
          },
        },
      ],
    );
  }

  async function handleDeleteChild(
    child: ChildManagementData,
  ) {
    if (!user?.uid) {
      return;
    }

    try {
      await deleteChild(user.uid, child.childId);

      setChildrenData((current) => {
        const next = current.filter(
          (item) => item.childId !== child.childId,
        );

        childrenScreenCache.set(user.uid, next);
        return next;
      });
    } catch (error) {
      console.error(
        "Unable to delete child profile:",
        error,
      );

      Alert.alert(
        "Delete failed",
        "We couldn’t delete this child profile. Please try again.",
      );
    }
  }

  function openParentDashboard(
    child: ChildManagementData,
  ) {
    /*
     * Keep the selected child available when moving between
     * the parent dashboard, children, and settings tabs.
     */
    selectActiveChild({
      id:
        child.childId,

      name:
        child.name,

      avatarId:
        child.avatarId,
    });

    router.replace({
      pathname:
        "/home",

      params: {
        childId:
          child.childId,
      },
    });
  }

  function openChildMode(
    child: ChildManagementData,
  ) {
    router.push({
      pathname:
        "/switch-to-child",

      params: {
        childId:
          child.childId,

        childName:
          child.name,

        avatarId:
          child.avatarId,
      },
    });
  }

  return (
    <View
      style={
        styles.screen
      }
    >
      <ScrollView
        style={
          styles.scrollView
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
        <Pressable
          style={({
            pressed,
          }) => [
            styles.audioButton,

            pressed &&
              styles.controlPressed,
          ]}
          onPress={() =>
            setAudioEnabled(
              (
                current,
              ) =>
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

        <Text
          style={
            styles.title
          }
        >
          Child Management
        </Text>

        <View
          style={
            styles.topLine
          }
        />

        <ErrorMessage
          message={error}
          style={
            styles.error
          }
        />

        {/*
         * Only show the real empty state after at least one
         * Firestore request has completed successfully or failed.
         */}
        {hasLoadedOnce &&
        !error &&
        childrenData.length ===
          0 ? (
          <View
            style={
              styles.emptyCard
            }
          >
            <Text
              style={
                styles.emptyTitle
              }
            >
              No child profiles yet
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Add a child profile to begin
              their courage journey.
            </Text>
          </View>
        ) : null}

        {childrenData.map(
          (child) => (
            <View
              key={
                child.childId
              }
              style={
                styles.childCard
              }
            >
              <View
                style={
                  styles.profileRow
                }
              >
                <Pressable
                  style={({
                    pressed,
                  }) => [
                    styles.dashboardSelection,

                    pressed &&
                      styles.profilePressed,
                  ]}
                  onPress={() =>
                    openParentDashboard(
                      child,
                    )
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${child.name}'s parent dashboard`}
                >
                  <View
                    style={
                      styles.avatarCard
                    }
                  >
                    <Image
                      source={
                        avatarImages[
                          child
                            .avatarId
                        ]
                      }
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
                        styles.childInfoText
                      }
                      numberOfLines={
                        1
                      }
                    >
                      Name:{" "}
                      {
                        child.name
                      }
                    </Text>

                    <Text
                      style={
                        styles.childInfoText
                      }
                    >
                      Age:{" "}
                      {
                        child.age
                      }
                    </Text>

                    <Text
                      style={
                        styles.moodTitle
                      }
                    >
                      Today’s Mood:
                    </Text>

                    <Text
                      style={
                        styles.moodText
                      }
                      numberOfLines={
                        1
                      }
                    >
                      {
                        child.moodLabel
                      }
                    </Text>
                  </View>
                </Pressable>

                <View
                  style={
                    styles.actionsColumn
                  }
                >
                  <AppButton
                    title="Edit"
                    onPress={() =>
                      openEditChild(
                        child.childId,
                      )
                    }
                    style={
                      styles.editButton
                    }
                  />

                  <Pressable
                    onPress={() =>
                      confirmDeleteChild(
                        child,
                      )
                    }
                    style={({
                      pressed,
                    }) => [
                      styles.deleteChildButton,
                      pressed &&
                        styles.controlPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${child.name}'s profile`}
                  >
                    <TrashIcon
                      width={x(22)}
                      height={x(22)}
                    />
                    <Text
                      style={
                        styles.deleteChildText
                      }
                    >
                      Delete
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      openChildMode(
                        child,
                      )
                    }
                    style={({
                      pressed,
                    }) => [
                      styles.childModeButton,

                      pressed &&
                        styles.controlPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Switch to ${child.name}'s child mode`}
                  >
                    <Text
                      style={
                        styles.childModeText
                      }
                    >
                      Child Mode
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ),
        )}

        <Pressable
          style={({
            pressed,
          }) => [
            styles.addChildCard,

            pressed &&
              styles.profilePressed,
          ]}
          onPress={
            openAddChild
          }
          accessibilityRole="button"
          accessibilityLabel="Add another child profile"
        >
          <Text
            style={
              styles.addChildText
            }
          >
            + Add Another Child Profile
          </Text>
        </Pressable>
      </ScrollView>

      <View
        style={
          styles.fixedNavbarWrapper
        }
      >
        <ParentBottomNav
          activeTab="children"
        />
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,

      position:
        "relative",

      backgroundColor:
        colors.background,
    },

    scrollView: {
      flex: 1,

      backgroundColor:
        colors.background,
    },

    scrollContent: {
      minHeight:
        y(900),

      paddingHorizontal:
        x(20),

      paddingTop:
        y(123),

      paddingBottom:
        y(
          SCROLL_BOTTOM_SPACE,
        ),

      backgroundColor:
        colors.background,
    },

    audioButton: {
      position:
        "absolute",

      right:
        x(20),

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

    title: {
      width:
        x(362),

      minHeight:
        y(39),

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
    },

    topLine: {
      width:
        x(362),

      height:
        StyleSheet.hairlineWidth,

      marginTop:
        y(26),

      marginBottom:
        y(23),

      backgroundColor:
        colors.primary,
    },

    error: {
      marginBottom:
        y(20),
    },

    emptyCard: {
      width:
        x(362),

      minHeight:
        y(150),

      marginBottom:
        y(24),

      paddingHorizontal:
        x(24),

      borderRadius:
        x(20),

      borderWidth:
        1,

      borderColor:
        colors.primary,

      backgroundColor:
        colors.white,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    emptyTitle: {
      color:
        colors.primary,

      fontFamily:
        "Outfit",

      fontSize:
        x(24),

      lineHeight:
        y(31),

      textAlign:
        "center",
    },

    emptyText: {
      marginTop:
        y(10),

      color:
        colors.primary,

      fontFamily:
        "Literata",

      fontSize:
        x(17),

      lineHeight:
        y(23),

      textAlign:
        "center",
    },

    childCard: {
      width:
        x(362),

      paddingVertical:
        y(22),

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        colors.primary,
    },

    profileRow: {
      width:
        "100%",

      minHeight:
        y(140),

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    dashboardSelection: {
      width:
        x(282),

      minHeight:
        y(118),

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    avatarCard: {
      width:
        x(118),

      height:
        y(118),

      borderRadius:
        x(15),

      backgroundColor:
        colors.white,

      alignItems:
        "center",

      justifyContent:
        "center",

      overflow:
        "hidden",
    },

    avatarImage: {
      width:
        x(118),

      height:
        y(118),
    },

    childInfoWrapper: {
      width:
        x(150),

      minHeight:
        y(118),

      marginLeft:
        x(14),

      justifyContent:
        "center",
    },

    childInfoText: {
      color:
        colors.primary,

      fontFamily:
        "Literata",

      fontSize:
        x(17),

      lineHeight:
        y(27),
    },

    moodTitle: {
      marginTop:
        y(2),

      color:
        colors.primary,

      fontFamily:
        "Literata",

      fontSize:
        x(16),

      lineHeight:
        y(24),
    },

    moodText: {
      color:
        colors.primary,

      fontFamily:
        "Literata",

      fontSize:
        x(16),

      lineHeight:
        y(22),
    },

    actionsColumn: {
      width:
        x(70),

      minHeight:
        y(118),

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    editButton: {
      width:
        x(62),

      height:
        y(48),

      borderRadius:
        x(15),
    },

    deleteChildButton: {
      marginTop: y(8),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: x(4),
      minHeight: y(28),
    },

    deleteChildText: {
      color: "#B00020",
      fontFamily: "Literata",
      fontSize: x(12),
      lineHeight: y(16),
    },

    childModeButton: {
      width:
        x(70),

      minHeight:
        y(42),

      marginTop:
        y(12),

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    childModeText: {
      color:
        colors.primary,

      fontFamily:
        "Literata",

      fontSize:
        x(14),

      lineHeight:
        y(18),

      textAlign:
        "center",

      textDecorationLine:
        "underline",
    },

    addChildCard: {
      width:
        x(362),

      minHeight:
        y(150),

      marginTop:
        y(34),

      marginBottom:
        y(35),

      borderRadius:
        x(20),

      borderWidth:
        1,

      borderStyle:
        "dashed",

      borderColor:
        colors.primary,

      backgroundColor:
        colors.white,

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

    addChildText: {
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

    fixedNavbarWrapper: {
      position:
        "absolute",

      left:
        x(20),

      bottom:
        y(
          FIXED_NAV_BOTTOM,
        ),

      width:
        x(362),

      height:
        y(
          FIXED_NAV_HEIGHT,
        ),

      borderRadius:
        x(50),

      backgroundColor:
        colors.background,

      overflow:
        "hidden",

      zIndex:
        50,

      elevation:
        12,

      shadowColor:
        colors.black,

      shadowOffset: {
        width: 0,
        height:
          y(4),
      },

      shadowOpacity:
        0.12,

      shadowRadius:
        x(5),
    },

    profilePressed: {
      opacity:
        0.78,
    },

    controlPressed: {
      opacity:
        0.65,
    },
  });