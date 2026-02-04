import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { sampleRoutes, sampleTrucks } from '@/data/sampleData';
import { GarbageTruck, Route, Notification, Citizen, CollectionStatus } from '@/types';
import { sampleCitizens } from '@/data/sampleData';

interface SimulationSession {
  id: string;
  is_running: boolean;
  speed_multiplier: number;
  started_at: string | null;
  paused_at: string | null;
  accumulated_time: number;
  truck_id: string | null;
}

interface RouteRecord {
  id: string;
  name: string;
  coordinates: [number, number][];
  wards_covered: string[];
  total_distance: number;
}

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
const interpolatePosition = (coordinates: [number, number][], progress: number): [number, number] => {
  if (coordinates.length < 2) return coordinates[0];
  
  const totalSegments = coordinates.length - 1;
  const targetSegment = progress * totalSegments;
  const segmentIndex = Math.floor(targetSegment);
  const segmentProgress = targetSegment - segmentIndex;
  
  if (segmentIndex >= totalSegments) return coordinates[coordinates.length - 1];
  
  const start = coordinates[segmentIndex];
  const end = coordinates[segmentIndex + 1];
  
  return [
    start[0] + (end[0] - start[0]) * segmentProgress,
    start[1] + (end[1] - start[1]) * segmentProgress,
  ];
};

// Calculate progress from time elapsed
const calculateProgress = (
  session: SimulationSession,
  route: RouteRecord,
  truckSpeed: number
): number => {
  if (!session.is_running && !session.started_at) return 0;
  
  let totalTimeSeconds = session.accumulated_time;
  
  if (session.is_running && session.started_at) {
    const now = new Date().getTime();
    const startedAt = new Date(session.started_at).getTime();
    const elapsedSinceStart = (now - startedAt) / 1000; // seconds
    totalTimeSeconds += elapsedSinceStart * session.speed_multiplier;
  }
  
  // distance = speed * time
  // speed in km/h, time in seconds -> distance in km = speed * time / 3600
  const distanceTraveled = (truckSpeed * totalTimeSeconds) / 3600;
  const progress = Math.min(distanceTraveled / route.total_distance, 1);
  
  return progress;
};

export const useSimulationSync = () => {
  const [session, setSession] = useState<SimulationSession | null>(null);
  const [routes, setRoutes] = useState<RouteRecord[]>([]);
  const [trucks, setTrucks] = useState<GarbageTruck[]>(sampleTrucks);
  const [citizens, setCitizens] = useState<Citizen[]>(sampleCitizens);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbReady, setDbReady] = useState(false);
  
  const animationRef = useRef<number>();
  const selectedCitizenRef = useRef<Citizen | null>(null);

  // Notification helper
  const addNotification = useCallback((message: string, type: Notification['type']) => {
    const notification: Notification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date(),
    };
    setNotifications(prev => [notification, ...prev].slice(0, 10));
  }, []);

  // Initialize database with sample data
  const initializeDatabase = useCallback(async () => {
    try {
      // Check if routes exist
      const { data: existingRoutes } = await supabase
        .from('routes')
        .select('id')
        .limit(1);
      
      if (!existingRoutes || existingRoutes.length === 0) {
        // Seed routes
        const routesToInsert = sampleRoutes.map(r => ({
          id: r.id,
          name: r.name,
          coordinates: r.coordinates,
          wards_covered: r.wardsCovered,
          total_distance: r.totalDistance,
        }));
        
        await supabase.from('routes').insert(routesToInsert);
        
        // Seed trucks
        const trucksToInsert = sampleTrucks.map(t => ({
          id: t.id,
          name: t.name,
          route_id: t.routeId,
          speed: t.speed,
        }));
        
        await supabase.from('trucks').insert(trucksToInsert);
      }
      
      // Check/create default simulation session
      const { data: existingSessions } = await supabase
        .from('simulation_sessions')
        .select('*')
        .limit(1);
      
      if (!existingSessions || existingSessions.length === 0) {
        await supabase.from('simulation_sessions').insert({
          is_running: false,
          speed_multiplier: 1,
          accumulated_time: 0,
          truck_id: 'truck1',
        });
      }
      
      setDbReady(true);
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }, []);

  // Load data from database
  const loadData = useCallback(async () => {
    try {
      // Load routes
      const { data: routesData } = await supabase
        .from('routes')
        .select('*');
      
      if (routesData) {
        setRoutes(routesData.map(r => ({
          id: r.id,
          name: r.name,
          coordinates: r.coordinates as [number, number][],
          wards_covered: r.wards_covered || [],
          total_distance: Number(r.total_distance),
        })));
      }
      
      // Load session
      const { data: sessionData } = await supabase
        .from('simulation_sessions')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (sessionData) {
        setSession({
          id: sessionData.id,
          is_running: sessionData.is_running,
          speed_multiplier: Number(sessionData.speed_multiplier),
          started_at: sessionData.started_at,
          paused_at: sessionData.paused_at,
          accumulated_time: Number(sessionData.accumulated_time),
          truck_id: sessionData.truck_id,
        });
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);
      setIsLoading(false);
    }
  }, []);

  // Update citizen statuses based on truck proximity
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
            if (selectedCitizenRef.current?.id === citizen.id) {
              addNotification(`Garbage collected at ${citizen.address}!`, 'success');
            }
          }
          // Within 200m - approaching
          else if (distance < 0.2 && citizen.status === 'pending') {
            newStatus = 'approaching';
            if (selectedCitizenRef.current?.id === citizen.id) {
              addNotification(`Garbage truck is near your location!`, 'info');
            }
          }
        }
        
        return { ...citizen, status: newStatus };
      })
    );
  }, [addNotification]);

  // Animation loop - compute position deterministically from session state
  useEffect(() => {
    if (!session || !dbReady || routes.length === 0) return;

    const animate = () => {
      if (!session) return;
      
      const updatedTrucks = sampleTrucks.map(truck => {
        const route = routes.find(r => r.id === truck.routeId);
        if (!route) return truck;
        
        const progress = calculateProgress(session, route, truck.speed);
        const position = interpolatePosition(route.coordinates, progress);
        
        return {
          ...truck,
          progress,
          currentPosition: position,
          status: (session.is_running && progress < 1) ? 'running' as const : 
                  (progress >= 1 ? 'idle' as const : truck.status),
        };
      });
      
      setTrucks(updatedTrucks);
      updateCitizenStatuses(updatedTrucks);
      
      if (session.is_running) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (session.is_running) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      // Still compute position once when paused
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [session, routes, dbReady, updateCitizenStatuses]);

  // Subscribe to realtime updates on simulation_sessions
  useEffect(() => {
    initializeDatabase().then(() => loadData());

    const channel = supabase
      .channel('simulation_sessions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'simulation_sessions',
        },
        (payload) => {
          console.log('Realtime update:', payload);
          if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
            const newData = payload.new as {
              id: string;
              is_running: boolean;
              speed_multiplier: number;
              started_at: string | null;
              paused_at: string | null;
              accumulated_time: number;
              truck_id: string | null;
            };
            setSession({
              id: newData.id,
              is_running: newData.is_running,
              speed_multiplier: Number(newData.speed_multiplier),
              started_at: newData.started_at,
              paused_at: newData.paused_at,
              accumulated_time: Number(newData.accumulated_time),
              truck_id: newData.truck_id,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initializeDatabase, loadData]);

  // Admin actions
  const startSimulation = useCallback(async () => {
    if (!session) return;
    
    await supabase
      .from('simulation_sessions')
      .update({
        is_running: true,
        started_at: new Date().toISOString(),
        paused_at: null,
      })
      .eq('id', session.id);
    
    addNotification('Simulation started', 'info');
  }, [session, addNotification]);

  const pauseSimulation = useCallback(async () => {
    if (!session || !session.started_at) return;
    
    // Calculate time elapsed since last start
    const now = new Date().getTime();
    const startedAt = new Date(session.started_at).getTime();
    const elapsedSinceStart = (now - startedAt) / 1000;
    const newAccumulatedTime = session.accumulated_time + (elapsedSinceStart * session.speed_multiplier);
    
    await supabase
      .from('simulation_sessions')
      .update({
        is_running: false,
        paused_at: new Date().toISOString(),
        accumulated_time: newAccumulatedTime,
        started_at: null,
      })
      .eq('id', session.id);
    
    addNotification('Simulation paused', 'info');
  }, [session, addNotification]);

  const resetSimulation = useCallback(async () => {
    if (!session) return;
    
    await supabase
      .from('simulation_sessions')
      .update({
        is_running: false,
        started_at: null,
        paused_at: null,
        accumulated_time: 0,
      })
      .eq('id', session.id);
    
    setCitizens(sampleCitizens);
    addNotification('Simulation reset', 'info');
  }, [session, addNotification]);

  const setSimulationSpeed = useCallback(async (speed: number) => {
    if (!session) return;
    
    // If currently running, accumulate time first
    if (session.is_running && session.started_at) {
      const now = new Date().getTime();
      const startedAt = new Date(session.started_at).getTime();
      const elapsedSinceStart = (now - startedAt) / 1000;
      const newAccumulatedTime = session.accumulated_time + (elapsedSinceStart * session.speed_multiplier);
      
      await supabase
        .from('simulation_sessions')
        .update({
          speed_multiplier: speed,
          accumulated_time: newAccumulatedTime,
          started_at: new Date().toISOString(), // Reset start time
        })
        .eq('id', session.id);
    } else {
      await supabase
        .from('simulation_sessions')
        .update({ speed_multiplier: speed })
        .eq('id', session.id);
    }
  }, [session]);

  const setSelectedCitizen = useCallback((citizen: Citizen | null) => {
    selectedCitizenRef.current = citizen;
  }, []);

  // ETA calculation
  const getETAForCitizen = useCallback((citizenId: string): number | null => {
    const citizen = citizens.find(c => c.id === citizenId);
    if (!citizen) return null;

    let minETA = Infinity;
    for (const truck of trucks) {
      if (truck.status === 'idle' && truck.progress >= 1) continue;
      
      const distance = calculateDistance(
        citizen.latitude,
        citizen.longitude,
        truck.currentPosition[1],
        truck.currentPosition[0]
      );
      const eta = (distance / truck.speed) * 60;
      if (eta < minETA) minETA = eta;
    }
    return minETA === Infinity ? null : Math.round(minETA);
  }, [citizens, trucks]);

  // Distance to truck
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

  return {
    // State
    isRunning: session?.is_running ?? false,
    simulationSpeed: session?.speed_multiplier ?? 1,
    trucks,
    routes: routes.map(r => ({
      id: r.id,
      name: r.name,
      coordinates: r.coordinates,
      truckId: sampleTrucks.find(t => t.routeId === r.id)?.id || null,
      wardsCovered: r.wards_covered,
      totalDistance: r.total_distance,
    })) as Route[],
    citizens,
    notifications,
    isLoading,
    
    // Actions
    startSimulation,
    pauseSimulation,
    resetSimulation,
    setSimulationSpeed,
    setSelectedCitizen,
    
    // Calculations
    getETAForCitizen,
    getDistanceToTruck,
  };
};
