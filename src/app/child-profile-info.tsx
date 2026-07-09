import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import AppButton from "@/components/ui/AppButton";
import BackButton from "@/components/ui/BackButton";
import FloatingTextInput from "@/components/ui/FloatingTextInput";
import Logo from "@/components/ui/Logo";
import { colors } from "@/constants/colors";
import { x, y } from "@/utils/scaling";

export default function ChildProfileInfoScreen() {
  const [childName, setChildName] = useState("");
  const [birthDate, setBirthDate] = useState("");

  return (
    <View style={styles.screen}>
      <BackButton fallback="/verify-email" />

      <Text style={styles.title}>Who is joining{"\n"}the journey?</Text>

      <Text style={styles.subtitle}>
        Please enter your child's details to{"\n"}
        personalize their emotional learning{"\n"}
        space and track progress.
      </Text>

      <View style={styles.nameInput}>
        <FloatingTextInput
          label="Child’s name or nickname"
          value={childName}
          onChangeText={setChildName}
          autoCapitalize="words"
          autoCorrect={false}
        />
      </View>

      <View style={styles.birthInput}>
        <FloatingTextInput
          label="MM/DD/YYYY"
          value={birthDate}
          onChangeText={setBirthDate}
          keyboardType="numbers-and-punctuation"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

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
    fontFamily: "Quiche",
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

  nameInput: {
    position: "absolute",
    left: x(20),
    top: y(355),
  },

  birthInput: {
    position: "absolute",
    left: x(20),
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