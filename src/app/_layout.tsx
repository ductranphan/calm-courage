/**
 * Root application layout.
 *
 * Responsibilities:
 * - Loads the Literata font before rendering screens.
 * - Keeps the splash screen visible until fonts are ready.
 * - Configures Expo Router Stack navigation for the whole app.
 */
import { Stack } from "expo-router";
import { useFonts, Literata_400Regular } from "@expo-google-fonts/literata";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

// Prevent the splash screen from disappearing before custom fonts are loaded.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Load the Literata font used in the Figma design.
  const [loaded] = useFonts({
    Literata: Literata_400Regular,
  });

  // Hide the splash screen once fonts are ready.
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Render nothing while fonts are loading to avoid a font flash.
  if (!loaded) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
