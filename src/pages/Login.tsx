import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSimulation } from '@/context/SimulationContext';
import { User, Shield, MapPin, ArrowLeft, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { userRole, setUserRole } = useSimulation();

  const handleContinue = () => {
    if (userRole === 'citizen') {
      navigate('/citizen');
    } else if (userRole === 'admin') {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <MapPin className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-heading text-lg font-semibold text-foreground">Detection Yogh</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl font-bold text-foreground">Welcome</h1>
            <p className="mt-2 text-muted-foreground">
              Select your role to access the platform
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Citizen Card */}
            <Card
              className={`cursor-pointer transition-all duration-200 ${
                userRole === 'citizen'
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'hover:border-primary/50 hover:shadow-md'
              }`}
              onClick={() => setUserRole('citizen')}
            >
              <CardHeader className="text-center">
                <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
                  userRole === 'citizen' ? 'bg-primary' : 'bg-primary/10'
                }`}>
                  <User className={`h-10 w-10 ${
                    userRole === 'citizen' ? 'text-primary-foreground' : 'text-primary'
                  }`} />
                </div>
                <CardTitle className="text-xl">Citizen</CardTitle>
                <CardDescription>
                  Track garbage collection in your area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    View truck location on map
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Get real-time ETA updates
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Receive collection notifications
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Admin Card */}
            <Card
              className={`cursor-pointer transition-all duration-200 ${
                userRole === 'admin'
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'hover:border-primary/50 hover:shadow-md'
              }`}
              onClick={() => setUserRole('admin')}
            >
              <CardHeader className="text-center">
                <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
                  userRole === 'admin' ? 'bg-primary' : 'bg-primary/10'
                }`}>
                  <Shield className={`h-10 w-10 ${
                    userRole === 'admin' ? 'text-primary-foreground' : 'text-primary'
                  }`} />
                </div>
                <CardTitle className="text-xl">Admin</CardTitle>
                <CardDescription>
                  Manage trucks, routes, and simulations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Control all garbage trucks
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Create and edit routes
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Run and manage simulations
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Button
              size="lg"
              onClick={handleContinue}
              disabled={!userRole}
              className="px-12"
            >
              Continue
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="mt-4 text-xs text-muted-foreground">
              This is a prototype. No real authentication is required.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
