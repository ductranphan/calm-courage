/**
 * Forgot password placeholder. This screen will later request a Firebase password reset email.
 */
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/colors";

export default function ForgotPasswordScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Forgot Password</Text>
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
