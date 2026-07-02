/**
 * Onboarding pager.
 *
 * Handles the swipeable onboarding statements and automatic page switching.
 * The PageIndicator is rendered separately so the dots stay fixed while the
 * statement text moves between pages.
 */
import { Dimensions, StyleSheet, View } from "react-native";
import { useEffect, useRef, useState } from "react";
import PagerView from "react-native-pager-view";

import Statement from "@/components/Statement";
import PageIndicator from "@/components/PageIndicator";
import { onboardingStatements } from "@/constants/onboarding";

const FIGMA_HEIGHT = 874;

const { width, height } = Dimensions.get("window");

const y = (value: number) => value * (height / FIGMA_HEIGHT);

export default function OnboardingPager() {
  // Ref lets us move the pager programmatically for auto-play.
  const pagerRef = useRef<PagerView>(null);

  // Tracks the currently visible onboarding page.
  const [currentPage, setCurrentPage] = useState(0);

  // Automatically move to the next statement every 3.5 seconds.
  useEffect(() => {
    const interval = setInterval(() => {
      const nextPage =
        currentPage === onboardingStatements.length - 1
          ? 0
          : currentPage + 1;

      pagerRef.current?.setPage(nextPage);
      setCurrentPage(nextPage);
    }, 3500);

    return () => clearInterval(interval);
  }, [currentPage]);

  return (
    <>
      {/* Swipeable onboarding statement pages */}
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={(event) => {
          setCurrentPage(event.nativeEvent.position);
        }}
      >
        {onboardingStatements.map((item) => (
          <View key={item.id} style={styles.page}>
            <Statement text={item.text} />
          </View>
        ))}
      </PagerView>

      {/* Fixed page indicator below the statement text */}
      <View style={styles.indicator}>
        <PageIndicator activeIndex={currentPage} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  pager: {
    position: "absolute",
    top: y(350),
    width: width,
    height: y(100),
  },

  page: {
    width: width,
    alignItems: "center",
    justifyContent: "center",
  },

  indicator: {
    position: "absolute",
    top: y(548),
    width: "100%",
    alignItems: "center",
  },
});
