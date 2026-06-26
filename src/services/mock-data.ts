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

export let driverOrdersMock: DriverOrder[] = [];
const driverOrdersListeners = new Set<() => void>();

export function subscribeDriverOrders(listener: () => void) {
  driverOrdersListeners.add(listener);
  return () => driverOrdersListeners.delete(listener);
}

function notifyDriverOrdersListeners() {
  for (const listener of driverOrdersListeners) {
    listener();
  }
}

export function addDriverOrder(order: DriverOrder) {
  driverOrdersMock.push(order);
  notifyDriverOrdersListeners();
}

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
