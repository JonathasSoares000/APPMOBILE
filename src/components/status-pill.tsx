import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { StyleSheet, View } from 'react-native';

type Props = {
  label: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'waiting' | 'danger' | 'urgent' | 'scheduled';
};

const statusColorMap = {
  pending: '#F59E0B',
  waiting: '#F59E0B',
  accepted: '#0F9D58',
  in_progress: '#2563EB',
  completed: '#0F9D58',
  danger: '#D92D20',
  urgent: '#DC2626',
  scheduled: '#2563EB',
};

export function StatusPill({ label, status }: Props) {
  const theme = useTheme();
  return (
    <View style={[styles.pill, { backgroundColor: `${statusColorMap[status]}22` }]}> 
      <ThemedText type="smallBold" style={[styles.label, { color: theme.text }]}> 
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
