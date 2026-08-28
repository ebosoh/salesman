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

-- INITIAL DEMO SEED DATA (NAKURU COUNTY FIELD AGENTS & ADMIN)
INSERT INTO public.profiles (id, full_name, phone_number, role, pin, is_active)
VALUES
    ('11111111-1111-1111-1111-111111111101', 'John Kimani', '0712345601', 'field_agent', '1234', true),
    ('11111111-1111-1111-1111-111111111102', 'Mercy Achieng', '0712345602', 'field_agent', '1234', true),
    ('11111111-1111-1111-1111-111111111103', 'David Kiprono', '0712345603', 'field_agent', '1234', true),
    ('11111111-1111-1111-1111-111111111104', 'Faith Wanjiku', '0712345604', 'field_agent', '1234', true),
    ('11111111-1111-1111-1111-111111111105', 'Peter Omwamba', '0712345605', 'field_agent', '1234', true),
    ('11111111-1111-1111-1111-111111111106', 'Grace Njeri', '0712345606', 'field_agent', '1234', true),
    ('11111111-1111-1111-1111-111111111107', 'Samuel Koech', '0712345607', 'field_agent', '1234', true),
    ('11111111-1111-1111-1111-111111111108', 'Eunice Moraa', '0712345608', 'field_agent', '1234', true),
    ('11111111-1111-1111-1111-111111111109', 'Dennis Kipkemboi', '0712345609', 'field_agent', '1234', true),
    ('11111111-1111-1111-1111-111111111110', 'Beatrice Chebet', '0712345610', 'field_agent', '1234', true),
    ('11111111-1111-1111-1111-111111111111', 'James Mwangi', '0712345611', 'field_agent', '1234', true),
    ('11111111-1111-1111-1111-111111111112', 'Rosemary Wambui', '0712345612', 'field_agent', '1234', true),
    ('11111111-1111-1111-1111-111111111113', 'Geoffrey Kiptoo', '0712345613', 'field_agent', '1234', true),
    ('11111111-1111-1111-1111-111111111114', 'Caroline Muthoni', '0712345614', 'field_agent', '1234', true),
    ('11111111-1111-1111-1111-111111111115', 'Victor Otieno', '0712345615', 'field_agent', '1234', true),
    ('11111111-1111-1111-1111-111111111116', 'Agnes Wanjiru', '0712345616', 'field_agent', '1234', true),
    ('11111111-1111-1111-1111-111111111117', 'Brian Rotich', '0712345617', 'field_agent', '1234', true),
    ('11111111-1111-1111-1111-111111111118', 'Lydia Chepkemoi', '0712345618', 'field_agent', '1234', true),
    ('11111111-1111-1111-1111-111111111119', 'Kevin Ochieng', '0712345619', 'field_agent', '1234', true),
    ('11111111-1111-1111-1111-111111111120', 'Stella Nyambura', '0712345620', 'field_agent', '1234', true),
    ('99999999-9999-9999-9999-999999999999', 'Sarah Mwangi (Operations Admin)', '0700000000', 'admin', '8888', true)
ON CONFLICT (phone_number) DO NOTHING;

-- SEED INITIAL VISITS IN NAKURU COUNTY
INSERT INTO public.client_visits (
    id, agent_id, shop_name, phone_number, physical_location, latitude, longitude, comments, device_name, visited_at, is_flagged, flag_reason
) VALUES
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01',
        '11111111-1111-1111-1111-111111111101',
        'Crown Hardware & Plastics',
        '0722112201',
        'Kenyatta Avenue, Nakuru CBD',
        -0.2827,
        36.0673,
        'Requested quotation for 500 units of 20L Jerrycans and PVC fittings.',
        'Samsung Galaxy A14 (SM-A145F)',
        NOW() - INTERVAL '3 hours',
        false,
        null
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02',
        '11111111-1111-1111-1111-111111111102',
        'Kaptembwa Agro-Plastics Ltd',
        '0733445502',
        'Kaptembwa Market, Nakuru West',
        -0.2980,
        36.0420,
        'Delivered sample water tanks catalog. Owner requested follow-up next Tuesday.',
        'Tecno Spark 10 Pro',
        NOW() - INTERVAL '2 hours',
        false,
        null
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03',
        '11111111-1111-1111-1111-111111111103',
        'QuickFix General Store',
        '0799887703',
        'Free Area Center, Nakuru East',
        -0.2805,
        36.1050,
        'Store visit recorded while in fast transit. Verified anomaly.',
        'Infinix Hot 30',
        NOW() - INTERVAL '45 minutes',
        true,
        'Speed Jump Anomaly: Speed recorded 125 km/h (> 100 km/h limit)'
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04',
        '11111111-1111-1111-1111-111111111106',
        'Mau View Hardware Mart',
        '0722334406',
        'Main Commercial St, Njoro Town',
        -0.3450,
        35.9400,
        'Ordered 200 rolls of drip irrigation pipes.',
        'Redmi Note 12',
        NOW() - INTERVAL '1 hour',
        false,
        null
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05',
        '11111111-1111-1111-1111-111111111111',
        'Rift Valley Hardware & Timber',
        '0733556611',
        'Gilgil Town Center',
        -0.4931,
        36.2833,
        'Interested in Sewak 1000L cylindrical water tanks.',
        'Samsung Galaxy A24',
        NOW() - INTERVAL '4 hours',
        false,
        null
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06',
        '11111111-1111-1111-1111-111111111113',
        'Crater Builders & Pipe Supplies',
        '0744667713',
        'Mbaria Kaniu Rd, Naivasha CBD',
        -0.7172,
        36.4310,
        'Verified delivery of PVC elbows and conduit pipes.',
        'Tecno Camon 20',
        NOW() - INTERVAL '1.5 hours',
        false,
        null
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa07',
        '11111111-1111-1111-1111-111111111109',
        'Highland Hardware Supplies',
        '0755778809',
        'Posta Road, Molo Town',
        -0.2480,
        35.7330,
        'Stock inquiry for Sewak heavy-duty basins and buckets.',
        'Infinix Note 30',
        NOW() - INTERVAL '2.5 hours',
        false,
        null
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa08',
        '11111111-1111-1111-1111-111111111117',
        'Bahati Farmers Construction Hub',
        '0766889917',
        'Bahati Center, Nakuru North',
        -0.1550,
        36.1450,
        'Confirmed order for 150 greenhouse film polythene sheets.',
        'Samsung Galaxy A14',
        NOW() - INTERVAL '30 minutes',
        false,
        null
    )
ON CONFLICT (id) DO NOTHING;
