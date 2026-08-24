/**
 * Parent math verification screen.
 *
 * Provides an alternative adult gate when the parent cannot remember
 * their PIN. Solving the math problem grants the same temporary parent
 * access as entering the correct PIN. It does not change or reset pinHash.
 */

import {
  router,
  type Href,
} from "expo-router";
import {
  useEffect,
  useState,
} from "react";
import {
  ActivityIndicator,
  Pressable,
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
   * Keep both numbers two digits and the result below 100.
   */
  const firstNumber =
    Math.floor(
      Math.random() * 30,
    ) + 20;

  const secondNumber =
    Math.floor(
      Math.random() * 30,
    ) + 20;

  return {
    firstNumber,
    secondNumber,
    answer:
      firstNumber +
      secondNumber,
  };
}

export default function ForgotPinMathScreen() {
  const {
    user,
    loading: authLoading,
  } =
    useAuth();

  const {
    childModeActive,
    parentAccessGranted,
    unlockParentAccess,
  } =
    useParentAccess();

  const [challenge] =
    useState<MathChallenge>(
      createMathChallenge,
    );

  const [
    enteredAnswer,
    setEnteredAnswer,
  ] =
    useState("");

  const [
    audioEnabled,
    setAudioEnabled,
  ] =
    useState(false);

  const [
    verifying,
    setVerifying,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    destinationAfterUnlock,
    setDestinationAfterUnlock,
  ] =
    useState<Href | null>(
      null,
    );

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.replace(
        "/login",
      );
      return;
    }

    if (!user.emailVerified) {
      router.replace(
        "/verify-email",
      );
    }
  }, [
    authLoading,
    user,
  ]);


  /*
   * Wait until ParentAccessContext has actually updated before opening a
   * protected parent route. Navigating to /home immediately after calling
   * unlockParentAccess() can race with the context update, causing /home
   * to think parent access is still locked and redirect back to the PIN
   * screen.
   */
  useEffect(() => {
    if (
      parentAccessGranted &&
      destinationAfterUnlock
    ) {
      const destination =
        destinationAfterUnlock;

      setDestinationAfterUnlock(
        null,
      );

      router.replace(
        destination,
      );
    }
  }, [
    destinationAfterUnlock,
    parentAccessGranted,
  ]);

  function handleNumberPress(
    number: string,
  ) {
    if (
      verifying ||
      enteredAnswer.length >=
        MAX_ANSWER_LENGTH
    ) {
      return;
    }

    setError(null);

    setEnteredAnswer(
      (current) =>
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

    setEnteredAnswer(
      (current) =>
        current.slice(
          0,
          -1,
        ),
    );
  }

  function handleUsePin() {
    if (verifying) {
      return;
    }

    router.replace(
      "/parent-verification",
    );
  }

  async function handleVerifyAnswer() {
    if (verifying) {
      return;
    }

    setError(null);

    if (!user?.uid) {
      setError(
        "You must be signed in to continue.",
      );
      return;
    }

    if (!enteredAnswer) {
      setError(
        "Please enter the answer.",
      );
      return;
    }

    if (
      Number(
        enteredAnswer,
      ) !==
      challenge.answer
    ) {
      setEnteredAnswer(
        "",
      );

      setError(
        "That answer is not correct. Please try again.",
      );

      return;
    }

    setVerifying(
      true,
    );

    try {
      const children =
        await listChildren(
          user.uid,
        );

      /*
       * A verified parent without a child profile still needs to
       * finish the child setup flow.
       */
      if (
        children.length ===
        0
      ) {
        setDestinationAfterUnlock(
          "/child-profile-info" as Href,
        );

        unlockParentAccess();

        return;
      }

      /*
       * Repair older test accounts that already have a child but
       * still contain onboardingComplete: false.
       */
      const profile =
        await getUserProfile(
          user.uid,
        );

      if (
        profile &&
        !profile.onboardingComplete
      ) {
        await completeOnboarding(
          user.uid,
        );
      }

      setDestinationAfterUnlock(
        "/home" as Href,
      );

      unlockParentAccess();
    } catch (verificationError) {
      console.error(
        "Unable to complete math verification:",
        verificationError,
      );

      setError(
        verificationError instanceof
          Error
          ? verificationError.message
          : "We couldn’t open the parent area. Please try again.",
      );
    } finally {
      setVerifying(
        false,
      );
    }
  }

  if (
    authLoading ||
    !user
  ) {
    return (
      <View
        style={
          styles.loadingScreen
        }
      >
        <ActivityIndicator
          size="large"
          color={
            colors.primary
          }
        />
      </View>
    );
  }

  return (
    <View
      style={
        styles.screen
      }
    >
      <View
        style={
          styles.figmaFrame
        }
      >
        <Pressable
          style={({
            pressed,
          }) => [
            styles.audioButton,

            pressed &&
              styles.controlPressed,

            verifying &&
              styles.disabledButton,
          ]}
          onPress={() =>
            setAudioEnabled(
              (current) =>
                !current,
            )
          }
          disabled={
            verifying
          }
          accessibilityRole="button"
          accessibilityLabel={
            audioEnabled
              ? "Turn audio off"
              : "Turn audio on"
          }
          accessibilityState={{
            selected:
              audioEnabled,

            disabled:
              verifying,
          }}
          hitSlop={8}
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

        <Text
          style={
            styles.title
          }
        >
          Parent Verification
        </Text>

        <Text
          style={
            styles.subtitle
          }
        >
          Please solve the math problem to
          {"\n"}
          prove you are an adult.
        </Text>

        <View
          style={
            styles.challengeRow
          }
        >
          <Text
            style={
              styles.mathProblem
            }
          >
            {challenge.firstNumber} +{" "}
            {challenge.secondNumber} =
          </Text>

          <View
            style={
              styles.answerBox
            }
            accessibilityLabel={
              enteredAnswer
                ? `Entered answer ${enteredAnswer}`
                : "Answer is empty"
            }
          >
            <Text
              style={
                styles.answerText
              }
            >
              {enteredAnswer}
            </Text>
          </View>
        </View>

        <View
          style={
            styles.keypad
          }
        >
          {numberRows.map(
            (
              row,
              rowIndex,
            ) => (
              <View
                key={
                  rowIndex
                }
                style={
                  styles.numberRow
                }
              >
                {row.map(
                  (number) => (
                    <Pressable
                      key={
                        number
                      }
                      style={({
                        pressed,
                      }) => [
                        styles.numberButton,

                        pressed &&
                          !verifying &&
                          styles.numberButtonPressed,

                        verifying &&
                          styles.disabledButton,
                      ]}
                      onPress={() =>
                        handleNumberPress(
                          number,
                        )
                      }
                      disabled={
                        verifying
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`Enter ${number}`}
                    >
                      <Text
                        style={
                          styles.numberText
                        }
                      >
                        {
                          number
                        }
                      </Text>
                    </Pressable>
                  ),
                )}
              </View>
            ),
          )}

          <View
            style={
              styles.specialRow
            }
          >
            <Pressable
              style={({
                pressed,
              }) => [
                styles.usePinButton,

                pressed &&
                  !verifying &&
                  styles.numberButtonPressed,

                verifying &&
                  styles.disabledButton,
              ]}
              onPress={
                handleUsePin
              }
              disabled={
                verifying
              }
              accessibilityRole="button"
              accessibilityLabel="Use PIN instead"
            >
              <Text
                style={
                  styles.specialButtonText
                }
              >
                Use PIN
              </Text>
            </Pressable>

            <Pressable
              style={({
                pressed,
              }) => [
                styles.zeroButton,

                pressed &&
                  !verifying &&
                  styles.numberButtonPressed,

                verifying &&
                  styles.disabledButton,
              ]}
              onPress={() =>
                handleNumberPress(
                  "0",
                )
              }
              disabled={
                verifying
              }
              accessibilityRole="button"
              accessibilityLabel="Enter zero"
            >
              <Text
                style={
                  styles.numberText
                }
              >
                0
              </Text>
            </Pressable>

            <Pressable
              style={({
                pressed,
              }) => [
                styles.deleteButton,

                pressed &&
                  !verifying &&
                  enteredAnswer.length >
                    0 &&
                  styles.numberButtonPressed,

                (
                  verifying ||
                  enteredAnswer.length ===
                    0
                ) &&
                  styles.disabledButton,
              ]}
              onPress={
                handleDelete
              }
              disabled={
                verifying ||
                enteredAnswer.length ===
                  0
              }
              accessibilityRole="button"
              accessibilityLabel="Delete last answer digit"
            >
              <Text
                style={
                  styles.specialButtonText
                }
              >
                Delete
              </Text>
            </Pressable>
          </View>
        </View>

        <ErrorMessage
          message={error}
          style={
            styles.error
          }
        />

        <View
          style={
            styles.verifyButtonWrapper
          }
        >
          {verifying ? (
            <ActivityIndicator
              size="small"
              color={
                colors.primary
              }
            />
          ) : (
            <AppButton
              title="Verify & Enter"
              onPress={
                handleVerifyAnswer
              }
              style={
                styles.actionButton
              }
            />
          )}
        </View>

        {childModeActive ? (
          <View
            style={
              styles.backButtonWrapper
            }
          >
            <AppButton
              title="Back to Child Mode"
              onPress={() =>
                router.replace(
                  "/child-dashboard" as Href,
                )
              }
              disabled={
                verifying
              }
              style={
                styles.actionButton
              }
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,

      backgroundColor:
        colors.background,

      overflow:
        "hidden",
    },

    loadingScreen: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        colors.background,
    },

    /*
     * Everything fits inside the visible screen. There is intentionally
     * no ScrollView on this page.
     */
    figmaFrame: {
      flex: 1,

      width:
        "100%",

      position:
        "relative",

      backgroundColor:
        colors.background,

      overflow:
        "hidden",
    },

    audioButton: {
      position:
        "absolute",

      left:
        x(347),

      top:
        y(48),

      width:
        x(35),

      height:
        x(35),

      alignItems:
        "center",

      justifyContent:
        "center",

      zIndex:
        20,
    },

    title: {
      position:
        "absolute",

      left:
        x(20),

      top:
        y(104),

      width:
        x(362),

      height:
        y(39),

      color:
        colors.primary,

      fontFamily:
        "Outfit",

      fontSize:
        x(30),

      lineHeight:
        y(39),

      textAlign:
        "center",

      includeFontPadding:
        false,
    },

    subtitle: {
      position:
        "absolute",

      left:
        x(20),

      top:
        y(158),

      width:
        x(362),

      minHeight:
        y(48),

      color:
        colors.primary,

      fontFamily:
        "Literata",

      fontSize:
        x(20),

      lineHeight:
        y(24),

      textAlign:
        "center",

      includeFontPadding:
        false,
    },

    challengeRow: {
      position:
        "absolute",

      left:
        x(40),

      top:
        y(224),

      width:
        x(322),

      height:
        y(70),

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      columnGap:
        x(10),
    },

    mathProblem: {
      width:
        x(175),

      color:
        colors.primary,

      fontFamily:
        "Outfit",

      fontSize:
        x(28),

      lineHeight:
        y(36),

      textAlign:
        "right",

      includeFontPadding:
        false,
    },

    answerBox: {
      width:
        x(92),

      height:
        y(62),

      borderRadius:
        x(18),

      backgroundColor:
        colors.white,

      alignItems:
        "center",

      justifyContent:
        "center",

      shadowColor:
        "#000000",

      shadowOffset: {
        width: 0,
        height:
          y(3),
      },

      shadowOpacity:
        0.22,

      shadowRadius:
        x(4),

      elevation:
        4,
    },

    answerText: {
      color:
        colors.primary,

      fontFamily:
        "Outfit",

      fontSize:
        x(28),

      lineHeight:
        y(36),

      textAlign:
        "center",

      includeFontPadding:
        false,
    },

    keypad: {
      position:
        "absolute",

      left:
        x(20),

      top:
        y(326),

      width:
        x(362),
    },

    numberRow: {
      width:
        x(240),

      height:
        y(62),

      marginLeft:
        x(61),

      marginBottom:
        y(10),

      flexDirection:
        "row",

      justifyContent:
        "space-between",
    },

    numberButton: {
      width:
        x(66),

      height:
        y(62),

      borderRadius:
        x(18),

      backgroundColor:
        "#DDEAEC",

      alignItems:
        "center",

      justifyContent:
        "center",

      shadowColor:
        "#000000",

      shadowOffset: {
        width: 0,
        height:
          y(3),
      },

      shadowOpacity:
        0.22,

      shadowRadius:
        x(4),

      elevation:
        4,
    },

    numberText: {
      color:
        colors.primary,

      fontFamily:
        "Outfit",

      fontSize:
        x(28),

      lineHeight:
        y(36),

      textAlign:
        "center",

      includeFontPadding:
        false,
    },

    specialRow: {
      width:
        x(322),

      height:
        y(62),

      marginLeft:
        x(20),

      flexDirection:
        "row",

      justifyContent:
        "space-between",
    },

    usePinButton: {
      width:
        x(112),

      height:
        y(62),

      borderRadius:
        x(18),

      backgroundColor:
        "#DDEAEC",

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        x(6),

      shadowColor:
        "#000000",

      shadowOffset: {
        width: 0,
        height:
          y(3),
      },

      shadowOpacity:
        0.22,

      shadowRadius:
        x(4),

      elevation:
        4,
    },

    zeroButton: {
      width:
        x(66),

      height:
        y(62),

      borderRadius:
        x(18),

      backgroundColor:
        "#DDEAEC",

      alignItems:
        "center",

      justifyContent:
        "center",

      shadowColor:
        "#000000",

      shadowOffset: {
        width: 0,
        height:
          y(3),
      },

      shadowOpacity:
        0.22,

      shadowRadius:
        x(4),

      elevation:
        4,
    },

    deleteButton: {
      width:
        x(112),

      height:
        y(62),

      borderRadius:
        x(18),

      backgroundColor:
        "#DDEAEC",

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        x(6),

      shadowColor:
        "#000000",

      shadowOffset: {
        width: 0,
        height:
          y(3),
      },

      shadowOpacity:
        0.22,

      shadowRadius:
        x(4),

      elevation:
        4,
    },

    specialButtonText: {
      color:
        colors.primary,

      fontFamily:
        "Outfit",

      fontSize:
        x(17),

      lineHeight:
        y(22),

      textAlign:
        "center",

      includeFontPadding:
        false,
    },

    numberButtonPressed: {
      opacity:
        0.7,

      transform: [
        {
          scale:
            0.97,
        },
      ],
    },

    disabledButton: {
      opacity:
        0.55,
    },

    error: {
      position:
        "absolute",

      left:
        x(20),

      top:
        y(615),

      width:
        x(362),

      minHeight:
        y(34),
    },

    verifyButtonWrapper: {
      position:
        "absolute",

      left:
        x(96),

      top:
        y(665),

      width:
        x(210),

      height:
        y(52),

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    backButtonWrapper: {
      position:
        "absolute",

      left:
        x(96),

      top:
        y(741),

      width:
        x(210),

      height:
        y(52),
    },

    actionButton: {
      width:
        x(210),

      height:
        y(52),

      borderRadius:
        x(20),

      shadowColor:
        "#000000",

      shadowOffset: {
        width: 0,
        height:
          y(4),
      },

      shadowOpacity:
        0.25,

      shadowRadius:
        x(4),

      elevation:
        5,
    },

    controlPressed: {
      opacity:
        0.65,
    },
  });