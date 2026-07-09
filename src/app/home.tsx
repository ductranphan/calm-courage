/**
 * Post-auth home screen placeholder.
 *
 * Temporary screen displayed after a parent signs in.
 * This will later be replaced by the actual parent dashboard.
 */
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import AppButton from "@/components/ui/AppButton";
import { colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { x, y } from "@/utils/scaling";

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.replace("/onboarding");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>

      <Text style={styles.subtitle}>{user?.email}</Text>

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

  subtitle: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(18),
    lineHeight: y(24),
    marginBottom: y(8),
  },
});