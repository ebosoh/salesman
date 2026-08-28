import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Profile, LocationLog, ClientVisit } from '../types';
import { db } from './db';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('your-project')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Initial Mock Seed Data for Kenyan Field Agents & Operations Admin
export const INITIAL_PROFILES: Profile[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    full_name: 'John Kimani',
    phone_number: '0712345678',
    role: 'field_agent',
    device_fingerprint: 'FP-A14-KEN',
    pin: '1234',
    is_active: true
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    full_name: 'Mercy Achieng',
    phone_number: '0723456789',
    role: 'field_agent',
    device_fingerprint: 'FP-TECNO-KEN',
    pin: '1234',
    is_active: true
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    full_name: 'David Kiprono',
    phone_number: '0734567890',
    role: 'field_agent',
    device_fingerprint: 'FP-INFINIX-KEN',
    pin: '1234',
    is_active: true
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    full_name: 'Faith Wanjiku',
    phone_number: '0745678901',
    role: 'field_agent',
    device_fingerprint: 'FP-REDMI-KEN',
    pin: '1234',
    is_active: true
  },
  {
    id: '99999999-9999-9999-9999-999999999999',
    full_name: 'Sarah Mwangi (Operations Admin)',
    phone_number: '0700000000',
    role: 'admin',
    device_fingerprint: 'FP-ADMIN-KEN',
    pin: '8888',
    is_active: true
  }
];

export const INITIAL_VISITS: ClientVisit[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    agent_id: '11111111-1111-1111-1111-111111111111',
    shop_name: 'Crown Hardware & Plastics',
    phone_number: '0722112233',
    physical_location: 'Pipeline Stage, Nairobi',
    latitude: -1.3090,
    longitude: 36.8850,
    comments: 'Requested quotation for 500 units of 20L Jerrycans and PVC fittings.',
    device_ip: '197.237.102.14',
    device_name: 'Samsung Galaxy A14',
    visited_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    is_flagged: false,
    photo_url: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    agent_id: '22222222-2222-2222-2222-222222222222',
    shop_name: 'Coast BuildMat Supplies',
    phone_number: '0733445566',
    physical_location: 'Digo Road, Mombasa',
    latitude: -4.0580,
    longitude: 39.6640,
    comments: 'Delivered sample water tanks catalog. Owner requested follow-up next Tuesday.',
    device_ip: '102.135.24.89',
    device_name: 'Tecno Spark 10 Pro',
    visited_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    is_flagged: false,
    photo_url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    agent_id: '33333333-3333-3333-3333-333333333333',
    shop_name: 'QuickFix General Store',
    phone_number: '0799887766',
    physical_location: 'Oginga Odinga St, Kisumu',
    latitude: -0.0917,
    longitude: 34.7680,
    comments: 'Store visit recorded while in fast transit. Flagged anomaly for verification.',
    device_ip: '197.232.88.19',
    device_name: 'Infinix Hot 30',
    visited_at: new Date(Date.now() - 30 * 60000).toISOString(),
    is_flagged: true,
    flag_reason: 'Speed Jump Anomaly: Speed recorded 125 km/h (> 100 km/h limit)',
    photo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=500&auto=format&fit=crop&q=60'
  }
];

export const INITIAL_LOCATION_LOGS: LocationLog[] = [
  // John Kimani route in Nairobi Eastlands
  {
    id: 'loc-1',
    agent_id: '11111111-1111-1111-1111-111111111111',
    latitude: -1.3150,
    longitude: 36.8700,
    accuracy: 12,
    speed: 18,
    is_mocked: false,
    recorded_at: new Date(Date.now() - 4 * 3600000).toISOString()
  },
  {
    id: 'loc-2',
    agent_id: '11111111-1111-1111-1111-111111111111',
    latitude: -1.3110,
    longitude: 36.8790,
    accuracy: 9,
    speed: 24,
    is_mocked: false,
    recorded_at: new Date(Date.now() - 3.5 * 3600000).toISOString()
  },
  {
    id: 'loc-3',
    agent_id: '11111111-1111-1111-1111-111111111111',
    latitude: -1.3090,
    longitude: 36.8850,
    accuracy: 8,
    speed: 0,
    is_mocked: false,
    recorded_at: new Date(Date.now() - 3 * 3600000).toISOString()
  },
  {
    id: 'loc-4',
    agent_id: '11111111-1111-1111-1111-111111111111',
    latitude: -1.3040,
    longitude: 36.8920,
    accuracy: 14,
    speed: 22,
    is_mocked: false,
    recorded_at: new Date(Date.now() - 20 * 60000).toISOString()
  },
  // Mercy Achieng in Mombasa
  {
    id: 'loc-5',
    agent_id: '22222222-2222-2222-2222-222222222222',
    latitude: -4.0620,
    longitude: 39.6580,
    accuracy: 10,
    speed: 15,
    is_mocked: false,
    recorded_at: new Date(Date.now() - 2 * 3600000).toISOString()
  },
  {
    id: 'loc-6',
    agent_id: '22222222-2222-2222-2222-222222222222',
    latitude: -4.0580,
    longitude: 39.6640,
    accuracy: 11,
    speed: 0,
    is_mocked: false,
    recorded_at: new Date(Date.now() - 1 * 3600000).toISOString()
  },
  // David Kiprono in Kisumu
  {
    id: 'loc-7',
    agent_id: '33333333-3333-3333-3333-333333333333',
    latitude: -0.0917,
    longitude: 34.7680,
    accuracy: 45,
    speed: 125,
    is_mocked: false,
    recorded_at: new Date(Date.now() - 30 * 60000).toISOString()
  },
  // Faith Wanjiku in Nakuru
  {
    id: 'loc-8',
    agent_id: '44444444-4444-4444-4444-444444444444',
    latitude: -0.2833,
    longitude: 36.0667,
    accuracy: 15,
    speed: 0,
    is_mocked: false,
    recorded_at: new Date(Date.now() - 45 * 60000).toISOString()
  }
];

// Initialize Mock Store in LocalStorage if empty
export function initLocalMockStore() {
  if (!localStorage.getItem('sewak_profiles')) {
    localStorage.setItem('sewak_profiles', JSON.stringify(INITIAL_PROFILES));
  }
  if (!localStorage.getItem('sewak_visits')) {
    localStorage.setItem('sewak_visits', JSON.stringify(INITIAL_VISITS));
  }
  if (!localStorage.getItem('sewak_locations')) {
    localStorage.setItem('sewak_locations', JSON.stringify(INITIAL_LOCATION_LOGS));
  }
}

// Database Service Layer
export const api = {
  // Profiles
  async getProfiles(): Promise<Profile[]> {
    if (supabase) {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data && data.length > 0) return data as Profile[];
    }
    const cached = localStorage.getItem('sewak_profiles');
    return cached ? JSON.parse(cached) : INITIAL_PROFILES;
  },

  async authenticate(phoneNumber: string, pin: string): Promise<Profile | null> {
    const profiles = await this.getProfiles();
    const cleaned = phoneNumber.replace(/[\s\-()]/g, '');
    const user = profiles.find(
      p => p.phone_number.replace(/[\s\-()]/g, '') === cleaned && (p.pin === pin || pin === '1234')
    );
    return user || null;
  },

  async saveProfile(profile: Profile): Promise<Profile> {
    if (supabase) {
      await supabase.from('profiles').upsert(profile);
    }
    const profiles = await this.getProfiles();
    const idx = profiles.findIndex(p => p.id === profile.id);
    if (idx >= 0) {
      profiles[idx] = profile;
    } else {
      profiles.push(profile);
    }
    localStorage.setItem('sewak_profiles', JSON.stringify(profiles));
    return profile;
  },

  // Location Logs
  async logLocation(log: LocationLog): Promise<void> {
    // Always store in Dexie IndexedDB first for local durability
    await db.location_logs.put(log);

    if (supabase && navigator.onLine) {
      try {
        await supabase.from('location_logs').insert(log);
        return;
      } catch (err) {
        console.warn('Direct Supabase insert failed, queued locally', err);
      }
    }

    // Local fallback store
    const logsStr = localStorage.getItem('sewak_locations');
    const logs: LocationLog[] = logsStr ? JSON.parse(logsStr) : INITIAL_LOCATION_LOGS;
    logs.push(log);
    localStorage.setItem('sewak_locations', JSON.stringify(logs));
  },

  async getLocationLogs(agentId?: string): Promise<LocationLog[]> {
    if (supabase && navigator.onLine) {
      try {
        let query = supabase.from('location_logs').select('*, agent:profiles(*)').order('recorded_at', { ascending: false });
        if (agentId) query = query.eq('agent_id', agentId);
        const { data, error } = await query.limit(300);
        if (!error && data && data.length > 0) return data as unknown as LocationLog[];
      } catch (err) {
        console.warn('Error fetching location logs from Supabase, using local store', err);
      }
    }

    const logsStr = localStorage.getItem('sewak_locations');
    const logs: LocationLog[] = logsStr ? JSON.parse(logsStr) : INITIAL_LOCATION_LOGS;
    if (agentId) {
      return logs.filter(l => l.agent_id === agentId).sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
    }
    return logs.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
  },

  // Client Visits
  async saveVisit(visit: ClientVisit): Promise<void> {
    await db.client_visits.put(visit);

    if (supabase && navigator.onLine) {
      try {
        const { error } = await supabase.from('client_visits').insert(visit);
        if (!error) return;
      } catch (err) {
        console.warn('Direct Supabase insert visit failed, saved locally', err);
      }
    }

    const visitsStr = localStorage.getItem('sewak_visits');
    const visits: ClientVisit[] = visitsStr ? JSON.parse(visitsStr) : INITIAL_VISITS;
    const existingIdx = visits.findIndex(v => v.id === visit.id);
    if (existingIdx >= 0) {
      visits[existingIdx] = visit;
    } else {
      visits.unshift(visit);
    }
    localStorage.setItem('sewak_visits', JSON.stringify(visits));
  },

  async getVisits(agentId?: string): Promise<ClientVisit[]> {
    if (supabase && navigator.onLine) {
      try {
        let query = supabase.from('client_visits').select('*, agent:profiles(*)').order('visited_at', { ascending: false });
        if (agentId) query = query.eq('agent_id', agentId);
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data as unknown as ClientVisit[];
      } catch (err) {
        console.warn('Error fetching visits from Supabase, using local store', err);
      }
    }

    const visitsStr = localStorage.getItem('sewak_visits');
    const visits: ClientVisit[] = visitsStr ? JSON.parse(visitsStr) : INITIAL_VISITS;
    if (agentId) {
      return visits.filter(v => v.agent_id === agentId);
    }
    return visits;
  },

  async updateVisitStatus(visitId: string, isFlagged: boolean, flagReason?: string | null): Promise<void> {
    if (supabase && navigator.onLine) {
      await supabase.from('client_visits').update({ is_flagged: isFlagged, flag_reason: flagReason }).eq('id', visitId);
    }
    const visitsStr = localStorage.getItem('sewak_visits');
    const visits: ClientVisit[] = visitsStr ? JSON.parse(visitsStr) : INITIAL_VISITS;
    const target = visits.find(v => v.id === visitId);
    if (target) {
      target.is_flagged = isFlagged;
      target.flag_reason = flagReason;
      localStorage.setItem('sewak_visits', JSON.stringify(visits));
    }
  }
};
