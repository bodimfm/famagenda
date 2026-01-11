import * as Notifications from 'expo-notifications';
import { PermissionStatus } from 'expo-modules-core';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const PUSH_TOKEN_KEY = 'famagenda_push_token';

// Configure how notifications are presented when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  type: 'event' | 'shopping' | 'pet' | 'reminder' | 'family';
  id?: string;
  [key: string]: unknown;
}

// Helper to add timeout to promises
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), timeoutMs)),
  ]);
}

// Register for push notifications and get the token
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    // Push notifications only work on physical devices
    if (!Device.isDevice) {
      console.log('Push notifications require a physical device');
      return null;
    }

    // Check if we're on Android and set up the notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'FAMAGENDA',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1B7C7C',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('events', {
        name: 'Eventos',
        description: 'Notificações de eventos do calendário',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Lembretes',
        description: 'Lembretes de tarefas e compras',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });
    }

    // Check current permission status with timeout
    const permissionResult = await withTimeout(
      Notifications.getPermissionsAsync(),
      5000,
      { status: PermissionStatus.UNDETERMINED, expires: 'never' as const, granted: false, canAskAgain: true }
    );
    let finalStatus = permissionResult.status;

    // If not granted, request permission with timeout
    if (finalStatus !== PermissionStatus.GRANTED) {
      const requestResult = await withTimeout(
        Notifications.requestPermissionsAsync(),
        10000,
        { status: PermissionStatus.UNDETERMINED, expires: 'never' as const, granted: false, canAskAgain: true }
      );
      finalStatus = requestResult.status;
    }

    if (finalStatus !== PermissionStatus.GRANTED) {
      console.log('Push notification permission not granted');
      return null;
    }

    // Get the project ID from Constants
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
      console.log('No EAS project ID found');
      return null;
    }

    // Get the Expo push token with timeout
    const tokenData = await withTimeout(
      Notifications.getExpoPushTokenAsync({ projectId }),
      10000,
      null
    );

    if (!tokenData) {
      console.log('Failed to get push token (timeout)');
      return null;
    }

    const token = tokenData.data;

    // Save token to AsyncStorage
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);

    console.log('Push token:', token);
    return token;
  } catch (error) {
    console.error('Error in registerForPushNotificationsAsync:', error);
    return null;
  }
}

// Get saved push token
export async function getSavedPushToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(PUSH_TOKEN_KEY);
  } catch {
    return null;
  }
}

// Schedule a local notification
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: NotificationData,
  trigger?: Notifications.NotificationTriggerInput
): Promise<string> {
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data as Record<string, unknown>,
      sound: 'default',
    },
    trigger: trigger || null, // null = immediate
  });

  return identifier;
}

// Schedule event reminder (1 hour before)
export async function scheduleEventReminder(
  eventId: string,
  title: string,
  eventDate: Date
): Promise<string | null> {
  const reminderDate = new Date(eventDate.getTime() - 60 * 60 * 1000); // 1 hour before

  // Don't schedule if the reminder time has passed
  if (reminderDate <= new Date()) {
    return null;
  }

  return await scheduleLocalNotification(
    'Lembrete de Evento',
    `${title} começa em 1 hora`,
    { type: 'event', id: eventId },
    { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderDate }
  );
}

// Schedule daily reminder at specific time
export async function scheduleDailyReminder(
  hour: number,
  minute: number,
  title: string,
  body: string
): Promise<string> {
  return await scheduleLocalNotification(
    title,
    body,
    { type: 'reminder' },
    {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    }
  );
}

// Cancel a scheduled notification
export async function cancelNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

// Cancel all scheduled notifications
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Get all scheduled notifications
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

// Set badge count (iOS)
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

// Clear badge
export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}

// Add notification received listener
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(callback);
}

// Add notification response listener (when user taps notification)
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

// Get last notification response (for when app opens from notification)
export async function getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
  return await Notifications.getLastNotificationResponseAsync();
}

// Send push notification to a token (via your backend or Expo's push service)
// This is a placeholder - in production, you'd call your backend
export async function sendPushNotificationToToken(
  expoPushToken: string,
  title: string,
  body: string,
  data?: NotificationData
): Promise<boolean> {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data: data || {},
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    return result.data?.status === 'ok';
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}

// Helper to format notification for shopping reminder
export function createShoppingReminder(itemCount: number): { title: string; body: string } {
  return {
    title: 'Lista de Compras',
    body: `Você tem ${itemCount} ${itemCount === 1 ? 'item' : 'itens'} pendente${itemCount === 1 ? '' : 's'} na lista de compras`,
  };
}

// Helper to format notification for pet care
export function createPetCareReminder(petName: string, careType: 'vaccine' | 'bath' | 'vet'): { title: string; body: string } {
  const careMessages = {
    vaccine: `${petName} precisa de vacina em breve`,
    bath: `Hora do banho do ${petName}!`,
    vet: `${petName} tem consulta veterinária marcada`,
  };

  return {
    title: 'Cuidados com Pet',
    body: careMessages[careType],
  };
}

// Helper to format notification for family events
export function createFamilyEventNotification(
  eventTitle: string,
  eventType: 'birthday' | 'anniversary' | 'event'
): { title: string; body: string } {
  const typeMessages = {
    birthday: `Aniversário: ${eventTitle}`,
    anniversary: `Aniversário de casamento: ${eventTitle}`,
    event: eventTitle,
  };

  return {
    title: 'Evento Familiar',
    body: typeMessages[eventType],
  };
}
