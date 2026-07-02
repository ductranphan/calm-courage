/**
 * Post-auth home screen placeholder.
 *
 * Shown after a parent signs in and verifies their email.
 */
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import AppButton from "@/components/AppButton";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/constants/colors";

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
    gap: 16,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  title: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 28,
  },
  subtitle: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 18,
    marginBottom: 8,
  },
});
