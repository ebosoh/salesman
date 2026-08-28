import Dexie, { type Table } from 'dexie';
import type { LocationLog, ClientVisit, OfflineQueueItem, Profile } from '../types';

export interface OfflinePhoto {
  id: string;
  visit_id: string;
  data_url: string;
  created_at: string;
}

export class SewakDatabase extends Dexie {
  location_logs!: Table<LocationLog, string>;
  client_visits!: Table<ClientVisit, string>;
  sync_queue!: Table<OfflineQueueItem, string>;
  offline_photos!: Table<OfflinePhoto, string>;
  cached_profiles!: Table<Profile, string>;

  constructor() {
    super('SewakSalesmanDB');
    this.version(1).stores({
      location_logs: 'id, agent_id, recorded_at, is_synced_offline',
      client_visits: 'id, agent_id, visited_at, is_flagged, is_synced_offline',
      sync_queue: 'id, type, created_at, status',
      offline_photos: 'id, visit_id, created_at',
      cached_profiles: 'id, phone_number, role'
    });
  }
}

export const db = new SewakDatabase();

// Helper functions for offline storage
export async function getPendingQueueCount(): Promise<number> {
  try {
    return await db.sync_queue.where('status').equals('pending').count();
  } catch (err) {
    console.error('Failed to get pending queue count', err);
    return 0;
  }
}

export async function clearAllLocalData(): Promise<void> {
  await db.location_logs.clear();
  await db.client_visits.clear();
  await db.sync_queue.clear();
  await db.offline_photos.clear();
}
