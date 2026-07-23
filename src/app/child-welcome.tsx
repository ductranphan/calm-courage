/**
 * Child welcome screen.
 *
 * Shows the selected child name and avatar.
 * It avoids showing Emma/panda before Firebase finishes loading.
 */

import { router, useLocalSearchParams } from "expo-router";
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

import AppButton from "@/components/ui/AppButton";
import BackButton from "@/components/ui/BackButton";
import {
  avatarImages,
  defaultAvatarId,
  normalizeAvatarId,
  type AvatarId,
} from "@/constants/avatars";
import { colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { getChild, listChildren } from "@/services/children";
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
  stars: number;
  gems: number;
  badges: number;
};

function formatScore(value: number) {
  return value.toString().padStart(2, "0");
}

function starsUntilNextReward(stars: number) {
  const remainder = stars % 5;
  return remainder === 0 && stars > 0 ? 5 : 5 - remainder;
}

export default function ChildWelcomeScreen() {
  const { user } = useAuth();

  const {
    childId,
    childName,
    avatarId,
  } = useLocalSearchParams<{
    childId?: string;
    childName?: string;
    avatarId?: string;
  }>();

  const hasImmediateData = Boolean(childName && avatarId);

  const [audioEnabled, setAudioEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const [childData, setChildData] = useState<ChildWelcomeData>({
    childId: childId || null,
    childName: childName || "",
    avatarId: normalizeAvatarId(avatarId ?? defaultAvatarId),
    stars: 0,
    gems: 0,
    badges: 0,
  });

  useEffect(() => {
    let stillMounted = true;

    async function loadChild() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      /**
       * If route params already include the correct child,
       * render immediately and avoid the Emma/panda flash.
       * Rewards still load from Firebase below.
       */
      if (childName && avatarId) {
        setChildData((current) => ({
          ...current,
          childId: childId || null,
          childName,
          avatarId: normalizeAvatarId(avatarId),
        }));
        setLoading(false);
      } else {
        setLoading(true);
      }

      try {
        let child = null;

        if (childId) {
          child = await getChild(user.uid, childId);
        } else {
          const children = await listChildren(user.uid);
          child = children[0] ?? null;
        }

        if (!stillMounted) {
          return;
        }

        if (!child) {
          setChildData((current) => ({
            ...current,
            childId: childId || null,
            childName: childName || current.childName,
            avatarId: normalizeAvatarId(avatarId ?? current.avatarId),
          }));
          return;
        }

        setChildData({
          childId: child.id,
          childName: child.name,
          avatarId: normalizeAvatarId(child.avatarId),
          stars: child.stars,
          gems: child.gems,
          badges: child.badges.length,
        });
      } catch {
        // Keep the last known state. Do not show a wrong fallback child.
      } finally {
        if (stillMounted) {
          setLoading(false);
        }
      }
    }

    loadChild();

    return () => {
      stillMounted = false;
    };
  }, [user?.uid, childId, childName, avatarId, hasImmediateData]);

  const buddyImage = avatarImages[childData.avatarId];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.figmaFrame}>
        <BackButton fallback="/switch-to-child" />

        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : (
          <>
            <Text style={styles.title}>
              Welcome back, {childData.childName || "friend"}!{"\n"}
              Tap your character!
            </Text>

            <View style={styles.profileCard}>
              <Image
                source={buddyImage}
                style={styles.buddyImage}
                resizeMode="contain"
              />

              <View style={styles.statsRow}>
                <StarIcon width={x(32)} height={x(32)} />
                <Text style={styles.statText}>{childData.stars}</Text>

                <DiamondIcon width={x(20)} height={x(20)} />
                <Text style={styles.statText}>
                  {formatScore(childData.gems)}
                </Text>

                <BadgeIcon width={x(28)} height={x(28)} />
                <Text style={styles.statText}>
                  {formatScore(childData.badges)}
                </Text>
              </View>

              <Text style={styles.rewardText}>
                {starsUntilNextReward(childData.stars)} more stars until your
                next{"\n"}big reward!
              </Text>
            </View>

            <Pressable
              onPress={() => setAudioEnabled((current) => !current)}
              style={styles.audioWrapper}
            >
              {audioEnabled ? (
                <AudioOnIcon width={x(70)} height={x(70)} />
              ) : (
                <AudioOffIcon width={x(70)} height={x(70)} />
              )}
            </Pressable>

            <View style={styles.buttonWrapper}>
              <AppButton
                title="Let’s Go!"
                onPress={() =>
                  router.replace({
                    pathname: "/daily-emotion",
                    params: {
                      childId: childData.childId ?? "",
                    },
                  })
                }
                style={styles.letsGoButton}
              />
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
    width: "100%",
    height: y(874),
    position: "relative",
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
    shadowOffset: { width: 0, height: y(4) },
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

  buttonWrapper: {
    position: "absolute",
    left: x(96),
    top: y(759),
    width: x(210),
    height: y(52),
  },

  letsGoButton: {
    width: x(210),
    height: y(52),
    borderRadius: x(20),
  },
});