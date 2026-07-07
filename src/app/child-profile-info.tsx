import { Dimensions, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";

import AppButton from "@/components/AppButton";
import BackButton from "@/components/BackButton";
import Logo from "@/components/Logo";
import { colors } from "@/constants/colors";

const FIGMA_WIDTH = 402;
const FIGMA_HEIGHT = 874;

const { width, height } = Dimensions.get("window");

const x = (value: number) => value * (width / FIGMA_WIDTH);
const y = (value: number) => value * (height / FIGMA_HEIGHT);

export default function ChildProfileInfoScreen() {
  return (
    <View style={styles.screen}>
      <BackButton fallback="/verify-email" />

      <Text style={styles.title}>Who is joining{"\n"}the journey?</Text>

      <Text style={styles.subtitle}>
        Please enter your child's details to{"\n"}
        personalize their emotional learning{"\n"}
        space and track progress.
      </Text>

      <TextInput
        placeholder="Child’s name or nickname"
        placeholderTextColor={colors.muted}
        style={[styles.input, styles.nameInput]}
      />

      <TextInput
        placeholder="Child’s date of birth"
        placeholderTextColor={colors.muted}
        style={[styles.input, styles.birthInput]}
      />

      <View style={styles.buttonWrapper}>
        <AppButton
          title="Next"
          onPress={() => router.push("/child-profile-avatar")}
          style={styles.nextButton}
        />
      </View>

      <View style={styles.logoWrapper}>
        <Logo width={x(168)} height={y(62)} shadow />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  title: {
    position: "absolute",
    left: x(20),
    top: y(123),
    width: x(260),
    minHeight: y(95),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(30),
    lineHeight: y(39),
  },

  subtitle: {
    position: "absolute",
    left: x(20),
    top: y(242),
    width: x(362),
    height: y(72),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
  },

  input: {
    position: "absolute",
    left: x(20),
    width: x(362),
    height: y(72),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: x(20),
    backgroundColor: colors.white,
    paddingHorizontal: x(26),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
  },

  nameInput: {
    top: y(355),
  },

  birthInput: {
    top: y(461),
  },

  buttonWrapper: {
    position: "absolute",
    left: x(97),
    top: y(597),
    width: x(210),
    height: y(52),
  },

  nextButton: {
    width: x(210),
    height: y(52),
    borderRadius: x(20),
  },

  logoWrapper: {
    position: "absolute",
    left: x(117),
    top: y(713),
    width: x(168),
    height: y(62),
  },
});