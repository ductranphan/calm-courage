/**
 * Parent math verification screen.
 *
 * Provides an alternative adult gate when the parent cannot remember
 * their PIN. Solving the math problem grants the same temporary parent
 * access as entering the correct PIN. It does not change or reset pinHash.
 */

import { router, type Href } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppButton from "@/components/ui/AppButton";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useParentAccess } from "@/contexts/ParentAccessContext";
import {
  completeOnboarding,
  getUserProfile,
} from "@/services/auth";
import { listChildren } from "@/services/children";
import { x, y } from "@/utils/scaling";

import AudioOffIcon from "../../assets/icons/audio-off.svg";
import AudioOnIcon from "../../assets/icons/audio-on.svg";

const MAX_ANSWER_LENGTH = 3;

const numberRows = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
];

type MathChallenge = {
  firstNumber: number;
  secondNumber: number;
  answer: number;
};

function createMathChallenge(): MathChallenge {
  /*
   * Keep both numbers two digits and the result below.
   */
  const firstNumber = Math.floor(Math.random() * 30) + 20;
  const secondNumber = Math.floor(Math.random() * 30) + 20;

  return {
    firstNumber,
    secondNumber,
    answer: firstNumber + secondNumber,
  };
}

export default function ForgotPinMathScreen() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const {
    childModeActive,
    unlockParentAccess,
  } = useParentAccess();

  const [challenge] = useState<MathChallenge>(
    createMathChallenge,
  );

  const [enteredAnswer, setEnteredAnswer] =
    useState("");

  const [audioEnabled, setAudioEnabled] =
    useState(false);

  const [verifying, setVerifying] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!user.emailVerified) {
      router.replace("/verify-email");
    }
  }, [authLoading, user]);

  function handleNumberPress(number: string) {
    if (
      verifying ||
      enteredAnswer.length >= MAX_ANSWER_LENGTH
    ) {
      return;
    }

    setError(null);

    setEnteredAnswer((current) =>
      `${current}${number}`.slice(
        0,
        MAX_ANSWER_LENGTH,
      ),
    );
  }

  function handleDelete() {
    if (verifying) {
      return;
    }

    setError(null);
    setEnteredAnswer((current) =>
      current.slice(0, -1),
    );
  }

  function handleUsePin() {
    if (verifying) {
      return;
    }

    router.replace("/parent-verification");
  }

  async function handleVerifyAnswer() {
    if (verifying) {
      return;
    }

    setError(null);

    if (!user?.uid) {
      setError("You must be signed in to continue.");
      return;
    }

    if (!enteredAnswer) {
      setError("Please enter the answer.");
      return;
    }

    if (Number(enteredAnswer) !== challenge.answer) {
      setEnteredAnswer("");
      setError(
        "That answer is not correct. Please try again.",
      );
      return;
    }

    setVerifying(true);

    try {
      const children = await listChildren(user.uid);

      /*
       * A verified parent without a child profile still needs to
       * finish the child setup flow.
       */
      if (children.length === 0) {
        unlockParentAccess();
        router.replace("/child-profile-info");
        return;
      }

      /*
       * Repair older test accounts that already have a child but
       * still contain onboardingComplete: false.
       */
      const profile = await getUserProfile(user.uid);

      if (profile && !profile.onboardingComplete) {
        await completeOnboarding(user.uid);
      }

      unlockParentAccess();
      router.replace("/home");
    } catch (verificationError) {
      console.error(
        "Unable to complete math verification:",
        verificationError,
      );

      setError(
        verificationError instanceof Error
          ? verificationError.message
          : "We couldn’t open the parent area. Please try again.",
      );
    } finally {
      setVerifying(false);
    }
  }

  if (authLoading || !user) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.figmaFrame}>
        <Pressable
          style={styles.audioButton}
          onPress={() =>
            setAudioEnabled((current) => !current)
          }
          disabled={verifying}
          accessibilityRole="button"
          accessibilityLabel={
            audioEnabled
              ? "Turn audio off"
              : "Turn audio on"
          }
          accessibilityState={{
            selected: audioEnabled,
            disabled: verifying,
          }}
        >
          {audioEnabled ? (
            <AudioOnIcon
              width={x(35)}
              height={x(35)}
            />
          ) : (
            <AudioOffIcon
              width={x(35)}
              height={x(35)}
            />
          )}
        </Pressable>

        <Text style={styles.title}>
          Parent Verification
        </Text>

        <Text style={styles.subtitle}>
          Please solve the math problem to
          {"\n"}
          prove you are an adult.
        </Text>

        <Text style={styles.mathProblem}>
          {challenge.firstNumber} + {challenge.secondNumber} =
        </Text>

        <View
          style={styles.answerBox}
          accessibilityLabel={
            enteredAnswer
              ? `Entered answer ${enteredAnswer}`
              : "Answer is empty"
          }
        >
          <Text style={styles.answerText}>
            {enteredAnswer}
          </Text>
        </View>

        <View style={styles.keypad}>
          {numberRows.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={styles.numberRow}
            >
              {row.map((number) => (
                <Pressable
                  key={number}
                  style={[
                    styles.numberButton,
                    verifying && styles.disabledButton,
                  ]}
                  onPress={() =>
                    handleNumberPress(number)
                  }
                  disabled={verifying}
                  accessibilityRole="button"
                  accessibilityLabel={`Enter ${number}`}
                >
                  <Text style={styles.numberText}>
                    {number}
                  </Text>
                </Pressable>
              ))}
            </View>
          ))}

          <View style={styles.specialRow}>
            <Pressable
              style={[
                styles.usePinButton,
                verifying && styles.disabledButton,
              ]}
              onPress={handleUsePin}
              disabled={verifying}
              accessibilityRole="button"
              accessibilityLabel="Use PIN instead"
            >
              <Text style={styles.specialButtonText}>
                Use PIN
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.zeroButton,
                verifying && styles.disabledButton,
              ]}
              onPress={() => handleNumberPress("0")}
              disabled={verifying}
              accessibilityRole="button"
              accessibilityLabel="Enter zero"
            >
              <Text style={styles.numberText}>0</Text>
            </Pressable>

            <Pressable
              style={[
                styles.deleteButton,
                (verifying || enteredAnswer.length === 0) &&
                  styles.disabledButton,
              ]}
              onPress={handleDelete}
              disabled={
                verifying || enteredAnswer.length === 0
              }
              accessibilityRole="button"
              accessibilityLabel="Delete last answer digit"
            >
              <Text style={styles.specialButtonText}>
                Delete
              </Text>
            </Pressable>
          </View>
        </View>

        <ErrorMessage
          message={error}
          style={styles.error}
        />

        <View style={styles.verifyButtonWrapper}>
          {verifying ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />
          ) : (
            <AppButton
              title="Verify & Enter"
              onPress={handleVerifyAnswer}
              style={styles.actionButton}
            />
          )}
        </View>

        {childModeActive ? (
          <View style={styles.backButtonWrapper}>
            <AppButton
              title="Back to Child Mode"
              onPress={() =>
                router.replace("/child-dashboard" as Href)
              }
              disabled={verifying}
              style={styles.actionButton}
            />
          </View>
        ) : null}
      </View>
    </ScrollView>
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
    minHeight: y(1206),
    backgroundColor: colors.background,
  },

  figmaFrame: {
    width: "100%",
    height: y(1206),
    position: "relative",
    backgroundColor: colors.background,
  },

  audioButton: {
    position: "absolute",
    left: x(347),
    top: y(30),
    width: x(35),
    height: x(35),
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    position: "absolute",
    left: x(20),
    top: y(123),
    width: x(362),
    height: y(39),
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(30),
    lineHeight: y(39),
    textAlign: "center",
  },

  subtitle: {
    position: "absolute",
    left: x(20),
    top: y(213),
    width: x(362),
    minHeight: y(48),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
  },

  mathProblem: {
    position: "absolute",
    left: x(67),
    top: y(374),
    width: x(145),
    height: y(39),
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(30),
    lineHeight: y(39),
    textAlign: "center",
  },

  answerBox: {
    position: "absolute",
    left: x(219),
    top: y(351),
    width: x(116),
    height: y(85),
    borderRadius: x(20),
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 5,
  },

  answerText: {
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(30),
    lineHeight: y(39),
    textAlign: "center",
  },

  keypad: {
    position: "absolute",
    left: x(20),
    top: y(498),
    width: x(362),
  },

  numberRow: {
    width: x(258),
    height: y(85),
    marginLeft: x(47),
    marginBottom: y(13),
    flexDirection: "row",
    justifyContent: "space-between",
  },

  numberButton: {
    width: x(76),
    height: y(85),
    borderRadius: x(20),
    backgroundColor: "#DDEAEC",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 5,
  },

  numberText: {
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(30),
    lineHeight: y(39),
    textAlign: "center",
  },

  specialRow: {
    width: x(362),
    height: y(85),
    flexDirection: "row",
    justifyContent: "space-between",
  },

  usePinButton: {
    width: x(123),
    height: y(85),
    borderRadius: x(20),
    backgroundColor: "#DDEAEC",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 5,
  },

  zeroButton: {
    width: x(76),
    height: y(85),
    borderRadius: x(20),
    backgroundColor: "#DDEAEC",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 5,
  },

  deleteButton: {
    width: x(123),
    height: y(85),
    borderRadius: x(20),
    backgroundColor: "#DDEAEC",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 5,
  },

  specialButtonText: {
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(20),
    lineHeight: y(24),
    textAlign: "center",
  },

  disabledButton: {
    opacity: 0.55,
  },

  error: {
    position: "absolute",
    left: x(20),
    top: y(866),
    width: x(362),
  },

  verifyButtonWrapper: {
    position: "absolute",
    left: x(96),
    top: y(911),
    width: x(210),
    height: y(52),
    alignItems: "center",
    justifyContent: "center",
  },

  backButtonWrapper: {
    position: "absolute",
    left: x(96),
    top: y(973),
    width: x(210),
    height: y(52),
  },

  actionButton: {
    width: x(210),
    height: y(52),
    borderRadius: x(20),
  },
});