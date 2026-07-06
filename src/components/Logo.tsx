/**
 * Reusable Calm Courage logo.
 *
 * Wraps the exported SVG logo and optionally displays the
 * Figma drop shadow used on some screens.
 */

import { StyleSheet, View } from "react-native";
import LogoSvg from "../../assets/images/logo.svg";

type Props = {
  width?: number;
  height?: number;
  shadow?: boolean;
};

export default function Logo({
  width = 350,
  height = 130,
  shadow = false,
}: Props) {
  const logo = <LogoSvg width={width} height={height} />;

  if (!shadow) {
    return logo;
  }

  return <View style={styles.shadow}>{logo}</View>;
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4, // Android
  },
});