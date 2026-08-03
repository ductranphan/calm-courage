/**
 * Parent settings screen.
 *
 * Notification preferences and subscription actions are currently local UI.
 * Account deletion keeps the existing Firebase deletion flow.
 */

import { router } from "expo-router";
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
  useWindowDimensions,
  View,
} from "react-native";

import ParentBottomNav from "@/components/dashboard/ParentBottomNav";
import TermsModal from "@/components/modals/TermsModal";
import AppButton from "@/components/ui/AppButton";
import {
  type ConsentDocumentKind,
} from "@/constants/consent";
import { colors } from "@/constants/colors";
import { useActiveChild } from "@/contexts/ActiveChildContext";
import { useAuth } from "@/contexts/AuthContext";
import { useParentAccess } from "@/contexts/ParentAccessContext";
import { x, y } from "@/utils/scaling";

import AudioOffIcon from "../../assets/icons/audio-off.svg";
import AudioOnIcon from "../../assets/icons/audio-on.svg";

const FIGMA_CONTENT_HEIGHT = 1320;
const FIXED_FOOTER_HEIGHT = 105;
const FIXED_FOOTER_BOTTOM = 20;
const FOOTER_SCROLL_SPACE = 125;

type SettingsToggleProps = {
  enabled: boolean;
  onChange: () => void;
  accessibilityLabel: string;
};

type SettingsRowProps = {
  label: string;
  onPress: () => void;
  accessibilityLabel: string;
  style?: object;
  multiline?: boolean;
  disabled?: boolean;
};

function SettingsToggle({
  enabled,
  onChange,
  accessibilityLabel,
}: SettingsToggleProps) {
  return (
    <Pressable
      style={[
        styles.toggle,
        enabled
          ? styles.toggleEnabled
          : styles.toggleDisabled,
      ]}
      onPress={onChange}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: enabled }}
      hitSlop={8}
    >
      <View
        style={[
          styles.toggleThumb,
          enabled
            ? styles.toggleThumbEnabled
            : styles.toggleThumbDisabled,
        ]}
      />
    </Pressable>
  );
}

function ChevronRight() {
  return <View style={styles.chevronRight} />;
}

function SettingsRow({
  label,
  onPress,
  accessibilityLabel,
  style,
  multiline = false,
  disabled = false,
}: SettingsRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingsRow,
        style,
        pressed && !disabled && styles.controlPressed,
        disabled && styles.disabledControl,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
    >
      <Text
        style={[
          styles.settingsRowText,
          multiline &&
            styles.settingsRowTextMultiline,
        ]}
      >
        {label}
      </Text>

      <View style={styles.chevronWrapper}>
        <ChevronRight />
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { height: viewportHeight } =
    useWindowDimensions();

  const {
    signOut: signOutUser,
    deleteAccount,
  } = useAuth();

  const { clearActiveChild } = useActiveChild();
  const { lockAccess } = useParentAccess();

  const [audioEnabled, setAudioEnabled] =
    useState(false);

  const [
    pushNotifications,
    setPushNotifications,
  ] = useState(false);

  const [
    weeklyEmailReports,
    setWeeklyEmailReports,
  ] = useState(false);

  const [
    legalModalDocument,
    setLegalModalDocument,
  ] =
    useState<ConsentDocumentKind | null>(
      null,
    );

  const [
    deleteModalVisible,
    setDeleteModalVisible,
  ] = useState(false);

  const [
    deletePassword,
    setDeletePassword,
  ] = useState("");

  const [
    deleteError,
    setDeleteError,
  ] = useState<string | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  const [signingOut, setSigningOut] =
    useState(false);

  const termsModalTranslateY =
    (viewportHeight - y(570)) / 2 -
    y(258);

  function handleSubscribe() {
    Alert.alert(
      "Membership Plan",
      "Subscription and payment functionality will be connected later.",
    );
  }

  function handleHelpSupport() {
    router.push("/help-support");
  }

  function handleLegalDocuments() {
    setLegalModalDocument("termsOfUse");
  }

  function handleChangePassword() {
    router.push("/forgot-password");
  }

  function handleSwitchToChildMode() {
    router.replace("/switch-to-child");
  }

  function handleLogoutPress() {
    if (signingOut) {
      return;
    }

    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          onPress: () => {
            void confirmLogout();
          },
        },
      ],
    );
  }

  async function confirmLogout() {
    setSigningOut(true);

    try {
      lockAccess();
      clearActiveChild();
      await signOutUser();
      router.replace("/login");
    } catch (error) {
      console.error(
        "Unable to log out:",
        error,
      );

      Alert.alert(
        "Unable to Log Out",
        error instanceof Error
          ? error.message
          : "Please try again.",
      );
    } finally {
      setSigningOut(false);
    }
  }

  function openDeleteModal() {
    if (deleting) {
      return;
    }

    setDeletePassword("");
    setDeleteError(null);
    setDeleteModalVisible(true);
  }

  function closeDeleteModal() {
    if (deleting) {
      return;
    }

    setDeletePassword("");
    setDeleteError(null);
    setDeleteModalVisible(false);
  }

  function handleDeleteAccountPress() {
    if (deleting) {
      return;
    }

    setDeleteError(null);

    if (!deletePassword.trim()) {
      setDeleteError(
        "Enter your password to delete your account.",
      );
      return;
    }

    Alert.alert(
      "Delete Account",
      "This permanently deletes your parent account, all child profiles, check-ins, progress, and rewards. This cannot be undone.",
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
      await deleteAccount(deletePassword);
      clearActiveChild();
      lockAccess();
      setDeletePassword("");
      setDeleteModalVisible(false);
      router.replace("/onboarding");
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
        contentInsetAdjustmentBehavior="never"
      >
        <View style={styles.figmaFrame}>
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
            Settings
          </Text>

          <View style={styles.topDivider} />

          <Text
            style={styles.notificationsTitle}
          >
            Notifications
          </Text>

          <Text
            style={
              styles.pushNotificationsText
            }
          >
            Push Notifications
          </Text>

          <View
            style={
              styles.pushNotificationsToggle
            }
          >
            <SettingsToggle
              enabled={pushNotifications}
              onChange={() =>
                setPushNotifications(
                  (current) => !current,
                )
              }
              accessibilityLabel="Push notifications"
            />
          </View>

          <Text
            style={styles.weeklyReportsText}
          >
            Weekly Email Reports
          </Text>

          <View
            style={
              styles.weeklyReportsToggle
            }
          >
            <SettingsToggle
              enabled={weeklyEmailReports}
              onChange={() =>
                setWeeklyEmailReports(
                  (current) => !current,
                )
              }
              accessibilityLabel="Weekly email reports"
            />
          </View>

          <View
            style={
              styles.notificationsDivider
            }
          />

          <Text
            style={styles.membershipTitle}
          >
            Membership Plan
          </Text>

          <View
            style={styles.membershipCard}
          >
            <Text
              style={
                styles.membershipDescription
              }
            >
              Unlock all 20 scenario cards
              &amp;{"\n"}
              parent insights!
            </Text>

            <Text
              style={styles.membershipPrice}
            >
              Monthly Subscription Pricing:
              {"\n"}
              $7.99/mo
            </Text>

            <View
              style={
                styles.subscribeButtonWrapper
              }
            >
              <AppButton
                title="Subscribe Now"
                onPress={handleSubscribe}
                style={
                  styles.subscribeButton
                }
              />
            </View>
          </View>

          <View
            style={styles.supportDivider}
          />

          <Text style={styles.supportTitle}>
            Support &amp; Legal
          </Text>

          <SettingsRow
            label="Help & Support"
            onPress={handleHelpSupport}
            accessibilityLabel="Open Help and Support"
            style={styles.helpSupportRow}
          />

          <SettingsRow
            label={
              "Terms of Service\n& Privacy Policy"
            }
            onPress={handleLegalDocuments}
            accessibilityLabel="Open Terms of Service and Privacy Policy"
            style={styles.legalRow}
            multiline
          />

          <View
            style={styles.accountDivider}
          />

          <Text
            style={
              styles.accountSettingsTitle
            }
          >
            Account Settings
          </Text>

          <SettingsRow
            label="Change Password"
            onPress={handleChangePassword}
            accessibilityLabel="Change password"
            style={
              styles.changePasswordRow
            }
          />

          <SettingsRow
            label={
              signingOut
                ? "Logging Out..."
                : "Log Out"
            }
            onPress={handleLogoutPress}
            accessibilityLabel="Log out"
            style={styles.logoutRow}
            disabled={signingOut}
          />

          <SettingsRow
            label="Delete Account"
            onPress={openDeleteModal}
            accessibilityLabel="Delete account"
            style={
              styles.deleteAccountRow
            }
            disabled={deleting}
          />
        </View>
      </ScrollView>

      <View style={styles.fixedFooter}>
        <Pressable
          style={({ pressed }) => [
            styles.switchToChildWrapper,
            pressed &&
              styles.controlPressed,
          ]}
          onPress={
            handleSwitchToChildMode
          }
          accessibilityRole="button"
          accessibilityLabel="Switch to child mode"
        >
          <Text
            style={
              styles.switchToChildText
            }
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
        visible={legalModalDocument !== null}
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={() =>
          setLegalModalDocument(null)
        }
      >
        <View style={styles.termsModalBackdrop}>
          <View
            style={[
              styles.termsModalPositioner,
              {
                transform: [
                  {
                    translateY:
                      termsModalTranslateY,
                  },
                ],
              },
            ]}
          >
            <TermsModal
              visible={
                legalModalDocument !== null
              }
              document={legalModalDocument}
              onClose={() =>
                setLegalModalDocument(null)
              }
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeDeleteModal}
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
            style={styles.deleteModalCard}
          >
            <Text
              style={
                styles.deleteModalTitle
              }
            >
              Delete Account
            </Text>

            <Text
              style={
                styles.deleteModalText
              }
            >
              Enter your password to
              permanently delete your account
              and all child data.
            </Text>

            <TextInput
              value={deletePassword}
              onChangeText={(value) => {
                setDeletePassword(value);
                setDeleteError(null);
              }}
              placeholder="Password"
              placeholderTextColor={
                colors.muted
              }
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!deleting}
              style={
                styles.deletePasswordInput
              }
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
              style={
                styles.deleteModalActions
              }
            >
              <Pressable
                style={({ pressed }) => [
                  styles.cancelDeleteButton,
                  pressed &&
                    styles.controlPressed,
                ]}
                onPress={closeDeleteModal}
                disabled={deleting}
                accessibilityRole="button"
                accessibilityLabel="Cancel account deletion"
              >
                <Text
                  style={
                    styles.cancelDeleteText
                  }
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.confirmDeleteButton,
                  pressed &&
                    styles.controlPressed,
                  deleting &&
                    styles.disabledControl,
                ]}
                onPress={
                  handleDeleteAccountPress
                }
                disabled={deleting}
                accessibilityRole="button"
                accessibilityLabel="Confirm account deletion"
              >
                {deleting ? (
                  <ActivityIndicator
                    color={colors.white}
                  />
                ) : (
                  <Text
                    style={
                      styles.confirmDeleteText
                    }
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
    backgroundColor:
      colors.background,
  },

  scrollView: {
    flex: 1,
    backgroundColor:
      colors.background,
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
    backgroundColor:
      colors.background,
  },

  figmaFrame: {
    width: "100%",
    height: y(FIGMA_CONTENT_HEIGHT),
    position: "relative",
    backgroundColor:
      colors.background,
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
    height: y(39),
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(30),
    lineHeight: y(39),
    textAlign: "center",
  },

  topDivider: {
    position: "absolute",
    left: x(20),
    top: y(188),
    width: x(362),
    height:
      StyleSheet.hairlineWidth,
    backgroundColor: colors.primary,
  },

  notificationsTitle: {
    position: "absolute",
    left: x(20),
    top: y(217),
    width: x(285),
    height: y(24),
    color: colors.primary,
    fontFamily: "LiterataBold",
    fontSize: x(20),
    lineHeight: y(24),
  },

  pushNotificationsText: {
    position: "absolute",
    left: x(20),
    top: y(262),
    width: x(285),
    height: y(24),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
  },

  pushNotificationsToggle: {
    position: "absolute",
    left: x(326),
    top: y(262),
    width: x(56),
    height: y(30),
  },

  weeklyReportsText: {
    position: "absolute",
    left: x(20),
    top: y(307),
    width: x(285),
    height: y(24),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
  },

  weeklyReportsToggle: {
    position: "absolute",
    left: x(326),
    top: y(307),
    width: x(56),
    height: y(30),
  },

  toggle: {
    width: x(56),
    height: y(30),
    borderRadius: x(20),
    justifyContent: "center",
  },

  toggleDisabled: {
    backgroundColor: "#D9D9D9",
  },

  toggleEnabled: {
    backgroundColor: colors.primary,
  },

  toggleThumb: {
    position: "absolute",
    top: y(5),
    width: x(20),
    height: x(20),
    borderRadius: x(20),
  },

  toggleThumbDisabled: {
    left: x(6),
    backgroundColor: colors.primary,
  },

  toggleThumbEnabled: {
    right: x(6),
    backgroundColor: "#D9D9D9",
  },

  notificationsDivider: {
    position: "absolute",
    left: x(20),
    top: y(366),
    width: x(362),
    height:
      StyleSheet.hairlineWidth,
    backgroundColor: colors.primary,
  },

  membershipTitle: {
    position: "absolute",
    left: x(20),
    top: y(392),
    width: x(285),
    height: y(24),
    color: colors.primary,
    fontFamily: "LiterataBold",
    fontSize: x(20),
    lineHeight: y(24),
  },

  membershipCard: {
    position: "absolute",
    left: x(20),
    top: y(437),
    width: x(362),
    height: y(271),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: x(20),
    backgroundColor:
      colors.background,
  },

  membershipDescription: {
    position: "absolute",
    left: x(31),
    top: y(21),
    width: x(300),
    minHeight: y(50),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(25),
  },

  membershipPrice: {
    position: "absolute",
    left: x(31),
    top: y(106),
    width: x(300),
    minHeight: y(50),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(25),
  },

  subscribeButtonWrapper: {
    position: "absolute",
    left: x(76.5),
    top: y(188),
    width: x(209),
    height: y(52),
  },

  subscribeButton: {
    width: x(209),
    height: y(52),
    borderRadius: x(20),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 5,
  },

  supportDivider: {
    position: "absolute",
    left: x(20),
    top: y(737),
    width: x(362),
    height:
      StyleSheet.hairlineWidth,
    backgroundColor: colors.primary,
  },

  supportTitle: {
    position: "absolute",
    left: x(20),
    top: y(763),
    width: x(285),
    height: y(24),
    color: colors.primary,
    fontFamily: "LiterataBold",
    fontSize: x(20),
    lineHeight: y(24),
  },

  settingsRow: {
    position: "absolute",
    left: x(20),
    width: x(362),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: x(20),
    backgroundColor:
      colors.background,
    justifyContent: "center",
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 4,
  },

  helpSupportRow: {
    top: y(813),
    height: y(62),
  },

  legalRow: {
    top: y(890),
    height: y(83),
  },

  settingsRowText: {
    width: x(319),
    marginLeft: x(21),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
  },

  settingsRowTextMultiline: {
    lineHeight: y(24),
  },

  chevronWrapper: {
    position: "absolute",
    right: x(18),
    top: "50%",
    width: x(18),
    height: y(18),
    marginTop: y(-9),
    alignItems: "center",
    justifyContent: "center",
  },

  chevronRight: {
    width: x(10),
    height: x(10),
    borderTopWidth: x(2),
    borderRightWidth: x(2),
    borderColor: colors.primary,
    transform: [{ rotate: "45deg" }],
  },

  accountDivider: {
    position: "absolute",
    left: x(20),
    top: y(1010),
    width: x(362),
    height:
      StyleSheet.hairlineWidth,
    backgroundColor: colors.primary,
  },

  accountSettingsTitle: {
    position: "absolute",
    left: x(20),
    top: y(1036),
    width: x(285),
    height: y(24),
    color: colors.primary,
    fontFamily: "LiterataBold",
    fontSize: x(20),
    lineHeight: y(24),
  },

  changePasswordRow: {
    top: y(1086),
    height: y(62),
  },

  logoutRow: {
    top: y(1162),
    height: y(62),
  },

  deleteAccountRow: {
    top: y(1238),
    height: y(62),
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
    backgroundColor:
      colors.background,
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

  termsModalBackdrop: {
    flex: 1,
    position: "relative",
    backgroundColor: "transparent",
  },

  termsModalPositioner: {
    flex: 1,
    position: "relative",
  },

  modalBackdrop: {
    flex: 1,
    paddingHorizontal: x(20),
    backgroundColor:
      "rgba(0, 0, 0, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteModalCard: {
    width: x(362),
    minHeight: y(330),
    paddingHorizontal: x(24),
    paddingVertical: y(28),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: x(20),
    backgroundColor:
      colors.background,
  },

  deleteModalTitle: {
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(28),
    lineHeight: y(35),
    textAlign: "center",
  },

  deleteModalText: {
    marginTop: y(18),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(16),
    lineHeight: y(23),
    textAlign: "center",
  },

  deletePasswordInput: {
    width: "100%",
    height: y(52),
    marginTop: y(24),
    borderRadius: x(16),
    borderWidth: 1,
    borderColor: colors.primary,
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

  deleteModalActions: {
    width: "100%",
    marginTop: y(25),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cancelDeleteButton: {
    width: x(138),
    height: y(50),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: x(18),
    alignItems: "center",
    justifyContent: "center",
  },

  cancelDeleteText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(18),
    lineHeight: y(23),
  },

  confirmDeleteButton: {
    width: x(138),
    height: y(50),
    borderRadius: x(18),
    backgroundColor: "#B00020",
    alignItems: "center",
    justifyContent: "center",
  },

  confirmDeleteText: {
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