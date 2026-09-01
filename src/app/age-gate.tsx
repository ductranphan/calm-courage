/**
 * COPPA neutral age gate.
 *
 * Asks for birth year only — never “Are you over 13?” —
 * before onboarding, sign-up, or login can collect account data.
 */

import { router, type Href } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppButton from "@/components/ui/AppButton";
import ErrorMessage from "@/components/ui/ErrorMessage";
import FloatingTextInput from "@/components/ui/FloatingTextInput";
import Logo from "@/components/ui/Logo";
import { colors } from "@/constants/colors";
import {
  isCoppaAdult,
  parseBirthYearInput,
  saveAgeGateAllowed,
} from "@/utils/ageGate";
import { x, y } from "@/utils/scaling";

export default function AgeGateScreen() {
  const [birthYearText, setBirthYearText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleContinue() {
    setError(null);

    const birthYear = parseBirthYearInput(birthYearText);

    if (birthYear === null) {
      setError("Enter your birth year as a 4-digit year.");
      return;
    }

    setSubmitting(true);

    try {
      if (!isCoppaAdult(birthYear)) {
        /*
         * Do not persist under-13 birth years. Route to the blocked
         * screen with no account or analytics collection.
         */
        router.replace("/under-13" as Href);
        return;
      }

      await saveAgeGateAllowed(birthYear);
      router.replace("/onboarding" as Href);
    } catch (saveError) {
      console.error("Unable to save age-gate clearance:", saveError);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.frame}>
        <Text style={styles.title}>Welcome</Text>

        <Text style={styles.body}>
          Enter your birth year to continue. We use this only to
          follow children’s privacy rules.
        </Text>

        <View style={styles.inputWrap}>
          <FloatingTextInput
            label="Birth year"
            value={birthYearText}
            onChangeText={(text) => {
              setBirthYearText(text.replace(/[^\d]/g, "").slice(0, 4));
              if (error) {
                setError(null);
              }
            }}
            keyboardType="number-pad"
            maxLength={4}
            autoComplete="birthdate-year"
            accessibilityLabel="Enter your birth year"
          />
        </View>

        {error ? (
          <ErrorMessage message={error} style={styles.error} />
        ) : null}

        <View style={styles.buttonWrap}>
          <AppButton
            title="Continue"
            onPress={() => {
              void handleContinue();
            }}
            disabled={submitting}
          />
        </View>

        <Pressable
          onPress={() => router.push("/privacy-policy" as Href)}
          style={styles.privacyLink}
          accessibilityRole="link"
          accessibilityLabel="Read Privacy Policy"
        >
          <Text style={styles.privacyLinkText}>Privacy Policy</Text>
        </Pressable>

        <View style={styles.logo}>
          <Logo width={x(168)} height={y(62)} shadow />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  frame: {
    flex: 1,
    position: "relative",
  },

  title: {
    position: "absolute",
    left: x(20),
    top: y(123),
    width: x(362),
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(30),
    lineHeight: y(39),
    textAlign: "center",
  },

  body: {
    position: "absolute",
    left: x(36),
    top: y(190),
    width: x(330),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(18),
    lineHeight: y(26),
    textAlign: "center",
  },

  inputWrap: {
    position: "absolute",
    left: x(20),
    top: y(300),
  },

  error: {
    position: "absolute",
    left: x(20),
    top: y(400),
  },

  buttonWrap: {
    position: "absolute",
    left: x(96),
    top: y(460),
  },

  privacyLink: {
    position: "absolute",
    left: x(20),
    top: y(540),
    width: x(362),
    alignItems: "center",
  },

  privacyLinkText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(18),
    lineHeight: y(24),
    textDecorationLine: "underline",
  },

  logo: {
    position: "absolute",
    left: x(117),
    top: y(640),
  },
});
