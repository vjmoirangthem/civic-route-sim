import React, { createContext, useContext, useState } from 'react';
import { useSimulationSync } from '@/hooks/useSimulationSync';
import { GarbageTruck, Route, Citizen, Notification, UserRole } from '@/types';

interface SimulationSyncContextType {
  // User
  userRole: UserRole | null;
  setUserRole: (role: UserRole | null) => void;
  selectedCitizen: Citizen | null;
  setSelectedCitizen: (citizen: Citizen | null) => void;
  
  // Simulation state (from database)
  isRunning: boolean;
  simulationSpeed: number;
  trucks: GarbageTruck[];
  routes: Route[];
  citizens: Citizen[];
  notifications: Notification[];
  isLoading: boolean;
  
  // Actions
  startSimulation: () => Promise<void>;
  pauseSimulation: () => Promise<void>;
  resetSimulation: () => Promise<void>;
  setSimulationSpeed: (speed: number) => Promise<void>;
  updateTruckSpeed: (truckId: string, speed: number) => void;
  
  // Calculations
  getETAForCitizen: (citizenId: string) => number | null;
  getDistanceToTruck: (citizenId: string) => number | null;
}

const SimulationSyncContext = createContext<SimulationSyncContextType | null>(null);

export const useSimulationSyncContext = () => {
  const context = useContext(SimulationSyncContext);
  if (!context) {
    throw new Error('useSimulationSyncContext must be used within SimulationSyncProvider');
  }
  return context;
};

export const SimulationSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [selectedCitizenState, setSelectedCitizenState] = useState<Citizen | null>(null);
  
  const {
    isRunning,
    simulationSpeed,
    trucks,
    routes,
    citizens,
    notifications,
    isLoading,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    setSimulationSpeed,
    setSelectedCitizen: setSelectedCitizenHook,
    getETAForCitizen,
    getDistanceToTruck,
  } = useSimulationSync();

  const setSelectedCitizen = (citizen: Citizen | null) => {
    setSelectedCitizenState(citizen);
    setSelectedCitizenHook(citizen);
  };

  // Placeholder for truck speed update (would need DB update in production)
  const updateTruckSpeed = (truckId: string, speed: number) => {
    console.log('Update truck speed:', truckId, speed);
  };

  return (
    <SimulationSyncContext.Provider
      value={{
        userRole,
        setUserRole,
        selectedCitizen: selectedCitizenState,
        setSelectedCitizen,
        isRunning,
        simulationSpeed,
        trucks,
        routes,
        citizens,
        notifications,
        isLoading,
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
    </SimulationSyncContext.Provider>
  );
};
