/**
 * Responsive scaling utilities.
 *
 * Converts Figma pixel values into responsive values based on the
 * current device dimensions.
 */

import { Dimensions } from "react-native";

const FIGMA_WIDTH = 402;
const FIGMA_HEIGHT = 874;

const { width, height } = Dimensions.get("window");

export const x = (value: number) => value * (width / FIGMA_WIDTH);
export const y = (value: number) => value * (height / FIGMA_HEIGHT);