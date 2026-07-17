/**
 * Terms acceptance screen shown after account creation.
 *
 * Parents review the terms, accept them, and receive a verification email.
 */
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import AppButton from "@/components/ui/AppButton";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/constants/colors";
import { termsContent } from "@/constants/terms";

export default function TermsScreen() {
  const { user, acceptTerms, sendVerificationEmail } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAccept() {
    if (!user) {
      router.replace("/onboarding");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await acceptTerms(user.uid);
      await sendVerificationEmail();
      router.replace("/verify-email");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to complete sign-up."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{termsContent.title}</Text>
        <Text style={styles.intro}>{termsContent.intro}</Text>

        {termsContent.sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text style={styles.heading}>{section.heading}</Text>
            {section.bullets.map((bullet) => (
              <Text key={bullet} style={styles.bullet}>
                • {bullet}
              </Text>
            ))}
          </View>
        ))}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.button}>
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <AppButton title="I Agree" onPress={handleAccept} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 40,
    gap: 14,
  },
  title: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 28,
    lineHeight: 36,
    textAlign: "center",
  },
  intro: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 16,
    lineHeight: 22,
  },
  section: {
    gap: 6,
  },
  heading: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 16,
    lineHeight: 22,
  },
  bullet: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 16,
    lineHeight: 22,
    paddingLeft: 4,
  },
  error: {
    color: "#B00020",
    fontFamily: "Literata",
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
  },
  button: {
    alignItems: "center",
    marginTop: 12,
    minHeight: 52,
    justifyContent: "center",
  },
});
