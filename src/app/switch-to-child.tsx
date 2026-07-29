/**
 * Switch to Child Mode screen.
 *
 * Shows the parent that it is time to pass the device to the child.
 * Matches Figma Screen 4.0.
 *
 * The exact selected child is stored in ActiveChildContext before the
 * device enters child mode.
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
import ErrorMessage from "@/components/ui/ErrorMessage";
import { passDeviceImage } from "@/constants/assets";
import {
  normalizeAvatarId,
  type AvatarId,
} from "@/constants/avatars";
import { colors } from "@/constants/colors";
import {
  useActiveChild,
  type ActiveChild,
} from "@/contexts/ActiveChildContext";
import { useAuth } from "@/contexts/AuthContext";
import { useParentAccess } from "@/contexts/ParentAccessContext";
import {
  getChild,
  listChildren,
} from "@/services/children";
import { x, y } from "@/utils/scaling";

export default function SwitchToChildScreen() {
  const { user } = useAuth();
  const { enterChildMode } = useParentAccess();
  const { selectActiveChild } = useActiveChild();

  const { childId, childName, avatarId } =
    useLocalSearchParams<{
      childId?: string;
      childName?: string;
      avatarId?: string;
    }>();

  const [selectedChild, setSelectedChild] =
    useState<ActiveChild | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let stillMounted = true;

    async function loadSelectedChild() {
      setError(null);

      if (!user?.uid) {
        if (stillMounted) {
          setLoading(false);
          setError("You must be signed in to continue.");
        }
        return;
      }

      /*
       * Use complete route data immediately when it is available.
       * This avoids an unnecessary Firestore request and prevents a
       * temporary wrong child name/avatar from appearing.
       */
      if (childId && childName && avatarId) {
        if (stillMounted) {
          setSelectedChild({
            id: childId,
            name: childName,
            avatarId: normalizeAvatarId(avatarId),
          });
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      try {
        let child = childId
          ? await getChild(user.uid, childId)
          : null;

        if (!childId) {
          const children = await listChildren(user.uid);

          /*
           * Never choose an arbitrary profile when several children exist.
           * Send the parent to Child Management so they can select the exact
           * child who will use the device.
           */
          if (children.length > 1) {
            router.replace("/children");
            return;
          }

          child = children[0] ?? null;
        }

        if (!stillMounted) {
          return;
        }

        if (!child) {
          setSelectedChild(null);
          setError("No child profile found.");
          return;
        }

        setSelectedChild({
          id: child.id,
          name: child.name,
          avatarId: normalizeAvatarId(child.avatarId),
        });
      } catch (loadError) {
        console.error(
          "Unable to load the selected child:",
          loadError,
        );

        if (stillMounted) {
          setSelectedChild(null);
          setError(
            "We couldn’t load the child profile. Please try again.",
          );
        }
      } finally {
        if (stillMounted) {
          setLoading(false);
        }
      }
    }

    void loadSelectedChild();

    return () => {
      stillMounted = false;
    };
  }, [
    user?.uid,
    childId,
    childName,
    avatarId,
  ]);

  function handleReadyToPlay() {
    if (!selectedChild) {
      setError("No child profile found.");
      return;
    }

    /*
     * Save the exact child before locking parent-only screens and
     * handing the device over.
     */
    selectActiveChild(selectedChild);
    enterChildMode();

    router.replace({
      pathname: "/child-welcome",
      params: {
        childId: selectedChild.id,
        childName: selectedChild.name,
        avatarId: selectedChild.avatarId,
      },
    });
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.figmaFrame}>
        <BackButton fallback="/children" />

        {loading ? (
          <ActivityIndicator
            color={colors.primary}
            style={styles.loader}
          />
        ) : (
          <>
            <Text style={styles.title}>
              Pass the device to{"\n"}
              {selectedChild?.name || "your child"}!
            </Text>

            <Text style={styles.subtitle}>
              It&apos;s time for your child to begin their{"\n"}
              courage journey. Hand over the{"\n"}
              screen to start playing!
            </Text>

            <View style={styles.imageWrapper}>
              <Image
                source={passDeviceImage}
                style={styles.image}
                resizeMode="cover"
              />
            </View>

            <ErrorMessage
              message={error}
              style={styles.error}
            />

            <View style={styles.buttonWrapper}>
              <AppButton
                title="Ready to Play!"
                onPress={handleReadyToPlay}
                style={styles.readyButton}
              />
            </View>

            <Pressable
              onPress={() =>
                router.replace("/home")
              }
              style={styles.dashboardLinkWrapper}
            >
              <Text style={styles.dashboardLink}>
                Go to Parent Dashboard
              </Text>
            </Pressable>
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
    minHeight: y(960),
    backgroundColor: colors.background,
  },

  figmaFrame: {
    width: "100%",
    height: y(960),
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

  subtitle: {
    position: "absolute",
    left: x(20),
    top: y(242),
    width: x(362),
    height: y(72),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
  },

  imageWrapper: {
    position: "absolute",
    left: x(20),
    top: y(355),
    width: x(362),
    height: y(350.42),
    borderRadius: x(20),
    overflow: "hidden",
    backgroundColor: colors.white,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  error: {
    position: "absolute",
    left: x(20),
    top: y(724),
    width: x(362),
  },

  buttonWrapper: {
    position: "absolute",
    left: x(96),
    top: y(772),
    width: x(210),
    height: y(52),
  },

  readyButton: {
    width: x(210),
    height: y(52),
    borderRadius: x(20),
  },

  dashboardLinkWrapper: {
    position: "absolute",
    left: x(88),
    top: y(890),
    width: x(226),
    height: y(24),
    alignItems: "center",
    justifyContent: "center",
  },

  dashboardLink: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textAlign: "center",
    textDecorationLine: "underline",
  },
});