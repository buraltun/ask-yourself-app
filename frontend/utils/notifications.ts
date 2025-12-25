import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    // For Android, set notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-reminder', {
        name: 'Günlük Hatırlatma',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#007AFF',
        sound: 'default',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

export const scheduleDailyNotification = async (hour: number, minute: number): Promise<string | null> => {
  try {
    // Cancel all existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule daily notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌟 Bugünün sorusu hazır!',
        body: 'Günlük düşüncelerini kaydetme zamanı.',
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { screen: 'home' },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
        channelId: Platform.OS === 'android' ? 'daily-reminder' : undefined,
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
};

export const getScheduledNotifications = async () => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

export const testNotification = async (): Promise<void> => {
  try {
    // Web'de bildirimler tam desteklenmediği için platform kontrolü yapıyoruz
    if (Platform.OS === 'web') {
      // Web'de sadece console'a yazdırıyoruz
      console.log('Test notification would be sent on native device');
      return;
    }
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Test Bildirimi',
        body: 'Bildirimler çalışıyor!',
        sound: 'default',
      },
      trigger: {
        seconds: 2,
      },
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    throw error;
  }
};
