-- ====================================================================
-- SEWAK PLASTICS FIELD SALES TRACKER & VERIFICATION SCHEMA (SUPABASE)
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('field_agent', 'admin')),
    device_fingerprint TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    pin TEXT NOT NULL DEFAULT '1234',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. LOCATION LOGS TABLE
CREATE TABLE IF NOT EXISTS public.location_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy NUMERIC,
    speed NUMERIC,
    is_mocked BOOLEAN NOT NULL DEFAULT FALSE,
    ip_address TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_synced_offline BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CLIENT VISITS TABLE
CREATE TABLE IF NOT EXISTS public.client_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    shop_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    physical_location TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    comments TEXT,
    device_ip TEXT,
    device_name TEXT,
    visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    photo_url TEXT,
    is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
    flag_reason TEXT,
    integrity_hash TEXT,
    is_synced_offline BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR REAL-TIME FILTERING & AGGREGATION
CREATE INDEX IF NOT EXISTS idx_location_logs_agent_recorded ON public.location_logs(agent_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_location_logs_recorded_at ON public.location_logs(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_visits_agent ON public.client_visits(agent_id, visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_visits_flagged ON public.client_visits(is_flagged);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone_number);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_visits ENABLE ROW LEVEL SECURITY;

-- Allow anonymous / authenticated read and insert for the sales tracker operations
CREATE POLICY "Allow public read of profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Allow profiles insert/update" ON public.profiles
    FOR ALL USING (true);

CREATE POLICY "Allow public read location logs" ON public.location_logs
    FOR SELECT USING (true);

CREATE POLICY "Allow location logs insert" ON public.location_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read client visits" ON public.client_visits
    FOR SELECT USING (true);

CREATE POLICY "Allow client visits insert" ON public.client_visits
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow client visits update" ON public.client_visits
    FOR UPDATE USING (true);

-- STORAGE BUCKET CONFIGURATION FOR PROOF PHOTOS
INSERT INTO storage.buckets (id, name, public) 
VALUES ('visit-photos', 'visit-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public photo uploads" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'visit-photos');

CREATE POLICY "Allow public photo downloads" ON storage.objects
    FOR SELECT USING (bucket_id = 'visit-photos');

-- INITIAL DEMO SEED DATA (KENYA FIELD AGENTS & ADMIN)
INSERT INTO public.profiles (id, full_name, phone_number, role, pin, is_active)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'John Kimani', '0712345678', 'field_agent', '1234', true),
    ('22222222-2222-2222-2222-222222222222', 'Mercy Achieng', '0723456789', 'field_agent', '1234', true),
    ('33333333-3333-3333-3333-333333333333', 'David Kiprono', '0734567890', 'field_agent', '1234', true),
    ('44444444-4444-4444-4444-444444444444', 'Faith Wanjiku', '0745678901', 'field_agent', '1234', true),
    ('99999999-9999-9999-9999-999999999999', 'Sarah Mwangi (Operations Admin)', '0700000000', 'admin', '8888', true)
ON CONFLICT (phone_number) DO NOTHING;

-- SEED INITIAL VISITS FOR DEMONSTRATION
INSERT INTO public.client_visits (
    id, agent_id, shop_name, phone_number, physical_location, latitude, longitude, comments, device_name, visited_at, is_flagged, flag_reason
) VALUES
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '11111111-1111-1111-1111-111111111111',
        'Crown Hardware & Plastics',
        '0722112233',
        'Pipeline Stage, Nairobi',
        -1.3090,
        36.8850,
        'Requested quotation for 500 units of 20L Jerrycans and PVC fittings.',
        'Samsung Galaxy A14 (SM-A145F)',
        NOW() - INTERVAL '3 hours',
        false,
        null
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '22222222-2222-2222-2222-222222222222',
        'Coast BuildMat Supplies',
        '0733445566',
        'Digo Road, Mombasa',
        -4.0580,
        39.6640,
        'Delivered sample water tanks catalog. Owner requested follow-up next Tuesday.',
        'Tecno Spark 10 Pro',
        NOW() - INTERVAL '1 hour',
        false,
        null
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        '33333333-3333-3333-3333-333333333333',
        'QuickFix General Store',
        '0799887766',
        'Oginga Odinga St, Kisumu',
        -0.0917,
        34.7680,
        'Store visit recorded while in fast transit. Verified anomaly.',
        'Infinix Hot 30',
        NOW() - INTERVAL '30 minutes',
        true,
        'Speed Jump Anomaly: Speed recorded 125 km/h (> 100 km/h limit)'
    )
ON CONFLICT (id) DO NOTHING;
