import { Linking, Platform } from 'react-native';

type NavigationApp = 'auto' | 'waze' | 'google' | 'apple' | 'web';

export async function openNavigation(destination: string, app: NavigationApp = 'auto') {
  const encodedDestination = encodeURIComponent(destination);
  const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedDestination}`;

  if (Platform.OS === 'web' || app === 'web') {
    return Linking.openURL(webUrl);
  }

  const wazeUrl = `waze://?q=${encodedDestination}&navigate=yes`;
  const googleAndroidUrl = `google.navigation:q=${encodedDestination}`;
  const googleIosUrl = `comgooglemaps://?daddr=${encodedDestination}&directionsmode=driving`;
  const appleUrl = `https://maps.apple.com/?daddr=${encodedDestination}&dirflg=d`;

  const tryOpen = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  };

  if (app === 'waze') {
    if (await tryOpen(wazeUrl)) return;
  }

  if (app === 'google') {
    const googleUrl = Platform.OS === 'ios' ? googleIosUrl : googleAndroidUrl;
    if (await tryOpen(googleUrl)) return;
  }

  if (app === 'apple') {
    if (Platform.OS === 'ios' && (await tryOpen(appleUrl))) return;
  }

  if (app === 'auto') {
    if (await tryOpen(wazeUrl)) return;
    const googleUrl = Platform.OS === 'ios' ? googleIosUrl : googleAndroidUrl;
    if (await tryOpen(googleUrl)) return;
    if (Platform.OS === 'ios' && (await tryOpen(appleUrl))) return;
  }

  await Linking.openURL(webUrl);
}
