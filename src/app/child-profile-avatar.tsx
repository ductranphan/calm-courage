<<<<<<< HEAD
import { router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import AppButton from "@/components/ui/AppButton";
import BackButton from "@/components/ui/BackButton";
import { colors } from "@/constants/colors";
import { x, y } from "@/utils/scaling";

const avatars = [
  {
    id: "lion",
    source: require("../../assets/images/lion.png"),
    left: 20,
    top: 355,
  },
  {
    id: "koala",
    source: require("../../assets/images/koala.png"),
    left: 211,
    top: 355,
  },
  {
    id: "panda",
    source: require("../../assets/images/panda.png"),
    left: 20,
    top: 517,
  },
  {
    id: "rabbit",
    source: require("../../assets/images/rabbit.png"),
    left: 211,
    top: 517,
  },
];

export default function ChildProfileAvatarScreen() {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  return (
    <View style={styles.screen}>
      <BackButton fallback="/child-profile-info" />

      <Text style={styles.title}>Choose a Buddy{"\n"}for Emma</Text>
=======
/**
 * Child profile avatar screen.
 *
 * Used for both:
 * - creating a child profile
 * - opening an existing child profile for editing
 *
 * The backend stores the selected avatar in the `avatar` field.
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
import { useAuth } from "@/contexts/AuthContext";
import {
  ageFromBirthdate,
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
  { id: "brave_lion", left: 20, top: 355 },
  { id: "calm_koala", left: 211, top: 355 },
  { id: "friendly_panda", left: 20, top: 517 },
  { id: "lovely_rabbit", left: 211, top: 517 },
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
          setChildAge(String(ageFromBirthdate(child.birthdate) ?? ""));
          setSelectedAvatar(normalizeAvatarId(child.avatar));
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

    void loadExistingChild();

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

    const parsedAge = Number.parseInt(childAge, 10);
    const trimmedName = childName.trim();

    if (!trimmedName) {
      setError("Please enter the child’s name first.");
      return;
    }

    if (
      !childAge.trim() ||
      !Number.isInteger(parsedAge) ||
      parsedAge < 1 ||
      parsedAge > 17
    ) {
      setError("Please enter an age between 1 and 17.");
      return;
    }

    setSaving(true);

    try {
      if (editing && childId) {
        await updateChild(user.uid, childId, {
          name: trimmedName,
          age: parsedAge,
          avatar: selectedAvatar,
        });

        router.replace("/children");
        return;
      }

      const savedChildId = await createChild(user.uid, {
        name: trimmedName,
        age: parsedAge,
        avatar: selectedAvatar,
      });

      router.replace({
        pathname: "/switch-to-child",
        params: {
          childId: savedChildId,
          childName: trimmedName,
          avatarId: selectedAvatar,
        },
      });
    } catch (saveError) {
      console.error("Unable to save child profile:", saveError);

      setError(
        editing
          ? "Unable to update child profile."
          : "Unable to create child profile."
      );
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
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40

      <Text style={styles.subtitle}>
        Pick your favorite companion to join{"\n"}
        your daily emotional journey and{"\n"}
        celebrate achievements.
      </Text>

<<<<<<< HEAD
      {avatars.map(({ id, source, left, top }) => (
        <Pressable
          key={id}
          onPress={() => setSelectedAvatar(id)}
=======
      {avatarPositions.map(({ id, left, top }) => (
        <Pressable
          key={id}
          onPress={() => setSelectedAvatar(id)}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel={`Choose ${id.replaceAll("_", " ")}`}
          accessibilityState={{
            selected: selectedAvatar === id,
            disabled: saving,
          }}
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
          style={[
            styles.avatarShadow,
            {
              left: x(left),
              top: y(top),
            },
<<<<<<< HEAD
            selectedAvatar === id && styles.selectedAvatarShadow,
=======
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
          ]}
        >
          <View style={styles.avatarClip}>
            <Image
<<<<<<< HEAD
              source={source}
              style={styles.avatarImage}
              resizeMode="contain"
            />
          </View>
        </Pressable>
      ))}

      <View style={styles.buttonWrapper}>
        <AppButton
          title="Let’s Start!"
          onPress={() => router.push("/switch-to-child")}
          style={styles.startButton}
        />
=======
              source={avatarImages[id]}
              style={styles.avatarImage}
              resizeMode="contain"
              fadeDuration={0}
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
            title={editing ? "Save Changes" : "Let’s Start!"}
            onPress={handleSaveChild}
            style={styles.startButton}
          />
        )}
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

<<<<<<< HEAD
=======
  loader: {
    marginTop: y(400),
  },

>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
  title: {
    position: "absolute",
    left: x(22),
    top: y(123),
<<<<<<< HEAD
    width: x(300),
=======
    width: x(330),
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
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
<<<<<<< HEAD
    shadowOffset: {
      width: 0,
      height: y(4),
    },
=======
    shadowOffset: { width: 0, height: y(4) },
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 8,
  },

<<<<<<< HEAD
  selectedAvatarShadow: {
    borderWidth: x(2),
    borderColor: colors.primary,
  },

=======
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
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

<<<<<<< HEAD
=======
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
    width: x(362),
  },

>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
  buttonWrapper: {
    position: "absolute",
    left: x(96),
    top: y(728),
    width: x(210),
    height: y(52),
<<<<<<< HEAD
=======
    alignItems: "center",
    justifyContent: "center",
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
  },

  startButton: {
    width: x(210),
    height: y(52),
    borderRadius: x(20),
  },
});