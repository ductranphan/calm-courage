/**
 * Post-auth home screen placeholder.
 *
 * Shown after a parent signs in, verifies email, and creates a child profile.
 */
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import AppButton from "@/components/AppButton";
import { useAuth } from "@/contexts/AuthContext";
import { avatars } from "@/constants/avatars";
import { colors } from "@/constants/colors";
import {
  ageFromBirthdate,
  type ChildProfile,
  listChildren,
} from "@/services/children";

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadChildren() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const profiles = await listChildren(user.uid);
        if (!cancelled) {
          setChildren(profiles);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadChildren();

    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleSignOut() {
    await signOut();
    router.replace("/onboarding");
  }

  const child = children[0];
  const avatar = avatars.find((option) => option.id === child?.avatar);
  const age = ageFromBirthdate(child?.birthdate);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <>
          <Text style={styles.title}>Welcome</Text>
          {child ? (
            <>
              <Text style={styles.avatar}>{avatar?.emoji ?? "🦁"}</Text>
              <Text style={styles.childName}>{child.name}</Text>
              {age !== null ? (
                <Text style={styles.childMeta}>Age {age}</Text>
              ) : null}
              <Text style={styles.childMeta}>
                Stars {child.stars} · Gems {child.gems}
              </Text>
            </>
          ) : null}
          <Text style={styles.subtitle}>{user?.email}</Text>
        </>
      )}
      <AppButton title="Sign Out" onPress={handleSignOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  title: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 28,
  },
  avatar: {
    fontSize: 48,
    lineHeight: 56,
  },
  childName: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 24,
    fontWeight: "700",
  },
  childMeta: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 16,
    marginBottom: 4,
  },
  subtitle: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 18,
    marginBottom: 8,
  },
});
