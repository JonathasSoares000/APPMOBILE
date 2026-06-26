import { InputField } from '@/components/input-field';
import { PrimaryButton } from '@/components/primary-button';
import { SectionCard } from '@/components/section-card';
import { StatusPill } from '@/components/status-pill';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { addDriverOrderToQueue, createCompanyCode, createTripRecord, getCompanyCode, getTripHistory } from '@/services/atende-service';
import type { RequestType, TripRecord } from '@/types';
import { copyToClipboard } from '@/utils/clipboard';
import { requestNotificationPermissions, sendDriverNotification } from '@/utils/notifications';
import * as Location from 'expo-location';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
const ADDRESS_SUGGESTIONS = [
  'Rua Renato José de Sena, 12 - Boa Viagem, Recife - PE',
  'Rua Antônio Marinho Vanderlei, Pte. dos Carvalhos, Cabo de Santo Agostinho - PE',
  'Condomínio Recanto Do Sol, Rua Jarangari, 53 - Jaboatão dos Guararapes - PE',
  'Rua Amambaí, 246 - Candeias, Jaboatão dos Guararapes - PE',
  'Rua João Cardoso Aires, 647 - Boa Viagem, Recife - PE',
  'Av. Conselheiro Aguiar, 1900 - Boa Viagem, Recife - PE',
  'Praça do Comercio, 45 - Centro, Recife - PE',
];
export default function GestorScreen() {
  const [companyCode, setCompanyCode] = useState(getCompanyCode());
  const [blocked, setBlocked] = useState(companyCode.blocked);
  const [employeeName, setEmployeeName] = useState('');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [dropoffSelected, setDropoffSelected] = useState(false);
  const [dropoffGeoSuggestions, setDropoffGeoSuggestions] = useState<string[]>([]);
  const [requestType, setRequestType] = useState<RequestType>('urgent');
  const [history, setHistory] = useState<TripRecord[]>(() => getTripHistory());
  const [pickupCoords, setPickupCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');
  const [locationMessage, setLocationMessage] = useState('');

  const KM_RATE = 3.11;

  const formatAddress = (address: Location.LocationGeocodedAddress) => {
    const parts = [address.name, address.street, address.district, address.city, address.region].filter(Boolean);
    return parts.join(', ');
  };

  const resolveCurrentLocation = async () => {
    setLocationStatus('loading');
    setLocationMessage('Obtendo sua localização...');

    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') {
      setLocationStatus('denied');
      setLocationMessage('Permissão de localização negada. Informe a origem manualmente.');
      return;
    }

    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
    setPickupCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });

    const reverse = await Location.reverseGeocodeAsync(position.coords);
    if (reverse.length > 0) {
      setPickup(formatAddress(reverse[0]));
      setLocationStatus('granted');
      setLocationMessage('Origem atual identificada com base no GPS.');
    } else {
      setLocationMessage('Origem obtida, mas não foi possível traduzir para um endereço.');
    }
  };

  const resolveDropoffLocation = async (addressText: string) => {
    if (!addressText.trim()) {
      setDropoffCoords(null);
      return;
    }
    try {
      const results = await Location.geocodeAsync(addressText);
      if (results.length > 0) {
        setDropoffCoords({ latitude: results[0].latitude, longitude: results[0].longitude });
      } else {
        setDropoffCoords(null);
      }
    } catch {
      setDropoffCoords(null);
    }
  };

  const filteredDropoffSuggestions = useMemo(() => {
    if (!dropoff.trim()) return [];
    const staticMatches = ADDRESS_SUGGESTIONS.filter((item) => item.toLowerCase().includes(dropoff.toLowerCase()));
    const combined = [...dropoffGeoSuggestions, ...staticMatches];
    // remove duplicates while preserving order
    return Array.from(new Set(combined));
  }, [dropoff, dropoffGeoSuggestions]);

  useEffect(() => {
    if (!dropoff.trim() || dropoff.trim().length < 3) {
      setDropoffGeoSuggestions([]);
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      try {
        const results = await Location.geocodeAsync(dropoff);
        if (!active) return;
        const formatted = results
          .map((r) => formatAddress(r as Location.LocationGeocodedAddress))
          .filter(Boolean);
        setDropoffGeoSuggestions(formatted);
      } catch (e) {
        setDropoffGeoSuggestions([]);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer as unknown as number);
    };
  }, [dropoff]);

  useEffect(() => {
    resolveCurrentLocation();
  }, []);

  useEffect(() => {
    resolveDropoffLocation(dropoff);
  }, [dropoff]);

  const degreesToRadians = (degrees: number) => degrees * (Math.PI / 180);

  const distanceBetweenCoordinates = (origin: { latitude: number; longitude: number }, destination: { latitude: number; longitude: number }) => {
    const earthRadiusKm = 6371;
    const dLat = degreesToRadians(destination.latitude - origin.latitude);
    const dLon = degreesToRadians(destination.longitude - origin.longitude);
    const lat1 = degreesToRadians(origin.latitude);
    const lat2 = degreesToRadians(destination.latitude);

    const a = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  };

  const estimatedDistanceKm = useMemo(() => {
    if (pickupCoords && dropoffCoords) {
      return Math.max(1, Math.round(distanceBetweenCoordinates(pickupCoords, dropoffCoords) * 10) / 10);
    }

    const originLength = pickup.trim().length;
    const destinationLength = dropoff.trim().length;
    const baseDistance = Math.max(2, Math.ceil((originLength + destinationLength) * 0.22));
    return baseDistance;
  }, [pickup, dropoff, pickupCoords, dropoffCoords]);

  const estimatedRoutePrice = useMemo(() => {
    return parseFloat((estimatedDistanceKm * KM_RATE).toFixed(2));
  }, [estimatedDistanceKm]);

  const canShowEstimate =
    pickup.trim().length > 0 &&
    dropoff.trim().length > 0 &&
    dropoffSelected &&
    pickupCoords !== null &&
    dropoffCoords !== null;

  const totalMonthly = history.reduce((sum, item) => sum + item.price, 0);
  const latestRoute = history[0];

  const handleCopy = async () => {
    await copyToClipboard(companyCode.code);
  };

  const handleGenerate = () => {
    const nextCode = createCompanyCode();
    setCompanyCode(nextCode);
    setBlocked(false);
  };

  const handleToggleBlock = () => {
    setBlocked((prev) => !prev);
    Alert.alert('Status atualizado', `Código ${blocked ? 'desbloqueado' : 'bloqueado'} com sucesso.`);
  };

  const handleRequestRide = async () => {
    if (!employeeName.trim()) {
      Alert.alert('Preencha o nome', 'Informe o nome do colaborador solicitante.');
      return;
    }

    const record = createTripRecord(
      employeeName,
      companyCode.code,
      pickup,
      dropoff,
      requestType,
      estimatedRoutePrice,
    );

    const newDriverOrder = {
      id: `DRV-${Math.floor(100 + Math.random() * 900)}`,
      passenger: employeeName,
      pickup: pickup || 'Origem não informada',
      dropoff: dropoff || 'Destino não informado',
      type: requestType,
      status: 'waiting' as const,
      requestedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      boardingCode: `BORD-${Math.floor(100 + Math.random() * 900)}`,
      finishCode: `FIN-${Math.floor(100 + Math.random() * 900)}`,
      distanceKm: estimatedDistanceKm,
      durationMin: Math.max(1, Math.round(estimatedDistanceKm * 2)),
      baseFare: parseFloat((estimatedRoutePrice * 0.35).toFixed(2)),
      currentFare: estimatedRoutePrice,
      routeNote: requestType === 'urgent' ? 'Corrida urgente, prioridade máxima' : 'Corrida agendada; confirme o horário.',
    };

    addDriverOrderToQueue(newDriverOrder);

    const hasPermission = await requestNotificationPermissions();
    if (hasPermission) {
      await sendDriverNotification(`Solicitação de corrida de ${employeeName}: ${pickup} → ${dropoff}`);
    }

    setHistory((prev) => [record, ...prev]);
    setEmployeeName('');
    setPickup('Recepção');
    setDropoff('Sala de reuniões');
    setDropoffSelected(false);
    Alert.alert('Solicitação enviada', 'A corrida foi cadastrada no histórico e o motorista foi notificado.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="subtitle">Painel do Gestor</ThemedText>
        <ThemedText type="default" style={styles.description}>
          Solicite corridas para funcionários, acompanhe o histórico e verifique o valor mensal total.
        </ThemedText>

        <SectionCard style={styles.section}>
          <View style={styles.rowBetween}>
            <ThemedText type="smallBold">Código da Empresa</ThemedText>
            <StatusPill label={blocked ? 'Bloqueado' : 'Ativo'} status={blocked ? 'danger' : 'accepted'} />
          </View>
          <ThemedText type="title" style={styles.code}>
            {companyCode.code}
          </ThemedText>
          <ThemedText type="small" style={styles.meta}>
            Gerado em {new Date(companyCode.generatedAt).toLocaleString('pt-BR')}
          </ThemedText>
          <View style={styles.buttonRow}>
            <PrimaryButton title="Copiar" onPress={handleCopy} />
            <PrimaryButton title="Gerar novo" onPress={handleGenerate} secondary />
          </View>
          <PrimaryButton title={blocked ? 'Desbloquear código' : 'Bloquear código'} onPress={handleToggleBlock} secondary />
        </SectionCard>

        <SectionCard style={styles.section}>
          <ThemedText type="smallBold">Solicitar corrida</ThemedText>
          <InputField label="Nome do funcionário" placeholder="João Silva" value={employeeName} onChangeText={setEmployeeName} />
          <InputField label="Código da empresa" placeholder="ATC-1592" value={companyCode.code} editable={false} />
          <InputField label="Origem" placeholder="Usar localização atual" value={pickup} onChangeText={setPickup} />
          <PrimaryButton title="Atualizar origem para minha localização" onPress={resolveCurrentLocation} secondary />
          <ThemedText type="small" style={styles.locationHint}>{locationMessage || 'Origem definida automaticamente com base no GPS.'}</ThemedText>
          <InputField
            label="Destino"
            placeholder="Endereço de entrega"
            value={dropoff}
            onChangeText={(value) => {
              setDropoff(value);
              setDropoffSelected(false);
            }}
          />
          {filteredDropoffSuggestions.length > 0 && (
            <View style={styles.suggestionsList}>
              {filteredDropoffSuggestions.map((address) => (
                <Pressable
                  key={address}
                  onPress={async () => {
                    setDropoff(address);
                    setDropoffSelected(true);
                    // attempt to resolve coords for selected suggestion
                    try {
                      const results = await Location.geocodeAsync(address);
                      if (results.length > 0) {
                        setDropoffCoords({ latitude: results[0].latitude, longitude: results[0].longitude });
                      }
                    } catch {
                      // ignore
                    }
                  }}
                  style={styles.suggestionItem}
                >
                  <ThemedText type="default">{address}</ThemedText>
                </Pressable>
              ))}
            </View>
          )}
          {canShowEstimate ? (
            <View style={styles.estimateBox}>
              <ThemedText type="smallBold">Valor estimado conforme contrato</ThemedText>
              <ThemedText type="default">R$ {estimatedRoutePrice.toFixed(2)} ({estimatedDistanceKm} km × R$ {KM_RATE.toFixed(2)})</ThemedText>
            </View>
          ) : (
            <View style={styles.estimateBox}>
              <ThemedText type="default">Informe origem e destino para ver o preço estimado.</ThemedText>
            </View>
          )}
          <View style={styles.typeButtons}>
            <PrimaryButton
              title="Urgente"
              onPress={() => setRequestType('urgent')}
              secondary={requestType !== 'urgent'}
              style={requestType === 'urgent' ? styles.selectedType : undefined}
            />
            <PrimaryButton
              title="Agendada"
              onPress={() => setRequestType('scheduled')}
              secondary={requestType !== 'scheduled'}
              style={requestType === 'scheduled' ? styles.selectedType : undefined}
            />
          </View>
          <PrimaryButton title="Enviar solicitação" onPress={handleRequestRide} />
        </SectionCard>

        {latestRoute ? (
          <SectionCard style={styles.mapCard}>
            <View style={styles.rowBetween}>
              <ThemedText type="smallBold">Rota mais recente</ThemedText>
              <StatusPill label={latestRoute.type === 'urgent' ? 'Urgente' : 'Agendada'} status={latestRoute.type} />
            </View>
            <ThemedView type="backgroundElement" style={styles.mapPreview}>
              <ThemedText type="smallBold">Mapa da rota</ThemedText>
              <ThemedText type="small">{latestRoute.pickup} → {latestRoute.dropoff}</ThemedText>
              <ThemedText type="small">Motorista concluiu o trajeto em R$ {latestRoute.price.toFixed(2)}</ThemedText>
            </ThemedView>
          </SectionCard>
        ) : null}

        <SectionCard style={styles.statsCard}>
          <ThemedText type="smallBold">Total mensal</ThemedText>
          <ThemedText type="title">R$ {totalMonthly.toFixed(2)}</ThemedText>
          <ThemedText type="small" style={styles.meta}>
            Valor total de todas as corridas solicitadas neste mês.
          </ThemedText>
        </SectionCard>

        <ThemedText type="smallBold" style={styles.historyTitle}>
          Histórico de viagens
        </ThemedText>
        <View style={styles.list}>
          {history.map((item) => (
            <SectionCard key={item.id} style={styles.historyCard}>
              <View style={styles.rowBetween}>
                <ThemedText type="smallBold">{item.employeeName}</ThemedText>
                <StatusPill label={item.type === 'urgent' ? 'Urgente' : 'Agendada'} status={item.type} />
              </View>
              <ThemedText type="small" style={styles.route}>
                {item.pickup} → {item.dropoff}
              </ThemedText>
              <View style={styles.rowBetween}>
                <ThemedText type="small">R$ {item.price.toFixed(2)}</ThemedText>
                <ThemedText type="small">{item.completedAt}</ThemedText>
              </View>
            </SectionCard>
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
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  code: {
    letterSpacing: 2,
  },
  meta: {
    color: '#64748B',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  statsCard: {
    gap: Spacing.two,
  },
  historyTitle: {
    marginTop: Spacing.two,
  },
  list: {
    gap: Spacing.three,
  },
  historyCard: {
    gap: Spacing.two,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'space-between',
  },
  selectedType: {
    borderColor: '#0F172A',
    borderWidth: 1,
  },
  locationHint: {
    color: '#475569',
    marginTop: Spacing.one,
    marginBottom: Spacing.two,
  },
  estimateBox: {
    marginTop: Spacing.two,
    padding: Spacing.three,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    gap: Spacing.one,
  },
  suggestionsList: {
    marginTop: Spacing.two,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  route: {
    color: '#475569',
  },
  mapCard: {
    gap: Spacing.two,
  },
  mapPreview: {
    borderRadius: 18,
    padding: Spacing.four,
    gap: Spacing.two,
    backgroundColor: '#E2E8F0',
  },
});
