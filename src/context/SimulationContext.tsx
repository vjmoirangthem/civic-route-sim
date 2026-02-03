import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { GarbageTruck, Route, Citizen, Notification, CollectionStatus, UserRole } from '@/types';
import { sampleCitizens, sampleRoutes, sampleTrucks } from '@/data/sampleData';

interface SimulationContextType {
  // User
  userRole: UserRole | null;
  setUserRole: (role: UserRole | null) => void;
  selectedCitizen: Citizen | null;
  setSelectedCitizen: (citizen: Citizen | null) => void;
  
  // Simulation state
  isRunning: boolean;
  simulationSpeed: number;
  trucks: GarbageTruck[];
  routes: Route[];
  citizens: Citizen[];
  notifications: Notification[];
  
  // Actions
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
  updateTruckSpeed: (truckId: string, speed: number) => void;
  
  // Calculations
  getETAForCitizen: (citizenId: string) => number | null;
  getDistanceToTruck: (citizenId: string) => number | null;
}

const SimulationContext = createContext<SimulationContextType | null>(null);

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within SimulationProvider');
  }
  return context;
};

// Haversine formula for distance calculation
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Interpolate position along route
const interpolatePosition = (route: Route, progress: number): [number, number] => {
  const coords = route.coordinates;
  if (coords.length < 2) return coords[0];
  
  const totalSegments = coords.length - 1;
  const targetSegment = progress * totalSegments;
  const segmentIndex = Math.floor(targetSegment);
  const segmentProgress = targetSegment - segmentIndex;
  
  if (segmentIndex >= totalSegments) return coords[coords.length - 1];
  
  const start = coords[segmentIndex];
  const end = coords[segmentIndex + 1];
  
  return [
    start[0] + (end[0] - start[0]) * segmentProgress,
    start[1] + (end[1] - start[1]) * segmentProgress,
  ];
};

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationSpeed, setSimulationSpeedState] = useState(1);
  const [trucks, setTrucks] = useState<GarbageTruck[]>(sampleTrucks);
  const [routes] = useState<Route[]>(sampleRoutes);
  const [citizens, setCitizens] = useState<Citizen[]>(sampleCitizens);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Add notification
  const addNotification = useCallback((message: string, type: Notification['type']) => {
    const notification: Notification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date(),
    };
    setNotifications(prev => [notification, ...prev].slice(0, 10));
  }, []);

  // Update citizen status based on truck proximity
  const updateCitizenStatuses = useCallback((currentTrucks: GarbageTruck[]) => {
    setCitizens(prevCitizens => 
      prevCitizens.map(citizen => {
        let newStatus: CollectionStatus = citizen.status;
        
        for (const truck of currentTrucks) {
          const distance = calculateDistance(
            citizen.latitude,
            citizen.longitude,
            truck.currentPosition[1],
            truck.currentPosition[0]
          );
          
          // Within 50m - collected
          if (distance < 0.05 && citizen.status !== 'collected') {
            newStatus = 'collected';
            if (selectedCitizen?.id === citizen.id) {
              addNotification(`Garbage collected at ${citizen.address}!`, 'success');
            }
          }
          // Within 200m - approaching
          else if (distance < 0.2 && citizen.status === 'pending') {
            newStatus = 'approaching';
            if (selectedCitizen?.id === citizen.id) {
              addNotification(`Garbage truck is near your location!`, 'info');
            }
          }
        }
        
        return { ...citizen, status: newStatus };
      })
    );
  }, [addNotification, selectedCitizen]);

  // Animation loop
  useEffect(() => {
    if (!isRunning) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const animate = (time: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
      }

      const deltaTime = (time - lastTimeRef.current) / 1000; // seconds
      lastTimeRef.current = time;

      setTrucks(prevTrucks => {
        const updatedTrucks = prevTrucks.map(truck => {
          if (truck.status !== 'running' || !truck.routeId) return truck;

          const route = routes.find(r => r.id === truck.routeId);
          if (!route) return truck;

          // Calculate progress increment based on speed
          // Assuming route totalDistance in km, speed in km/h
          const progressIncrement = (truck.speed * simulationSpeed * deltaTime) / (route.totalDistance * 3600);
          const newProgress = Math.min(truck.progress + progressIncrement * 100, 1);
          const newPosition = interpolatePosition(route, newProgress);

          return {
            ...truck,
            progress: newProgress,
            currentPosition: newPosition,
            status: newProgress >= 1 ? 'idle' as const : 'running' as const,
          };
        });

        updateCitizenStatuses(updatedTrucks);
        return updatedTrucks;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, routes, simulationSpeed, updateCitizenStatuses]);

  const startSimulation = useCallback(() => {
    setIsRunning(true);
    setTrucks(prev => prev.map(truck => ({
      ...truck,
      status: truck.routeId ? 'running' : 'idle',
    })));
    addNotification('Simulation started', 'info');
  }, [addNotification]);

  const pauseSimulation = useCallback(() => {
    setIsRunning(false);
    setTrucks(prev => prev.map(truck => ({
      ...truck,
      status: truck.status === 'running' ? 'paused' : truck.status,
    })));
    lastTimeRef.current = 0;
    addNotification('Simulation paused', 'info');
  }, [addNotification]);

  const resetSimulation = useCallback(() => {
    setIsRunning(false);
    lastTimeRef.current = 0;
    setTrucks(sampleTrucks.map(truck => ({
      ...truck,
      progress: 0,
      status: 'idle',
      currentPosition: sampleRoutes.find(r => r.id === truck.routeId)?.coordinates[0] || truck.currentPosition,
    })));
    setCitizens(sampleCitizens);
    setNotifications([]);
    addNotification('Simulation reset', 'info');
  }, [addNotification]);

  const setSimulationSpeed = useCallback((speed: number) => {
    setSimulationSpeedState(speed);
  }, []);

  const updateTruckSpeed = useCallback((truckId: string, speed: number) => {
    setTrucks(prev => prev.map(truck =>
      truck.id === truckId ? { ...truck, speed } : truck
    ));
  }, []);

  const getETAForCitizen = useCallback((citizenId: string): number | null => {
    const citizen = citizens.find(c => c.id === citizenId);
    if (!citizen) return null;

    // Find nearest truck on a route
    let minETA = Infinity;

    for (const truck of trucks) {
      if (!truck.routeId || truck.status === 'idle') continue;

      const distance = calculateDistance(
        citizen.latitude,
        citizen.longitude,
        truck.currentPosition[1],
        truck.currentPosition[0]
      );

      // ETA in minutes
      const eta = (distance / truck.speed) * 60;
      if (eta < minETA) minETA = eta;
    }

    return minETA === Infinity ? null : Math.round(minETA);
  }, [citizens, trucks]);

  const getDistanceToTruck = useCallback((citizenId: string): number | null => {
    const citizen = citizens.find(c => c.id === citizenId);
    if (!citizen) return null;

    let minDistance = Infinity;

    for (const truck of trucks) {
      const distance = calculateDistance(
        citizen.latitude,
        citizen.longitude,
        truck.currentPosition[1],
        truck.currentPosition[0]
      );
      if (distance < minDistance) minDistance = distance;
    }

    return minDistance === Infinity ? null : minDistance;
  }, [citizens, trucks]);

  return (
    <SimulationContext.Provider
      value={{
        userRole,
        setUserRole,
        selectedCitizen,
        setSelectedCitizen,
        isRunning,
        simulationSpeed,
        trucks,
        routes,
        citizens,
        notifications,
        startSimulation,
        pauseSimulation,
        resetSimulation,
        setSimulationSpeed,
        updateTruckSpeed,
        getETAForCitizen,
        getDistanceToTruck,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};
