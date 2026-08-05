/**
 * Delete Account screen.
 *
 * Matches Figma Screen 16.0:
 * - permanent-deletion warning
 * - optional reasons for leaving
 * - optional written feedback
 * - fixed parent footer
 *
 * The existing Firebase deletion flow remains protected by password
 * reauthentication after the parent taps Continue.
 */

import {
  router,
  type Href,
} from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

  const [password, setPassword] =
    useState("");

  const [deleteError, setDeleteError] =
    useState<string | null>(null);

  const [deleting, setDeleting] =
    useState(false);

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
    setPassword("");
    setDeleteError(null);
    setConfirmationVisible(true);
  }

  function closeConfirmation() {
    if (deleting) {
      return;
    }

    setPassword("");
    setDeleteError(null);
    setConfirmationVisible(false);
  }

  function handleDeletePress() {
    if (deleting) {
      return;
    }

    setDeleteError(null);

    if (!password.trim()) {
      setDeleteError(
        "Enter your password to delete your account.",
      );
      return;
    }

    Alert.alert(
      "Permanently Delete Account?",
      "This will permanently delete your parent account, child profiles, check-ins, progress, rewards, and subscription data. This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void confirmDeleteAccount();
          },
        },
      ],
    );
  }

  async function confirmDeleteAccount() {
    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteAccount(
        password,
        {
          reasons:
            selectedReasons,
          feedback:
            additionalFeedback,
        },
      );

      clearActiveChild();
      lockAccess();

      setPassword("");
      setConfirmationVisible(false);

      router.replace(
        "/onboarding" as Href,
      );
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
          style={styles.modalBackdrop}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : "height"
          }
        >
          <View
            style={styles.confirmationCard}
          >
            <Text
              style={styles.confirmationTitle}
            >
              Final Confirmation
            </Text>

            <Text
              style={styles.confirmationText}
            >
              Enter your password to permanently
              delete your account and all child data.
            </Text>

            <TextInput
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setDeleteError(null);
              }}
              placeholder="Password"
              placeholderTextColor="#A7A8CB"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!deleting}
              style={styles.passwordInput}
              accessibilityLabel="Password for account deletion"
            />

            {deleteError ? (
              <Text
                style={styles.deleteError}
                accessibilityRole="alert"
              >
                {deleteError}
              </Text>
            ) : null}

            <View
              style={styles.confirmationActions}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.cancelButton,
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

              <Pressable
                style={({ pressed }) => [
                  styles.deleteButton,
                  pressed &&
                    styles.controlPressed,
                  deleting &&
                    styles.disabledControl,
                ]}
                onPress={handleDeletePress}
                disabled={deleting}
                accessibilityRole="button"
                accessibilityLabel="Permanently delete account"
              >
                {deleting ? (
                  <ActivityIndicator
                    color={colors.white}
                  />
                ) : (
                  <Text
                    style={styles.deleteButtonText}
                  >
                    Delete
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    backgroundColor: "#F1F3F5",
    overflow: "hidden",
    zIndex: 50,
    elevation: 12,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.12,
    shadowRadius: x(5),
  },

  modalBackdrop: {
    flex: 1,
    paddingHorizontal: x(20),
    backgroundColor:
      "rgba(0, 0, 0, 0.50)",
    alignItems: "center",
    justifyContent: "center",
  },

  confirmationCard: {
    width: x(362),
    minHeight: y(340),
    paddingHorizontal: x(24),
    paddingVertical: y(28),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: x(20),
    backgroundColor: "#F1F3F5",
  },

  confirmationTitle: {
    color: colors.primary,
    fontFamily: "OutfitBold",
    fontSize: x(28),
    lineHeight: y(35),
    textAlign: "center",
  },

  confirmationText: {
    marginTop: y(18),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(16),
    lineHeight: y(23),
    textAlign: "center",
  },

  passwordInput: {
    width: "100%",
    height: y(52),
    marginTop: y(24),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: x(16),
    backgroundColor: colors.white,
    paddingHorizontal: x(16),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(18),
  },

  deleteError: {
    marginTop: y(10),
    color: "#B00020",
    fontFamily: "Literata",
    fontSize: x(14),
    lineHeight: y(18),
    textAlign: "center",
  },

  confirmationActions: {
    width: "100%",
    marginTop: y(25),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cancelButton: {
    width: x(138),
    height: y(50),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: x(18),
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(18),
    lineHeight: y(23),
  },

  deleteButton: {
    width: x(138),
    height: y(50),
    borderRadius: x(18),
    backgroundColor: "#B00020",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteButtonText: {
    color: colors.white,
    fontFamily: "LiterataBold",
    fontSize: x(18),
    lineHeight: y(23),
  },

  controlPressed: {
    opacity: 0.65,
  },

  disabledControl: {
    opacity: 0.55,
  },
});