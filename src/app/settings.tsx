/**
 * Parent settings screen.
 *
 * Contains notification preferences and the membership plan section.
 *
 * Notification toggles are currently stored in frontend state.
 * Subscription functionality will be connected later.
 */

import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import ParentBottomNav from "@/components/dashboard/ParentBottomNav";
import AppButton from "@/components/ui/AppButton";
import { colors } from "@/constants/colors";
import { x, y } from "@/utils/scaling";

import AudioOffIcon from "../../assets/icons/audio-off.svg";
import AudioOnIcon from "../../assets/icons/audio-on.svg";

type SettingsToggleProps = {
  enabled: boolean;
  onChange: () => void;
  accessibilityLabel: string;
};

/**
 * Reusable settings toggle.
 *
 * Disabled:
 * - grey background
 * - blue circle on the left
 *
 * Enabled:
 * - blue background
 * - grey circle on the right
 */
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
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [pushNotifications, setPushNotifications] =
    useState(false);
  const [weeklyEmailReports, setWeeklyEmailReports] =
    useState(false);

  function handleSubscribe() {
    /*
     * Subscription and payment functionality
     * will be implemented later.
     */
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
    minHeight: y(900),
    backgroundColor: colors.background,
  },

  figmaFrame: {
    width: "100%",
    height: y(900),
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

  switchToChildWrapper: {
    position: "absolute",
    left: x(20),
    top: y(750),
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
    top: y(783),
    width: x(362),
    height: y(72),
  },
});