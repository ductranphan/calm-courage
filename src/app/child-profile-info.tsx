/**
 * Child profile info screen.
 *
 * Used for both:
 * - creating a new child profile
 * - editing an existing child profile
 */

import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import BackButton from "@/components/ui/BackButton";
import AppButton from "@/components/ui/AppButton";
import ErrorMessage from "@/components/ui/ErrorMessage";
import FloatingTextInput from "@/components/ui/FloatingTextInput";
import Logo from "@/components/ui/Logo";
import { colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { getChild } from "@/services/children";
import { x, y } from "@/utils/scaling";

export default function ChildProfileInfoScreen() {
  const { user } = useAuth();
  const { childId } = useLocalSearchParams<{ childId?: string }>();

  const editing = Boolean(childId);

  const [childName, setChildName] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(Boolean(childId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stillMounted = true;

    async function loadChild() {
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
          setAge(String(child.age));
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

    loadChild();

    return () => {
      stillMounted = false;
    };
  }, [childId, user?.uid]);

  function handleNext() {
    setError(null);

    const trimmedName = childName.trim();
    const parsedAge = Number(age);

    if (!trimmedName) {
      setError("Please enter the child’s name.");
      return;
    }

    if (!age.trim() || Number.isNaN(parsedAge) || parsedAge <= 0) {
      setError("Please enter a valid age.");
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
      <View style={styles.screen}>
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <BackButton fallback={editing ? "/children" : "/verify-email"} />

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
          onChangeText={setAge}
          keyboardType="number-pad"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <ErrorMessage message={error} style={styles.error} />

      <View style={styles.buttonWrapper}>
        <AppButton title="Next" onPress={handleNext} style={styles.nextButton} />
      </View>

      <View style={styles.logoWrapper}>
        <Logo width={x(168)} height={y(62)} shadow />
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
    left: x(20),
    top: y(123),
    width: x(330),
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