import { db } from './db';
import { api, supabase, isSupabaseConfigured } from './supabase';
import { generatePayloadHash } from './antiSpoofing';
import type { ClientVisit, LocationLog, OfflineQueueItem } from '../types';

export class SyncService {
  private static isSyncing = false;

  /**
   * Enqueue a client visit into offline IndexedDB storage with SHA-256 integrity hash
   */
  static async enqueueVisit(visit: ClientVisit): Promise<void> {
    const integrityHash = await generatePayloadHash({
      agent_id: visit.agent_id,
      shop_name: visit.shop_name,
      phone_number: visit.phone_number,
      physical_location: visit.physical_location,
      latitude: visit.latitude,
      longitude: visit.longitude,
      visited_at: visit.visited_at
    });

    const visitWithHash: ClientVisit = {
      ...visit,
      integrity_hash: integrityHash,
      is_synced_offline: true
    };

    // Save to local database
    await db.client_visits.put(visitWithHash);

    // Save to sync queue
    const queueItem: OfflineQueueItem = {
      id: visit.id,
      type: 'CLIENT_VISIT',
      payload: visitWithHash,
      integrity_hash: integrityHash,
      created_at: new Date().toISOString(),
      retry_count: 0,
      status: 'pending'
    };

    await db.sync_queue.put(queueItem);

    // Attempt immediate sync if online
    if (navigator.onLine) {
      this.syncPendingQueue();
    }
  }

  /**
   * Enqueue a location log into offline IndexedDB
   */
  static async enqueueLocationLog(log: LocationLog): Promise<void> {
    const integrityHash = await generatePayloadHash({
      agent_id: log.agent_id,
      latitude: log.latitude,
      longitude: log.longitude,
      accuracy: log.accuracy,
      recorded_at: log.recorded_at
    });

    const logWithHash: LocationLog = {
      ...log,
      is_synced_offline: true
    };

    await db.location_logs.put(logWithHash);

    const queueItem: OfflineQueueItem = {
      id: log.id,
      type: 'LOCATION_LOG',
      payload: logWithHash,
      integrity_hash: integrityHash,
      created_at: new Date().toISOString(),
      retry_count: 0,
      status: 'pending'
    };

    await db.sync_queue.put(queueItem);

    if (navigator.onLine) {
      this.syncPendingQueue();
    }
  }

  /**
   * Process all pending items in the IndexedDB sync queue
   */
  static async syncPendingQueue(): Promise<{ syncedCount: number; failedCount: number }> {
    if (this.isSyncing || !navigator.onLine) {
      return { syncedCount: 0, failedCount: 0 };
    }

    this.isSyncing = true;
    let syncedCount = 0;
    let failedCount = 0;

    try {
      const pendingItems = await db.sync_queue
        .where('status')
        .equals('pending')
        .toArray();

      for (const item of pendingItems) {
        try {
          // 1. Verify Data Integrity Hash before sending
          let expectedHash = '';
          if (item.type === 'CLIENT_VISIT') {
            const v = item.payload as ClientVisit;
            expectedHash = await generatePayloadHash({
              agent_id: v.agent_id,
              shop_name: v.shop_name,
              phone_number: v.phone_number,
              physical_location: v.physical_location,
              latitude: v.latitude,
              longitude: v.longitude,
              visited_at: v.visited_at
            });
          } else {
            const l = item.payload as LocationLog;
            expectedHash = await generatePayloadHash({
              agent_id: l.agent_id,
              latitude: l.latitude,
              longitude: l.longitude,
              accuracy: l.accuracy,
              recorded_at: l.recorded_at
            });
          }

          // If hash mismatch occurs, someone altered local storage
          if (expectedHash !== item.integrity_hash) {
            console.error('Data Integrity Violation! Queue item hash mismatch for ID:', item.id);
            if (item.type === 'CLIENT_VISIT') {
              (item.payload as ClientVisit).is_flagged = true;
              (item.payload as ClientVisit).flag_reason = 'Offline data tampering detected (SHA-256 hash mismatch)';
            }
          }

          // 2. Dispatch to Supabase / Backend API
          if (isSupabaseConfigured && supabase) {
            if (item.type === 'CLIENT_VISIT') {
              const visitPayload = item.payload as ClientVisit;
              const { error } = await supabase.from('client_visits').upsert(visitPayload);
              if (error) throw error;
            } else if (item.type === 'LOCATION_LOG') {
              const locPayload = item.payload as LocationLog;
              const { error } = await supabase.from('location_logs').upsert(locPayload);
              if (error) throw error;
            }
          } else {
            // Local fallback store persistence
            if (item.type === 'CLIENT_VISIT') {
              await api.saveVisit(item.payload as ClientVisit);
            } else if (item.type === 'LOCATION_LOG') {
              await api.logLocation(item.payload as LocationLog);
            }
          }

          // 3. Mark as synced and delete from queue
          await db.sync_queue.delete(item.id);
          syncedCount++;
        } catch (err: unknown) {
          failedCount++;
          console.error('Failed to sync queue item:', item.id, err);
          const errorMsg = err instanceof Error ? err.message : String(err);
          await db.sync_queue.update(item.id, {
            retry_count: item.retry_count + 1,
            status: item.retry_count >= 5 ? 'failed' : 'pending',
            error_message: errorMsg
          });
        }
      }
    } catch (err) {
      console.error('Sync queue loop error:', err);
    } finally {
      this.isSyncing = false;
    }

    return { syncedCount, failedCount };
  }
}
