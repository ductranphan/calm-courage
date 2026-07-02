/**
 * Terms and privacy placeholder. This screen will later display legal documents.
 */
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/colors";

export default function TermsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Terms</Text>
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
