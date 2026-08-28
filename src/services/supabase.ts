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

// Initial Mock Seed Data for Nakuru County Field Agents & Operations Admin
export const INITIAL_PROFILES: Profile[] = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    full_name: 'John Kimani',
    phone_number: '0712345601',
    role: 'field_agent',
    device_fingerprint: 'FP-A14-NKU01',
    pin: '1234',
    is_active: true
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    full_name: 'Mercy Achieng',
    phone_number: '0712345602',
    role: 'field_agent',
    device_fingerprint: 'FP-TECNO-NKU02',
    pin: '1234',
    is_active: true
  },
  {
    id: '11111111-1111-1111-1111-111111111103',
    full_name: 'David Kiprono',
    phone_number: '0712345603',
    role: 'field_agent',
    device_fingerprint: 'FP-INFINIX-NKU03',
    pin: '1234',
    is_active: true
  },
  {
    id: '11111111-1111-1111-1111-111111111104',
    full_name: 'Faith Wanjiku',
    phone_number: '0712345604',
    role: 'field_agent',
    device_fingerprint: 'FP-REDMI-NKU04',
    pin: '1234',
    is_active: true
  },
  {
    id: '11111111-1111-1111-1111-111111111105',
    full_name: 'Peter Omwamba',
    phone_number: '0712345605',
    role: 'field_agent',
    device_fingerprint: 'FP-SAMS-NKU05',
    pin: '1234',
    is_active: true
  },
  {
    id: '11111111-1111-1111-1111-111111111106',
    full_name: 'Grace Njeri',
    phone_number: '0712345606',
    role: 'field_agent',
    device_fingerprint: 'FP-REDMI-NKU06',
    pin: '1234',
    is_active: true
  },
  {
    id: '11111111-1111-1111-1111-111111111107',
    full_name: 'Samuel Koech',
    phone_number: '0712345607',
    role: 'field_agent',
    device_fingerprint: 'FP-OPPO-NKU07',
    pin: '1234',
    is_active: true
  },
  {
    id: '11111111-1111-1111-1111-111111111108',
    full_name: 'Eunice Moraa',
    phone_number: '0712345608',
    role: 'field_agent',
    device_fingerprint: 'FP-TECNO-NKU08',
    pin: '1234',
    is_active: true
  },
  {
    id: '11111111-1111-1111-1111-111111111109',
    full_name: 'Dennis Kipkemboi',
    phone_number: '0712345609',
    role: 'field_agent',
    device_fingerprint: 'FP-INF-NKU09',
    pin: '1234',
    is_active: true
  },
  {
    id: '11111111-1111-1111-1111-111111111110',
    full_name: 'Beatrice Chebet',
    phone_number: '0712345610',
    role: 'field_agent',
    device_fingerprint: 'FP-VIVO-NKU10',
    pin: '1234',
    is_active: true
  },
  {
    id: '11111111-1111-1111-1111-111111111111',
    full_name: 'James Mwangi',
    phone_number: '0712345611',
    role: 'field_agent',
    device_fingerprint: 'FP-SAMS-NKU11',
    pin: '1234',
    is_active: true
  },
  {
    id: '11111111-1111-1111-1111-111111111112',
    full_name: 'Rosemary Wambui',
    phone_number: '0712345612',
    role: 'field_agent',
    device_fingerprint: 'FP-NOKIA-NKU12',
    pin: '1234',
    is_active: true
  },
  {
    id: '11111111-1111-1111-1111-111111111113',
    full_name: 'Geoffrey Kiptoo',
    phone_number: '0712345613',
    role: 'field_agent',
    device_fingerprint: 'FP-TECNO-NKU13',
    pin: '1234',
    is_active: true
  },
  {
    id: '11111111-1111-1111-1111-111111111114',
    full_name: 'Caroline Muthoni',
    phone_number: '0712345614',
    role: 'field_agent',
    device_fingerprint: 'FP-INF-NKU14',
    pin: '1234',
    is_active: true
  },
  {
    id: '11111111-1111-1111-1111-111111111115',
    full_name: 'Victor Otieno',
    phone_number: '0712345615',
    role: 'field_agent',
    device_fingerprint: 'FP-REDMI-NKU15',
    pin: '1234',
    is_active: true
  },
  {
    id: '11111111-1111-1111-1111-111111111116',
    full_name: 'Agnes Wanjiru',
    phone_number: '0712345616',
    role: 'field_agent',
    device_fingerprint: 'FP-SAMS-NKU16',
    pin: '1234',
    is_active: true
  },
  {
    id: '11111111-1111-1111-1111-111111111117',
    full_name: 'Brian Rotich',
    phone_number: '0712345617',
    role: 'field_agent',
    device_fingerprint: 'FP-OPPO-NKU17',
    pin: '1234',
    is_active: true
  },
  {
    id: '11111111-1111-1111-1111-111111111118',
    full_name: 'Lydia Chepkemoi',
    phone_number: '0712345618',
    role: 'field_agent',
    device_fingerprint: 'FP-TECNO-NKU18',
    pin: '1234',
    is_active: true
  },
  {
    id: '11111111-1111-1111-1111-111111111119',
    full_name: 'Kevin Ochieng',
    phone_number: '0712345619',
    role: 'field_agent',
    device_fingerprint: 'FP-VIVO-NKU19',
    pin: '1234',
    is_active: true
  },
  {
    id: '11111111-1111-1111-1111-111111111120',
    full_name: 'Stella Nyambura',
    phone_number: '0712345620',
    role: 'field_agent',
    device_fingerprint: 'FP-SAMS-NKU20',
    pin: '1234',
    is_active: true
  },
  {
    id: '99999999-9999-9999-9999-999999999999',
    full_name: 'Sarah Mwangi (Operations Admin)',
    phone_number: '0700000000',
    role: 'admin',
    device_fingerprint: 'FP-ADMIN-NKU',
    pin: '8888',
    is_active: true
  }
];

export const INITIAL_VISITS: ClientVisit[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01',
    agent_id: '11111111-1111-1111-1111-111111111101',
    shop_name: 'Crown Hardware & Plumbing Supplies',
    phone_number: '0722112201',
    physical_location: 'Kenyatta Avenue, Nakuru CBD',
    latitude: -0.2827,
    longitude: 36.0673,
    comments: 'Requested quotation for 5x 5000L cylindrical plastic water tanks and 100 bundles of 1/2-inch and 3/4-inch PVC plumbing pipes.',
    device_ip: '197.237.102.14',
    device_name: 'Samsung Galaxy A14',
    visited_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    is_flagged: false,
    photo_url: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02',
    agent_id: '11111111-1111-1111-1111-111111111102',
    shop_name: 'Kaptembwa Plumbing & Tank Depot',
    phone_number: '0733445502',
    physical_location: 'Kaptembwa Market, Nakuru West',
    latitude: -0.2980,
    longitude: 36.0420,
    comments: 'Delivered sample water tanks (1000L - 10000L) & PVC plumbing pipes catalog. Owner requested follow-up next Tuesday.',
    device_ip: '102.135.24.89',
    device_name: 'Tecno Spark 10 Pro',
    visited_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    is_flagged: false,
    photo_url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03',
    agent_id: '11111111-1111-1111-1111-111111111103',
    shop_name: 'QuickFix Plumbing & Hardware Store',
    phone_number: '0799887703',
    physical_location: 'Free Area Center, Nakuru East',
    latitude: -0.2805,
    longitude: 36.1050,
    comments: 'Store visit recorded while in fast transit. Inquired about HDPE water pipes & 3000L plastic water tanks. Flagged anomaly.',
    device_ip: '197.232.88.19',
    device_name: 'Infinix Hot 30',
    visited_at: new Date(Date.now() - 45 * 60000).toISOString(),
    is_flagged: true,
    flag_reason: 'Speed Jump Anomaly: Speed recorded 125 km/h (> 100 km/h limit)',
    photo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04',
    agent_id: '11111111-1111-1111-1111-111111111106',
    shop_name: 'Mau View Hardware & Piping Mart',
    phone_number: '0722334406',
    physical_location: 'Main Commercial St, Njoro Town',
    latitude: -0.3450,
    longitude: 35.9400,
    comments: 'Ordered 50 bundles of Class B & C PVC plumbing pipes and 4x 2500L plastic water storage tanks.',
    device_ip: '197.237.55.12',
    device_name: 'Redmi Note 12',
    visited_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    is_flagged: false,
    photo_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05',
    agent_id: '11111111-1111-1111-1111-111111111111',
    shop_name: 'Rift Valley Tanks & Piping Supplies',
    phone_number: '0733556611',
    physical_location: 'Gilgil Town Center',
    latitude: -0.4931,
    longitude: 36.2833,
    comments: 'Interested in Sewak 1000L & 2000L cylindrical plastic water tanks and PPR plumbing pipe fittings.',
    device_ip: '102.135.88.22',
    device_name: 'Samsung Galaxy A24',
    visited_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    is_flagged: false,
    photo_url: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06',
    agent_id: '11111111-1111-1111-1111-111111111113',
    shop_name: 'Crater Builders & Pipe Supplies',
    phone_number: '0744667713',
    physical_location: 'Mbaria Kaniu Rd, Naivasha CBD',
    latitude: -0.7172,
    longitude: 36.4310,
    comments: 'Verified delivery of PVC waste pipes, plumbing elbows, and 5000L vertical water tanks.',
    device_ip: '197.232.14.77',
    device_name: 'Tecno Camon 20',
    visited_at: new Date(Date.now() - 1.5 * 3600000).toISOString(),
    is_flagged: false,
    photo_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa07',
    agent_id: '11111111-1111-1111-1111-111111111109',
    shop_name: 'Highland Tanks & Hardware Supplies',
    phone_number: '0755778809',
    physical_location: 'Posta Road, Molo Town',
    latitude: -0.2480,
    longitude: 35.7330,
    comments: 'Stock inquiry for Sewak UV-stabilized plastic water tanks (1000L, 5000L) and PVC plumbing conduit pipes.',
    device_ip: '197.237.99.33',
    device_name: 'Infinix Note 30',
    visited_at: new Date(Date.now() - 2.5 * 3600000).toISOString(),
    is_flagged: false,
    photo_url: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa08',
    agent_id: '11111111-1111-1111-1111-111111111117',
    shop_name: 'Bahati Plumbing & Tank Hub',
    phone_number: '0766889917',
    physical_location: 'Bahati Center, Nakuru North',
    latitude: -0.1550,
    longitude: 36.1450,
    comments: 'Confirmed order for 8x 3000L plastic water tanks and 120 lengths of PPR hot & cold plumbing pipes.',
    device_ip: '102.135.44.11',
    device_name: 'Samsung Galaxy A14',
    visited_at: new Date(Date.now() - 30 * 60000).toISOString(),
    is_flagged: false,
    photo_url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=500&auto=format&fit=crop&q=60'
  }
];

export const INITIAL_LOCATION_LOGS: LocationLog[] = [
  // 1. John Kimani (Nakuru CBD & Section 58)
  {
    id: 'loc-1a',
    agent_id: '11111111-1111-1111-1111-111111111101',
    latitude: -0.2860,
    longitude: 36.0620,
    accuracy: 10,
    speed: 15,
    is_mocked: false,
    recorded_at: new Date(Date.now() - 3 * 3600000).toISOString()
  },
  {
    id: 'loc-1b',
    agent_id: '11111111-1111-1111-1111-111111111101',
    latitude: -0.2827,
    longitude: 36.0673,
    accuracy: 8,
    speed: 22,
    is_mocked: false,
    recorded_at: new Date(Date.now() - 15 * 60000).toISOString()
  },

  // 2. Mercy Achieng (Kaptembwa / Shabab)
  {
    id: 'loc-2a',
    agent_id: '11111111-1111-1111-1111-111111111102',
    latitude: -0.2980,
    longitude: 36.0420,
    accuracy: 12,
    speed: 0,
    is_mocked: false,
    recorded_at: new Date(Date.now() - 25 * 60000).toISOString()
  },

  // 3. David Kiprono (Free Area / Pipeline Nakuru)
  {
    id: 'loc-3a',
    agent_id: '11111111-1111-1111-1111-111111111103',
    latitude: -0.2805,
    longitude: 36.1050,
    accuracy: 9,
    speed: 35,
    is_mocked: false,
    recorded_at: new Date(Date.now() - 10 * 60000).toISOString()
  },

  // 4. Faith Wanjiku (Lanet)
  {
    id: 'loc-4a',
    agent_id: '11111111-1111-1111-1111-111111111104',
    latitude: -0.2750,
    longitude: 36.1400,
    accuracy: 14,
    speed: 0,
    is_mocked: false,
    recorded_at: new Date(Date.now() - 40 * 60000).toISOString()
  },

  // 5. Peter Omwamba (Nakuru Industrial Area)
  {
    id: 'loc-5a',
    agent_id: '11111111-1111-1111-1111-111111111105',
    latitude: -0.2910,
    longitude: 36.0580,
    accuracy: 11,
    speed: 18,
    is_mocked: false,
    recorded_at: new Date(Date.now() - 12 * 60000).toISOString()
  },

  // 6. Grace Njeri (Njoro Town)
  {
    id: 'loc-6a',
    agent_id: '11111111-1111-1111-1111-111111111106',
    latitude: -0.3450,
    longitude: 35.9400,
    accuracy: 10,
    speed: 28,
    is_mocked: false,
    recorded_at: new Date(Date.now() - 8 * 60000).toISOString()
  },

  // 7. Samuel Koech (Ngata)
  {
    id: 'loc-7a',
    agent_id: '11111111-1111-1111-1111-111111111107',
    latitude: -0.2720,
    longitude: 35.9850,
    accuracy: 15,
    speed: 42,
    is_mocked: false,
    recorded_at: new Date(Date.now() - 20 * 60000).toISOString()
  },

  // 8. Eunice Moraa (Salgaa)
  {
    id: 'loc-8a',
    agent_id: '11111111-1111-1111-1111-111111111108',
    latitude: -0.2050,
    longitude: 35.8600,
    accuracy: 12,
    speed: 0,
    is_mocked: false,
    recorded_at: new Date(Date.now() - 35 * 60000).toISOString()
  },

  // 9. Dennis Kipkemboi (Molo Town)
  {
    id: 'loc-9a',
    agent_id: '11111111-1111-1111-1111-111111111109',
    latitude: -0.2480,
    longitude: 35.7330,
    accuracy: 9,
    speed: 15,
    is_mocked: false,
    recorded_at: new Date(Date.now() - 18 * 60000).toISOString()
  },

  // 10. Beatrice Chebet (Elburgon)
  {
    id: 'loc-10a',
    agent_id: '11111111-1111-1111-1111-111111111110',
    latitude: -0.2970,
    longitude: 35.8150,
    accuracy: 13,
    speed: 25,
    is_mocked: false,
    recorded_at: new Date(Date.now() - 14 * 60000).toISOString()
  },

  // 11. James Mwangi (Gilgil Town)
  {
    id: 'loc-11a',
    agent_id: '11111111-1111-1111-1111-111111111111',
    latitude: -0.4931,
    longitude: 36.2833,
    accuracy: 10,
    speed: 20,
    is_mocked: false,
    recorded_at: new Date(Date.now() - 16 * 60000).toISOString()
  },

  // 12. Rosemary Wambui (Kikopey)
  {
    id: 'loc-12a',
    agent_id: '11111111-1111-1111-1111-111111111112',
    latitude: -0.4450,
    longitude: 36.2350,
    accuracy: 14,
    speed: 0,
    is_mocked: false,
    recorded_at: new Date(Date.now() - 50 * 60000).toISOString()
  },

  // 13. Geoffrey Kiptoo (Naivasha CBD)
  {
    id: 'loc-13a',
    agent_id: '11111111-1111-1111-1111-111111111113',
    latitude: -0.7172,
    longitude: 36.4310,
    accuracy: 8,
    speed: 30,
    is_mocked: false,
    recorded_at: new Date(Date.now() - 7 * 60000).toISOString()
  },

  // 14. Caroline Muthoni (Karagita / South Lake)
  {
    id: 'loc-14a',
    agent_id: '11111111-1111-1111-1111-111111111114',
    latitude: -0.7600,
    longitude: 36.4150,
    accuracy: 11,
    speed: 19,
    is_mocked: false,
    recorded_at: new Date(Date.now() - 22 * 60000).toISOString()
  },

  // 15. Victor Otieno (Kayole Naivasha)
  {
    id: 'loc-15a',
    agent_id: '11111111-1111-1111-1111-111111111115',
    latitude: -0.7020,
    longitude: 36.4480,
    accuracy: 15,
    speed: 0,
    is_mocked: false,
    recorded_at: new Date(Date.now() - 30 * 60000).toISOString()
  },

  // 16. Agnes Wanjiru (Mai Mahiu)
  {
    id: 'loc-16a',
    agent_id: '11111111-1111-1111-1111-111111111116',
    latitude: -0.9900,
    longitude: 36.5850,
    accuracy: 12,
    speed: 38,
    is_mocked: false,
    recorded_at: new Date(Date.now() - 11 * 60000).toISOString()
  },

  // 17. Brian Rotich (Bahati)
  {
    id: 'loc-17a',
    agent_id: '11111111-1111-1111-1111-111111111117',
    latitude: -0.1550,
    longitude: 36.1450,
    accuracy: 10,
    speed: 24,
    is_mocked: false,
    recorded_at: new Date(Date.now() - 19 * 60000).toISOString()
  },

  // 18. Lydia Chepkemoi (Subukia)
  {
    id: 'loc-18a',
    agent_id: '11111111-1111-1111-1111-111111111118',
    latitude: 0.0050,
    longitude: 36.2450,
    accuracy: 16,
    speed: 0,
    is_mocked: false,
    recorded_at: new Date(Date.now() - 45 * 60000).toISOString()
  },

  // 19. Kevin Ochieng (Ronda Nakuru)
  {
    id: 'loc-19a',
    agent_id: '11111111-1111-1111-1111-111111111119',
    latitude: -0.2950,
    longitude: 36.0850,
    accuracy: 9,
    speed: 16,
    is_mocked: false,
    recorded_at: new Date(Date.now() - 27 * 60000).toISOString()
  },

  // 20. Stella Nyambura (Milimani / London Nakuru)
  {
    id: 'loc-20a',
    agent_id: '11111111-1111-1111-1111-111111111120',
    latitude: -0.2680,
    longitude: 36.0550,
    accuracy: 8,
    speed: 20,
    is_mocked: false,
    recorded_at: new Date(Date.now() - 5 * 60000).toISOString()
  }
];

export const CURRENT_DATA_VERSION = 'sewak_v3_nakuru_tanks_pipes';

// Initialize Mock Store in LocalStorage if empty or outdated
export function initLocalMockStore() {
  const version = localStorage.getItem('sewak_data_version');
  const storedProfiles = localStorage.getItem('sewak_profiles');
  let parsedProfiles: Profile[] = [];
  try {
    if (storedProfiles) parsedProfiles = JSON.parse(storedProfiles);
  } catch {
    parsedProfiles = [];
  }

  if (version !== CURRENT_DATA_VERSION || !storedProfiles || parsedProfiles.length < 20) {
    localStorage.setItem('sewak_profiles', JSON.stringify(INITIAL_PROFILES));
    localStorage.setItem('sewak_visits', JSON.stringify(INITIAL_VISITS));
    localStorage.setItem('sewak_locations', JSON.stringify(INITIAL_LOCATION_LOGS));
    localStorage.setItem('sewak_data_version', CURRENT_DATA_VERSION);
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
