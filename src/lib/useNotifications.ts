import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import {
  registerForPushNotificationsAsync,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  getLastNotificationResponse,
  NotificationData,
} from './notifications';

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const router = useRouter();

  // Handle notification tap navigation
  const handleNotificationNavigation = (data: NotificationData) => {
    if (!data?.type) return;

    switch (data.type) {
      case 'event':
        // Navigate to calendar tab
        router.push('/(tabs)/calendar');
        break;
      case 'shopping':
        // Navigate to shopping tab
        router.push('/(tabs)/shopping');
        break;
      case 'pet':
        if (data.id) {
          router.push(`/pet-detail?id=${data.id}`);
        } else {
          router.push('/(tabs)/pets');
        }
        break;
      case 'family':
        router.push('/(tabs)/family');
        break;
      case 'reminder':
        // Navigate to home or relevant screen
        router.push('/(tabs)');
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
      }
    });

    // Check if app was opened from a notification
    getLastNotificationResponse().then((response) => {
      if (response) {
        const data = response.notification.request.content.data as NotificationData;
        handleNotificationNavigation(data);
      }
    });

    // Listen for notifications received while app is foregrounded
    notificationListener.current = addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    // Listen for notification taps
    responseListener.current = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data as NotificationData;
      handleNotificationNavigation(data);
    });

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
  };
}
