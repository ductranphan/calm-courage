/**
 * Parent verification screen.
 *
 * Appears when access to the parent area is requested.
 * Verifies the parent's four-digit PIN against the pinHash stored at:
 *
 * parents/{authenticatedUserUid}
 */

import { router } from "expo-router";
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
import { verifyParentPin } from "@/services/auth";
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

  const [pin, setPin] = useState("");
  const [
    audioEnabled,
    setAudioEnabled,
  ] = useState(false);

  const [verifying, setVerifying] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user]);

  function handleNumberPress(number: string) {
    if (
      verifying ||
      pin.length >= PIN_LENGTH
    ) {
      return;
    }

    setError(null);

    setPin((current) =>
      `${current}${number}`.slice(
        0,
        PIN_LENGTH,
      ),
    );
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
    setError(
      "PIN recovery is not available yet.",
    );
  }

  async function handleVerifyPin() {
    if (verifying) {
      return;
    }

    setError(null);

    if (!user?.uid) {
      setError("You must be signed in to continue.");
      return;
    }

    if (!isValidPin(pin)) {
      setError("Please enter your four-digit PIN.");
      return;
    }

    setVerifying(true);

    try {
      const pinIsCorrect = await verifyParentPin(
        user.uid,
        pin,
      );

      if (!pinIsCorrect) {
        setPin("");
        setError("The PIN you entered is incorrect.");
        return;
      }

      /*
      * Existing parent flow:
      *
      * Login
      * → PIN verification
      * → Parent dashboard
      */
      router.replace("/home");
    } catch (verificationError) {
      console.error(
        "Unable to verify parent PIN:",
        verificationError,
      );

      setError(
        verificationError instanceof Error
          ? verificationError.message
          : "We couldn’t verify your PIN. Please try again.",
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
              onPress={handleVerifyPin}
              style={styles.actionButton}
            />
          )}
        </View>

        <View
          style={styles.backButtonWrapper}
        >
          <AppButton
            title="Back to Child Mode"
            onPress={() =>
              router.replace(
                "/child-welcome",
              )
            }
            style={styles.actionButton}
          />
        </View>
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
    fontFamily: "Quiche",
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
    fontFamily: "Quiche",
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
    fontFamily: "Quiche",
    fontSize: x(18),
    lineHeight: y(21),
    textAlign: "center",
  },

  deleteText: {
    color: colors.primary,
    fontFamily: "Quiche",
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