/**
 * Reusable parent bottom navigation.
 *
 * Used on parent dashboard-related screens.
 */

import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import { x, y } from "@/utils/scaling";

import BearChildrenIcon from "../../../assets/icons/bear-children.svg";
import EllipseSettingsIcon from "../../../assets/icons/ellipse-settings.svg";
import SquareDashboardIcon from "../../../assets/icons/square-dashboard.svg";
import StarSettingsIcon from "../../../assets/icons/star-settings.svg";

type ParentTab = "dashboard" | "children" | "settings";

type Props = {
  activeTab?: ParentTab;
};

function DashboardIcon() {
  return (
    <View style={styles.dashboardIcon}>
      <SquareDashboardIcon width={x(42)} height={x(40)} />

      <View style={styles.dashboardVerticalLine} />
      <View style={styles.dashboardHorizontalLine} />
    </View>
  );
}

function SettingsIcon() {
  return (
    <View style={styles.settingsIcon}>
      <StarSettingsIcon width={x(46)} height={x(46)} />

      <View style={styles.settingsEllipse}>
        <EllipseSettingsIcon width={x(12)} height={x(12)} />
      </View>
    </View>
  );
}

export default function ParentBottomNav({ activeTab = "dashboard" }: Props) {
  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.replace("/home")} style={styles.navItem}>
        <View
          style={
            activeTab === "dashboard" ? styles.activeIcon : styles.inactiveIcon
          }
        >
          <DashboardIcon />
        </View>

        <Text style={styles.navLabel}>Dashboard</Text>
      </Pressable>

      <Pressable
        onPress={() => router.replace("/children")}
        style={styles.navItem}
      >
        <View
          style={
            activeTab === "children" ? styles.activeIcon : styles.inactiveIcon
          }
        >
          <BearChildrenIcon width={x(47)} height={x(43)} />
        </View>

        <Text style={styles.navLabel}>Children</Text>
      </Pressable>

      <Pressable
        onPress={() => {
          // Later: router.replace("/settings");
        }}
        style={styles.navItem}
      >
        <View
          style={
            activeTab === "settings" ? styles.activeIcon : styles.inactiveIcon
          }
        >
          <SettingsIcon />
        </View>

        <Text style={styles.navLabel}>Settings</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: x(362),
    height: y(72),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: x(50),
    backgroundColor: colors.background,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },

  navItem: {
    width: x(90),
    height: y(62),
    alignItems: "center",
    justifyContent: "center",
  },

  activeIcon: {
    opacity: 1,
  },

  inactiveIcon: {
    opacity: 0.75,
  },

  dashboardIcon: {
    width: x(43),
    height: x(43),
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  dashboardVerticalLine: {
    position: "absolute",
    width: x(2),
    height: x(43),
    backgroundColor: colors.background,
    left: x(20.5),
    top: 0,
  },

  dashboardHorizontalLine: {
    position: "absolute",
    width: x(43),
    height: x(2),
    backgroundColor: colors.background,
    left: 0,
    top: x(20.5),
  },

  settingsIcon: {
    width: x(46),
    height: x(46),
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  settingsEllipse: {
    position: "absolute",
    left: x(17),
    top: x(17),
    width: x(12),
    height: x(12),
    alignItems: "center",
    justifyContent: "center",
  },

  navLabel: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(12),
    lineHeight: y(15),
    textAlign: "center",
    marginTop: y(-2),
  },
});