/**
<<<<<<< HEAD
 * Temporary switch-to-child screen.
 *
 * Placeholder screen shown after the child profile setup flow.
 * This will later be replaced by the real child mode/home transition.
 */
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import AppButton from "@/components/ui/AppButton";
import BackButton from "@/components/ui/BackButton";
import { colors } from "@/constants/colors";
import { x, y } from "@/utils/scaling";

export default function SwitchToChildScreen() {
  return (
    <View style={styles.screen}>
      <BackButton fallback="/child-profile-avatar" />

      <Text style={styles.title}>Switch to Child</Text>

      <Text style={styles.subtitle}>
        This screen is temporary so you can test the profile setup flow.
      </Text>

      <AppButton
        title="Continue to Home"
        onPress={() => router.replace("/home")}
      />
    </View>
=======
 * Switch to Child Mode screen.
 *
 * Shows the parent that it is time to pass the device to the child.
 */

import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppButton from "@/components/ui/AppButton";
import BackButton from "@/components/ui/BackButton";
import { passDeviceImage } from "@/constants/assets";
import { colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { listChildren } from "@/services/children";
import { x, y } from "@/utils/scaling";

export default function SwitchToChildScreen() {
  const { user } = useAuth();

  const { childId, childName, avatarId } = useLocalSearchParams<{
    childId?: string;
    childName?: string;
    avatarId?: string;
  }>();

  const [name, setName] = useState(childName || "");
  const [loading, setLoading] = useState(!childName);

  useEffect(() => {
    let stillMounted = true;

    async function loadChildName() {
      if (childName) {
        setName(childName);
        setLoading(false);
        return;
      }

      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const children = await listChildren(user.uid);

        const selectedChild = childId
          ? children.find((child) => child.id === childId)
          : children[0];

        if (stillMounted && selectedChild) {
          setName(selectedChild.name);
        }
      } catch {
        // Keep the name empty.
        if (stillMounted) {
          setLoading(false);
        }
      }
    }

    void loadChildName();

    return () => {
      stillMounted = false;
    };
  }, [user?.uid, childId, childName]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.figmaFrame}>
        <BackButton fallback="/child-profile-avatar" />

        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : (
          <>
            <Text style={styles.title}>
              Pass the device to{"\n"}
              {name || "your child"}!
            </Text>

            <Text style={styles.subtitle}>
              It&apos;s time for your child to begin their{"\n"}
              courage journey. Hand over the{"\n"}
              screen to start playing!
            </Text>

            <View style={styles.imageWrapper}>
              <Image
                source={passDeviceImage}
                style={styles.image}
                resizeMode="cover"
              />
            </View>

            <View style={styles.buttonWrapper}>
              <AppButton
                title="Ready to Play!"
                onPress={() =>
                  router.replace({
                    pathname: "/child-welcome",
                    params: {
                      childId: childId ?? "",
                      childName: name,
                      avatarId: avatarId ?? "",
                    },
                  })
                }
                style={styles.readyButton}
              />
            </View>

            <Pressable
              onPress={() => router.replace("/home")}
              style={styles.dashboardLinkWrapper}
            >
              <Text style={styles.dashboardLink}>Go to Parent Dashboard</Text>
            </Pressable>
          </>
        )}
      </View>
    </ScrollView>
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
<<<<<<< HEAD
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: x(24),
    gap: y(24),
  },

  title: {
=======
  },

  scrollContent: {
    minHeight: y(960),
    backgroundColor: colors.background,
  },

  figmaFrame: {
    width: "100%",
    height: y(960),
    position: "relative",
    backgroundColor: colors.background,
  },

  loader: {
    marginTop: y(420),
  },

  title: {
    position: "absolute",
    left: x(20),
    top: y(123),
    width: x(362),
    height: y(78),
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
    color: colors.primary,
    fontFamily: "Quiche",
    fontSize: x(30),
    lineHeight: y(39),
<<<<<<< HEAD
    textAlign: "center",
  },

  subtitle: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(26),
    textAlign: "center",
=======
  },

  subtitle: {
    position: "absolute",
    left: x(20),
    top: y(242),
    width: x(362),
    height: y(72),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
  },

  imageWrapper: {
    position: "absolute",
    left: x(20),
    top: y(355),
    width: x(362),
    height: y(350.42),
    borderRadius: x(20),
    overflow: "hidden",
    backgroundColor: colors.white,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  buttonWrapper: {
    position: "absolute",
    left: x(96),
    top: y(772),
    width: x(210),
    height: y(52),
  },

  readyButton: {
    width: x(210),
    height: y(52),
    borderRadius: x(20),
  },

  dashboardLinkWrapper: {
    position: "absolute",
    left: x(88),
    top: y(890),
    width: x(226),
    height: y(24),
    alignItems: "center",
    justifyContent: "center",
  },

  dashboardLink: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textAlign: "center",
    textDecorationLine: "underline",
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
  },
});