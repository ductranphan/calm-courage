/**
 * Child Management screen.
 *
 * Shows child profile data from Firebase:
 * - name
 * - age
 * - avatarId
 * - latest mood from checkIns
 */

import { router } from "expo-router";
import { useEffect, useState } from "react";
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
  defaultAvatarId,
  normalizeAvatarId,
  type AvatarId,
} from "@/constants/avatars";
import { colors } from "@/constants/colors";
import {
  defaultEmotionId,
  formatEmotionLabel,
  normalizeEmotionId,
} from "@/constants/emotions";
import { useAuth } from "@/contexts/AuthContext";
import { listCheckIns } from "@/services/checkIns";
import { listChildren } from "@/services/children";
import { x, y } from "@/utils/scaling";

import AudioOffIcon from "../../assets/icons/audio-off.svg";
import AudioOnIcon from "../../assets/icons/audio-on.svg";

type ChildManagementData = {
  childId: string | null;
  name: string;
  age: number;
  avatarId: AvatarId;
  moodLabel: string;
};

const FALLBACK_CHILD: ChildManagementData = {
  childId: null,
  name: "Emma",
  age: 4,
  avatarId: defaultAvatarId,
  moodLabel: formatEmotionLabel(defaultEmotionId),
};

export default function ChildrenScreen() {
  const { user } = useAuth();

  const [audioEnabled, setAudioEnabled] = useState(false);
  const [childData, setChildData] =
    useState<ChildManagementData>(FALLBACK_CHILD);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stillMounted = true;

    async function loadChildData() {
      if (!user?.uid) {
        setChildData(FALLBACK_CHILD);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const children = await listChildren(user.uid);
        const firstChild = children[0];

        if (!firstChild) {
          if (stillMounted) {
            setChildData(FALLBACK_CHILD);
          }
          return;
        }

        let moodLabel = formatEmotionLabel(defaultEmotionId);

        try {
          const checkIns = await listCheckIns(user.uid, firstChild.id);
          const latestMood = normalizeEmotionId(checkIns[0]?.emotion);
          moodLabel = formatEmotionLabel(latestMood);
        } catch {
          moodLabel = formatEmotionLabel(defaultEmotionId);
        }

        if (stillMounted) {
          setChildData({
            childId: firstChild.id,
            name: firstChild.name,
            age: firstChild.age,
            avatarId: normalizeAvatarId(firstChild.avatarId),
            moodLabel,
          });
        }
      } catch {
        if (stillMounted) {
          setChildData(FALLBACK_CHILD);
        }
      } finally {
        if (stillMounted) {
          setLoading(false);
        }
      }
    }

    loadChildData();

    return () => {
      stillMounted = false;
    };
  }, [user?.uid]);

  const avatarImage = avatarImages[childData.avatarId];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.figmaFrame}>
        <Pressable
          style={styles.audioButton}
          onPress={() => setAudioEnabled((current) => !current)}
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
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : (
          <>
            <View style={styles.avatarCard}>
              <Image
                source={avatarImage}
                style={styles.avatarImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.childInfoWrapper}>
              <Text style={styles.childInfoText}>Name: {childData.name}</Text>
              <Text style={styles.childInfoText}>Age: {childData.age}</Text>
              <Text style={styles.childInfoText}>Today’s Mood:</Text>
              <Text style={styles.childInfoText}>{childData.moodLabel}</Text>
            </View>

            <View style={styles.editButtonWrapper}>
              <AppButton
                title="Edit"
                onPress={() => {
                  if (!childData.childId) {
                    router.push("/child-profile-info");
                    return;
                  }

                  router.push({
                    pathname: "/child-profile-info",
                    params: {
                      childId: childData.childId,
                    },
                  });
                }}
                style={styles.editButton}
              />
            </View>
          </>
        )}

        <View style={styles.childInfoLine} />

        <Pressable
          style={styles.addChildCard}
          onPress={() => router.push("/child-profile-info")}
        >
          <Text style={styles.addChildText}>+ Add Multiple Child Profiles</Text>
        </Pressable>

        <Pressable
          onPress={() =>
            router.push({
              pathname: "/switch-to-child",
              params: {
                childId: childData.childId ?? "",
                childName: childData.name,
                avatarId: childData.avatarId,
              },
            })
          }
          style={styles.switchWrapper}
        >
          <Text style={styles.switchText}>Switch to Child Mode</Text>
        </Pressable>

        <View style={styles.bottomNavWrapper}>
          <ParentBottomNav activeTab="children" />
        </View>
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
    backgroundColor: colors.background,
  },

  figmaFrame: {
    width: "100%",
    height: y(900),
    position: "relative",
    backgroundColor: colors.background,
  },

  audioButton: {
    position: "absolute",
    left: x(347),
    top: y(48),
    width: x(35),
    height: x(35),
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    position: "absolute",
    left: x(20),
    top: y(123),
    width: x(362),
    height: y(39),
    color: colors.primary,
    fontFamily: "Quiche",
    fontSize: x(30),
    lineHeight: y(39),
    textAlign: "center",
  },

  topLine: {
    position: "absolute",
    left: x(20),
    top: y(188),
    width: x(362),
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.primary,
  },

  loader: {
    position: "absolute",
    left: x(186),
    top: y(260),
  },

  avatarCard: {
    position: "absolute",
    left: x(20),
    top: y(212),
    width: x(132),
    height: y(132),
    borderRadius: x(15),
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  avatarImage: {
    width: x(132),
    height: y(132),
  },

  childInfoWrapper: {
    position: "absolute",
    left: x(171),
    top: y(213),
    width: x(150),
    height: y(132),
  },

  childInfoText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(35),
  },

  editButtonWrapper: {
    position: "absolute",
    left: x(326),
    top: y(294),
    width: x(56),
    height: y(52),
  },

  editButton: {
    width: x(56),
    height: y(52),
    borderRadius: x(15),
  },

  childInfoLine: {
    position: "absolute",
    left: x(20),
    top: y(364),
    width: x(362),
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.primary,
  },

  addChildCard: {
    position: "absolute",
    left: x(20),
    top: y(438),
    width: x(362),
    height: y(271),
    borderRadius: x(20),
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.primary,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",

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

  switchWrapper: {
    position: "absolute",
    left: x(20),
    top: y(750),
    width: x(206),
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
    left: x(20),
    top: y(783),
    width: x(362),
    height: y(72),
  },
});