/**
 * Root layout.
 *
 * Loads fonts and image assets before showing the app.
 */

import { Stack } from "expo-router";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

import { AuthProvider } from "@/contexts/AuthContext";
import { preloadImages } from "@/utils/preloadAssets";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    async function loadAssets() {
      try {
        await Promise.all([
          Font.loadAsync({
            Literata: require("../../assets/fonts/Literata-Regular.ttf"),
            Quiche: require("../../assets/fonts/Quiche-Regular.ttf"),
          }),

          preloadImages(),
        ]);
      } finally {
        setAssetsLoaded(true);
        SplashScreen.hideAsync();
      }
    }

    loadAssets();
  }, []);

  if (!assetsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}