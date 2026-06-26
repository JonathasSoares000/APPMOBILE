import { CompanyCode, DriverOrder, RideRequest, TripRecord } from '@/types';

export const companyCodeMock: CompanyCode = {
  code: 'ATC-1592',
  blocked: false,
  generatedAt: new Date().toISOString(),
  ridesToday: 21,
  activeEmployees: 82,
};

export const rideRequestsMock: RideRequest[] = [
  {
    id: 'REQ-001',
    passenger: 'Marina Alves',
    pickup: 'Recepção - Torre A',
    dropoff: 'Sala de reuniões 2',
    status: 'waiting',
    requestedAt: '08:12',
  },
  {
    id: 'REQ-002',
    passenger: 'Paulo Castro',
    pickup: 'Auditoria',
    dropoff: 'Estacionamento B',
    status: 'waiting',
    requestedAt: '08:35',
  },
];

export const driverOrdersMock: DriverOrder[] = [
  {
    id: 'DRV-101',
    passenger: 'Clara Souza',
    pickup: 'Portaria 3',
    dropoff: 'Terminal 1',
    type: 'urgent',
    status: 'waiting',
    requestedAt: '08:10',
    boardingCode: 'BORD-359',
    finishCode: 'FIN-701',
    distanceKm: 9.2,
    durationMin: 18,
    baseFare: 12.5,
    currentFare: 25.8,
    routeNote: 'Tráfego leve, rota mais curta disponível',
  },
  {
    id: 'DRV-102',
    passenger: 'Rafael Lima',
    pickup: 'Torre B',
    dropoff: 'Laboratório',
    type: 'scheduled',
    status: 'waiting',
    requestedAt: '09:00',
    boardingCode: 'BORD-420',
    finishCode: 'FIN-894',
    distanceKm: 6.4,
    durationMin: 14,
    baseFare: 10.0,
    currentFare: 18.2,
    routeNote: 'Rota agendada; poderá haver alteração por engarrafamento',
  },
];

export const tripHistoryMock: TripRecord[] = [
  {
    id: 'HIST-001',
    employeeName: 'Jessica Moraes',
    companyCode: 'ATC-1592',
    pickup: 'Recepção',
    dropoff: 'Sala de Reuniões B',
    type: 'urgent',
    price: 34.2,
    status: 'completed',
    requestedAt: '2026-06-15 08:15',
    completedAt: '2026-06-15 08:42',
  },
  {
    id: 'HIST-002',
    employeeName: 'Rodrigo Santos',
    companyCode: 'ATC-1592',
    pickup: 'Auditório',
    dropoff: 'Terminal 2',
    type: 'scheduled',
    price: 42.7,
    status: 'completed',
    requestedAt: '2026-06-14 10:00',
    completedAt: '2026-06-14 10:33',
  },
];

export function generateCompanyCode() {
  return `ATC-${Math.floor(1000 + Math.random() * 9000)}`;
}
