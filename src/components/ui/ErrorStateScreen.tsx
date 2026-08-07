/**
 * Reusable full-page child-mode error state.
 *
 * Matches Figma Screen 0.1 and keeps the child navigation available.
 */

import { router, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path as SvgPath } from "react-native-svg";

import { colors } from "@/constants/colors";
import { x, y } from "@/utils/scaling";

import HouseIcon from "../../../assets/icons/house.svg";
import StarIcon from "../../../assets/icons/star.svg";
import WorkbookDashboardIcon from "../../../assets/icons/workbook-dashboard.svg";
import ErrorStateIllustration from "../../../assets/images/error-state.svg";

const PAGE_BACKGROUND = "#F1F3F5";
const RETRY_BACKGROUND = "#E6D8EB";

type ChildErrorTab =
  | "workbook"
  | "home"
  | "rewards";

type ErrorStateScreenProps = {
  title?: string;
  message?: string;
  retryLabel?: string;
  activeTab?: ChildErrorTab;
  onRetry: () => void | Promise<void>;
};

function RetryIcon() {
  return (
    <Svg
      width={x(24)}
      height={x(24)}
      viewBox="0 0 24 24"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <SvgPath
        d="M20 6V11H15"
        fill="none"
        stroke={colors.primary}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <SvgPath
        d="M19.15 14.5A7.5 7.5 0 1 1 18.8 8.9L20 11"
        fill="none"
        stroke={colors.primary}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function ErrorStateScreen({
  title = "Oops! Something\nwent wrong.",
  message =
    "Please check your internet\nconnection and try again.",
  retryLabel = "Retry",
  activeTab = "home",
  onRetry,
}: ErrorStateScreenProps) {
  function handleParentMode() {
    router.push(
      "/parent-verification" as Href,
    );
  }

  function handleNavigation(
    destination: ChildErrorTab,
  ) {
    if (destination === activeTab) {
      return;
    }

    const hrefByTab: Record<
      ChildErrorTab,
      Href
    > = {
      workbook:
        "/digital-workbook" as Href,
      home: "/child-dashboard" as Href,
      rewards: "/rewards" as Href,
    };

    router.replace(hrefByTab[destination]);
  }

  return (
    <View style={styles.screen}>
      <View style={styles.illustrationWrapper}>
        <ErrorStateIllustration
          width={x(200)}
          height={y(173)}
        />
      </View>

      <Text style={styles.title}>
        {title}
      </Text>

      <Text style={styles.message}>
        {message}
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.retryButton,
          pressed && styles.controlPressed,
        ]}
        onPress={() => {
          void onRetry();
        }}
        accessibilityRole="button"
        accessibilityLabel={retryLabel}
      >
        <Text style={styles.retryText}>
          {retryLabel}
        </Text>

        <RetryIcon />
      </Pressable>

      <View style={styles.fixedFooter}>
        <Pressable
          style={({ pressed }) => [
            styles.parentModeLink,
            pressed && styles.controlPressed,
          ]}
          onPress={handleParentMode}
          accessibilityRole="button"
          accessibilityLabel="Switch to Parent Mode"
        >
          <Text style={styles.parentModeText}>
            Switch to Parent Mode
          </Text>
        </Pressable>

        <View style={styles.bottomNav}>
          <Pressable
            style={styles.navItem}
            onPress={() =>
              handleNavigation("workbook")
            }
            accessibilityRole="button"
            accessibilityLabel="Workbook"
            accessibilityState={{
              selected:
                activeTab === "workbook",
            }}
          >
            <View
              style={[
                styles.navIcon,
                activeTab !== "workbook" &&
                  styles.inactiveNavIcon,
              ]}
            >
              <WorkbookDashboardIcon
                width={x(41.94)}
                height={y(40.07)}
              />
            </View>

            <Text style={styles.navLabel}>
              Workbook
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() =>
              handleNavigation("home")
            }
            accessibilityRole="button"
            accessibilityLabel="Home"
            accessibilityState={{
              selected: activeTab === "home",
            }}
          >
            <View
              style={[
                styles.navIcon,
                activeTab !== "home" &&
                  styles.inactiveNavIcon,
              ]}
            >
              <HouseIcon
                width={x(40)}
                height={y(40)}
              />
            </View>

            <Text style={styles.navLabel}>
              Home
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() =>
              handleNavigation("rewards")
            }
            accessibilityRole="button"
            accessibilityLabel="Rewards"
            accessibilityState={{
              selected:
                activeTab === "rewards",
            }}
          >
            <View
              style={[
                styles.navIcon,
                activeTab !== "rewards" &&
                  styles.inactiveNavIcon,
              ]}
            >
              <StarIcon
                width={x(42)}
                height={y(42)}
              />
            </View>

            <Text style={styles.navLabel}>
              Rewards
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: "relative",
    backgroundColor: PAGE_BACKGROUND,
  },

  illustrationWrapper: {
    position: "absolute",
    left: x(101),
    top: y(122),
    width: x(200),
    height: y(173),
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    position: "absolute",
    left: x(83),
    top: y(371),
    width: x(236),
    height: y(76),
    color: colors.primary,
    fontFamily: "OutfitBold",
    fontSize: x(30),
    lineHeight: y(38),
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
  },

  message: {
    position: "absolute",
    left: x(47),
    top: y(485),
    width: x(308),
    height: y(50),
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(20),
    lineHeight: y(25),
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
  },

  retryButton: {
    position: "absolute",
    left: x(96),
    top: y(611),
    width: x(210),
    height: y(52),
    borderRadius: x(20),
    backgroundColor: RETRY_BACKGROUND,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: x(8),

    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 5,
  },

  retryText: {
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(20),
    lineHeight: y(26),
    includeFontPadding: false,
  },

  fixedFooter: {
    position: "absolute",
    left: x(20),
    bottom: y(20),
    width: x(362),
    height: y(105),
    backgroundColor: "transparent",
    zIndex: 50,
  },

  parentModeLink: {
    position: "absolute",
    left: 0,
    top: 0,
    width: x(250),
    height: y(24),
    justifyContent: "center",
  },

  parentModeText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textDecorationLine: "underline",
  },

  bottomNav: {
    position: "absolute",
    left: 0,
    top: y(33),
    width: x(362),
    height: y(72),
    borderWidth: x(1),
    borderColor: colors.primary,
    borderRadius: x(50),
    backgroundColor: PAGE_BACKGROUND,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: x(18),
  },

  navItem: {
    width: x(58),
    height: y(56.75),
    alignItems: "center",
    justifyContent: "center",
  },

  navIcon: {
    alignItems: "center",
    justifyContent: "center",
  },

  inactiveNavIcon: {
    opacity: 0.72,
  },

  navLabel: {
    marginTop: y(1),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(10),
    lineHeight: y(12),
    textAlign: "center",
  },

  controlPressed: {
    opacity: 0.65,
  },
});