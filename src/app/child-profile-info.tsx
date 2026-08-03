/**
 * Child profile details screen.
 *
 * First step of creating or editing a child profile.
 *
 * This screen:
 * - collects and validates the child’s name and age
 * - loads the existing profile when editing
 * - passes the details to the avatar-selection screen
 *
 * It does not save changes to Firestore directly.
 * The profile is saved after the avatar is selected.
 */

import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppButton from "@/components/ui/AppButton";
import BackButton from "@/components/ui/BackButton";
import ErrorMessage from "@/components/ui/ErrorMessage";
import FloatingTextInput from "@/components/ui/FloatingTextInput";
import Logo from "@/components/ui/Logo";
import {
  defaultAvatarId,
  normalizeAvatarId,
  type AvatarId,
} from "@/constants/avatars";
import { colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { getChild } from "@/services/children";
import { x, y } from "@/utils/scaling";

export default function ChildProfileInfoScreen() {
  const { user } = useAuth();
  const { childId, source } = useLocalSearchParams<{
    childId?: string;
    source?: string;
  }>();

  const editing = Boolean(childId);
  const openedFromChildren = source === "children";

  const [childName, setChildName] = useState("");
  const [age, setAge] = useState("");
  const [avatarId, setAvatarId] = useState<AvatarId>(defaultAvatarId);
  const [loading, setLoading] = useState(Boolean(childId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stillMounted = true;

    async function loadChild() {
      if (!childId || !user?.uid) {
        setLoading(false);
        return;
      }

      setError(null);

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
          setAge(String(child.age));
          setAvatarId(normalizeAvatarId(child.avatarId));
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

    void loadChild();

    return () => {
      stillMounted = false;
    };
  }, [childId, user?.uid]);

  function handleAgeChange(value: string) {
    setAge(value.replace(/[^0-9]/g, ""));
  }

  function handleNext() {
    setError(null);

    const trimmedName = childName.trim();
    const parsedAge = Number(age);

    if (!trimmedName) {
      setError("Please enter the child’s name.");
      return;
    }

    if (
      !age.trim() ||
      Number.isNaN(parsedAge) ||
      !Number.isInteger(parsedAge) ||
      parsedAge <= 0
    ) {
      setError("Please enter a valid whole-number age.");
      return;
    }

    router.push({
      pathname: "/child-profile-avatar",
      params: {
        childId: childId ?? "",
        name: trimmedName,
        age: String(parsedAge),
        avatarId,
        source: openedFromChildren ? "children" : "onboarding",
      },
    });
  }

  const backFallback =
    editing || openedFromChildren ? "/children" : "/parent-verification";

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.figmaFrame} onPress={Keyboard.dismiss}>
          <BackButton fallback={backFallback} />

          <Text style={styles.title}>
            {editing ? "Edit Child Profile" : "Who is joining\n the journey?"}
          </Text>

          <Text style={styles.subtitle}>
            Please enter your child&apos;s details to{"\n"}
            personalize their emotional learning{"\n"}
            space and track progress.
          </Text>

          <View style={styles.nameInput}>
            <FloatingTextInput
              label="Child’s name or nickname"
              placeholder="Child’s name or nickname"
              value={childName}
              onChangeText={setChildName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.ageInput}>
            <FloatingTextInput
              label="Child’s age"
              placeholder="Child’s age"
              value={age}
              onChangeText={handleAgeChange}
              keyboardType="number-pad"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <ErrorMessage message={error} style={styles.error} />

          <View style={styles.buttonWrapper}>
            <AppButton
              title="Next"
              onPress={handleNext}
              style={styles.nextButton}
            />
          </View>

          <View style={styles.logoWrapper}>
            <Logo width={x(168)} height={y(62)} shadow />
          </View>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
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

  title: {
    position: "absolute",
    left: x(20),
    top: y(123),
    width: x(330),
    minHeight: y(95),
    color: colors.primary,
    fontFamily: "Outfit",
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

  nameInput: {
    position: "absolute",
    left: x(20),
    top: y(355),
  },

  ageInput: {
    position: "absolute",
    left: x(20),
    top: y(461),
  },

  error: {
    position: "absolute",
    left: x(20),
    top: y(545),
  },

  buttonWrapper: {
    position: "absolute",
    left: x(96),
    top: y(597),
    width: x(210),
    height: y(52),
  },

  nextButton: {
    width: x(210),
    height: y(52),
    borderRadius: x(20),
  },

  logoWrapper: {
    position: "absolute",
    left: x(117),
    top: y(713),
    width: x(168),
    height: y(62),
  },
});