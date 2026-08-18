import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "@/constants/colors";
import { x, y } from "@/utils/scaling";

import ScenarioFrontTemplate from "../../../assets/images/scenarios/scenario-front-template.svg";

type ScenarioFrontCardProps = {
  scenarioNumber: number;
  text: string;
  onPress?: () => void;
};

export default function ScenarioFrontCard({
  scenarioNumber,
  text,
  onPress,
}: ScenarioFrontCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.scenarioNumber}>
        {scenarioNumber}.
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Scenario ${scenarioNumber}. ${text}`}
      >
        <ScenarioFrontTemplate
          width={x(362)}
          height={y(510)}
          style={styles.background}
        />

        <View style={styles.textContainer}>
          <Text
            style={styles.scenarioText}
            adjustsFontSizeToFit
            minimumFontScale={0.78}
          >
            {text}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },

  scenarioNumber: {
    marginBottom: y(20),
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(30),
    lineHeight: y(38),
    textAlign: "center",
  },

  card: {
    position: "relative",
    width: x(362),
    height: y(510),
    alignItems: "center",
    justifyContent: "center",
  },

  background: {
    position: "absolute",
    left: 0,
    top: 0,
  },

  textContainer: {
    width: x(290),
    minHeight: y(210),
    paddingHorizontal: x(8),
    alignItems: "center",
    justifyContent: "center",
  },

  scenarioText: {
    color: colors.primary,
    fontFamily: "LiterataBold",
    fontSize: x(23),
    lineHeight: y(29),
    textAlign: "center",
    includeFontPadding: false,
  },

  cardPressed: {
    opacity: 0.85,
  },
});