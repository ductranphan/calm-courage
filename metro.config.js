/**
 * Metro bundler configuration.
 *
 * Adds SVG support so Figma-exported SVG files can be imported as React
 * components, for example: import LogoSvg from "../assets/images/logo.svg".
 */
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Use react-native-svg-transformer to transform SVG files into components.
config.transformer.babelTransformerPath = require.resolve(
  "react-native-svg-transformer"
);

// Remove SVG from normal asset handling.
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== "svg"
);

// Add SVG to source extensions so it can be imported in TSX files.
config.resolver.sourceExts.push("svg");

module.exports = config;
