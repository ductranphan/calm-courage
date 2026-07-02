/**
 * Reusable text input.
 *
 * Used for form fields such as email, password, child name, and PIN.
 * It wraps React Native TextInput with the app's standard styling.
 */
import { StyleSheet, TextInput, TextInputProps } from "react-native";
import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

export default function AppTextInput(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.muted}
      style={styles.input}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    height: 78,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 18,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    ...typography.input,
    color: colors.primary,
  },
});
