// Detection Yogh Types

export type UserRole = 'citizen' | 'admin';

export type CollectionStatus = 'pending' | 'approaching' | 'collected' | 'missed';

export interface Citizen {
  id: string;
  name: string;
  address: string;
  ward: string;
  mohalla: string;
  latitude: number;
  longitude: number;
  status: CollectionStatus;
}

export interface GarbageTruck {
  id: string;
  name: string;
  currentPosition: [number, number]; // [lng, lat]
  speed: number; // km/h
  status: 'idle' | 'running' | 'paused';
  routeId: string | null;
  progress: number; // 0-1 along the route
}

export interface Route {
  id: string;
  name: string;
  coordinates: [number, number][]; // Array of [lng, lat]
  truckId: string | null;
  wardsCovered: string[];
  totalDistance: number; // km
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: Date;
}

export interface SimulationState {
  isRunning: boolean;
  speed: number; // multiplier
  trucks: GarbageTruck[];
  routes: Route[];
  citizens: Citizen[];
}
