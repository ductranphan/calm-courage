/**
 * Delete Account screen.
 *
 * Includes:
 * - permanent-deletion warning
 * - optional reasons for leaving
 * - optional written feedback
 * - Figma Screen 16.1 final-confirmation modal
 * - Figma Screen 16.2 account-deleted success modal
 * - one final-confirmation modal with both DELETE and login-password fields
 * - success modal is mounted only after deletion succeeds
 * - uses bye.svg and logo.svg from assets/images
 * - transparent parent footer/navbar wrapper
 */

import {
  router,
  type Href,
} from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import ParentBottomNav from "@/components/dashboard/ParentBottomNav";
import { colors } from "@/constants/colors";
import { useActiveChild } from "@/contexts/ActiveChildContext";
import { useAuth } from "@/contexts/AuthContext";
import { useParentAccess } from "@/contexts/ParentAccessContext";
import { x, y } from "@/utils/scaling";

import AudioOffIcon from "../../assets/icons/audio-off.svg";
import AudioOnIcon from "../../assets/icons/audio-on.svg";
import BackIcon from "../../assets/icons/back.svg";
import DeleteWarningIcon from "../../assets/icons/delete-warning.svg";
import ByeImage from "../../assets/images/bye.svg";
import LogoImage from "../../assets/images/logo.svg";

const FIGMA_CONTENT_HEIGHT = 940;
const FIXED_FOOTER_HEIGHT = 105;
const FIXED_FOOTER_BOTTOM = 20;
const FOOTER_SCROLL_SPACE = 125;

const LEAVING_REASONS = [
  "No longer use the app.",
  "Found a better alternative.",
  "Technical issues/bugs.",
  "Subscription is too expensive.",
  "Other.",
] as const;

type LeavingReason =
  (typeof LEAVING_REASONS)[number];

export default function DeleteAccountScreen() {
  const { deleteAccount } = useAuth();
  const { clearActiveChild } = useActiveChild();
  const { lockAccess } = useParentAccess();

  const [audioEnabled, setAudioEnabled] =
    useState(false);

  const [
    selectedReasons,
    setSelectedReasons,
  ] = useState<LeavingReason[]>([]);

  const [
    additionalFeedback,
    setAdditionalFeedback,
  ] = useState("");

  const [
    confirmationVisible,
    setConfirmationVisible,
  ] = useState(false);

  const [
    confirmationKeyword,
    setConfirmationKeyword,
  ] = useState("");

  const [
    deletionPassword,
    setDeletionPassword,
  ] = useState("");

  const [deleteError, setDeleteError] =
    useState<string | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  const [
    accountDeletedVisible,
    setAccountDeletedVisible,
  ] = useState(false);

  const keywordConfirmed = useMemo(
    () =>
      confirmationKeyword.trim() ===
      "DELETE",
    [confirmationKeyword],
  );

  const modalButtonDisabled =
    deleting ||
    !keywordConfirmed ||
    deletionPassword.trim().length === 0;

  function toggleReason(
    reason: LeavingReason,
  ) {
    setSelectedReasons((current) =>
      current.includes(reason)
        ? current.filter(
            (item) => item !== reason,
          )
        : [...current, reason],
    );
  }

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/settings" as Href);
  }

  function handleSwitchToChildMode() {
    router.replace(
      "/switch-to-child" as Href,
    );
  }

  function openConfirmation() {
    setConfirmationKeyword("");
    setDeletionPassword("");
    setDeleteError(null);
    setConfirmationVisible(true);
  }

  function closeConfirmation() {
    if (deleting) {
      return;
    }

    setConfirmationKeyword("");
    setDeletionPassword("");
    setDeleteError(null);
    setConfirmationVisible(false);
  }

  function handleReturnToLogin() {
    setAccountDeletedVisible(false);

    /*
     * After account deletion, return to the public entry screen
     * where the user can either create a new account or log in.
     */
    router.replace("/onboarding" as Href);
  }

  function handleFinalDeletePress() {
    if (modalButtonDisabled) {
      return;
    }

    setDeleteError(null);
    void confirmDeleteAccount();
  }

  async function confirmDeleteAccount() {
    if (deleting) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteAccount(
        deletionPassword,
        {
          reasons: selectedReasons,
          feedback: additionalFeedback,
        },
      );

      clearActiveChild();
      lockAccess();

      setConfirmationKeyword("");
      setDeletionPassword("");
      setConfirmationVisible(false);
      setAccountDeletedVisible(true);
    } catch (error) {
      console.error(
        "Unable to delete account:",
        error,
      );

      setDeleteError(
        error instanceof Error
          ? error.message
          : "Unable to delete account. Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          alwaysBounceVertical={false}
          overScrollMode="never"
          contentInsetAdjustmentBehavior="never"
        >
          <View style={styles.figmaFrame}>
            <Pressable
              style={({ pressed }) => [
                styles.backButton,
                pressed &&
                  styles.controlPressed,
              ]}
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Go back to settings"
              hitSlop={8}
            >
              <BackIcon
                width={x(37.24)}
                height={y(22.18)}
              />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.audioButton,
                pressed &&
                  styles.controlPressed,
              ]}
              onPress={() =>
                setAudioEnabled(
                  (current) => !current,
                )
              }
              accessibilityRole="button"
              accessibilityLabel={
                audioEnabled
                  ? "Turn audio off"
                  : "Turn audio on"
              }
              accessibilityState={{
                selected: audioEnabled,
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

            <Text style={styles.title}>
              Delete Account
            </Text>

            <View style={styles.topDivider} />

            <View style={styles.warningCard}>
              <View
                style={styles.warningIconWrapper}
              >
                <DeleteWarningIcon
                  width={x(49)}
                  height={x(49)}
                />
              </View>

              <Text style={styles.warningText}>
                <Text
                  style={styles.warningTextBold}
                >
                  Warning:{" "}
                </Text>
                Deleting your account is permanent.
                All progress tracking, child profiles,
                and subscription benefits will be lost
                immediately.
              </Text>
            </View>

            <View style={styles.reasonCard}>
              <Text style={styles.reasonTitle}>
                Please tell us why you are leaving
                {"\n"}
                (Optional):
              </Text>

              <View style={styles.reasonList}>
                {LEAVING_REASONS.map(
                  (reason) => {
                    const selected =
                      selectedReasons.includes(
                        reason,
                      );

                    return (
                      <Pressable
                        key={reason}
                        style={({ pressed }) => [
                          styles.reasonRow,
                          pressed &&
                            styles.controlPressed,
                        ]}
                        onPress={() =>
                          toggleReason(reason)
                        }
                        accessibilityRole="checkbox"
                        accessibilityLabel={reason}
                        accessibilityState={{
                          checked: selected,
                        }}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            selected &&
                              styles.checkboxSelected,
                          ]}
                        >
                          {selected ? (
                            <Text
                              style={
                                styles.checkboxMark
                              }
                            >
                              ✓
                            </Text>
                          ) : null}
                        </View>

                        <Text
                          style={styles.reasonText}
                        >
                          {reason}
                        </Text>
                      </Pressable>
                    );
                  },
                )}
              </View>

              <TextInput
                value={additionalFeedback}
                onChangeText={
                  setAdditionalFeedback
                }
                placeholder="Tell us more..."
                placeholderTextColor="#A7A8CB"
                multiline
                textAlignVertical="top"
                maxLength={500}
                style={styles.feedbackInput}
                accessibilityLabel="Additional feedback"
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.continueButton,
                pressed &&
                  styles.controlPressed,
              ]}
              onPress={openConfirmation}
              accessibilityRole="button"
              accessibilityLabel="Continue to delete account"
            >
              <Text
                style={styles.continueButtonText}
              >
                Continue to Delete Account
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.fixedFooter}>
        <Pressable
          style={({ pressed }) => [
            styles.switchToChildWrapper,
            pressed &&
              styles.controlPressed,
          ]}
          onPress={handleSwitchToChildMode}
          accessibilityRole="button"
          accessibilityLabel="Switch to child mode"
        >
          <Text
            style={styles.switchToChildText}
          >
            Switch to Child Mode
          </Text>
        </Pressable>

        <View
          style={styles.bottomNavWrapper}
        >
          <ParentBottomNav
            activeTab="settings"
          />
        </View>
      </View>

      <Modal
        visible={confirmationVisible}
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={closeConfirmation}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdropPasswordRequired}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : "height"
          }
        >
          <View
            style={styles.confirmationCardPasswordRequired}
          >
            <View
              style={
                styles.confirmationWarningIcon
              }
            >
              <DeleteWarningIcon
                width={x(49)}
                height={x(49)}
              />
            </View>

            <Text
              style={styles.confirmationTitle}
            >
              Final Confirmation
            </Text>

            <Text
              style={styles.confirmationText}
            >
              To confirm deletion,{"\n"}
              please type “DELETE”{"\n"}
              in the box below.
            </Text>

            <TextInput
              value={confirmationKeyword}
              onChangeText={(value) => {
                setDeleteError(null);
                setConfirmationKeyword(
                  value.toUpperCase(),
                );
              }}
              placeholder="Type “DELETE” here"
              placeholderTextColor="#A7A8CB"
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!deleting}
              returnKeyType="done"
              onSubmitEditing={
                modalButtonDisabled
                  ? undefined
                  : handleFinalDeletePress
              }
              style={styles.confirmationInput}
              accessibilityLabel="Type DELETE to confirm account deletion"
            />

            <Text
              style={styles.passwordPrompt}
            >
              Please confirm your password to continue.
            </Text>

            <TextInput
              value={deletionPassword}
              onChangeText={(value) => {
                setDeleteError(null);
                setDeletionPassword(value);
              }}
              placeholder="Enter your password"
              placeholderTextColor="#A7A8CB"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!deleting}
              returnKeyType="done"
              onSubmitEditing={
                modalButtonDisabled
                  ? undefined
                  : handleFinalDeletePress
              }
              style={styles.passwordInput}
              accessibilityLabel="Password to confirm account deletion"
            />

            {deleteError ? (
              <Text
                style={[
                  styles.deleteError,
                  styles.deleteErrorPasswordRequired,
                ]}
                accessibilityRole="alert"
              >
                {deleteError}
              </Text>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.finalDeleteButton,
                styles.finalDeleteButtonPasswordRequired,
                modalButtonDisabled
                  ? styles.finalDeleteButtonDisabled
                  : styles.finalDeleteButtonEnabled,
                pressed &&
                  !modalButtonDisabled &&
                  styles.controlPressed,
              ]}
              onPress={handleFinalDeletePress}
              disabled={modalButtonDisabled}
              accessibilityRole="button"
              accessibilityLabel="Delete my account permanently"
              accessibilityState={{
                disabled:
                  modalButtonDisabled,
              }}
            >
              {deleting ? (
                <ActivityIndicator
                  color={colors.white}
                />
              ) : (
                <Text
                  style={[
                    styles.finalDeleteButtonText,
                    !modalButtonDisabled &&
                      styles.finalDeleteButtonTextEnabled,
                  ]}
                >
                  Delete My Account
                </Text>
              )}
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                styles.cancelButtonPasswordRequired,
                pressed &&
                  styles.controlPressed,
                deleting &&
                  styles.disabledControl,
              ]}
              onPress={closeConfirmation}
              disabled={deleting}
              accessibilityRole="button"
              accessibilityLabel="Cancel account deletion"
            >
              <Text
                style={styles.cancelButtonText}
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {accountDeletedVisible ? (
        <Modal
          visible
          transparent
          animationType="fade"
          presentationStyle="overFullScreen"
          statusBarTranslucent
          onRequestClose={() => {
          }}
        >
          <View style={styles.accountDeletedBackdrop}>
            <View style={styles.accountDeletedCard}>
              <View style={styles.byeImage}>
                <ByeImage
                  width="100%"
                  height="100%"
                  accessibilityLabel="Waving hand"
                />
              </View>

              <View style={styles.deletedLogoShadow}>
                <LogoImage
                  width="100%"
                  height="100%"
                  accessibilityLabel="Calm Courage Company logo"
                />
              </View>

              <Text style={styles.accountDeletedTitle}>
                Account Deleted
              </Text>

              <Text style={styles.accountDeletedText}>
                Your account and all{"\n"}
                associated data have been{"\n"}
                successfully deleted.{"\n"}
                We’re sad to see you go!
              </Text>

              <Pressable
                style={({ pressed }) => [
                  styles.returnToLoginButton,
                  pressed && styles.controlPressed,
                ]}
                onPress={handleReturnToLogin}
                accessibilityRole="button"
                accessibilityLabel="Return to login screen"
              >
                <Text style={styles.returnToLoginButtonText}>
                  Return to Login Screen
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: "relative",
    backgroundColor: "#F1F3F5",
  },

  keyboardAvoidingView: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
    backgroundColor: "#F1F3F5",
  },

  scrollContent: {
    flexGrow: 1,
    minHeight: y(
      FIGMA_CONTENT_HEIGHT +
        FOOTER_SCROLL_SPACE,
    ),
    paddingBottom: y(
      FOOTER_SCROLL_SPACE,
    ),
    backgroundColor: "#F1F3F5",
  },

  figmaFrame: {
    position: "relative",
    width: "100%",
    height: y(FIGMA_CONTENT_HEIGHT),
    backgroundColor: "#F1F3F5",
  },

  backButton: {
    position: "absolute",
    left: x(30),
    top: y(48),
    width: x(40),
    height: y(35),
    alignItems: "flex-start",
    justifyContent: "center",
    zIndex: 10,
  },

  audioButton: {
    position: "absolute",
    left: x(347),
    top: y(48),
    width: x(35),
    height: x(35),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  title: {
    position: "absolute",
    left: x(20),
    top: y(123),
    width: x(362),
    height: y(38),
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(30),
    lineHeight: y(38),
    textAlign: "center",
  },

  topDivider: {
    position: "absolute",
    left: x(20),
    top: y(188),
    width: x(362),
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.primary,
  },

  warningCard: {
    position: "absolute",
    left: x(20),
    top: y(227),
    width: x(362),
    height: y(156),
    borderWidth: 1,
    borderColor: "#EA5757",
    borderRadius: x(20),
    backgroundColor: "#FFDADA",
  },

  warningIconWrapper: {
    position: "absolute",
    left: x(10),
    top: y(15),
    width: x(49),
    height: x(49),
    alignItems: "center",
    justifyContent: "center",
  },

  warningText: {
    position: "absolute",
    left: x(67),
    top: y(14),
    width: x(287),
    minHeight: y(125),
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(20),
    lineHeight: y(24),
  },

  warningTextBold: {
    fontFamily: "OutfitBold",
  },

  reasonCard: {
    position: "absolute",
    left: x(20),
    top: y(408),
    width: x(362),
    height: y(437),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: x(20),
    backgroundColor: colors.white,
  },

  reasonTitle: {
    position: "absolute",
    left: x(20),
    top: y(25),
    width: x(321),
    height: y(48),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
  },

  reasonList: {
    position: "absolute",
    left: x(20),
    top: y(92),
    width: x(321),
  },

  reasonRow: {
    width: x(321),
    height: y(38),
    flexDirection: "row",
    alignItems: "center",
  },

  checkbox: {
    width: x(24),
    height: x(24),
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxSelected: {
    borderColor: "#8D4AE8",
  },

  checkboxMark: {
    color: "#8D4AE8",
    fontFamily: "OutfitBold",
    fontSize: x(18),
    lineHeight: y(22),
  },

  reasonText: {
    flex: 1,
    marginLeft: x(15),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
  },

  feedbackInput: {
    position: "absolute",
    left: x(20),
    top: y(297),
    width: x(320),
    height: y(122),
    borderWidth: 1,
    borderColor: "#A7A8CB",
    borderRadius: x(20),
    backgroundColor: colors.white,
    paddingHorizontal: x(20),
    paddingTop: y(17),
    paddingBottom: y(17),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
  },

  continueButton: {
    position: "absolute",
    left: x(20),
    top: y(870),
    width: x(362),
    height: y(52),
    borderRadius: x(20),
    backgroundColor: "#E8D8F1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 5,
  },

  continueButtonText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textAlign: "center",
  },

  fixedFooter: {
    position: "absolute",
    left: x(20),
    bottom: y(
      FIXED_FOOTER_BOTTOM,
    ),
    width: x(362),
    height: y(
      FIXED_FOOTER_HEIGHT,
    ),
    backgroundColor: "transparent",
    zIndex: 50,
  },

  switchToChildWrapper: {
    position: "absolute",
    left: 0,
    top: 0,
    minWidth: x(226),
    height: y(28),
    justifyContent: "center",
    backgroundColor: "transparent",
  },

  switchToChildText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textDecorationLine: "underline",
  },

  bottomNavWrapper: {
    position: "absolute",
    left: 0,
    top: y(33),
    width: x(362),
    height: y(72),
    borderRadius: x(50),
    backgroundColor: "transparent",
    overflow: "visible",
    zIndex: 50,
  },

  modalBackdropPasswordRequired: {
    flex: 1,
    paddingTop: y(105),
    backgroundColor:
      "rgba(0, 0, 0, 0.50)",
    alignItems: "center",
    justifyContent: "flex-start",
  },

  confirmationCardPasswordRequired: {
    position: "relative",
    width: x(331),
    height: y(600),
    borderRadius: x(20),
    backgroundColor: "#F1F3F5",
  },

  confirmationWarningIcon: {
    position: "absolute",
    left: x(141),
    top: y(34),
    width: x(49),
    height: x(49),
    alignItems: "center",
    justifyContent: "center",
  },

  confirmationTitle: {
    position: "absolute",
    left: x(28),
    top: y(86),
    width: x(275),
    height: y(38),
    color: colors.primary,
    fontFamily: "OutfitBold",
    fontSize: x(30),
    lineHeight: y(38),
    textAlign: "center",
    includeFontPadding: false,
  },

  confirmationText: {
    position: "absolute",
    left: x(58),
    top: y(139),
    width: x(215),
    minHeight: y(74),
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(20),
    lineHeight: y(24),
    textAlign: "center",
    includeFontPadding: false,
  },

  confirmationInput: {
    position: "absolute",
    left: x(15.5),
    top: y(232),
    width: x(300),
    height: y(72),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: x(20),
    backgroundColor: colors.white,
    paddingHorizontal: x(20),
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(20),
    lineHeight: y(24),
    includeFontPadding: false,
  },

  passwordPrompt: {
    position: "absolute",
    left: x(20),
    top: y(316),
    width: x(291),
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(15),
    lineHeight: y(19),
    textAlign: "center",
  },

  passwordInput: {
    position: "absolute",
    left: x(15.5),
    top: y(345),
    width: x(300),
    height: y(60),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: x(20),
    backgroundColor: colors.white,
    paddingHorizontal: x(20),
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(20),
    lineHeight: y(24),
    includeFontPadding: false,
  },

  deleteError: {
    position: "absolute",
    left: x(18),
    top: y(307),
    width: x(295),
    color: "#B00020",
    fontFamily: "Outfit",
    fontSize: x(13),
    lineHeight: y(16),
    textAlign: "center",
  },

  deleteErrorPasswordRequired: {
    top: y(411),
  },

  finalDeleteButton: {
    position: "absolute",
    left: x(15.5),
    top: y(323),
    width: x(300),
    height: y(52),
    borderRadius: x(20),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 5,
  },

  finalDeleteButtonPasswordRequired: {
    top: y(455),
  },

  finalDeleteButtonDisabled: {
    backgroundColor: "#D9D9D9",
  },

  finalDeleteButtonEnabled: {
    backgroundColor: "#EA5757",
  },

  finalDeleteButtonText: {
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(20),
    lineHeight: y(24),
    textAlign: "center",
  },

  finalDeleteButtonTextEnabled: {
    color: colors.white,
    fontFamily: "OutfitBold",
  },

  cancelButton: {
    position: "absolute",
    left: x(15.5),
    top: y(392),
    width: x(300),
    height: y(52),
    borderRadius: x(20),
    backgroundColor: "#E8D8F1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 5,
  },

  cancelButtonPasswordRequired: {
    top: y(524),
  },

  cancelButtonText: {
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(20),
    lineHeight: y(24),
    textAlign: "center",
  },

  accountDeletedBackdrop: {
    flex: 1,
    paddingTop: y(154),
    backgroundColor: "rgba(0, 0, 0, 0.50)",
    alignItems: "center",
    justifyContent: "flex-start",
  },

  accountDeletedCard: {
    position: "relative",
    width: x(331),
    height: y(500),
    borderRadius: x(20),
    backgroundColor: "#F1F3F5",
  },

  byeImage: {
    position: "absolute",
    left: x(47),
    top: y(42),
    width: x(131),
    height: y(131),
  },

  deletedLogoShadow: {
    position: "absolute",
    left: x(151),
    top: y(117),
    width: x(130),
    height: y(45),
  },

  accountDeletedTitle: {
    position: "absolute",
    left: x(30),
    top: y(208),
    width: x(274),
    height: y(38),
    color: colors.primary,
    fontFamily: "OutfitBold",
    fontSize: x(30),
    lineHeight: y(38),
    textAlign: "center",
    includeFontPadding: false,
  },

  accountDeletedText: {
    position: "absolute",
    left: x(30),
    top: y(259),
    width: x(271),
    minHeight: y(96),
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(20),
    lineHeight: y(24),
    textAlign: "center",
    includeFontPadding: false,
  },

  returnToLoginButton: {
    position: "absolute",
    left: x(16),
    top: y(392),
    width: x(300),
    height: y(52),
    borderRadius: x(20),
    backgroundColor: "#E6D8EB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 5,
  },

  returnToLoginButtonText: {
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(20),
    lineHeight: y(24),
    textAlign: "center",
    includeFontPadding: false,
  },

  controlPressed: {
    opacity: 0.65,
  },

  disabledControl: {
    opacity: 0.55,
  },
});