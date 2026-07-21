/**
 * Child profile creation screen.
 *
 * Shown after email verification so parents can add their child's details.
 */
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import AppButton from "@/components/ui/AppButton";
import AppTextInput from "@/components/ui/AppTextInput";
import { useAuth } from "@/contexts/AuthContext";
import { avatars, type AvatarId } from "@/constants/avatars";
import { colors } from "@/constants/colors";
import { completeOnboarding } from "@/services/auth";
import { createChild } from "@/services/children";

const MIN_AGE = 1;
const MAX_AGE = 17;

export default function AddChildScreen() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [avatar, setAvatar] = useState<AvatarId>("brave_lion");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreateProfile() {
    if (!user) {
      router.replace("/onboarding");
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please enter your child's name.");
      return;
    }

    const parsedAge = Number.parseInt(age, 10);
    if (!Number.isInteger(parsedAge) || parsedAge < MIN_AGE || parsedAge > MAX_AGE) {
      setError(`Please enter an age between ${MIN_AGE} and ${MAX_AGE}.`);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await createChild(user.uid, {
        name: trimmedName,
        age: parsedAge,
        avatar,
      });
      await completeOnboarding(user.uid);
      router.replace("/home");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create child profile."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Create Child Profile</Text>
        <Text style={styles.subtitle}>
          Tell us about your child so we can personalize their confidence
          journey.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Child&apos;s name</Text>
          <AppTextInput
            placeholder="Enter name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
            textContentType="name"
          />

          <Text style={styles.label}>Age</Text>
          <AppTextInput
            placeholder="Enter age"
            value={age}
            onChangeText={(value) => setAge(value.replace(/\D/g, ""))}
            keyboardType="number-pad"
            maxLength={2}
          />

          <Text style={styles.label}>Choose an avatar</Text>
          <View style={styles.avatarRow}>
            {avatars.map((option) => {
              const selected = option.id === avatar;

              return (
                <Pressable
                  key={option.id}
                  onPress={() => setAvatar(option.id)}
                  style={[
                    styles.avatarOption,
                    { backgroundColor: option.color },
                    selected && styles.avatarOptionSelected,
                  ]}
                >
                  <Text style={styles.avatarEmoji}>{option.emoji}</Text>
                  <Text style={styles.avatarLabel}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.button}>
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <AppButton title="Continue" onPress={handleCreateProfile} />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 40,
    gap: 16,
  },
  title: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 30,
    lineHeight: 39,
    textAlign: "center",
  },
  subtitle: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 18,
    lineHeight: 24,
    textAlign: "center",
  },
  form: {
    marginTop: 8,
    gap: 12,
  },
  label: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: -4,
  },
  avatarRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  avatarOption: {
    width: "47%",
    minHeight: 88,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 12,
  },
  avatarOptionSelected: {
    borderColor: colors.primary,
  },
  avatarEmoji: {
    fontSize: 28,
    lineHeight: 32,
  },
  avatarLabel: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 14,
    lineHeight: 18,
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
    marginTop: 8,
    minHeight: 52,
    justifyContent: "center",
  },
});
