/**
 * Root application layout.
 *
 * Keeps the splash screen visible until fonts and bundled images are ready.
 */

import * as Font from "expo-font";
import { Stack } from "expo-router";
<<<<<<< HEAD
import * as Font from "expo-font";
=======
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

import { AuthProvider } from "@/contexts/AuthContext";
import { preloadImages } from "@/utils/preloadAssets";

<<<<<<< HEAD
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
=======
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function prepareApplication() {
      try {
        await Promise.all([
          Font.loadAsync({
            Literata: require(
              "../../assets/fonts/Literata-Regular.ttf",
            ),
            Quiche: require(
              "../../assets/fonts/Quiche-Regular.ttf",
            ),
          }),

          preloadImages(),
        ]);
      } catch (error) {
        console.warn(
          "Some application assets could not be loaded:",
          error,
        );
      } finally {
        if (mounted) {
          setAppReady(true);

          try {
            await SplashScreen.hideAsync();
          } catch {
            // Splash screen may already be hidden.
          }
        }
      }
    }

    void prepareApplication();

    return () => {
      mounted = false;
    };
  }, []);

  if (!appReady) {
    return null;
  }
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}