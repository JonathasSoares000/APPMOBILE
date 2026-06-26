import { InputField } from '@/components/input-field';
import { PrimaryButton } from '@/components/primary-button';
import { RideCard } from '@/components/ride-card';
import { SectionCard } from '@/components/section-card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { getRideRequests } from '@/services/atende-service';
import { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

export default function ColaboradorScreen() {
  const [companyCode, setCompanyCode] = useState('');
  const requests = useMemo(() => getRideRequests(), []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="subtitle">Solicitar Corrida</ThemedText>
        <ThemedText type="default" style={styles.description}>
          Informe o código da empresa para gerar a solicitação de transporte.
        </ThemedText>

        <SectionCard style={styles.section}>
          <InputField
            label="Código da Empresa"
            placeholder="ATC-1592"
            value={companyCode}
            onChangeText={setCompanyCode}
          />
          <PrimaryButton title="Solicitar corrida" onPress={() => {}} />
        </SectionCard>

        <ThemedText type="smallBold" style={styles.historyTitle}>
          Solicitações recentes
        </ThemedText>
        <View style={styles.list}>
          {requests.map((ride) => (
            <RideCard key={ride.id} ride={ride} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  description: {
    color: '#64748B',
  },
  section: {
    gap: Spacing.three,
  },
  historyTitle: {
    marginTop: Spacing.two,
  },
  list: {
    gap: Spacing.three,
  },
});
