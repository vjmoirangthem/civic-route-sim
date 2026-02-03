import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSimulation } from '@/context/SimulationContext';
import MapContainer from '@/components/map/MapContainer';
import StatusBadge from '@/components/ui/StatusBadge';
import { ArrowLeft, MapPin, Truck, Clock, Bell, Home, Navigation } from 'lucide-react';

const CitizenDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    userRole,
    citizens,
    selectedCitizen,
    setSelectedCitizen,
    isRunning,
    notifications,
    getETAForCitizen,
    getDistanceToTruck,
  } = useSimulation();

  const [eta, setEta] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  // Redirect if not citizen
  useEffect(() => {
    if (userRole !== 'citizen') {
      navigate('/login');
    }
  }, [userRole, navigate]);

  // Set default citizen on mount
  useEffect(() => {
    if (!selectedCitizen && citizens.length > 0) {
      setSelectedCitizen(citizens[0]);
    }
  }, [citizens, selectedCitizen, setSelectedCitizen]);

  // Update ETA and distance periodically
  useEffect(() => {
    if (!selectedCitizen) return;

    const updateStats = () => {
      setEta(getETAForCitizen(selectedCitizen.id));
      setDistance(getDistanceToTruck(selectedCitizen.id));
    };

    updateStats();
    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, [selectedCitizen, getETAForCitizen, getDistanceToTruck, isRunning]);

  const handleCitizenChange = (citizenId: string) => {
    const citizen = citizens.find(c => c.id === citizenId);
    if (citizen) {
      setSelectedCitizen(citizen);
    }
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/login')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <MapPin className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-heading text-lg font-semibold text-foreground">
                  Citizen Dashboard
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={selectedCitizen?.id || ''}
                onValueChange={handleCitizenChange}
              >
                <SelectTrigger className="w-[200px]">
                  <Home className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Select your location" />
                </SelectTrigger>
                <SelectContent>
                  {citizens.map((citizen) => (
                    <SelectItem key={citizen.id} value={citizen.id}>
                      {citizen.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Map Area */}
        <div className="flex-1 relative">
          <MapContainer
            showCitizens
            showTrucks
            showRoutes
            highlightCitizen={selectedCitizen}
            className="absolute inset-0"
          />

          {/* Status Overlay */}
          {selectedCitizen && (
            <div className="absolute top-4 left-4 right-4 lg:right-auto lg:w-80">
              <Card className="bg-card/95 backdrop-blur-sm shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Your Location</CardTitle>
                    <StatusBadge status={selectedCitizen.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium text-foreground">{selectedCitizen.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedCitizen.address}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedCitizen.mohalla}, {selectedCitizen.ward}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-muted p-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Navigation className="h-4 w-4" />
                        <span className="text-xs">Distance</span>
                      </div>
                      <p className="mt-1 font-heading text-xl font-bold text-foreground">
                        {distance !== null ? `${(distance * 1000).toFixed(0)}m` : '--'}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs">ETA</span>
                      </div>
                      <p className="mt-1 font-heading text-xl font-bold text-foreground">
                        {eta !== null ? `${eta} min` : '--'}
                      </p>
                    </div>
                  </div>

                  {!isRunning && (
                    <div className="rounded-lg bg-status-pending/10 p-3 text-center">
                      <p className="text-sm text-status-pending font-medium">
                        Simulation not running
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ask admin to start the simulation
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 left-4">
            <Card className="bg-card/95 backdrop-blur-sm">
              <CardContent className="p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Legend</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-[#E67E22] flex items-center justify-center">
                      <Truck className="h-2.5 w-2.5 text-white" />
                    </div>
                    <span className="text-xs">Garbage Truck</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-status-pending" />
                    <span className="text-xs">Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-status-approaching" />
                    <span className="text-xs">Approaching</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-status-collected" />
                    <span className="text-xs">Collected</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Notifications Panel (Desktop) */}
        <div className="hidden lg:block w-80 border-l border-border bg-card overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="font-heading text-lg font-semibold">Notifications</h2>
            </div>

            {recentNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs mt-1">Updates will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      notification.type === 'success'
                        ? 'bg-status-collected/10 border-status-collected/30'
                        : notification.type === 'warning'
                        ? 'bg-status-pending/10 border-status-pending/30'
                        : notification.type === 'error'
                        ? 'bg-status-missed/10 border-status-missed/30'
                        : 'bg-muted border-border'
                    }`}
                  >
                    <p className="text-sm font-medium text-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Notifications */}
      <div className="lg:hidden border-t border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-sm">Latest Update</h3>
        </div>
        {recentNotifications.length > 0 ? (
          <p className="text-sm text-foreground">{recentNotifications[0].message}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No notifications yet</p>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;
