/**
 * Root application layout.
 *
 * Keeps the splash screen visible until fonts and bundled images are ready.
 */

import * as Font from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

import { AuthProvider } from "@/contexts/AuthContext";
import { preloadImages } from "@/utils/preloadAssets";

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

  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </AuthProvider>
  );
}