/**
 * Child profile avatar screen.
 *
 * Final step of creating or editing a child profile.
 *
 * This screen:
 * - receives the child’s name, age, and existing avatar
 * - allows the parent to select an avatar
 * - creates or updates the complete child profile in Firestore
 *
 * Profiles opened from Child Management return to the Children page.
 * The first onboarding profile continues to the Switch to Child screen.
 */

import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppButton from "@/components/ui/AppButton";
import BackButton from "@/components/ui/BackButton";
import ErrorMessage from "@/components/ui/ErrorMessage";
import {
  avatarImages,
  defaultAvatarId,
  normalizeAvatarId,
  type AvatarId,
} from "@/constants/avatars";
import { colors } from "@/constants/colors";
import { useActiveChild } from "@/contexts/ActiveChildContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  createChild,
  getChild,
  updateChild,
} from "@/services/children";
import { x, y } from "@/utils/scaling";

const avatarPositions: {
  id: AvatarId;
  left: number;
  top: number;
}[] = [
  { id: "lion", left: 20, top: 355 },
  { id: "koala", left: 211, top: 355 },
  { id: "panda", left: 20, top: 517 },
  { id: "rabbit", left: 211, top: 517 },
];

export default function ChildProfileAvatarScreen() {
  const { user } = useAuth();
  const { activeChild, selectActiveChild } = useActiveChild();

  const {
    childId,
    name = "",
    age = "",
    avatarId = "",
    source,
  } = useLocalSearchParams<{
    childId?: string;
    name?: string;
    age?: string;
    avatarId?: string;
    source?: string;
  }>();

  const editing = Boolean(childId);
  const openedFromChildren = source === "children";
  const hasCompleteRouteData = Boolean(
    name.trim() && age.trim() && avatarId,
  );

  const [childName, setChildName] = useState(name);
  const [childAge, setChildAge] = useState(age);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>(
    avatarId ? normalizeAvatarId(avatarId) : defaultAvatarId,
  );

  const [loading, setLoading] = useState(
    Boolean(childId && !hasCompleteRouteData),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stillMounted = true;

    async function loadExistingChildWhenNeeded() {
      if (!childId || !user?.uid || hasCompleteRouteData) {
        setLoading(false);
        return;
      }

      setError(null);
      setLoading(true);

      try {
        const child = await getChild(user.uid, childId);

        if (!child) {
          if (stillMounted) {
            setError("Child profile not found.");
          }
          return;
        }

        if (stillMounted) {
          
          if (!name.trim()) {
            setChildName(child.name);
          }

          if (!age.trim()) {
            setChildAge(String(child.age));
          }

          if (!avatarId) {
            setSelectedAvatar(normalizeAvatarId(child.avatarId));
          }
        }
      } catch (loadError) {
        console.error("Unable to load child profile:", loadError);

        if (stillMounted) {
          setError("Unable to load child profile.");
        }
      } finally {
        if (stillMounted) {
          setLoading(false);
        }
      }
    }

    void loadExistingChildWhenNeeded();

    return () => {
      stillMounted = false;
    };
  }, [
    age,
    avatarId,
    childId,
    hasCompleteRouteData,
    name,
    user?.uid,
  ]);

  async function handleSaveChild() {
    setError(null);

    if (!user?.uid) {
      setError("You must be signed in to save a child profile.");
      return;
    }

    const trimmedName = childName.trim();
    const parsedAge = Number(childAge);

    if (!trimmedName) {
      setError("Please enter the child’s name first.");
      return;
    }

    if (
      !childAge.trim() ||
      Number.isNaN(parsedAge) ||
      !Number.isInteger(parsedAge) ||
      parsedAge <= 0
    ) {
      setError("Please enter a valid whole-number age.");
      return;
    }

    setSaving(true);

    try {
      let savedChildId = childId;

      if (editing && childId) {
        await updateChild(user.uid, childId, {
          name: trimmedName,
          age: parsedAge,
          avatarId: selectedAvatar,
        });

        /* Keep child-mode data synchronized if this was the active child. */
        if (activeChild?.id === childId) {
          selectActiveChild({
            id: childId,
            name: trimmedName,
            avatarId: selectedAvatar,
          });
        }
      } else {
        savedChildId = await createChild(user.uid, {
          name: trimmedName,
          age: parsedAge,
          avatarId: selectedAvatar,
        });
      }

      /*
       * Editing and adding from Child Management return to the full list.
       * The first onboarding child continues to the pass-device screen.
       */
      if (editing || openedFromChildren) {
        router.replace("/children");
        return;
      }

      router.replace({
        pathname: "/switch-to-child",
        params: {
          childId: savedChildId ?? "",
          childName: trimmedName,
          avatarId: selectedAvatar,
        },
      });
    } catch (saveError) {
      console.error("Unable to save child profile:", saveError);
      setError("Unable to save child profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <BackButton
        fallback={
          editing || openedFromChildren
            ? "/children"
            : "/child-profile-info"
        }
      />

      <Text style={styles.title}>
        Choose a Buddy{"\n"}
        for {childName || "your child"}
      </Text>

      <Text style={styles.subtitle}>
        Pick your favorite companion to join{"\n"}
        your daily emotional journey and{"\n"}
        celebrate achievements.
      </Text>

      {avatarPositions.map(({ id, left, top }) => (
        <Pressable
          key={id}
          onPress={() => setSelectedAvatar(id)}
          style={[styles.avatarShadow, { left: x(left), top: y(top) }]}
          accessibilityRole="button"
          accessibilityLabel={`Choose ${id} avatar`}
          accessibilityState={{ selected: selectedAvatar === id }}
        >
          <View style={styles.avatarClip}>
            <Image
              source={avatarImages[id]}
              style={styles.avatarImage}
              resizeMode="contain"
            />
          </View>

          {selectedAvatar === id ? (
            <View style={styles.selectedBorder} />
          ) : null}
        </Pressable>
      ))}

      <ErrorMessage message={error} style={styles.error} />

      <View style={styles.buttonWrapper}>
        {saving ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <AppButton
            title={
              editing
                ? "Save Changes"
                : openedFromChildren
                  ? "Save Child"
                  : "Let’s Start!"
            }
            onPress={handleSaveChild}
            style={styles.startButton}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  title: {
    position: "absolute",
    left: x(22),
    top: y(123),
    width: x(330),
    minHeight: y(90),
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

  avatarShadow: {
    position: "absolute",
    width: x(171),
    height: y(138),
    borderRadius: x(20),
    backgroundColor: colors.white,

    shadowColor: "#000000",
    shadowOffset: { width: 0, height: y(4) },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 8,
  },

  avatarClip: {
    width: "100%",
    height: "100%",
    borderRadius: x(20),
    backgroundColor: colors.white,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  selectedBorder: {
    position: "absolute",
    left: 0,
    top: 0,
    right: -1,
    bottom: -1,
    borderWidth: x(2),
    borderColor: colors.primary,
    borderRadius: x(20),
    zIndex: 10,
  },

  error: {
    position: "absolute",
    left: x(20),
    top: y(695),
  },

  buttonWrapper: {
    position: "absolute",
    left: x(96),
    top: y(728),
    width: x(210),
    height: y(52),
    alignItems: "center",
    justifyContent: "center",
  },

  startButton: {
    width: x(210),
    height: y(52),
    borderRadius: x(20),
  },
});