/**
 * Reusable screen wrapper.
 *
 * Provides the default background color and horizontal padding for screens
 * that use flexible layout instead of absolute Figma positioning.
 */
import { SafeAreaView, StyleSheet, ViewStyle } from "react-native";
import { colors } from "@/constants/colors";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export default function ScreenContainer({ children, style }: Props) {
  return <SafeAreaView style={[styles.container, style]}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 32,
  },
});
