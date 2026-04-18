import { useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications() {
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status: existing } = await Notifications.getPermissionsAsync();
      let finalStatus = existing;
      if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch (e) {
      console.warn('Notification permission error:', e);
      return false;
    }
  }, []);

  const scheduleDaily = useCallback(async (hour: number, minute: number) => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🥊 BoxFit',
          body: 'Zeit fürs Training! Dein Workout wartet auf dich.',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
    } catch (e) {
      console.warn('Schedule notification error:', e);
      // Fallback: try with calendar trigger instead
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🥊 BoxFit',
            body: 'Zeit fürs Training! Dein Workout wartet auf dich.',
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            hour,
            minute,
            repeats: true,
          },
        });
      } catch (e2) {
        console.warn('Fallback notification also failed:', e2);
        Alert.alert(
          'Benachrichtigungen nicht verfügbar',
          'Tägliche Erinnerungen funktionieren erst mit einem Development Build (nicht in Expo Go).'
        );
      }
    }
  }, []);

  const cancelAll = useCallback(async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (e) {
      console.warn('Cancel notifications error:', e);
    }
  }, []);

  return { requestPermission, scheduleDaily, cancelAll };
}
