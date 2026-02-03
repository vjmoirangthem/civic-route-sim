import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Construction, AlertTriangle, Droplets, ArrowRight, MapPin, Truck, Users } from 'lucide-react';

const categories = [
  {
    id: 'garbage',
    title: 'Garbage Collection',
    description: 'Track garbage trucks in real-time and receive collection notifications',
    icon: Trash2,
    active: true,
    color: 'primary',
  },
  {
    id: 'encroachment',
    title: 'Encroachment',
    description: 'Report and monitor unauthorized constructions',
    icon: Construction,
    active: false,
    color: 'muted',
  },
  {
    id: 'potholes',
    title: 'Potholes',
    description: 'Report road damage and track repairs',
    icon: AlertTriangle,
    active: false,
    color: 'muted',
  },
  {
    id: 'water',
    title: 'Water Issues',
    description: 'Report water supply and drainage problems',
    icon: Droplets,
    active: false,
    color: 'muted',
  },
];

const stats = [
  { value: '24+', label: 'Wards Covered', icon: MapPin },
  { value: '15', label: 'Active Trucks', icon: Truck },
  { value: '10K+', label: 'Citizens Served', icon: Users },
];

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="civic-gradient absolute inset-0 opacity-5" />
        <div className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <MapPin className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-heading text-xl font-bold text-foreground">Detection Yogh</span>
            </div>
            <Button onClick={() => navigate('/login')} variant="default">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </nav>
        </div>

        <div className="container mx-auto px-4 py-20 text-center">
          <div className="mx-auto max-w-3xl">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Civic Infrastructure
              <span className="block text-primary">Monitoring Platform</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              A comprehensive simulation and visualization platform for municipal operations. 
              Track garbage trucks, monitor collection status, and receive real-time notifications.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" onClick={() => navigate('/login')} className="px-8">
                Login / Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="font-heading text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground">Service Categories</h2>
          <p className="mt-2 text-muted-foreground">
            Monitor and manage various civic infrastructure services
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Card
              key={category.id}
              className={`relative overflow-hidden transition-all duration-200 ${
                category.active
                  ? 'cursor-pointer border-primary/30 hover:border-primary hover:shadow-lg'
                  : 'cursor-not-allowed opacity-60'
              }`}
              onClick={() => category.active && navigate('/login')}
            >
              {!category.active && (
                <div className="absolute right-2 top-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  Coming Soon
                </div>
              )}
              <CardHeader>
                <div
                  className={`mb-3 flex h-12 w-12 items-center justify-center rounded-lg ${
                    category.active ? 'bg-primary/10' : 'bg-muted'
                  }`}
                >
                  <category.icon
                    className={`h-6 w-6 ${category.active ? 'text-primary' : 'text-muted-foreground'}`}
                  />
                </div>
                <CardTitle className="text-lg">{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              {category.active && (
                <CardContent>
                  <Button variant="ghost" className="w-full" disabled={!category.active}>
                    Explore
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold text-foreground">How It Works</h2>
            <p className="mt-2 text-muted-foreground">
              Simple workflow for citizens and administrators
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                1
              </div>
              <h3 className="font-heading text-xl font-semibold">Select Your Role</h3>
              <p className="mt-2 text-muted-foreground">
                Choose between Citizen or Admin view based on your access level
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                2
              </div>
              <h3 className="font-heading text-xl font-semibold">View Live Map</h3>
              <p className="mt-2 text-muted-foreground">
                See real-time truck locations, routes, and collection status
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                3
              </div>
              <h3 className="font-heading text-xl font-semibold">Get Notifications</h3>
              <p className="mt-2 text-muted-foreground">
                Receive updates when the truck is approaching or has passed your location
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <MapPin className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-lg font-semibold text-foreground">Detection Yogh</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            A civic infrastructure monitoring and simulation platform
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            © 2025 Detection Yogh. Prototype Build.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
