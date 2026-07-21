/**
 * Responsive scaling utilities.
 *
 * Converts Figma pixel values into responsive values based on the
<<<<<<< HEAD
 * current device width.
 *
=======
 * current device dimensions.
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
 */

import { Dimensions } from "react-native";

const FIGMA_WIDTH = 402;
const FIGMA_HEIGHT = 874;

const { width, height } = Dimensions.get("window");

export const x = (value: number) => value * (width / FIGMA_WIDTH);
export const y = (value: number) => value * (height / FIGMA_HEIGHT);