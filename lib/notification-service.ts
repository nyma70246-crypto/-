import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('[Notifications] Permission request error:', error);
    return false;
  }
}

/**
 * Schedule a local notification
 */
export async function scheduleNotification(
  payload: NotificationPayload,
  delaySeconds: number = 0
): Promise<string | null> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: payload.title,
        body: payload.body,
        badge: payload.badge,
        data: payload.data || {},
        sound: 'default',
      },
      trigger: { seconds: delaySeconds > 0 ? delaySeconds : 1 } as any,
    });

    return notificationId;
  } catch (error) {
    console.error('[Notifications] Schedule error:', error);
    return null;
  }
}

/**
 * Send message notification
 */
export async function sendMessageNotification(
  senderName: string,
  messagePreview: string
): Promise<string | null> {
  return scheduleNotification({
    title: `رسالة جديدة من ${senderName}`,
    body: messagePreview,
    data: {
      type: 'message',
      senderName,
    },
  });
}

/**
 * Send offer notification
 */
export async function sendOfferNotification(
  workerName: string,
  offerDescription: string
): Promise<string | null> {
  return scheduleNotification({
    title: `عرض جديد من ${workerName}`,
    body: offerDescription,
    data: {
      type: 'offer',
      workerName,
    },
  });
}

/**
 * Send rating notification
 */
export async function sendRatingNotification(
  customerName: string,
  rating: number
): Promise<string | null> {
  return scheduleNotification({
    title: `تقييم جديد من ${customerName}`,
    body: `حصلت على تقييم ${rating} نجوم`,
    data: {
      type: 'rating',
      customerName,
      rating,
    },
  });
}

/**
 * Send booking confirmation notification
 */
export async function sendBookingNotification(
  workerName: string,
  bookingTime: string
): Promise<string | null> {
  return scheduleNotification({
    title: 'تأكيد الحجز',
    body: `تم حجز الخدمة مع ${workerName} في ${bookingTime}`,
    data: {
      type: 'booking',
      workerName,
      bookingTime,
    },
  });
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('[Notifications] Cancel error:', error);
  }
}

/**
 * Cancel all notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('[Notifications] Cancel all error:', error);
  }
}

/**
 * Get notification listener
 */
export function addNotificationListener(
  callback: (notification: any) => void
) {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    ({ notification }) => {
      callback(notification);
    }
  );

  return subscription;
}

/**
 * Setup notification listeners
 */
export function setupNotificationListeners() {
  // Listen for notifications when app is in foreground
  const foregroundSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('[Notifications] Received notification:', notification);
    }
  );

  // Listen for notification responses (when user taps notification)
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const { notification } = response;
      console.log('[Notifications] Notification response:', notification.request.content.data);
      
      // Handle notification tap based on type
      const data = notification.request.content.data;
      if (data.type === 'message') {
        // Navigate to chat screen
        console.log('[Notifications] Opening chat with:', data.senderName);
      } else if (data.type === 'offer') {
        // Navigate to offers screen
        console.log('[Notifications] Opening offer from:', data.workerName);
      }
    }
  );

  return () => {
    foregroundSubscription.remove();
    responseSubscription.remove();
  };
}
