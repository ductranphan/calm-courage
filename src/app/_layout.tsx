/**
 * Root layout.
 *
 * Loads fonts and image assets before showing the app, provides the
 * authentication/access contexts, and protects parent-only routes.
 */

import * as Font from "expo-font";
import {
  Redirect,
  Stack,
  usePathname,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import { colors } from "@/constants/colors";
import { preloadQuestImages } from "@/constants/questAssets";
import { ActiveChildProvider } from "@/contexts/ActiveChildContext";
import {
  AuthProvider,
  useAuth,
} from "@/contexts/AuthContext";
import {
  ParentAccessProvider,
  useParentAccess,
} from "@/contexts/ParentAccessContext";
import { preloadImages } from "@/utils/preloadAssets";

void SplashScreen.preventAutoHideAsync().catch(
  (error: unknown) => {
    console.warn(
      "Unable to keep the splash screen visible:",
      error,
    );
  },
);

const PARENT_ONLY_ROUTES = new Set([
  "/home",
  "/children",
  "/settings",
  "/child-profile-info",
  "/child-profile-avatar",
]);

function AppStack() {
  const pathname = usePathname();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const { parentAccessGranted } =
    useParentAccess();

  const parentOnlyRoute =
    PARENT_ONLY_ROUTES.has(pathname);

  if (parentOnlyRoute && authLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  if (parentOnlyRoute && !user) {
    return <Redirect href="/login" />;
  }

  if (
    parentOnlyRoute &&
    user &&
    !user.emailVerified
  ) {
    return <Redirect href="/verify-email" />;
  }

  if (
    parentOnlyRoute &&
    user &&
    user.emailVerified &&
    !parentAccessGranted
  ) {
    return (
      <Redirect href="/parent-verification" />
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "none",
      }}
    />
  );
}

export default function RootLayout() {
  const [assetsLoaded, setAssetsLoaded] =
    useState(false);

  useEffect(() => {
    let stillMounted = true;

    async function loadAssets() {
      try {
        await Promise.all([
          Font.loadAsync({
            /*
             * Body font.
             */
            Literata: require(
              "../../assets/fonts/Literata-Regular.ttf",
            ),
            LiterataMedium: require(
              "../../assets/fonts/Literata-Medium.ttf",
            ),
            LiterataSemiBold: require(
              "../../assets/fonts/Literata-SemiBold.ttf",
            ),
            LiterataBold: require(
              "../../assets/fonts/Literata-Bold.ttf",
            ),
            LiterataItalic: require(
              "../../assets/fonts/Literata-Italic.ttf",
            ),

            /*
             * Display font.
             */
            Outfit: require(
              "../../assets/fonts/Outfit-Regular.ttf",
            ),
            OutfitMedium: require(
              "../../assets/fonts/Outfit-Medium.ttf",
            ),
            OutfitSemiBold: require(
              "../../assets/fonts/Outfit-SemiBold.ttf",
            ),
            OutfitBold: require(
              "../../assets/fonts/Outfit-Bold.ttf",
            ),
            OutfitExtraBold: require(
              "../../assets/fonts/Outfit-ExtraBold.ttf",
            ),
            OutfitBlack: require(
              "../../assets/fonts/Outfit-Black.ttf",
            ),
          }),

          preloadImages(),

          preloadQuestImages(),
        ]);
      } catch (error) {
        console.error(
          "Unable to preload application assets:",
          error,
        );
      } finally {
        if (!stillMounted) {
          return;
        }

        setAssetsLoaded(true);

        try {
          await SplashScreen.hideAsync();
        } catch (error) {
          console.warn(
            "Unable to hide the splash screen:",
            error,
          );
        }
      }
    }

    void loadAssets();

    return () => {
      stillMounted = false;
    };
  }, []);

  if (!assetsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ParentAccessProvider>
        <ActiveChildProvider>
          <AppStack />
        </ActiveChildProvider>
      </ParentAccessProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});