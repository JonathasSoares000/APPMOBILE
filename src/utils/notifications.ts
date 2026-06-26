import Constants from 'expo-constants';
import { Platform } from 'react-native';

const isAndroidExpoGo = Constants.appOwnership === 'expo' && Platform.OS === 'android';

export async function initializeNotifications() {
  if (isAndroidExpoGo) {
    console.warn('expo-notifications não é suportado no Expo Go Android. Notificações desabilitadas.');
    return;
  }

  const Notifications = await import('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function requestNotificationPermissions() {
  if (isAndroidExpoGo) {
    return false;
  }

  const Notifications = await import('expo-notifications');
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') {
    return true;
  }

  const { status: newStatus } = await Notifications.requestPermissionsAsync();
  return newStatus === 'granted';
}

export async function sendDriverNotification(message: string, title = 'Nova corrida disponível') {
  if (isAndroidExpoGo) {
    return;
  }

  const Notifications = await import('expo-notifications');
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body: message,
      sound: 'default',
    },
    trigger: null,
  });
}
