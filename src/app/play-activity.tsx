/**
 * Generic Level-1 play screen for child game hubs.
 *
 * Starts the linked Phase 1 activity, validates the child's choice,
 * then completes the activity once and returns to the hub.
 */

import {
  router,
  useLocalSearchParams,
  type Href,
} from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppButton from "@/components/ui/AppButton";
import { colors } from "@/constants/colors";
import {
  GAME_LEVELS_BY_ID,
} from "@/constants/gameLevels";
import { useActiveChild } from "@/contexts/ActiveChildContext";
import { useAuth } from "@/contexts/AuthContext";
import { useParentAccess } from "@/contexts/ParentAccessContext";
import {
  completeActivityById,
  getActivityAttempt,
  startActivityById,
} from "@/services/activityAttempts";
import { x, y } from "@/utils/scaling";

import BackIcon from "../../assets/icons/back.svg";

export default function PlayActivityScreen() {
  const { user } = useAuth();
  const { activeChild } = useActiveChild();
  const { childModeActive } = useParentAccess();

  const { levelId, gameType } =
    useLocalSearchParams<{
      levelId?: string;
      gameType?: string;
    }>();

  const level = useMemo(() => {
    if (typeof levelId === "string") {
      return GAME_LEVELS_BY_ID[levelId] ?? null;
    }

    return null;
  }, [levelId]);

  const [selectedChoiceId, setSelectedChoiceId] =
    useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    null,
  );
  const [success, setSuccess] = useState<string | null>(
    null,
  );
  const [alreadyCompleted, setAlreadyCompleted] =
    useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!childModeActive || !activeChild) {
      router.replace("/parent-verification" as Href);
    }
  }, [activeChild, childModeActive]);

  useEffect(() => {
    let stillMounted = true;

    async function prepareLevel() {
      if (!user?.uid || !activeChild?.id || !level) {
        if (stillMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const attempt = await getActivityAttempt(
          user.uid,
          activeChild.id,
          level.activityId,
        );

        if (!stillMounted) {
          return;
        }

        if (attempt?.status === "completed") {
          setAlreadyCompleted(true);
          setSuccess(
            "You already finished this challenge. Great job!",
          );
        } else {
          await startActivityById(
            user.uid,
            activeChild.id,
            level.activityId,
            {
              source: "play_activity",
              levelId: level.id,
              gameType: level.gameType,
            },
          );
        }
      } catch (prepareError) {
        console.error(
          "Unable to prepare play activity:",
          prepareError,
        );

        if (stillMounted) {
          setError(
            "We couldn’t start this challenge. Please try again.",
          );
        }
      } finally {
        if (stillMounted) {
          setLoading(false);
        }
      }
    }

    void prepareLevel();

    return () => {
      stillMounted = false;
    };
  }, [activeChild?.id, level, user?.uid]);

  async function handleSubmit() {
    if (
      !user?.uid ||
      !activeChild?.id ||
      !level ||
      submitting ||
      alreadyCompleted
    ) {
      return;
    }

    if (!selectedChoiceId) {
      setError("Pick an answer to continue.");
      return;
    }

    const choice = level.choices.find(
      (item) => item.id === selectedChoiceId,
    );

    if (!choice?.correct) {
      setError(
        "Not quite — try another answer. You’ve got this!",
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await completeActivityById(
        user.uid,
        activeChild.id,
        level.activityId,
        {
          source: "play_activity",
          levelId: level.id,
          gameType: level.gameType,
          choiceId: choice.id,
        },
      );

      setAlreadyCompleted(true);
      setSuccess(level.successMessage);
    } catch (submitError) {
      console.error(
        "Unable to complete play activity:",
        submitError,
      );
      setError(
        "We couldn’t save your progress. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleBack() {
    const href = (level?.hubRoute ??
      "/child-dashboard") as Href;
    router.replace(href);
  }

  if (!childModeActive || !activeChild) {
    return null;
  }

  if (!level) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          This challenge was not found.
        </Text>
        <AppButton
          title="Back"
          onPress={() =>
            router.replace("/child-dashboard" as Href)
          }
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Pressable
        style={styles.backButton}
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel="Back"
      >
        <BackIcon width={x(37)} height={y(22)} />
      </Pressable>

      <Text style={styles.eyebrow}>
        {(gameType ?? level.gameType).replace(
          "_",
          " ",
        )}
      </Text>
      <Text style={styles.title}>{level.title}</Text>
      <Text style={styles.prompt}>{level.prompt}</Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loader}
        />
      ) : (
        <View style={styles.choices}>
          {level.choices.map((choice) => {
            const selected =
              selectedChoiceId === choice.id;

            return (
              <Pressable
                key={choice.id}
                onPress={() => {
                  if (alreadyCompleted) {
                    return;
                  }
                  setSelectedChoiceId(choice.id);
                  setError(null);
                }}
                style={[
                  styles.choice,
                  selected && styles.choiceSelected,
                ]}
                accessibilityRole="button"
                accessibilityState={{
                  selected,
                  disabled: alreadyCompleted,
                }}
              >
                <Text
                  style={[
                    styles.choiceText,
                    selected &&
                      styles.choiceTextSelected,
                  ]}
                >
                  {choice.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {error ? (
        <Text
          style={styles.errorText}
          accessibilityRole="alert"
        >
          {error}
        </Text>
      ) : null}

      {success ? (
        <Text style={styles.successText}>
          {success}
        </Text>
      ) : null}

      <View style={styles.actions}>
        {alreadyCompleted ? (
          <AppButton
            title="Back to Games"
            onPress={handleBack}
          />
        ) : (
          <AppButton
            title={
              submitting
                ? "Saving..."
                : "Check Answer"
            }
            onPress={() => {
              void handleSubmit();
            }}
            disabled={loading || submitting}
          />
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
  content: {
    paddingHorizontal: x(20),
    paddingTop: y(60),
    paddingBottom: y(40),
    minHeight: y(800),
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    gap: y(16),
    padding: x(20),
  },
  backButton: {
    marginBottom: y(20),
    alignSelf: "flex-start",
  },
  eyebrow: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(16),
    textTransform: "capitalize",
    marginBottom: y(8),
  },
  title: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(28),
    fontWeight: "700",
    marginBottom: y(16),
  },
  prompt: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(28),
    marginBottom: y(24),
  },
  loader: {
    marginVertical: y(40),
  },
  choices: {
    gap: y(12),
  },
  choice: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: x(16),
    backgroundColor: colors.white,
    paddingVertical: y(16),
    paddingHorizontal: x(16),
  },
  choiceSelected: {
    backgroundColor: colors.primary,
  },
  choiceText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(18),
    lineHeight: y(24),
  },
  choiceTextSelected: {
    color: colors.white,
  },
  errorText: {
    marginTop: y(16),
    color: "#B00020",
    fontFamily: "Literata",
    fontSize: x(16),
    textAlign: "center",
  },
  successText: {
    marginTop: y(16),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(18),
    lineHeight: y(24),
    textAlign: "center",
  },
  actions: {
    marginTop: y(28),
    alignItems: "center",
  },
});