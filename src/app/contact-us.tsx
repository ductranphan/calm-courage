/**
 * Parent Contact Us screen.
 *
 * Matches Figma Screen 13.1.1:
 * - authenticated parent email
 * - issue-type selector
 * - subject and message fields
 * - optional image/screenshot attachment
 * - system email composer submission
 * - parent-mode navigation
 */

import * as ImagePicker from "expo-image-picker";
import * as MailComposer from "expo-mail-composer";
import { router, type Href } from "expo-router";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Alert,
  Keyboard,
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
import Logo from "@/components/ui/Logo";
import { colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useParentAccess } from "@/contexts/ParentAccessContext";
import { x, y } from "@/utils/scaling";

import AudioOffIcon from "../../assets/icons/audio-off.svg";
import AudioOnIcon from "../../assets/icons/audio-on.svg";
import BackIcon from "../../assets/icons/back.svg";

const PAGE_HEIGHT = 1202;
const SUPPORT_EMAIL =
  process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim() ?? "";

const ISSUE_TYPES = [
  "Billing / Subscription",
  "Technical Issue",
  "Account / Login",
  "Child Profile",
  "Feedback / Suggestion",
  "Other",
] as const;

type IssueType = (typeof ISSUE_TYPES)[number];

type FocusedInput =
  | "email"
  | "subject"
  | "message"
  | null;

function ChevronDown() {
  return <View style={styles.chevronDown} />;
}

function PlusIcon() {
  return (
    <View style={styles.plusIcon}>
      <View style={styles.plusHorizontal} />
      <View style={styles.plusVertical} />
    </View>
  );
}

function isValidEmail(value: string): boolean {
  return /^\S+@\S+\.\S+$/.test(value.trim());
}

export default function ContactUsScreen() {
  const { user } = useAuth();
  const { parentAccessGranted } =
    useParentAccess();

  const [audioEnabled, setAudioEnabled] =
    useState(false);

  const [email, setEmail] = useState(
    user?.email ?? "",
  );

  const [issueType, setIssueType] =
    useState<IssueType>(
      "Billing / Subscription",
    );

  const [subject, setSubject] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [attachment, setAttachment] =
    useState<ImagePicker.ImagePickerAsset | null>(
      null,
    );

  const [issueModalVisible, setIssueModalVisible] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [
    successModalVisible,
    setSuccessModalVisible,
  ] = useState(false);

  const [focusedInput, setFocusedInput] =
    useState<FocusedInput>(null);

  useEffect(() => {
    if (!user) {
      router.replace("/login" as Href);
      return;
    }

    if (!parentAccessGranted) {
      router.replace(
        "/parent-verification" as Href,
      );
    }
  }, [parentAccessGranted, user]);

  useEffect(() => {
    if (!email && user?.email) {
      setEmail(user.email);
    }
  }, [email, user?.email]);

  const attachmentLabel = useMemo(() => {
    if (!attachment) {
      return "Attach Image / Screenshot";
    }

    return (
      attachment.fileName ??
      "Image attached"
    );
  }, [attachment]);

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/help-support" as Href);
  }

  function handleSwitchToChildMode() {
    router.replace(
      "/switch-to-child" as Href,
    );
  }

  function handleBackToSettings() {
    setSuccessModalVisible(false);
    router.replace("/settings" as Href);
  }

  async function handlePickImage() {
    try {
      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: false,
          quality: 0.85,
          selectionLimit: 1,
        });

      if (result.canceled) {
        return;
      }

      setAttachment(result.assets[0] ?? null);
    } catch (error) {
      console.error(
        "Unable to select a support attachment:",
        error,
      );

      Alert.alert(
        "Attachment unavailable",
        "The image could not be selected. Please try again.",
      );
    }
  }

  function validateForm(): boolean {
    if (!isValidEmail(email)) {
      Alert.alert(
        "Check your email",
        "Please enter a valid email address.",
      );
      return false;
    }

    if (!subject.trim()) {
      Alert.alert(
        "Subject required",
        "Please add a brief description of your issue.",
      );
      return false;
    }

    if (message.trim().length < 10) {
      Alert.alert(
        "Message too short",
        "Please describe your issue using at least 10 characters.",
      );
      return false;
    }

    return true;
  }

  async function openEmailComposer() {
    setSubmitting(true);

    try {
      const available =
        await MailComposer.isAvailableAsync();

      if (!available) {
        Alert.alert(
          "Email unavailable",
          "No email application is configured on this device.",
        );
        return;
      }

      const body = [
        `Parent email: ${email.trim()}`,
        `Issue type: ${issueType}`,
        "",
        message.trim(),
      ].join("\n");

      const result =
        await MailComposer.composeAsync({
          ...(SUPPORT_EMAIL
            ? {
                recipients: [SUPPORT_EMAIL],
              }
            : {}),
          subject: `[Calm Courage Support] ${subject.trim()}`,
          body,
          attachments: attachment
            ? [attachment.uri]
            : undefined,
        });

      if (result.status === "sent") {
        setSubject("");
        setMessage("");
        setAttachment(null);
        setFocusedInput(null);
        setSuccessModalVisible(true);
        return;
      }

      if (result.status === "saved") {
        Alert.alert(
          "Draft saved",
          "Your support message was saved as a draft but was not sent.",
        );
        return;
      }

      if (result.status === "undetermined") {
        Alert.alert(
          "Message status unavailable",
          "Your email application closed, but the app could not confirm whether the message was sent.",
        );
      }
    } catch (error) {
      console.error(
        "Unable to open the support email composer:",
        error,
      );

      Alert.alert(
        "Unable to prepare message",
        "Please try again in a moment.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit() {
    Keyboard.dismiss();

    if (!validateForm()) {
      return;
    }

    if (!SUPPORT_EMAIL) {
      Alert.alert(
        "Support email not configured",
        "The email draft will open without a recipient. Add EXPO_PUBLIC_SUPPORT_EMAIL to your .env file after the support address is confirmed.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Open Draft",
            onPress: () => {
              void openEmailComposer();
            },
          },
        ],
      );
      return;
    }

    void openEmailComposer();
  }

  if (!user || !parentAccessGranted) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
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
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="never"
      >
        <View style={styles.figmaPage}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.controlPressed,
            ]}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
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
              pressed && styles.controlPressed,
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
                height={y(35)}
              />
            ) : (
              <AudioOffIcon
                width={x(35)}
                height={y(35)}
              />
            )}
          </Pressable>

          <Text style={styles.title}>
            Contact Us
          </Text>

          <View style={styles.headerDivider} />

          <Text style={styles.emailLabel}>
            Email Address
          </Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            style={[
              styles.input,
              styles.emailInput,
            ]}
            placeholder={
              focusedInput === "email"
                ? ""
                : "parent@example.com"
            }
            placeholderTextColor={colors.muted}
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onFocus={() =>
              setFocusedInput("email")
            }
            onBlur={() =>
              setFocusedInput(null)
            }
            accessibilityLabel="Email Address"
          />

          <Text style={styles.issueTypeLabel}>
            Issue Type
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.selectInput,
              pressed && styles.controlPressed,
            ]}
            onPress={() =>
              setIssueModalVisible(true)
            }
            accessibilityRole="button"
            accessibilityLabel="Choose issue type"
            accessibilityValue={{
              text: issueType,
            }}
          >
            <Text
              style={styles.selectInputText}
              numberOfLines={1}
            >
              {issueType}
            </Text>

            <ChevronDown />
          </Pressable>

          <Text style={styles.subjectLabel}>
            Subject
          </Text>

          <TextInput
            value={subject}
            onChangeText={setSubject}
            style={[
              styles.input,
              styles.subjectInput,
            ]}
            placeholder={
              focusedInput === "subject"
                ? ""
                : "Brief description of your issue"
            }
            placeholderTextColor={colors.muted}
            maxLength={100}
            returnKeyType="next"
            onFocus={() =>
              setFocusedInput("subject")
            }
            onBlur={() =>
              setFocusedInput(null)
            }
            accessibilityLabel="Subject"
          />

          <Text style={styles.messageLabel}>
            Message
          </Text>

          <TextInput
            value={message}
            onChangeText={setMessage}
            style={styles.messageInput}
            placeholder={
              focusedInput === "message"
                ? ""
                : "Please describe your issue in\ndetail (min 10 characters)..."
            }
            placeholderTextColor={colors.muted}
            multiline
            maxLength={1500}
            textAlignVertical="top"
            onFocus={() =>
              setFocusedInput("message")
            }
            onBlur={() =>
              setFocusedInput(null)
            }
            accessibilityLabel="Message"
          />

          <Pressable
            style={({ pressed }) => [
              styles.attachmentButton,
              pressed && styles.controlPressed,
            ]}
            onPress={() => {
              void handlePickImage();
            }}
            accessibilityRole="button"
            accessibilityLabel={
              attachment
                ? "Replace attached image"
                : "Attach image or screenshot"
            }
          >
            <PlusIcon />

            <Text
              style={styles.attachmentText}
              numberOfLines={1}
            >
              {attachmentLabel}
            </Text>

            {attachment ? (
              <Pressable
                style={styles.removeAttachmentButton}
                onPress={(event) => {
                  event.stopPropagation();
                  setAttachment(null);
                }}
                accessibilityRole="button"
                accessibilityLabel="Remove attachment"
                hitSlop={8}
              >
                <Text
                  style={
                    styles.removeAttachmentText
                  }
                >
                  ×
                </Text>
              </Pressable>
            ) : null}
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.controlPressed,
              submitting &&
                styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel="Submit Message"
            accessibilityState={{
              disabled: submitting,
            }}
          >
            <Text style={styles.submitButtonText}>
              {submitting
                ? "Preparing..."
                : "Submit Message"}
            </Text>
          </Pressable>

          <View style={styles.footer}>
            <Pressable
              style={({ pressed }) => [
                styles.switchToChildButton,
                pressed &&
                  styles.controlPressed,
              ]}
              onPress={handleSwitchToChildMode}
              accessibilityRole="button"
              accessibilityLabel="Switch to Child Mode"
            >
              <Text
                style={styles.switchToChildText}
              >
                Switch to Child Mode
              </Text>
            </Pressable>

            <View style={styles.bottomNavWrapper}>
              <ParentBottomNav activeTab="settings" />
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={issueModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() =>
          setIssueModalVisible(false)
        }
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() =>
            setIssueModalVisible(false)
          }
        >
          <Pressable
            style={styles.issueModalCard}
            onPress={() => {
              // Keep taps inside the modal from closing it.
            }}
          >
            <Text style={styles.issueModalTitle}>
              Select Issue Type
            </Text>

            {ISSUE_TYPES.map((option) => {
              const selected =
                issueType === option;

              return (
                <Pressable
                  key={option}
                  style={({ pressed }) => [
                    styles.issueOption,
                    selected &&
                      styles.issueOptionSelected,
                    pressed &&
                      styles.controlPressed,
                  ]}
                  onPress={() => {
                    setIssueType(option);
                    setIssueModalVisible(false);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected,
                  }}
                >
                  <Text
                    style={[
                      styles.issueOptionText,
                      selected &&
                        styles.issueOptionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={() =>
          setSuccessModalVisible(false)
        }
      >
        <View style={styles.successModalBackdrop}>
          <View style={styles.successModalCard}>
            <View style={styles.successLogoWrapper}>
              <Logo
                width={x(177.3)}
                height={y(61)}
                shadow
              />
            </View>

            <Text style={styles.successModalTitle}>
              Message Sent!
            </Text>

            <Text style={styles.successModalMessage}>
              Thank you for reaching out.{"\n"}
              Our support team will reply{"\n"}
              to your registered email{"\n"}
              within 24-48 hours.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.successModalButton,
                pressed && styles.controlPressed,
              ]}
              onPress={handleBackToSettings}
              accessibilityRole="button"
              accessibilityLabel="Back to Settings"
            >
              <Text
                style={
                  styles.successModalButtonText
                }
              >
                Back to Settings
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    minHeight: y(PAGE_HEIGHT),
    backgroundColor: colors.background,
  },

  figmaPage: {
    position: "relative",
    width: "100%",
    height: y(PAGE_HEIGHT),
    backgroundColor: colors.background,
  },

  backButton: {
    position: "absolute",
    left: x(20),
    top: y(48),
    width: x(37.24),
    height: y(35),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  audioButton: {
    position: "absolute",
    left: x(347),
    top: y(48),
    width: x(35),
    height: y(35),
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
    includeFontPadding: false,
  },

  headerDivider: {
    position: "absolute",
    left: x(20),
    top: y(188),
    width: x(362),
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.primary,
  },

  emailLabel: {
    position: "absolute",
    left: x(20),
    top: y(215),
    width: x(285),
    height: y(24),
    color: colors.primary,
    fontFamily: "LiterataBold",
    fontSize: x(20),
    lineHeight: y(24),
    includeFontPadding: false,
  },

  issueTypeLabel: {
    position: "absolute",
    left: x(20),
    top: y(349),
    width: x(285),
    height: y(24),
    color: colors.primary,
    fontFamily: "LiterataBold",
    fontSize: x(20),
    lineHeight: y(24),
    includeFontPadding: false,
  },

  subjectLabel: {
    position: "absolute",
    left: x(20),
    top: y(483),
    width: x(285),
    height: y(24),
    color: colors.primary,
    fontFamily: "LiterataBold",
    fontSize: x(20),
    lineHeight: y(24),
    includeFontPadding: false,
  },

  messageLabel: {
    position: "absolute",
    left: x(20),
    top: y(617),
    width: x(285),
    height: y(24),
    color: colors.primary,
    fontFamily: "LiterataBold",
    fontSize: x(20),
    lineHeight: y(24),
    includeFontPadding: false,
  },

  input: {
    position: "absolute",
    left: x(20),
    width: x(362),
    height: y(72),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: x(20),
    backgroundColor: colors.white,
    paddingHorizontal: x(20),
    paddingVertical: 0,
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
  },

  emailInput: {
    top: y(250),
  },

  subjectInput: {
    top: y(518),
  },

  selectInput: {
    position: "absolute",
    left: x(20),
    top: y(384),
    width: x(362),
    height: y(72),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: x(20),
    backgroundColor: colors.white,
    paddingLeft: x(20),
    paddingRight: x(46),
    flexDirection: "row",
    alignItems: "center",
  },

  selectInputText: {
    flex: 1,
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
  },

  chevronDown: {
    position: "absolute",
    right: x(18),
    top: y(27),
    width: x(13),
    height: x(13),
    borderRightWidth: x(2),
    borderBottomWidth: x(2),
    borderColor: colors.primary,
    transform: [{ rotate: "45deg" }],
  },

  messageInput: {
    position: "absolute",
    left: x(20),
    top: y(652),
    width: x(362),
    height: y(180),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: x(20),
    backgroundColor: colors.white,
    paddingHorizontal: x(20),
    paddingTop: y(14),
    paddingBottom: y(14),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
  },

  attachmentButton: {
    position: "absolute",
    left: x(20),
    top: y(859),
    width: x(362),
    height: y(72),
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.primary,
    borderRadius: x(20),
    backgroundColor: colors.background,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: x(32),
    paddingRight: x(48),
  },

  plusIcon: {
    width: x(22),
    height: x(22),
    marginRight: x(14),
    alignItems: "center",
    justifyContent: "center",
  },

  plusHorizontal: {
    position: "absolute",
    width: x(22),
    height: x(2),
    backgroundColor: colors.primary,
  },

  plusVertical: {
    position: "absolute",
    width: x(2),
    height: x(22),
    backgroundColor: colors.primary,
  },

  attachmentText: {
    flex: 1,
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
  },

  removeAttachmentButton: {
    position: "absolute",
    right: x(17),
    width: x(30),
    height: x(30),
    alignItems: "center",
    justifyContent: "center",
  },

  removeAttachmentText: {
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(26),
    lineHeight: x(28),
  },

  submitButton: {
    position: "absolute",
    left: x(97),
    top: y(968),
    width: x(209),
    height: y(52),
    borderRadius: x(20),
    backgroundColor: colors.lavender,
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

  submitButtonDisabled: {
    opacity: 0.6,
  },

  submitButtonText: {
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(20),
    lineHeight: y(25),
    textAlign: "center",
    includeFontPadding: false,
  },

  footer: {
    position: "absolute",
    left: x(20),
    top: y(1070),
    width: x(362),
    height: y(105),
  },

  switchToChildButton: {
    position: "absolute",
    left: 0,
    top: 0,
    height: y(24),
    justifyContent: "center",
  },

  switchToChildText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textDecorationLine: "underline",
    includeFontPadding: false,
  },

  bottomNavWrapper: {
    position: "absolute",
    left: 0,
    top: y(33),
    width: x(362),
    height: y(72),
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: x(25),
  },

  issueModalCard: {
    width: "100%",
    maxWidth: x(352),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: x(20),
    backgroundColor: colors.background,
    paddingHorizontal: x(16),
    paddingTop: y(18),
    paddingBottom: y(16),

    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(6),
    elevation: 8,
  },

  issueModalTitle: {
    marginBottom: y(12),
    color: colors.primary,
    fontFamily: "OutfitBold",
    fontSize: x(24),
    lineHeight: y(30),
    textAlign: "center",
  },

  issueOption: {
    minHeight: y(48),
    borderRadius: x(14),
    paddingHorizontal: x(14),
    justifyContent: "center",
  },

  issueOptionSelected: {
    backgroundColor: colors.primary,
  },

  issueOptionText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(18),
    lineHeight: y(23),
  },

  issueOptionTextSelected: {
    color: colors.white,
  },

  successModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.48)",
    alignItems: "center",
    justifyContent: "center",
  },

  successModalCard: {
    position: "relative",
    width: x(331),
    height: y(500),
    borderRadius: x(20),
    backgroundColor: colors.background,

    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(6),
    elevation: 10,
  },

  successLogoWrapper: {
    position: "absolute",
    left: x(76.85),
    top: y(63),
    width: x(177.3),
    height: y(61),
    alignItems: "center",
    justifyContent: "center",
  },

  successModalTitle: {
    position: "absolute",
    left: x(52.3),
    top: y(177),
    width: x(226.39),
    height: y(38),
    color: colors.primary,
    fontFamily: "OutfitBold",
    fontSize: x(30),
    lineHeight: y(38),
    textAlign: "center",
    includeFontPadding: false,
  },

  successModalMessage: {
    position: "absolute",
    left: x(25),
    top: y(224),
    width: x(281),
    minHeight: y(100),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textAlign: "center",
    includeFontPadding: false,
  },

  successModalButton: {
    position: "absolute",
    left: x(40.5),
    top: y(385),
    width: x(250),
    height: y(52),
    borderRadius: x(20),
    backgroundColor: colors.lavender,
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

  successModalButtonText: {
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(20),
    lineHeight: y(25),
    textAlign: "center",
    includeFontPadding: false,
  },

  controlPressed: {
    opacity: 0.65,
  },
});