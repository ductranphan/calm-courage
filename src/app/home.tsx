/**
 * Parent dashboard screen.
 *
 * Connected to the backend where possible:
 * - child name
 * - child avatar
 * - latest check-in mood
 *
 * Progress remains temporary until the backend stores activity data.
 */
<<<<<<< HEAD
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import AppButton from "@/components/ui/AppButton";
import { avatars } from "@/constants/avatars";
import { colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { type ChildProfile, listChildren } from "@/services/children";
=======

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
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
import { x, y } from "@/utils/scaling";

import AudioOffIcon from "../../assets/icons/audio-off.svg";
import AudioOnIcon from "../../assets/icons/audio-on.svg";

export default function ParentDashboardScreen() {
  const { mood } = useLocalSearchParams<{ mood?: string }>();

  const dashboardData = useParentDashboardData({
    moodOverride: mood,
  });

  const [audioEnabled, setAudioEnabled] = useState(false);

  if (dashboardData.loading) {
    return (
      <View style={styles.stateScreen}>
        <ActivityIndicator size="large" color={colors.primary} />

        <Text style={styles.stateText}>
          Loading your child&apos;s dashboard...
        </Text>
      </View>
    );
  }

  if (dashboardData.error) {
    return (
      <View style={styles.stateScreen}>
        <Text style={styles.stateTitle}>
          Unable to load the dashboard
        </Text>

        <Text style={styles.stateText}>
          Please check your connection and try again.
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
      <View style={styles.stateScreen}>
        <Text style={styles.stateTitle}>No child profile yet</Text>

        <Text style={styles.stateText}>
          Create a child profile to view their emotional progress.
        </Text>

        <Pressable
          style={styles.createProfileButton}
          onPress={() => router.push("/child-profile-info")}
        >
          <Text style={styles.createProfileButtonText}>
            Create Child Profile
          </Text>
        </Pressable>
      </View>
    );
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
          onPress={() => setAudioEnabled((current) => !current)}
          accessibilityRole="button"
          accessibilityLabel={
            audioEnabled ? "Turn audio off" : "Turn audio on"
          }
        >
          {audioEnabled ? (
            <AudioOnIcon width={x(35)} height={x(35)} />
          ) : (
            <AudioOffIcon width={x(35)} height={x(35)} />
          )}
        </Pressable>

        <Text style={styles.title}>Parent Dashboard</Text>

        <View style={styles.dividerTop} />

        <View style={styles.progressReportWrapper}>
          <Text style={styles.progressReportTitle}>
            Emotion &amp; Activity Progress Report
          </Text>

          <Text style={styles.moodText}>
            {dashboardData.moodLabel
              ? `Today's Mood: "${dashboardData.moodLabel}"`
              : "Today's Mood: No check-in yet"}
          </Text>
        </View>

        <View style={styles.moodImageWrapper}>
          {dashboardData.todaysMood ? (
            <Image
              source={getEmotionImage(dashboardData.todaysMood)}
              style={styles.moodImage}
              resizeMode="contain"
              fadeDuration={0}
            />
          ) : (
            <Text style={styles.noMoodText}>No check-in yet</Text>
          )}
        </View>

        <View style={styles.progressBarWrapper}>
          <ProgressBar progress={dashboardData.progressPercent} />
        </View>

        <Text style={styles.phaseText}>
          {dashboardData.progressLabel}
        </Text>

        <Text style={styles.activitiesText}>
          {dashboardData.activitiesLabel}
        </Text>

        <View style={styles.dividerMiddle} />

        <Text style={styles.promptTitle}>
          Evening Conversation Prompt
        </Text>

        <View style={styles.promptCardWrapper}>
          <InsightPromptCard
            childName={dashboardData.childName}
            moodLabel={dashboardData.moodLabel ?? "No check-in yet"}
            onViewMore={() => {
              // This functionality will be added later.
            }}
          />
        </View>

        <Pressable
          onPress={() =>
            router.push({
              pathname: "/switch-to-child",
              params: {
                childId: dashboardData.childId,
                childName: dashboardData.childName,
                avatarId: dashboardData.avatarId,
              },
            })
          }
          style={styles.switchWrapper}
          accessibilityRole="button"
        >
          <Text style={styles.switchText}>
            Switch to Child Mode
          </Text>
        </Pressable>

        <View style={styles.bottomNavWrapper}>
          <ParentBottomNav activeTab="dashboard" />
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

  stateScreen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
<<<<<<< HEAD
    gap: y(16),
    backgroundColor: colors.background,
    paddingHorizontal: x(24),
  },

=======
    paddingHorizontal: x(30),
  },

  stateTitle: {
    color: colors.primary,
    fontFamily: "Quiche",
    fontSize: x(28),
    lineHeight: y(36),
    textAlign: "center",
  },

  stateText: {
    marginTop: y(18),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(18),
    lineHeight: y(26),
    textAlign: "center",
  },

  createProfileButton: {
    marginTop: y(30),
    minWidth: x(210),
    height: y(52),
    paddingHorizontal: x(24),
    borderRadius: x(20),
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  createProfileButtonText: {
    color: colors.white,
    fontFamily: "Literata",
    fontSize: x(18),
    lineHeight: y(24),
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

>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
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
    minHeight: y(61),
    alignItems: "center",
  },

  progressReportTitle: {
    width: x(362),
    color: colors.primary,
<<<<<<< HEAD
    fontFamily: "Quiche",
    fontSize: x(28),
    lineHeight: y(36),
  },

  avatar: {
    fontSize: x(48),
    lineHeight: y(56),
  },

  childName: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(24),
    fontWeight: "700",
  },

  childMeta: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(16),
    marginBottom: y(4),
  },

  subtitle: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(18),
    lineHeight: y(24),
    marginBottom: y(8),
=======
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

  noMoodText: {
    width: x(100),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(11),
    lineHeight: y(16),
    textAlign: "center",
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
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
  },
});