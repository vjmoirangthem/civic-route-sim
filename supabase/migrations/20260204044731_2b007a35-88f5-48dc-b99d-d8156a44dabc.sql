-- Routes table: stores the lat-long coordinates for each route
CREATE TABLE public.routes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    coordinates JSONB NOT NULL, -- Array of [lng, lat] pairs
    wards_covered TEXT[] NOT NULL DEFAULT '{}',
    total_distance NUMERIC(10, 3) NOT NULL DEFAULT 0, -- km
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trucks table: stores truck metadata
CREATE TABLE public.trucks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    route_id TEXT REFERENCES public.routes(id),
    speed NUMERIC(5, 2) NOT NULL DEFAULT 20, -- km/h
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Simulation sessions table: tracks when simulation starts/stops
-- Both Admin and Citizen screens read this to compute position deterministically
CREATE TABLE public.simulation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_running BOOLEAN NOT NULL DEFAULT false,
    speed_multiplier NUMERIC(4, 2) NOT NULL DEFAULT 1,
    started_at TIMESTAMP WITH TIME ZONE, -- When simulation was last started
    paused_at TIMESTAMP WITH TIME ZONE, -- When simulation was paused
    accumulated_time NUMERIC(12, 3) NOT NULL DEFAULT 0, -- Seconds accumulated before last pause
    truck_id TEXT REFERENCES public.trucks(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public read for demo, no auth needed)
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public read/write for demo purposes
CREATE POLICY "Public read routes" ON public.routes FOR SELECT USING (true);
CREATE POLICY "Public insert routes" ON public.routes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update routes" ON public.routes FOR UPDATE USING (true);

CREATE POLICY "Public read trucks" ON public.trucks FOR SELECT USING (true);
CREATE POLICY "Public insert trucks" ON public.trucks FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update trucks" ON public.trucks FOR UPDATE USING (true);

CREATE POLICY "Public read simulation_sessions" ON public.simulation_sessions FOR SELECT USING (true);
CREATE POLICY "Public insert simulation_sessions" ON public.simulation_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update simulation_sessions" ON public.simulation_sessions FOR UPDATE USING (true);

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_routes_updated_at
    BEFORE UPDATE ON public.routes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trucks_updated_at
    BEFORE UPDATE ON public.trucks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_simulation_sessions_updated_at
    BEFORE UPDATE ON public.simulation_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for simulation_sessions (critical for cross-device sync)
ALTER PUBLICATION supabase_realtime ADD TABLE public.simulation_sessions;