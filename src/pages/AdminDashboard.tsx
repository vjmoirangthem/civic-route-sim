import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSimulationSyncContext } from '@/context/SimulationSyncContext';
import MapContainer from '@/components/map/MapContainer';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  ArrowLeft,
  MapPin,
  Play,
  Pause,
  RotateCcw,
  Truck,
  Route,
  Users,
  Gauge,
  Settings,
  Loader2,
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    userRole,
    isRunning,
    simulationSpeed,
    trucks,
    routes,
    citizens,
    isLoading,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    setSimulationSpeed,
    updateTruckSpeed,
  } = useSimulationSyncContext();

  // Redirect if not admin
  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/login');
    }
  }, [userRole, navigate]);

  const collectedCount = citizens.filter(c => c.status === 'collected').length;
  const pendingCount = citizens.filter(c => c.status === 'pending').length;
  const approachingCount = citizens.filter(c => c.status === 'approaching').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading simulation data...</p>
        </div>
      </div>
    );
  }

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
                  Admin Dashboard
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isRunning ? 'default' : 'secondary'} className="gap-1">
                <div className={`h-2 w-2 rounded-full ${isRunning ? 'bg-status-collected animate-pulse' : 'bg-muted-foreground'}`} />
                {isRunning ? 'Running' : 'Stopped'}
              </Badge>
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
            className="absolute inset-0"
          />

          {/* Quick Stats Overlay */}
          <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
            <Card className="bg-card/95 backdrop-blur-sm shadow-lg">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-status-collected/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-status-collected" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-foreground">{collectedCount}</p>
                  <p className="text-xs text-muted-foreground">Collected</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/95 backdrop-blur-sm shadow-lg">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-status-pending/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-status-pending" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-foreground">{pendingCount}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/95 backdrop-blur-sm shadow-lg">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-status-approaching/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-status-approaching" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-foreground">{approachingCount}</p>
                  <p className="text-xs text-muted-foreground">Approaching</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Control Panel */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-border bg-card overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Simulation Controls */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-lg font-semibold">Simulation Controls</h2>
              </div>

              <div className="flex gap-2 mb-4">
                <Button
                  onClick={isRunning ? pauseSimulation : startSimulation}
                  className="flex-1"
                  variant={isRunning ? 'secondary' : 'default'}
                >
                  {isRunning ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start
                    </>
                  )}
                </Button>
                <Button onClick={resetSimulation} variant="outline">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Speed Multiplier</label>
                  <span className="text-sm text-muted-foreground">{simulationSpeed}x</span>
                </div>
                <Slider
                  value={[simulationSpeed]}
                  onValueChange={([value]) => setSimulationSpeed(value)}
                  min={0.5}
                  max={10}
                  step={0.5}
                  className="w-full"
                />
              </div>
            </div>

            {/* Trucks List */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Truck className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-lg font-semibold">Trucks</h2>
              </div>

              <div className="space-y-3">
                {trucks.map((truck) => {
                  const route = routes.find(r => r.id === truck.routeId);
                  return (
                    <Card key={truck.id} className="border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-[#E67E22]/10 flex items-center justify-center">
                              <Truck className="h-4 w-4 text-[#E67E22]" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{truck.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {route?.name || 'No route assigned'}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={truck.status === 'running' ? 'default' : 'secondary'}
                          >
                            {truck.status}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Speed</span>
                            <span className="text-sm font-medium">{truck.speed} km/h</span>
                          </div>
                          <Slider
                            value={[truck.speed]}
                            onValueChange={([value]) => updateTruckSpeed(truck.id, value)}
                            min={5}
                            max={40}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{(truck.progress * 100).toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${truck.progress * 100}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Routes List */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Route className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-lg font-semibold">Routes</h2>
              </div>

              <div className="space-y-3">
                {routes.map((route) => {
                  const assignedTruck = trucks.find(t => t.routeId === route.id);
                  return (
                    <Card key={route.id} className="border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">{route.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {route.totalDistance} km • {route.wardsCovered.join(', ')}
                            </p>
                          </div>
                          {assignedTruck && (
                            <Badge variant="outline" className="text-xs">
                              {assignedTruck.name}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Citizens Summary */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-lg font-semibold">Citizens Coverage</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-2xl font-heading font-bold text-foreground">{citizens.length}</p>
                  <p className="text-xs text-muted-foreground">Total Citizens</p>
                </div>
                <div className="rounded-lg bg-status-collected/10 p-3 text-center">
                  <p className="text-2xl font-heading font-bold text-status-collected">
                    {((collectedCount / citizens.length) * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Coverage</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {citizens.slice(0, 5).map((citizen) => (
                  <div
                    key={citizen.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{citizen.name}</p>
                      <p className="text-xs text-muted-foreground">{citizen.mohalla}</p>
                    </div>
                    <StatusBadge status={citizen.status} />
                  </div>
                ))}
                {citizens.length > 5 && (
                  <p className="text-xs text-center text-muted-foreground">
                    +{citizens.length - 5} more citizens
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
