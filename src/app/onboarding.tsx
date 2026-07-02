/**
 * Onboarding screen.
 *
 * Displays the first-time user welcome flow:
 * - Calm Courage logo
 * - Swipeable onboarding statements
 * - Fixed page indicators
 * - Navigation buttons for account creation and login
 */
import { Dimensions, StyleSheet, View } from "react-native";
import { router } from "expo-router";

import AppButton from "@/components/AppButton";
import OnboardingPager from "@/components/onboarding/OnboardingPager";
import { colors } from "@/constants/colors";

import LogoSvg from "../../assets/images/logo.svg";

// Original Figma frame size. All fixed positions are scaled from this frame.
const FIGMA_WIDTH = 402;
const FIGMA_HEIGHT = 874;

const { width, height } = Dimensions.get("window");

// Converts Figma X/Y values into device-specific values.
const x = (value: number) => value * (width / FIGMA_WIDTH);
const y = (value: number) => value * (height / FIGMA_HEIGHT);

export default function OnboardingScreen() {
  return (
    <View style={styles.container}>
      {/* Main app logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoShadow}>
          <LogoSvg width={x(359)} height={y(134)} />
        </View>
      </View>

      {/* Swipeable/auto-playing onboarding text */}
      <OnboardingPager />

      {/* Primary navigation actions */}
      <View style={styles.buttons}>
        <AppButton
          title="Get Started"
          onPress={() => router.push("/create-account")}
        />

        <AppButton title="Log In" onPress={() => router.push("/login")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  logoContainer: {
    position: "absolute",
    top: y(140),
    width: "100%",
    alignItems: "center",
  },

  logoShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 10,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },

  buttons: {
    position: "absolute",
    left: x(96),
    top: y(629),
    gap: y(16),
  },
});
