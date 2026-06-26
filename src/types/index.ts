export type Role = 'colaborador' | 'motorista' | 'gestor';

export type RideStatus = 'waiting' | 'accepted' | 'in_progress' | 'completed';
export type RequestType = 'urgent' | 'scheduled';
export type RouteStatus = RideStatus | 'urgent' | 'scheduled';

export type RideRequest = {
  id: string;
  passenger: string;
  pickup: string;
  dropoff: string;
  status: RideStatus;
  requestedAt: string;
};

export type DriverOrder = {
  id: string;
  passenger: string;
  pickup: string;
  dropoff: string;
  type: RequestType;
  status: RideStatus;
  requestedAt: string;
  boardingCode: string;
  finishCode: string;
  distanceKm: number;
  durationMin: number;
  baseFare: number;
  currentFare: number;
  routeNote: string;
};

export type TripRecord = {
  id: string;
  employeeName: string;
  companyCode: string;
  pickup: string;
  dropoff: string;
  type: RequestType;
  price: number;
  status: RideStatus;
  requestedAt: string;
  completedAt: string;
};

export type CompanyCode = {
  code: string;
  blocked: boolean;
  generatedAt: string;
  ridesToday: number;
  activeEmployees: number;
};
