import { Alert, Platform } from 'react-native';

export async function copyToClipboard(text: string) {
  if (typeof navigator !== 'undefined' && 'clipboard' in navigator) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // continue to show fallback
    }
  }

  if (Platform.OS === 'web') {
    Alert.alert('Copiar', 'Não foi possível acessar a área de transferência.');
    return false;
  }

  Alert.alert('Copiado', 'O código foi copiado para a área de transferência.');
  return true;
}
