/**
 * Child profile avatar screen.
 *
 * Used for both:
 * - creating a new child profile
 * - editing an existing child profile
 *
 * Saves the selected avatar to Firebase as avatarId.
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

import BackButton from "@/components/ui/BackButton";
import AppButton from "@/components/ui/AppButton";
import ErrorMessage from "@/components/ui/ErrorMessage";
import {
  avatarImages,
  defaultAvatarId,
  normalizeAvatarId,
  type AvatarId,
} from "@/constants/avatars";
import { colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { seedPhaseActivities } from "@/services/activityAttempts";
import { completeOnboarding } from "@/services/auth";
import { createChild, getChild, updateChild } from "@/services/children";
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

  const { childId, name = "", age = "" } = useLocalSearchParams<{
    childId?: string;
    name?: string;
    age?: string;
  }>();

  const editing = Boolean(childId);

  const [childName, setChildName] = useState(name);
  const [childAge, setChildAge] = useState(age);
  const [selectedAvatar, setSelectedAvatar] =
    useState<AvatarId>(defaultAvatarId);

  const [loading, setLoading] = useState(Boolean(childId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stillMounted = true;

    async function loadExistingChild() {
      if (!childId || !user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const child = await getChild(user.uid, childId);

        if (!child) {
          if (stillMounted) {
            setError("Child profile not found.");
          }
          return;
        }

        if (stillMounted) {
          setChildName(child.name);
          setChildAge(String(child.age));
          setSelectedAvatar(normalizeAvatarId(child.avatarId));
        }
      } catch {
        if (stillMounted) {
          setError("Unable to load child profile.");
        }
      } finally {
        if (stillMounted) {
          setLoading(false);
        }
      }
    }

    loadExistingChild();

    return () => {
      stillMounted = false;
    };
  }, [childId, user?.uid]);

  async function handleSaveChild() {
    setError(null);

    if (!user?.uid) {
      setError("You must be signed in to save a child profile.");
      return;
    }

    const parsedAge = Number(childAge);

    if (!childName.trim()) {
      setError("Please enter the child’s name first.");
      return;
    }

    if (!childAge.trim() || Number.isNaN(parsedAge) || parsedAge <= 0) {
      setError("Please enter a valid age.");
      return;
    }

    setSaving(true);

    try {
      let savedChildId = childId;

      if (editing && childId) {
        await updateChild(user.uid, childId, {
          name: childName,
          age: parsedAge,
          avatarId: selectedAvatar,
        });
      } else {
        savedChildId = await createChild(user.uid, {
          name: childName,
          age: parsedAge,
          avatarId: selectedAvatar,
        });

        if (savedChildId) {
          await seedPhaseActivities(user.uid, savedChildId, 1);
          await completeOnboarding(user.uid);
        }
      }

      router.replace({
        pathname: "/switch-to-child",
        params: {
          childId: savedChildId ?? "",
          childName: childName.trim(),
          avatarId: selectedAvatar,
        },
      });
    } catch {
      setError("Unable to save child profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <BackButton
        fallback={
          editing
            ? `/child-profile-info?childId=${childId}`
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
        >
          <View style={styles.avatarClip}>
            <Image
              source={avatarImages[id]}
              style={styles.avatarImage}
              resizeMode="contain"
            />
          </View>

          {selectedAvatar === id ? <View style={styles.selectedBorder} /> : null}
        </Pressable>
      ))}

      <ErrorMessage message={error} style={styles.error} />

      <View style={styles.buttonWrapper}>
        {saving ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <AppButton
            title={editing ? "Save Changes" : "Let’s Start!"}
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

  loader: {
    marginTop: y(400),
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