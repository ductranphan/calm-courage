/**
 * Parent verification screen.
 *
 * Appears when access to the parent area is requested.
 * Verifies the parent's four-digit PIN against the pinHash stored at:
 *
 * parents/{authenticatedUserUid}
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
  verifyParentPin,
} from "@/services/auth";
import { listChildren } from "@/services/children";
import { isValidPin } from "@/utils/pin";
import { x, y } from "@/utils/scaling";

import AudioOffIcon from "../../assets/icons/audio-off.svg";
import AudioOnIcon from "../../assets/icons/audio-on.svg";

const PIN_LENGTH = 4;

const numberRows = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
];

export default function ParentVerificationScreen() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const {
    childModeActive,
    parentAccessGranted,
    unlockParentAccess,
  } = useParentAccess();

  const [pin, setPin] = useState("");
  const [
    audioEnabled,
    setAudioEnabled,
  ] = useState(false);

  const [verifying, setVerifying] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [destinationAfterUnlock, setDestinationAfterUnlock] =
    useState<Href | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (
      parentAccessGranted &&
      destinationAfterUnlock
    ) {
      const destination = destinationAfterUnlock;
      setDestinationAfterUnlock(null);
      router.replace(destination);
    }
  }, [
    destinationAfterUnlock,
    parentAccessGranted,
  ]);

  function handleNumberPress(number: string) {
    if (
      verifying ||
      pin.length >= PIN_LENGTH
    ) {
      return;
    }

    setError(null);

    const nextPin = `${pin}${number}`.slice(
      0,
      PIN_LENGTH,
    );

    setPin(nextPin);

    /*
     * Auto-submit once all four digits are entered so parents do not
     * need to find the Verify button below the keypad.
     */
    if (nextPin.length === PIN_LENGTH) {
      void handleVerifyPin(nextPin);
    }
  }

  function handleDelete() {
    if (verifying) {
      return;
    }

    setError(null);
    setPin((current) =>
      current.slice(0, -1),
    );
  }

  function handleForgotPin() {
    if (verifying) {
      return;
    }

    setError(null);
    router.push("./forgot-pin-math");
  }

  async function handleVerifyPin(
    pinToVerify: string = pin,
  ) {
    if (verifying) {
      return;
    }

    setError(null);

    if (!user?.uid) {
      setError("You must be signed in to continue.");
      return;
    }

    if (!isValidPin(pinToVerify)) {
      setError("Please enter your four-digit PIN.");
      return;
    }

    setVerifying(true);

    try {
      const pinIsCorrect = await verifyParentPin(
        user.uid,
        pinToVerify,
      );

      if (!pinIsCorrect) {
        setPin("");
        setError("The PIN you entered is incorrect.");
        return;
      }

      const children = await listChildren(user.uid);

      /*
       * A verified parent account without a child profile has not
       * finished onboarding yet. Continue from child setup instead
       * of opening an empty parent dashboard.
       */
      if (children.length === 0) {
        setDestinationAfterUnlock(
          "/child-profile-info",
        );
        unlockParentAccess();
        return;
      }

      /*
       * Repair older accounts that already have a child but still
       * contain onboardingComplete: false in Firestore.
       */
      const profile = await getUserProfile(user.uid);

      if (profile && !profile.onboardingComplete) {
        await completeOnboarding(user.uid);
      }

      setDestinationAfterUnlock("/home");
      unlockParentAccess();
    } catch (verificationError) {
      console.error(
        "Unable to complete parent verification:",
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

  if (authLoading) {
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
      contentContainerStyle={
        styles.scrollContent
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.figmaFrame}>
        <Pressable
          style={styles.audioButton}
          onPress={() =>
            setAudioEnabled(
              (current) => !current,
            )
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
          Enter your 4-digit PIN to access
          {"\n"}
          Parent Settings.
        </Text>

        <Text style={styles.pinLabel}>
          PIN
        </Text>

        <View style={styles.pinBoxesRow}>
          {Array.from(
            { length: PIN_LENGTH },
            (_, index) => (
              <View
                key={index}
                style={styles.pinBox}
                accessibilityLabel={
                  pin[index]
                    ? `PIN digit ${
                        index + 1
                      } entered`
                    : `PIN digit ${
                        index + 1
                      } empty`
                }
              >
                <Text style={styles.pinDot}>
                  {pin[index] ? "•" : ""}
                </Text>
              </View>
            ),
          )}
        </View>

        <View style={styles.keypad}>
          {numberRows.map(
            (row, rowIndex) => (
              <View
                key={rowIndex}
                style={styles.numberRow}
              >
                {row.map((number) => (
                  <Pressable
                    key={number}
                    style={[
                      styles.numberButton,
                      verifying &&
                        styles.disabledButton,
                    ]}
                    onPress={() =>
                      handleNumberPress(
                        number,
                      )
                    }
                    disabled={verifying}
                    accessibilityRole="button"
                    accessibilityLabel={`Enter ${number}`}
                  >
                    <Text
                      style={
                        styles.numberText
                      }
                    >
                      {number}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ),
          )}

          <View style={styles.specialRow}>
            <Pressable
              style={[
                styles.specialButton,
                verifying &&
                  styles.disabledButton,
              ]}
              onPress={handleForgotPin}
              disabled={verifying}
              accessibilityRole="button"
              accessibilityLabel="Forgot PIN"
            >
              <Text
                style={
                  styles.specialButtonText
                }
              >
                Forgot{"\n"}PIN? (Math)
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.zeroButton,
                verifying &&
                  styles.disabledButton,
              ]}
              onPress={() =>
                handleNumberPress("0")
              }
              disabled={verifying}
              accessibilityRole="button"
              accessibilityLabel="Enter zero"
            >
              <Text style={styles.numberText}>
                0
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.specialButton,
                (verifying ||
                  pin.length === 0) &&
                  styles.disabledButton,
              ]}
              onPress={handleDelete}
              disabled={
                verifying ||
                pin.length === 0
              }
              accessibilityRole="button"
              accessibilityLabel="Delete last PIN digit"
            >
              <Text style={styles.deleteText}>
                Delete
              </Text>
            </Pressable>
          </View>
        </View>

        <ErrorMessage
          message={error}
          style={styles.error}
        />

        <View
          style={
            styles.verifyButtonWrapper
          }
        >
          {verifying ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />
          ) : (
            <AppButton
              title="Verify & Enter"
              onPress={() => {
                void handleVerifyPin();
              }}
              style={styles.actionButton}
            />
          )}
        </View>

        {childModeActive ? (
          <View
            style={styles.backButtonWrapper}
          >
            <AppButton
              title="Back to Child Mode"
              onPress={() =>
                router.replace(
                  "/child-dashboard" as Href,
                )
              }
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
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
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

  pinLabel: {
    position: "absolute",
    left: x(20),
    top: y(312),
    width: x(292),
    height: y(24),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
  },

  pinBoxesRow: {
    position: "absolute",
    left: x(20),
    top: y(351),
    width: x(362),
    height: y(85),
    flexDirection: "row",
    justifyContent: "space-between",
  },

  pinBox: {
    width: x(76),
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

  pinDot: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(32),
    lineHeight: y(39),
    textAlign: "center",
  },

  keypad: {
    position: "absolute",
    left: x(20),
    top: y(514),
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

  specialButton: {
    width: x(123),
    height: y(85),
    borderRadius: x(20),
    backgroundColor: "#DDEAEC",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: x(5),

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

  disabledButton: {
    opacity: 0.55,
  },

  specialButtonText: {
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(18),
    lineHeight: y(21),
    textAlign: "center",
  },

  deleteText: {
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(20),
    lineHeight: y(25),
    textAlign: "center",
  },

  error: {
    position: "absolute",
    left: x(20),
    top: y(930),
    width: x(362),
  },

  verifyButtonWrapper: {
    position: "absolute",
    left: x(96),
    top: y(991),
    width: x(210),
    height: y(52),
    alignItems: "center",
    justifyContent: "center",
  },

  backButtonWrapper: {
    position: "absolute",
    left: x(96),
    top: y(1063),
    width: x(210),
    height: y(52),
  },

  actionButton: {
    width: x(210),
    height: y(52),
    borderRadius: x(20),

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 5,
  },
});