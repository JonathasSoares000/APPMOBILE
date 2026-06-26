import { PrimaryButton } from '@/components/primary-button';
import { SectionCard } from '@/components/section-card';
import { StatusPill } from '@/components/status-pill';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { getDriverOrders, subscribeDriverOrdersChange } from '@/services/atende-service';
import type { DriverOrder } from '@/types';
import { openNavigation } from '@/utils/navigation';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';

export default function MotoristaScreen() {
  const [online, setOnline] = useState(true);
  const [orders, setOrders] = useState<DriverOrder[]>(() => getDriverOrders());
  const [activeOrder, setActiveOrder] = useState<DriverOrder | null>(null);
  const [boardingCode, setBoardingCode] = useState('');
  const [finishCode, setFinishCode] = useState('');
  const [selectedApp, setSelectedApp] = useState<'auto' | 'waze' | 'google' | 'apple'>('auto');
  const [finalFare, setFinalFare] = useState(0);
  const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapModule, setMapModule] = useState<any>(null);
  const [region, setRegion] = useState<{ latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number } | null>(null);
  const mapRef = useRef<any>(null);
  const [pickupCoords, setPickupCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const handleAccept = async (orderId: string) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order) return;

    setActiveOrder(order);
    setFinalFare(order.currentFare);
    setOrders((prev) => prev.map((item) => (item.id === orderId ? { ...item, status: 'accepted' } : item)));
    await openNavigation(order.dropoff, selectedApp);

    // try to geocode pickup and dropoff to show markers on the map
    let pCoords = null;
    let dCoords = null;
    try {
      const p = await Location.geocodeAsync(order.pickup);
      if (p.length > 0) {
        pCoords = { latitude: p[0].latitude, longitude: p[0].longitude };
        setPickupCoords(pCoords);
      } else {
        setPickupCoords(null);
      }
    } catch (e) {
      setPickupCoords(null);
    }

    try {
      const d = await Location.geocodeAsync(order.dropoff);
      if (d.length > 0) {
        dCoords = { latitude: d[0].latitude, longitude: d[0].longitude };
        setDropoffCoords(dCoords);
      } else {
        setDropoffCoords(null);
      }
    } catch (e) {
      setDropoffCoords(null);
    }

    // set region to show route center and fit map to coordinates
    const coordsForFit: Array<{ latitude: number; longitude: number }> = [];
    if (pCoords) coordsForFit.push(pCoords);
    if (dCoords) coordsForFit.push(dCoords);
    if (driverLocation) coordsForFit.push(driverLocation);

    if (coordsForFit.length > 0) {
      const sum = coordsForFit.reduce((acc, c) => ({ latitude: acc.latitude + c.latitude, longitude: acc.longitude + c.longitude }), { latitude: 0, longitude: 0 });
      const centerLat = sum.latitude / coordsForFit.length;
      const centerLon = sum.longitude / coordsForFit.length;
      setRegion({ latitude: centerLat, longitude: centerLon, latitudeDelta: 0.05, longitudeDelta: 0.05 });

      // if map ref available, fit to coordinates
      setTimeout(() => {
        try {
          if (mapRef.current && mapRef.current.fitToCoordinates && coordsForFit.length > 0) {
            mapRef.current.fitToCoordinates(coordsForFit, { edgePadding: { top: 60, right: 60, bottom: 60, left: 60 }, animated: true });
          }
        } catch (e) {
          // ignore
        }
      }, 300);
    }
  };

  const handleStart = () => {
    if (!activeOrder) return;

    setActiveOrder({ ...activeOrder, status: 'in_progress' });
  };

  const handleCancel = () => {
    if (!activeOrder) return;

    Alert.alert(
      'Cancelar corrida',
      'Deseja cancelar esta corrida?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: () => {
            setOrders((prev) =>
              prev.map((item) =>
                item.id === activeOrder.id ? { ...item, status: 'waiting' } : item,
              ),
            );
            setActiveOrder(null);
            setFinishCode('');
            setBoardingCode('');
            setFinalFare(0);
          },
        },
      ],
    );
  };

  useEffect(() => {
    const unsubscribe = subscribeDriverOrdersChange(() => {
      setOrders(getDriverOrders());
    });
    setOrders(getDriverOrders());

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
          const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setDriverLocation(coords);
          setRegion({ ...coords, latitudeDelta: 0.03, longitudeDelta: 0.03 });
        }
      } catch (e) {
        // ignore
      }

      try {
        const m = await import('react-native-maps');
        setMapModule(m);
      } catch (e) {
        // library not installed — map will fall back to placeholder
        setMapModule(null);
      }
    })();

    return unsubscribe;
  }, []);

  const handleFinish = () => {
    if (!activeOrder) return;
    if (finishCode !== activeOrder.finishCode) {
      Alert.alert('Código incorreto', 'Informe o código de finalização da corrida corretamente.');
      return;
    }

    Alert.alert('Corrida finalizada', `Valor final: R$ ${finalFare.toFixed(2)}`);
    setActiveOrder(null);
    setFinishCode('');
    setBoardingCode('');
    setFinalFare(0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionCard style={styles.statusSection}>
          <View style={styles.rowBetween}>
            <ThemedText type="subtitle">Painel do Motorista</ThemedText>
            <Switch value={online} onValueChange={setOnline} />
          </View>
          <ThemedText type="default" style={styles.description}>
            {online ? 'Você está online para receber corridas urgentes e agendadas.' : 'Ative o status para começar a receber chamadas.'}
          </ThemedText>
        </SectionCard>
        {/* Map area (like Uber) */}
        {mapModule && driverLocation ? (
          (() => {
            const MapView = mapModule.MapView || mapModule.default;
            const Marker = mapModule.Marker || mapModule.default?.Marker;
            const Polyline = mapModule.Polyline || mapModule.default?.Polyline;
            return (
              <SectionCard style={{ padding: 0 }}>
                <MapView
                  ref={mapRef}
                  style={{ width: '100%', height: 300, borderRadius: 18 }}
                  initialRegion={region ?? undefined}
                  showsUserLocation={true}
                >
                  {driverLocation && Marker ? (
                    <Marker coordinate={driverLocation} title="Você" />
                  ) : null}
                  {pickupCoords && Marker ? (
                    <Marker coordinate={pickupCoords} title="Origem" pinColor="green" />
                  ) : null}
                  {dropoffCoords && Marker ? (
                    <Marker coordinate={dropoffCoords} title="Destino" pinColor="red" />
                  ) : null}
                  {pickupCoords && dropoffCoords && Polyline ? (
                    <Polyline coordinates={[pickupCoords, dropoffCoords]} strokeWidth={4} strokeColor="#2563EB" />
                  ) : null}
                </MapView>
              </SectionCard>
            );
          })()
        ) : (
          <SectionCard style={styles.mapPlaceholder}>
            <ThemedText type="smallBold">Mapa</ThemedText>
            <ThemedText type="small">Instale `react-native-maps` para mapa interativo ou use navegação externa.</ThemedText>
          </SectionCard>
        )}

        {activeOrder ? (
          <SectionCard style={styles.activeCard}>
            <View style={styles.rowBetween}>
              <ThemedText type="smallBold">Em viagem</ThemedText>
              <StatusPill label={activeOrder.type === 'urgent' ? 'Urgente' : 'Agendada'} status={activeOrder.type} />
            </View>

            <ThemedText type="title" style={styles.orderTitle}>
              {activeOrder.pickup} → {activeOrder.dropoff}
            </ThemedText>

            <ThemedText type="small" style={styles.smallText}>
              Passageiro: {activeOrder.passenger}
            </ThemedText>
            <ThemedText type="small" style={styles.smallText}>
              Distância: {activeOrder.distanceKm.toFixed(1)} km • Tempo estimado: {activeOrder.durationMin} min
            </ThemedText>
            <ThemedText type="small" style={styles.smallText}>
              Rota: {activeOrder.routeNote}
            </ThemedText>

            <View style={styles.taximeterBox}>
              <View style={styles.rowBetween}>
                <ThemedText type="smallBold">Valor final</ThemedText>
                <ThemedText type="default">R$ {finalFare.toFixed(2)}</ThemedText>
              </View>
            </View>

            <View style={styles.formRow}>
              <TextInput
                placeholder="Código de embarque"
                value={boardingCode}
                onChangeText={setBoardingCode}
                style={styles.input}
              />
              <TextInput
                placeholder="Código de finalização"
                value={finishCode}
                onChangeText={setFinishCode}
                style={styles.input}
              />
            </View>

            <View style={styles.summaryRow}>
              {activeOrder.status !== 'in_progress' ? (
                <PrimaryButton title="Iniciar corrida" onPress={handleStart} secondary />
              ) : null}
              <PrimaryButton title="Finalizar corrida" onPress={handleFinish} secondary />
              <PrimaryButton title="Cancelar corrida" onPress={handleCancel} secondary />
            </View>
          </SectionCard>
        ) : null}

        <ThemedText type="smallBold" style={styles.sectionTitle}>
          Chamadas disponíveis
        </ThemedText>

        <View style={styles.list}>
          {orders.length === 0 ? (
            <SectionCard style={styles.orderCard}>
              <ThemedText type="default">Nenhuma corrida disponível no momento.</ThemedText>
            </SectionCard>
          ) : (
            orders.map((order) => (
              <SectionCard key={order.id} style={styles.orderCard}>
                <View style={styles.header}>
                  <ThemedText type="smallBold">{order.passenger}</ThemedText>
                  <StatusPill label={order.type === 'urgent' ? 'Urgente' : 'Agendada'} status={order.type} />
                </View>
                <ThemedText type="small" style={styles.route}>
                  {order.pickup} → {order.dropoff}
                </ThemedText>
                <ThemedText type="small" style={styles.metaText}>
                  {order.distanceKm.toFixed(1)} km • {order.durationMin} min • Código de embarque: {order.boardingCode}
                </ThemedText>
                <View style={styles.orderOptions}>
                  <View style={styles.appSelector}>
                    {['auto', 'waze', 'google', 'apple'].map((app) => (
                      <Pressable
                        key={app}
                        onPress={() => setSelectedApp(app as 'auto' | 'waze' | 'google' | 'apple')}
                        style={[styles.appButton, selectedApp === app && styles.appButtonSelected]}
                      >
                        <ThemedText type="small" style={selectedApp === app ? styles.appButtonTextSelected : undefined}>
                          {app === 'auto' ? 'Auto' : app.charAt(0).toUpperCase() + app.slice(1)}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                  <PrimaryButton title="Aceitar" onPress={() => handleAccept(order.id)} />
                </View>
              </SectionCard>
            ))
          )}
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
  statusSection: {
    gap: Spacing.two,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  description: {
    color: '#64748B',
  },
  activeCard: {
    gap: Spacing.three,
  },
  orderTitle: {
    marginTop: Spacing.one,
  },
  smallText: {
    color: '#475569',
  },
  taximeterBox: {
    padding: Spacing.three,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
  },
  appSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  appButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
  },
  appButtonSelected: {
    backgroundColor: '#0F172A',
  },
  appButtonTextSelected: {
    color: '#fff',
  },
  orderOptions: {
    gap: Spacing.two,
  },
  formRow: {
    gap: Spacing.two,
  },
  input: {
    borderRadius: 14,
    padding: Spacing.three,
    backgroundColor: '#ffffff',
    color: '#0F172A',
  },
  summaryRow: {
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  sectionTitle: {
    marginTop: Spacing.two,
  },
  list: {
    gap: Spacing.three,
  },
  orderCard: {
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
  metaText: {
    color: '#475569',
  },
  orderOptions: {
    gap: Spacing.two,
  },
});
