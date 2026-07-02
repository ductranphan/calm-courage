/**
 * Email verification placeholder. This screen will later guide parents after sending a verification email.
 */
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/colors";

export default function VerifyEmailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Verify Email</Text>
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
