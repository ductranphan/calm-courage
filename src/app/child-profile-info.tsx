<<<<<<< HEAD
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import AppButton from "@/components/ui/AppButton";
import BackButton from "@/components/ui/BackButton";
import FloatingTextInput from "@/components/ui/FloatingTextInput";
import Logo from "@/components/ui/Logo";
import { colors } from "@/constants/colors";
import { x, y } from "@/utils/scaling";

export default function ChildProfileInfoScreen() {
  const [childName, setChildName] = useState("");
  const [birthDate, setBirthDate] = useState("");

  return (
    <View style={styles.screen}>
      <BackButton fallback="/verify-email" />

      <Text style={styles.title}>Who is joining{"\n"}the journey?</Text>

      <Text style={styles.subtitle}>
        Please enter your child's details to{"\n"}
        personalize their emotional learning{"\n"}
        space and track progress.
      </Text>

      <View style={styles.nameInput}>
        <FloatingTextInput
          label="Child’s name or nickname"
          value={childName}
          onChangeText={setChildName}
          autoCapitalize="words"
          autoCorrect={false}
        />
      </View>

      <View style={styles.birthInput}>
        <FloatingTextInput
          label="MM/DD/YYYY"
          value={birthDate}
          onChangeText={setBirthDate}
          keyboardType="numbers-and-punctuation"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.buttonWrapper}>
        <AppButton
          title="Next"
          onPress={() => router.push("/child-profile-avatar")}
          style={styles.nextButton}
        />
      </View>

      <View style={styles.logoWrapper}>
        <Logo width={x(168)} height={y(62)} shadow />
      </View>
    </View>
=======
/**
 * Child profile information screen.
 *
 * Used for both:
 * - creating a child profile
 * - opening an existing child profile for editing
 *
 * The page is scrollable and tapping outside an input closes the keyboard.
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
import { colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import {
  ageFromBirthdate,
  getChild,
} from "@/services/children";
import { x, y } from "@/utils/scaling";

export default function ChildProfileInfoScreen() {
  const { user } = useAuth();

  const { childId } = useLocalSearchParams<{
    childId?: string;
  }>();

  const editing = Boolean(childId);

  const [childName, setChildName] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(Boolean(childId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadChild() {
      if (!childId || !user?.uid) {
        if (!cancelled) {
          setLoading(false);
        }

        return;
      }

      try {
        const child = await getChild(user.uid, childId);

        if (!child) {
          if (!cancelled) {
            setError("Child profile not found.");
          }

          return;
        }

        if (!cancelled) {
          setChildName(child.name);
          setAge(
            String(ageFromBirthdate(child.birthdate) ?? ""),
          );
        }
      } catch (loadError) {
        console.error(
          "Unable to load child profile:",
          loadError,
        );

        if (!cancelled) {
          setError("Unable to load child profile.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadChild();

    return () => {
      cancelled = true;
    };
  }, [childId, user?.uid]);

  function handleNext() {
    Keyboard.dismiss();
    setError(null);

    const trimmedName = childName.trim();
    const parsedAge = Number.parseInt(age, 10);

    if (!trimmedName) {
      setError("Please enter the child’s name.");
      return;
    }

    if (
      !age.trim() ||
      !Number.isInteger(parsedAge) ||
      parsedAge < 1 ||
      parsedAge > 17
    ) {
      setError("Please enter an age between 1 and 17.");
      return;
    }

    router.push({
      pathname: "/child-profile-avatar",
      params: {
        childId: childId ?? "",
        name: trimmedName,
        age: String(parsedAge),
      },
    });
  }

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.loadingText}>
          Loading child profile...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={
          Platform.OS === "ios" ? "interactive" : "on-drag"
        }
      >
        <View style={styles.figmaFrame}>
          <Pressable
            style={styles.dismissKeyboardArea}
            onPress={Keyboard.dismiss}
            accessible={false}
          />

          <BackButton
            fallback={
              editing ? "/children" : "/verify-email"
            }
          />

          <Text style={styles.title}>
            {editing
              ? "Edit Child Profile"
              : "Who is joining\n the journey?"}
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
              onChangeText={(value) => {
                setChildName(value);

                if (error) {
                  setError(null);
                }
              }}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.ageInput}>
            <FloatingTextInput
              label="Child’s age"
              placeholder="Child’s age"
              value={age}
              onChangeText={(value) => {
                setAge(value.replace(/[^0-9]/g, ""));

                if (error) {
                  setError(null);
                }
              }}
              keyboardType="number-pad"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
          </View>

          <ErrorMessage
            message={error}
            style={styles.error}
          />

          <View style={styles.buttonWrapper}>
            <AppButton
              title="Next"
              onPress={handleNext}
              style={styles.nextButton}
            />
          </View>

          <View style={styles.logoWrapper}>
            <Logo
              width={x(168)}
              height={y(62)}
              shadow
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

<<<<<<< HEAD
=======
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

  dismissKeyboardArea: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: y(14),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(17),
    lineHeight: y(24),
    textAlign: "center",
  },

>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
  title: {
    position: "absolute",
    left: x(20),
    top: y(123),
<<<<<<< HEAD
    width: x(260),
=======
    width: x(330),
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
    minHeight: y(95),
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
<<<<<<< HEAD
    height: y(72),
=======
    minHeight: y(72),
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
  },

  nameInput: {
    position: "absolute",
    left: x(20),
    top: y(355),
<<<<<<< HEAD
  },

  birthInput: {
    position: "absolute",
    left: x(20),
    top: y(461),
=======
    zIndex: 2,
  },

  ageInput: {
    position: "absolute",
    left: x(20),
    top: y(461),
    zIndex: 2,
  },

  error: {
    position: "absolute",
    left: x(20),
    top: y(545),
    width: x(362),
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
  },

  buttonWrapper: {
    position: "absolute",
<<<<<<< HEAD
    left: x(97),
    top: y(597),
    width: x(210),
    height: y(52),
=======
    left: x(96),
    top: y(597),
    width: x(210),
    height: y(52),
    zIndex: 2,
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
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