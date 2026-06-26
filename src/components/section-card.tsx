import { ThemedView } from '@/components/themed-view';
import { StyleSheet, ViewProps } from 'react-native';

export function SectionCard({ style, ...props }: ViewProps) {
  return <ThemedView type="backgroundElement" style={[styles.card, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
});
