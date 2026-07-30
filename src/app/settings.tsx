/**
 * Parent settings screen.
 *
 * Contains notification preferences, membership plan, and account deletion.
 *
 * Notification toggles are currently stored in frontend state.
 * Subscription functionality will be connected later.
 */

import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import ParentBottomNav from "@/components/dashboard/ParentBottomNav";
import AppButton from "@/components/ui/AppButton";
import { colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { x, y } from "@/utils/scaling";

import AudioOffIcon from "../../assets/icons/audio-off.svg";
import AudioOnIcon from "../../assets/icons/audio-on.svg";

type SettingsToggleProps = {
  enabled: boolean;
  onChange: () => void;
  accessibilityLabel: string;
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
      accessibilityState={{
        checked: enabled,
      }}
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

export default function SettingsScreen() {
  const { deleteAccount } = useAuth();

  const [audioEnabled, setAudioEnabled] = useState(false);
  const [pushNotifications, setPushNotifications] =
    useState(false);
  const [weeklyEmailReports, setWeeklyEmailReports] =
    useState(false);
  const [deletePassword, setDeletePassword] =
    useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] =
    useState<string | null>(null);

  function handleSubscribe() {
    /*
     * Subscription and payment functionality
     * will be implemented later with store-compliant IAP.
     */
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
      "This permanently deletes your parent account, all child profiles, check-ins, and progress. This cannot be undone.",
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
      setDeletePassword("");
      router.replace("/onboarding");
    } catch (error) {
      console.error("Unable to delete account:", error);

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
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.figmaFrame}>
        <Pressable
          style={styles.audioButton}
          onPress={() =>
            setAudioEnabled((current) => !current)
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

        <Text style={styles.notificationsTitle}>
          Notifications
        </Text>

        <Text style={styles.pushNotificationsText}>
          Push Notifications
        </Text>

        <View style={styles.pushNotificationsToggle}>
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

        <Text style={styles.weeklyReportsText}>
          Weekly Email Reports
        </Text>

        <View style={styles.weeklyReportsToggle}>
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

        <View style={styles.notificationsDivider} />

        <Text style={styles.membershipTitle}>
          Membership Plan
        </Text>

        <View style={styles.membershipCard}>
          <Text style={styles.membershipDescription}>
            Unlock all 20 scenario cards &amp;{"\n"}
            parent insights!
          </Text>

          <Text style={styles.membershipPrice}>
            Monthly Subscription Pricing:{"\n"}
            $7.99/mo
          </Text>

          <View style={styles.subscribeButtonWrapper}>
            <AppButton
              title="Subscribe Now"
              onPress={handleSubscribe}
              style={styles.subscribeButton}
            />
          </View>
        </View>

        <Text style={styles.accountTitle}>
          Account
        </Text>

        <Text style={styles.accountHint}>
          Enter your password to permanently delete
          {"\n"}
          your account and all child data.
        </Text>

        <TextInput
          value={deletePassword}
          onChangeText={(value) => {
            setDeletePassword(value);
            setDeleteError(null);
          }}
          placeholder="Password"
          placeholderTextColor={colors.muted}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          editable={!deleting}
          style={styles.deletePasswordInput}
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

        <View style={styles.deleteButtonWrapper}>
          {deleting ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />
          ) : (
            <AppButton
              title="Delete Account"
              onPress={handleDeleteAccountPress}
              style={styles.deleteButton}
            />
          )}
        </View>

        <Pressable
          style={styles.switchToChildWrapper}
          onPress={() =>
            router.replace("/switch-to-child")
          }
          accessibilityRole="button"
          accessibilityLabel="Switch to child mode"
        >
          <Text style={styles.switchToChildText}>
            Switch to Child Mode
          </Text>
        </Pressable>

        <View style={styles.bottomNavWrapper}>
          <ParentBottomNav activeTab="settings" />
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

  scrollContent: {
    minHeight: y(1180),
    backgroundColor: colors.background,
  },

  figmaFrame: {
    width: "100%",
    height: y(1180),
    position: "relative",
    backgroundColor: colors.background,
  },

  audioButton: {
    position: "absolute",
    left: x(347),
    top: y(48),
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

  topDivider: {
    position: "absolute",
    left: x(20),
    top: y(188),
    width: x(362),
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.primary,
  },

  notificationsTitle: {
    position: "absolute",
    left: x(20),
    top: y(217),
    width: x(285),
    height: y(24),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    fontWeight: "700",
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
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.primary,
  },

  membershipTitle: {
    position: "absolute",
    left: x(20),
    top: y(392),
    width: x(285),
    height: y(24),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    fontWeight: "700",
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
    backgroundColor: colors.background,
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

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 5,
  },

  accountTitle: {
    position: "absolute",
    left: x(20),
    top: y(730),
    width: x(285),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    fontWeight: "700",
  },

  accountHint: {
    position: "absolute",
    left: x(20),
    top: y(764),
    width: x(362),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(16),
    lineHeight: y(22),
  },

  deletePasswordInput: {
    position: "absolute",
    left: x(20),
    top: y(820),
    width: x(362),
    height: y(52),
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
    position: "absolute",
    left: x(20),
    top: y(880),
    width: x(362),
    color: "#B00020",
    fontFamily: "Literata",
    fontSize: x(14),
    lineHeight: y(18),
    textAlign: "center",
  },

  deleteButtonWrapper: {
    position: "absolute",
    left: x(96),
    top: y(910),
    width: x(210),
    height: y(52),
    alignItems: "center",
    justifyContent: "center",
  },

  deleteButton: {
    width: x(210),
    height: y(52),
    borderRadius: x(20),
    backgroundColor: "#B00020",
  },

  switchToChildWrapper: {
    position: "absolute",
    left: x(20),
    top: y(990),
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
    left: x(20),
    top: y(1040),
    width: x(362),
    height: y(72),
  },
});
