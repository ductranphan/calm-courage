/**
 * In-app Privacy Policy screen.
 *
 * Always available for COPPA / store transparency. Optionally opens
 * the hosted URL used on App Store and Google Play listings.
 */

import * as WebBrowser from "expo-web-browser";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import BackButton from "@/components/ui/BackButton";
import { consentDocuments } from "@/constants/consent";
import { colors } from "@/constants/colors";
import {
  hasHostedPrivacyPolicyUrl,
  PRIVACY_POLICY_URL,
} from "@/constants/legalUrls";
import { x, y } from "@/utils/scaling";

export default function PrivacyPolicyScreen() {
  const content = consentDocuments.privacyPolicy;

  async function openHostedPolicy() {
    if (!hasHostedPrivacyPolicyUrl()) {
      return;
    }

    await WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL);
  }

  return (
    <View style={styles.screen}>
      <BackButton fallback="/age-gate" />

      <Text style={styles.title}>{content.title}</Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.body}>{content.body}</Text>

        {hasHostedPrivacyPolicyUrl() ? (
          <Pressable
            onPress={() => {
              void openHostedPolicy();
            }}
            accessibilityRole="link"
            accessibilityLabel="Open hosted Privacy Policy"
            style={styles.hostedLink}
          >
            <Text style={styles.hostedLinkText}>
              Open full Privacy Policy online
            </Text>
          </Pressable>
        ) : (
          <Text style={styles.hostedHint}>
            Store listings must link to a hosted Privacy Policy URL.
            Set EXPO_PUBLIC_PRIVACY_POLICY_URL before App Store / Play
            submission.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  title: {
    marginTop: y(110),
    marginHorizontal: x(24),
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(28),
    lineHeight: y(36),
    textAlign: "center",
  },

  scroll: {
    flex: 1,
    marginTop: y(16),
  },

  scrollContent: {
    paddingHorizontal: x(24),
    paddingBottom: y(48),
  },

  body: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(16),
    lineHeight: y(24),
  },

  hostedLink: {
    marginTop: y(24),
    alignItems: "center",
  },

  hostedLinkText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(16),
    lineHeight: y(24),
    textDecorationLine: "underline",
  },

  hostedHint: {
    marginTop: y(24),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(14),
    lineHeight: y(20),
    opacity: 0.85,
  },
});
