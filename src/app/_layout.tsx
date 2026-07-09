/**
 * Root application layout.
 *
 * Responsibilities:
 * - Loads the Literata font before rendering screens.
 * - Keeps the splash screen visible until fonts are ready.
 * - Configures Expo Router Stack navigation for the whole app.
 */
import { Stack } from "expo-router";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

import { AuthProvider } from "@/contexts/AuthContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        Literata: require("../../assets/fonts/Literata-Regular.ttf"),
        Quiche: require("../../assets/fonts/Quiche-Regular.ttf"),
      });

      setFontsLoaded(true);
      SplashScreen.hideAsync();
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}