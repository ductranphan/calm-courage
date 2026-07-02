/**
 * SVG TypeScript declaration.
 *
 * Allows TypeScript to understand imports ending in .svg and treat them as
 * React components that accept standard SVG props.
 */
declare module "*.svg" {
  import React from "react";
  import { SvgProps } from "react-native-svg";

  const content: React.FC<SvgProps>;
  export default content;
}
