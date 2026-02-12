import { useState, useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import type { EventSubscription } from "expo-modules-core";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";

type NotificationType = "wave" | "match" | "message";

interface NotificationData {
  type: NotificationType;
  matchId?: string;
  fromUserId?: string;
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Push notifications only work on physical devices
  if (Platform.OS === "web") {
    return null;
  }

  // Check existing permissions first
  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not already granted
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Push notification permission not granted");
    return null;
  }

  // Configure Android notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#D4785C",
    });
  }

  try {
    const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
    if (!projectId || projectId.includes("your-")) {
      // Skip in development without a real EAS project ID
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    return tokenData.data;
  } catch {
    // Push tokens not available in Expo Go
    return null;
  }
}

function handleNotificationTap(data: NotificationData) {
  switch (data.type) {
    case "wave":
      // Navigate to the discover tab where waves are shown
      router.push("/(tabs)/discover");
      break;

    case "match":
      // Navigate to the matches screen
      router.push("/(screens)/matches");
      break;

    case "message":
      if (data.matchId) {
        // Navigate directly to the chat for this match
        router.push({
          pathname: "/(screens)/chat",
          params: { matchId: data.matchId },
        });
      } else {
        // Fallback to matches list
        router.push("/(screens)/matches");
      }
      break;

    default:
      break;
  }
}

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);

  const notificationListener = useRef<EventSubscription | null>(null);
  const responseListener = useRef<EventSubscription | null>(null);

  const { session } = useAuthStore();
  const userId = session?.user?.id;

  // Register for push notifications and save token to Supabase
  useEffect(() => {
    if (!userId) return;

    registerForPushNotificationsAsync().then(async (token) => {
      if (!token) return;

      setExpoPushToken(token);

      // Save the push token to the user's profile in Supabase
      const { error } = await supabase
        .from("profiles")
        .update({ push_token: token })
        .eq("id", userId);

      if (error) {
        console.error("Failed to save push token:", error.message);
      }
    });
  }, [userId]);

  // Set up notification listeners
  useEffect(() => {
    // Listener for notifications received while app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((incoming) => {
        setNotification(incoming);
      });

    // Listener for when user taps on a notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as Record<
          string,
          unknown
        >;

        if (data?.type) {
          handleNotificationTap(data as unknown as NotificationData);
        }
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  // Clear push token state on sign out
  useEffect(() => {
    if (!userId && expoPushToken) {
      setExpoPushToken(null);
    }
  }, [userId, expoPushToken]);

  return { expoPushToken, notification };
}
