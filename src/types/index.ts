export type UserRole = 'field_agent' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  phone_number: string;
  role: UserRole;
  device_fingerprint?: string;
  is_active: boolean;
  pin?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LocationLog {
  id: string;
  agent_id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number | null;
  is_mocked: boolean;
  ip_address?: string;
  recorded_at: string;
  is_synced_offline?: boolean;
  created_at?: string;
  agent?: Profile;
}

export interface ClientVisit {
  id: string;
  agent_id: string;
  shop_name: string;
  phone_number: string;
  physical_location: string;
  latitude: number;
  longitude: number;
  comments: string;
  device_ip: string;
  device_name: string;
  visited_at: string;
  photo_url?: string;
  is_flagged: boolean;
  flag_reason?: string | null;
  integrity_hash?: string;
  is_synced_offline?: boolean;
  created_at?: string;
  agent?: Profile;
}

export interface OfflineQueueItem {
  id: string;
  type: 'LOCATION_LOG' | 'CLIENT_VISIT';
  payload: LocationLog | ClientVisit;
  integrity_hash: string;
  created_at: string;
  retry_count: number;
  status: 'pending' | 'syncing' | 'failed';
  error_message?: string;
}

export interface ShiftStatus {
  isClockedIn: boolean;
  clockInTime: string | null;
  clockOutTime: string | null;
  isWithinWorkingHours: boolean;
  eatTimeString: string;
  remainingMinutesToday: number;
}

export interface AntiSpoofingResult {
  isMocked: boolean;
  isFlagged: boolean;
  flagReasons: string[];
  calculatedSpeedKmH?: number;
  timeSkewSeconds?: number;
  accuracyMeters?: number;
}

export interface AgentRealTimeState {
  profile: Profile;
  lastLocation?: LocationLog;
  todayVisits: ClientVisit[];
  todayLocations: LocationLog[];
  status: 'moving' | 'stationary' | 'offline' | 'clocked_out';
  stationaryDurationMinutes?: number;
  lastSeenAgoMinutes?: number;
}
