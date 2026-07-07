import { useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import AppButton from "@/components/AppButton";
import BackButton from "@/components/BackButton";
import { colors } from "@/constants/colors";

import Lion from "../../assets/images/lion.svg";
import Koala from "../../assets/images/koala.svg";
import Panda from "../../assets/images/panda.svg";
import Rabbit from "../../assets/images/rabbit.svg";

const FIGMA_WIDTH = 402;
const FIGMA_HEIGHT = 874;

const { width, height } = Dimensions.get("window");

const x = (value: number) => value * (width / FIGMA_WIDTH);
const y = (value: number) => value * (height / FIGMA_HEIGHT);

const avatars = [
  { id: "lion", Component: Lion, left: 20, top: 355, imageWidth: 171, imageHeight: 138 },
  { id: "koala", Component: Koala, left: 211, top: 355, imageWidth: 171, imageHeight: 138 },
  { id: "panda", Component: Panda, left: 20, top: 517, imageWidth: 171, imageHeight: 138 },
  { id: "rabbit", Component: Rabbit, left: 211, top: 517, imageWidth: 171, imageHeight: 138 },
];

export default function ChildProfileAvatarScreen() {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  return (
    <View style={styles.screen}>
      <BackButton fallback="/child-profile-info" />

      <Text style={styles.title}>Choose a Buddy{"\n"}for Emma</Text>

      <Text style={styles.subtitle}>
        Pick your favorite companion to join{"\n"}
        your daily emotional journey and{"\n"}
        celebrate achievements.
      </Text>

      {avatars.map(({ id, Component, left, top, imageWidth, imageHeight }) => (
        <Pressable
          key={id}
          onPress={() => setSelectedAvatar(id)}
          style={[
            styles.avatarCard,
            {
              left: x(left),
              top: y(top),
            },
            selectedAvatar === id && styles.selectedAvatarCard,
          ]}
        >
          <Component width={x(imageWidth)} height={y(imageHeight)} />
        </Pressable>
      ))}

      <View style={styles.buttonWrapper}>
        <AppButton
          title="Let’s Start!"
          onPress={() => router.push("/switch-to-child")}
          style={styles.startButton}
        />
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
    left: x(22),
    top: y(123),
    width: x(300),
    minHeight: y(90),
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

  avatarCard: {
    position: "absolute",
    width: x(171),
    height: y(138),
    borderRadius: x(20),
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  selectedAvatarCard: {
    borderColor: colors.primary,
  },

  buttonWrapper: {
    position: "absolute",
    left: x(96),
    top: y(728),
    width: x(210),
    height: y(52),
  },

  startButton: {
    width: x(210),
    height: y(52),
    borderRadius: x(20),
  },
});