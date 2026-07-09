import { router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import AppButton from "@/components/ui/AppButton";
import BackButton from "@/components/ui/BackButton";
import { colors } from "@/constants/colors";
import { x, y } from "@/utils/scaling";

const avatars = [
  {
    id: "lion",
    source: require("../../assets/images/lion.png"),
    left: 20,
    top: 355,
  },
  {
    id: "koala",
    source: require("../../assets/images/koala.png"),
    left: 211,
    top: 355,
  },
  {
    id: "panda",
    source: require("../../assets/images/panda.png"),
    left: 20,
    top: 517,
  },
  {
    id: "rabbit",
    source: require("../../assets/images/rabbit.png"),
    left: 211,
    top: 517,
  },
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

      {avatars.map(({ id, source, left, top }) => (
        <Pressable
          key={id}
          onPress={() => setSelectedAvatar(id)}
          style={[
            styles.avatarShadow,
            {
              left: x(left),
              top: y(top),
            },
            selectedAvatar === id && styles.selectedAvatarShadow,
          ]}
        >
          <View style={styles.avatarClip}>
            <Image
              source={source}
              style={styles.avatarImage}
              resizeMode="contain"
            />
          </View>
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

  avatarShadow: {
    position: "absolute",
    width: x(171),
    height: y(138),
    borderRadius: x(20),
    backgroundColor: colors.white,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 8,
  },

  selectedAvatarShadow: {
    borderWidth: x(2),
    borderColor: colors.primary,
  },

  avatarClip: {
    width: "100%",
    height: "100%",
    borderRadius: x(20),
    backgroundColor: colors.white,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
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