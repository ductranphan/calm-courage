/**
 * Parent Dashboard screen.
 *
 * Displays real Firebase child and emotion data.
 */

import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import InsightPromptCard from "@/components/dashboard/InsightPromptCard";
import ParentBottomNav from "@/components/dashboard/ParentBottomNav";
import ProgressBar from "@/components/dashboard/ProgressBar";
import { colors } from "@/constants/colors";
import { getEmotionImage } from "@/constants/emotions";
import { useParentDashboardData } from "@/hooks/useParentDashboardData";
import { x, y } from "@/utils/scaling";

import AudioOffIcon from "../../assets/icons/audio-off.svg";
import AudioOnIcon from "../../assets/icons/audio-on.svg";

export default function ParentDashboardScreen() {
  const { mood } =
    useLocalSearchParams<{
      mood?: string;
    }>();

  const dashboardData =
    useParentDashboardData({
      moodOverride: mood,
    });

  const [audioEnabled, setAudioEnabled] =
    useState(false);

  if (dashboardData.loading) {
    return (
      <View style={styles.statusScreen}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.statusText}>
          Loading dashboard...
        </Text>
      </View>
    );
  }

  if (dashboardData.error) {
    return (
      <View style={styles.statusScreen}>
        <Text style={styles.statusTitle}>
          Unable to load dashboard
        </Text>

        <Text style={styles.statusText}>
          {dashboardData.error}
        </Text>
      </View>
    );
  }

  if (
    dashboardData.empty ||
    !dashboardData.childId ||
    !dashboardData.childName ||
    !dashboardData.avatarId
  ) {
    return (
      <View style={styles.statusScreen}>
        <Text style={styles.statusTitle}>
          No child profile found
        </Text>

        <Text style={styles.statusText}>
          Add a child profile to view the parent dashboard.
        </Text>

        <Pressable
          onPress={() =>
            router.replace(
              "/child-profile-info",
            )
          }
        >
          <Text style={styles.statusLink}>
            Add Child Profile
          </Text>
        </Pressable>
      </View>
    );
  }

  const moodImage = dashboardData.todaysMood
    ? getEmotionImage(
        dashboardData.todaysMood,
      )
    : null;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.scrollContent
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.figmaFrame}>
        <Pressable
          style={styles.audioButton}
          onPress={() =>
            setAudioEnabled(
              (current) => !current,
            )
          }
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
          Parent Dashboard
        </Text>

        <View style={styles.dividerTop} />

        <View
          style={styles.progressReportWrapper}
        >
          <Text
            style={styles.progressReportTitle}
          >
            Emotion &amp; Activity Progress Report
          </Text>

          <Text style={styles.moodText}>
            Today&apos;s Mood:{" "}
            {dashboardData.todaysMood
              ? `"${dashboardData.moodLabel}"`
              : dashboardData.moodLabel}
          </Text>
        </View>

        {moodImage ? (
          <View
            style={styles.moodImageWrapper}
          >
            <Image
              source={moodImage}
              style={styles.moodImage}
              resizeMode="contain"
            />
          </View>
        ) : null}

        {dashboardData.progressAvailable ? (
          <>
            <View
              style={
                styles.progressBarWrapper
              }
            >
              <ProgressBar
                progress={
                  dashboardData.progressPercent
                }
              />
            </View>

            <Text style={styles.phaseText}>
              {dashboardData.progressLabel}
            </Text>

            <Text
              style={styles.activitiesText}
            >
              {dashboardData.activitiesLabel}
            </Text>
          </>
        ) : (
          <Text
            style={
              styles.progressUnavailableText
            }
          >
            Progress tracking is not available yet.
          </Text>
        )}

        <View style={styles.dividerMiddle} />

        <Text style={styles.promptTitle}>
          Evening Conversation Prompt
        </Text>

        <View
          style={styles.promptCardWrapper}
        >
          <InsightPromptCard
            childName={
              dashboardData.childName
            }
            moodLabel={
              dashboardData.moodLabel
            }
            onViewMore={() => {
              // Later: router.push("/parent-insights");
            }}
          />
        </View>

        <Pressable
          onPress={() =>
            router.push({
              pathname: "/switch-to-child",
              params: {
                childId:
                  dashboardData.childId,
                childName:
                  dashboardData.childName,
                avatarId:
                  dashboardData.avatarId,
              },
            })
          }
          style={styles.switchWrapper}
        >
          <Text style={styles.switchText}>
            Switch to Child Mode
          </Text>
        </Pressable>

        <View
          style={styles.bottomNavWrapper}
        >
          <ParentBottomNav
            activeTab="dashboard"
          />
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

  statusScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: x(30),
    backgroundColor: colors.background,
  },

  statusTitle: {
    color: colors.primary,
    fontFamily: "Quiche",
    fontSize: x(28),
    lineHeight: y(36),
    textAlign: "center",
  },

  statusText: {
    marginTop: y(16),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(18),
    lineHeight: y(26),
    textAlign: "center",
  },

  statusLink: {
    marginTop: y(24),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(26),
    textAlign: "center",
    textDecorationLine: "underline",
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

  dividerTop: {
    position: "absolute",
    left: x(20),
    top: y(188),
    width: x(362),
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.primary,
  },

  progressReportWrapper: {
    position: "absolute",
    left: x(20),
    top: y(208),
    width: x(362),
    height: y(61),
    alignItems: "center",
  },

  progressReportTitle: {
    width: x(362),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(35),
    fontWeight: "700",
    textAlign: "center",
  },

  moodText: {
    width: x(362),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(35),
    textAlign: "center",
    textDecorationLine: "underline",
  },

  moodImageWrapper: {
    position: "absolute",
    left: x(171),
    top: y(281),
    width: x(60),
    height: x(60),
    alignItems: "center",
    justifyContent: "center",
  },

  moodImage: {
    width: x(60),
    height: x(60),
  },

  progressBarWrapper: {
    position: "absolute",
    left: x(20),
    top: y(333),
    width: x(362),
    height: y(19),
  },

  phaseText: {
    position: "absolute",
    left: x(20),
    top: y(356),
    width: x(218),
    height: y(35),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(35),
  },

  activitiesText: {
    position: "absolute",
    left: x(249),
    top: y(359),
    width: x(133),
    height: y(35),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(12),
    lineHeight: y(35),
    textAlign: "right",
  },

  progressUnavailableText: {
    position: "absolute",
    left: x(20),
    top: y(342),
    width: x(362),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(17),
    lineHeight: y(24),
    textAlign: "center",
  },

  dividerMiddle: {
    position: "absolute",
    left: x(20),
    top: y(410),
    width: x(362),
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.primary,
  },

  promptTitle: {
    position: "absolute",
    left: x(20),
    top: y(422),
    width: x(362),
    height: y(35),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(35),
    fontWeight: "700",
  },

  promptCardWrapper: {
    position: "absolute",
    left: x(20),
    top: y(460),
    width: x(362),
    height: y(271),
  },

  switchWrapper: {
    position: "absolute",
    left: x(20),
    top: y(750),
    width: x(206),
    height: y(24),
    justifyContent: "center",
  },

  switchText: {
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