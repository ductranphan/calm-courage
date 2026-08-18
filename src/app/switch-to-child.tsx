/**
 * Switch to Child Mode screen.
 *
 * Shows the parent that it is time to pass the device to the child.
 * Matches Figma Screen 4.0.
 *
 * The selected child is rendered immediately from route params or
 * ActiveChildContext whenever possible. Firestore is only used as a
 * background fallback when the screen does not already have complete
 * child data.
 *
 * This avoids showing a loading spinner before entering child mode.
 */

import {
  router,
  useLocalSearchParams,
} from "expo-router";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppButton from "@/components/ui/AppButton";
import BackButton from "@/components/ui/BackButton";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { passDeviceImage } from "@/constants/assets";
import {
  normalizeAvatarId,
} from "@/constants/avatars";
import { colors } from "@/constants/colors";
import {
  useActiveChild,
  type ActiveChild,
} from "@/contexts/ActiveChildContext";
import { useAuth } from "@/contexts/AuthContext";
import { useParentAccess } from "@/contexts/ParentAccessContext";
import {
  getChild,
  listChildren,
} from "@/services/children";
import { x, y } from "@/utils/scaling";

function createRouteChild(
  childId: string | undefined,
  childName: string | undefined,
  avatarId: string | undefined,
): ActiveChild | null {
  if (
    !childId ||
    !childName ||
    !avatarId
  ) {
    return null;
  }

  return {
    id: childId,
    name: childName,
    avatarId:
      normalizeAvatarId(
        avatarId,
      ),
  };
}

export default function SwitchToChildScreen() {
  const { user } =
    useAuth();

  const {
    enterChildMode,
  } = useParentAccess();

  const {
    activeChild,
    selectActiveChild,
  } = useActiveChild();

  const {
    childId,
    childName,
    avatarId,
  } =
    useLocalSearchParams<{
      childId?: string;
      childName?: string;
      avatarId?: string;
    }>();

  const routeChild =
    useMemo(
      () =>
        createRouteChild(
          childId,
          childName,
          avatarId,
        ),
      [
        avatarId,
        childId,
        childName,
      ],
    );

  const initialChild =
    useMemo(() => {
      if (routeChild) {
        return routeChild;
      }

      if (
        activeChild &&
        (
          !childId ||
          activeChild.id ===
            childId
        )
      ) {
        return activeChild;
      }

      return null;
    }, [
      activeChild,
      childId,
      routeChild,
    ]);

  const [
    selectedChild,
    setSelectedChild,
  ] =
    useState<ActiveChild | null>(
      initialChild,
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  useEffect(() => {
    let stillMounted =
      true;

    async function loadSelectedChild() {
      setError(null);

      if (!user?.uid) {
        if (
          stillMounted
        ) {
          setError(
            "You must be signed in to continue.",
          );
        }

        return;
      }

      /*
       * Complete route data is already enough to render and continue.
       * It came from the exact child selected by the parent, so there
       * is no reason to block the screen with another Firestore read.
       */
      if (routeChild) {
        if (
          stillMounted
        ) {
          setSelectedChild(
            routeChild,
          );
        }

        return;
      }

      /*
       * If ActiveChildContext already contains the exact requested
       * child, keep it visible immediately while we refresh the profile.
       */
      if (
        activeChild &&
        (
          !childId ||
          activeChild.id ===
            childId
        )
      ) {
        if (
          stillMounted
        ) {
          setSelectedChild(
            activeChild,
          );
        }

        /*
         * When there is no explicit child ID, ActiveChildContext already
         * identifies the child the parent was viewing. No list request is
         * needed just to rediscover the same profile.
         */
        if (!childId) {
          return;
        }
      }

      try {
        let child =
          childId
            ? await getChild(
                user.uid,
                childId,
              )
            : null;

        if (!childId) {
          const children =
            await listChildren(
              user.uid,
            );

          /*
           * Never choose an arbitrary profile when several children exist.
           * Send the parent to Child Management so they can select the exact
           * child who will use the device.
           */
          if (
            children.length >
            1
          ) {
            router.replace(
              "/children",
            );
            return;
          }

          child =
            children[0] ??
            null;
        }

        if (
          !stillMounted
        ) {
          return;
        }

        if (!child) {
          /*
           * Keep an already-visible matching ActiveChild preview if one
           * exists. Only clear the screen when there truly is no child data.
           */
          const hasMatchingPreview =
            Boolean(
              activeChild &&
                (
                  !childId ||
                  activeChild.id ===
                    childId
                ),
            );

          if (
            !hasMatchingPreview
          ) {
            setSelectedChild(
              null,
            );

            setError(
              "No child profile found.",
            );
          }

          return;
        }

        setSelectedChild({
          id:
            child.id,

          name:
            child.name,

          avatarId:
            normalizeAvatarId(
              child.avatarId,
            ),
        });
      } catch (loadError) {
        console.error(
          "Unable to refresh the selected child:",
          loadError,
        );

        const hasMatchingPreview =
          Boolean(
            activeChild &&
              (
                !childId ||
                activeChild.id ===
                  childId
              ),
          );

        if (
          stillMounted &&
          !hasMatchingPreview
        ) {
          setError(
            "We couldn’t load the child profile. Please try again.",
          );
        }
      }
    }

    void loadSelectedChild();

    return () => {
      stillMounted =
        false;
    };
  }, [
    activeChild,
    childId,
    routeChild,
    user?.uid,
  ]);

  function handleReadyToPlay() {
    if (!selectedChild) {
      setError(
        "No child profile found.",
      );
      return;
    }

    /*
     * Save the exact child before locking parent-only screens and
     * handing the device over.
     */
    selectActiveChild(
      selectedChild,
    );

    enterChildMode();

    router.replace({
      pathname:
        "/child-welcome",

      params: {
        childId:
          selectedChild.id,

        childName:
          selectedChild.name,

        avatarId:
          selectedChild.avatarId,
      },
    });
  }

  return (
    <ScrollView
      style={
        styles.screen
      }
      contentContainerStyle={
        styles.scrollContent
      }
      showsVerticalScrollIndicator={
        false
      }
      bounces={false}
      alwaysBounceVertical={
        false
      }
      overScrollMode="never"
      contentInsetAdjustmentBehavior="never"
    >
      <View
        style={
          styles.figmaFrame
        }
      >
        <BackButton
          fallback="/children"
        />

        <Text
          style={
            styles.title
          }
        >
          Pass the device to
          {"\n"}
          {selectedChild?.name ||
            "your child"}!
        </Text>

        <Text
          style={
            styles.subtitle
          }
        >
          It&apos;s time for your child to begin their
          {"\n"}
          courage journey. Hand over the
          {"\n"}
          screen to start playing!
        </Text>

        <View
          style={
            styles.imageWrapper
          }
        >
          <Image
            source={
              passDeviceImage
            }
            style={
              styles.image
            }
            resizeMode="cover"
            fadeDuration={0}
          />
        </View>

        <ErrorMessage
          message={error}
          style={
            styles.error
          }
        />

        <View
          style={
            styles.buttonWrapper
          }
        >
          <AppButton
            title="Ready to Play!"
            onPress={
              handleReadyToPlay
            }
            style={
              styles.readyButton
            }
          />
        </View>

        <Pressable
          onPress={() =>
            router.replace(
              "/home",
            )
          }
          style={({
            pressed,
          }) => [
            styles.dashboardLinkWrapper,

            pressed &&
              styles.controlPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Go to Parent Dashboard"
        >
          <Text
            style={
              styles.dashboardLink
            }
          >
            Go to Parent Dashboard
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,

      backgroundColor:
        colors.background,
    },

    scrollContent: {
      minHeight:
        y(960),

      backgroundColor:
        colors.background,
    },

    figmaFrame: {
      width:
        "100%",

      height:
        y(960),

      position:
        "relative",

      backgroundColor:
        colors.background,
    },

    title: {
      position:
        "absolute",

      left:
        x(20),

      top:
        y(123),

      width:
        x(362),

      height:
        y(78),

      color:
        colors.primary,

      fontFamily:
        "Outfit",

      fontSize:
        x(30),

      lineHeight:
        y(39),
    },

    subtitle: {
      position:
        "absolute",

      left:
        x(20),

      top:
        y(242),

      width:
        x(362),

      height:
        y(72),

      color:
        colors.primary,

      fontFamily:
        "Literata",

      fontSize:
        x(20),

      lineHeight:
        y(24),
    },

    imageWrapper: {
      position:
        "absolute",

      left:
        x(20),

      top:
        y(355),

      width:
        x(362),

      height:
        y(350.42),

      borderRadius:
        x(20),

      overflow:
        "hidden",

      backgroundColor:
        colors.white,
    },

    image: {
      width:
        "100%",

      height:
        "100%",
    },

    error: {
      position:
        "absolute",

      left:
        x(20),

      top:
        y(724),

      width:
        x(362),
    },

    buttonWrapper: {
      position:
        "absolute",

      left:
        x(96),

      top:
        y(772),

      width:
        x(210),

      height:
        y(52),
    },

    readyButton: {
      width:
        x(210),

      height:
        y(52),

      borderRadius:
        x(20),
    },

    dashboardLinkWrapper: {
      position:
        "absolute",

      left:
        x(88),

      top:
        y(890),

      width:
        x(226),

      height:
        y(24),

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    dashboardLink: {
      color:
        colors.primary,

      fontFamily:
        "Literata",

      fontSize:
        x(20),

      lineHeight:
        y(24),

      textAlign:
        "center",

      textDecorationLine:
        "underline",
    },

    controlPressed: {
      opacity:
        0.65,
    },
  });