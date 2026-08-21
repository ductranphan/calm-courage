/**
 * Registers a push notification opt-in for the parent account.
 *
 * When expo-notifications is installed and permissions are granted,
 * the Expo push token is stored on the parent profile for a future
 * Cloud Function / push server. Opt-in is always persisted.
 */

import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

import {
  registerPushToken,
  updateParentPreferences,
} from "@/services/preferences";

async function getExpoPushToken(): Promise<string | null> {
  try {
    // Dynamic import keeps the app runnable if the package is not linked yet.
    const Notifications = await import(
      "expo-notifications"
    );

    if (!Device.isDevice) {
      return `simulator:${Device.modelName ?? "device"}`;
    }

    const current =
      await Notifications.getPermissionsAsync();

    let status = current.status;

    if (status !== "granted") {
      const requested =
        await Notifications.requestPermissionsAsync();
      status = requested.status;
    }

    if (status !== "granted") {
      return null;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(
        "default",
        {
          name: "default",
          importance:
            Notifications.AndroidImportance.DEFAULT,
        },
      );
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const tokenResult =
      await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined,
      );

    return tokenResult.data;
  } catch (error) {
    console.warn(
      "Push token registration skipped:",
      error,
    );
    return null;
  }
}

export async function enableParentPushNotifications(
  parentUid: string,
): Promise<{ enabled: boolean; token: string | null }> {
  const token = await getExpoPushToken();

  if (token) {
    await registerPushToken(parentUid, token);
    return { enabled: true, token };
  }

  await updateParentPreferences(parentUid, {
    pushNotifications: true,
  });

  return { enabled: true, token: null };
}
