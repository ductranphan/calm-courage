/**
 * Reusable emotion image component.
 *
 * Displays the correct local image for a given emotion string.
 */

import type { ImageStyle, StyleProp } from "react-native";
import { Image } from "react-native";

import { getEmotionImage } from "@/constants/emotions";

type Props = {
  emotion?: string | null;
  style?: StyleProp<ImageStyle>;
};

export default function EmotionImage({ emotion, style }: Props) {
  return (
    <Image
      source={getEmotionImage(emotion)}
      style={style}
      resizeMode="contain"
    />
  );
}