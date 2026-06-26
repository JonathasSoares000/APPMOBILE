import {
    addDriverOrder,
    companyCodeMock,
    driverOrdersMock,
    generateCompanyCode,
    rideRequestsMock,
    subscribeDriverOrders,
    tripHistoryMock,
} from '@/services/mock-data';
import { CompanyCode, DriverOrder, RequestType, RideRequest, TripRecord } from '@/types';

export function getCompanyCode(): CompanyCode {
  return companyCodeMock;
}

export function getRideRequests(): RideRequest[] {
  return rideRequestsMock;
}

export function getDriverOrders(): DriverOrder[] {
  return [...driverOrdersMock];
}

export function subscribeDriverOrdersChange(listener: () => void) {
  return subscribeDriverOrders(listener);
}

export function addDriverOrderToQueue(order: DriverOrder) {
  addDriverOrder(order);
}

export function getTripHistory(): TripRecord[] {
  return tripHistoryMock;
}

export function createCompanyCode(): CompanyCode {
  return {
    ...companyCodeMock,
    code: generateCompanyCode(),
    blocked: false,
    generatedAt: new Date().toISOString(),
  };
}

export function createTripRecord(
  employeeName: string,
  companyCode: string,
  pickup: string,
  dropoff: string,
  type: RequestType,
  price?: number,
): TripRecord {
  const cost = price ?? parseFloat((Math.random() * 15 + 25).toFixed(2));
  const now = new Date();
  return {
    id: `HIST-${Math.floor(100 + Math.random() * 900)}`,
    employeeName,
    companyCode,
    pickup,
    dropoff,
    type,
    price: cost,
    status: 'completed',
    requestedAt: `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
    completedAt: `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
  };
}
