import { StatusPill } from '@/components/status-pill';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { RideRequest } from '@/types';
import { StyleSheet, View } from 'react-native';

type Props = {
  ride: RideRequest;
};

export function RideCard({ ride }: Props) {
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="smallBold">{ride.passenger}</ThemedText>
        <StatusPill label={ride.status.replace('_', ' ')} status={ride.status} />
      </View>
      <ThemedText type="small" style={styles.route}>
        {ride.pickup} → {ride.dropoff}
      </ThemedText>
      <View style={styles.metaRow}>
        <ThemedText type="small" style={styles.metaLabel}>
          Solicitação às {ride.requestedAt}
        </ThemedText>
        <ThemedText type="small" style={styles.metaLabel}>
          #{ride.id}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 18,
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  route: {
    color: '#475569',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  metaLabel: {
    color: '#64748B',
  },
});
