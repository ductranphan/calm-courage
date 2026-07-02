/**
 * Email sign-up form placeholder. This screen will collect parent email, password, PIN, and terms acceptance before Firebase integration.
 */
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/colors";

export default function EmailSignupScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Email Sign-Up</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  text: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 20,
  },
});
