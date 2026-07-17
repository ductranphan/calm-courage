/**
 * Post-auth home screen placeholder.
 *
 * Shown after a parent signs in, verifies email, and creates a child profile.
 */
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import AppButton from "@/components/ui/AppButton";
import { avatars } from "@/constants/avatars";
import { colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { type ChildProfile, listChildren } from "@/services/children";
import { x, y } from "@/utils/scaling";

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
  const avatar = avatars.find((option) => option.id === child?.avatarId);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <>
          <Text style={styles.title}>Welcome</Text>
          {child ? (
            <>
              <Text style={styles.avatar}>{avatar?.emoji ?? "🐻"}</Text>
              <Text style={styles.childName}>{child.name}</Text>
              <Text style={styles.childMeta}>Age {child.age}</Text>
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
    gap: y(16),
    backgroundColor: colors.background,
    paddingHorizontal: x(24),
  },

  title: {
    color: colors.primary,
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
  },
});
