/**
 * Figma loading screen.
 *
 * Displays:
 * - Calm Courage logo
 * - Loading text
 * - eight dots filling from left to right
 */

import { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "@/constants/colors";
import { x, y } from "@/utils/scaling";

const DOT_COUNT = 8;
const DOT_INTERVAL = 300;

type LoadingScreenProps = {
  /**
   * The first loading screen can appear before the Outfit
   * font has finished loading.
   */
  fontReady?: boolean;
};

export default function LoadingScreen({
  fontReady = true,
}: LoadingScreenProps) {
  const [activeDotCount, setActiveDotCount] =
    useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDotCount((currentCount) => {
        if (currentCount >= DOT_COUNT) {
          return 1;
        }

        return currentCount + 1;
      });
    }, DOT_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require(
            "../../../assets/images/logo.png"
          )}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Calm Courage Company logo"
        />
      </View>

      <Text
        style={[
          styles.loadingText,
          fontReady
            ? styles.loadingTextWithFont
            : null,
        ]}
      >
        Loading...
      </Text>

      <View
        style={styles.dotsContainer}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel="Application loading"
        accessibilityValue={{
          min: 1,
          max: DOT_COUNT,
          now: activeDotCount,
        }}
      >
        {Array.from(
          { length: DOT_COUNT },
          (_, index) => {
            const isActive =
              index < activeDotCount;

            return (
              <View
                key={`loading-dot-${index}`}
                style={[
                  styles.dot,
                  isActive
                    ? styles.activeDot
                    : styles.inactiveDot,
                ]}
              />
            );
          },
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: colors.background,
  },

  logoContainer: {
    position: "absolute",
    top: y(310),
    left: x(47),
    width: x(308),
    height: y(106),

    shadowColor: colors.black,
    shadowOffset: {
      width: x(10),
      height: y(10),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(10),

    elevation: 10,
  },

  logo: {
    width: "100%",
    height: "100%",
  },

  loadingText: {
    position: "absolute",
    top: y(452),
    left: x(156),
    width: x(90),
    height: y(25),

    color: colors.primary,
    fontSize: x(20),
    lineHeight: y(25),
    fontWeight: "400",
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
  },

  loadingTextWithFont: {
    fontFamily: "Outfit",
    fontWeight: "400",
  },

  dotsContainer: {
    position: "absolute",
    top: y(513),
    left: x(86),
    width: x(230),
    height: x(20),

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dot: {
    width: x(20),
    height: x(20),
    borderRadius: x(10),
  },

  activeDot: {
    backgroundColor: colors.primary,
  },

  inactiveDot: {
    backgroundColor: colors.gray,
  },
});