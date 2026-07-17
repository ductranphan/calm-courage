/**
 * Onboarding screen.
 *
 * Displays the first-time user welcome flow:
 * - Calm Courage logo
 * - Swipeable onboarding statements
 * - Fixed page indicators
 * - Navigation buttons for account creation and login
 */
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import OnboardingPager from "@/components/onboarding/OnboardingPager";
import AppButton from "@/components/ui/AppButton";
import { colors } from "@/constants/colors";
import { x, y } from "@/utils/scaling";

import LogoSvg from "../../assets/images/logo.svg";

export default function OnboardingScreen() {
  return (
    <View style={styles.container}>
      {/* Main app logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoShadow}>
          <LogoSvg width={x(359)} height={y(134)} />
        </View>
      </View>

      {/* Swipeable onboarding text */}
      <OnboardingPager />

      {/* Primary navigation buttons */}
      <View style={styles.buttons}>
        <AppButton
          title="Get Started"
          onPress={() => router.push("/create-account")}
        />

        <AppButton
          title="Log In"
          onPress={() => router.push("/login")}
        />
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
      width: x(10),
      height: y(10),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(10),
    elevation: 10,
  },

  buttons: {
    position: "absolute",
    left: x(96),
    top: y(629),
    gap: y(16),
  },
});