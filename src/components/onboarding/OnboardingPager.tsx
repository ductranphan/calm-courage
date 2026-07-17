/**
 * Onboarding pager.
 *
 * Handles the swipeable onboarding statements and automatic page switching.
 * The PageIndicator is rendered separately so the dots stay fixed while the
 * statement text moves between pages.
 */
import { StyleSheet, View } from "react-native";
import { useEffect, useRef, useState } from "react";
import PagerView from "react-native-pager-view";

import PageIndicator from "@/components/onboarding/PageIndicator";
import Statement from "@/components/onboarding/Statement";
import { onboardingStatements } from "@/constants/onboarding";
import { y } from "@/utils/scaling";

export default function OnboardingPager() {
  const pagerRef = useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = useState(0);

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

      <View style={styles.indicator}>
        <PageIndicator activeIndex={currentPage} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  pager: {
    position: "absolute",
    top: y(334),
    width: "100%",
    height: y(150),
  },

  page: {
    width: "100%",
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