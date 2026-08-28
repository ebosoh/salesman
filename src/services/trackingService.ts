import { evaluateLocationIntegrity, verifyServerTimeSkew } from './antiSpoofing';
import { isWithinWorkingHours } from './workingHours';
import { fetchClientIp } from './deviceInfo';
import { SyncService } from './syncService';
import type { LocationLog, Profile } from '../types';

export class TrackingService {
  private static watchId: number | null = null;
  private static intervalId: number | null = null;
  private static lastLog: LocationLog | null = null;
  private static currentAgent: Profile | null = null;
  private static listeners: Array<(loc: LocationLog) => void> = [];
  private static statusListeners: Array<(active: boolean, message: string) => void> = [];

  static subscribeLocation(cb: (loc: LocationLog) => void) {
    this.listeners.push(cb);
    if (this.lastLog) cb(this.lastLog);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  static subscribeStatus(cb: (active: boolean, message: string) => void) {
    this.statusListeners.push(cb);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== cb);
    };
  }

  private static notifyStatus(active: boolean, message: string) {
    this.statusListeners.forEach(cb => cb(active, message));
  }

  /**
   * Start tracking field agent during shift hours
   */
  static async startTracking(agent: Profile): Promise<boolean> {
    this.currentAgent = agent;

    // 1. Check working hours (8am - 5pm EAT)
    if (!isWithinWorkingHours()) {
      this.notifyStatus(false, 'Outside working hours (8:00 AM - 5:00 PM EAT). Tracking halted.');
      return false;
    }

    this.stopTracking();

    // 2. Perform initial location capture
    await this.captureAndLogLocation();

    // 3. Set up periodic location logging every 3 minutes (or watchPosition)
    if ('geolocation' in navigator) {
      try {
        this.watchId = navigator.geolocation.watchPosition(
          pos => this.handlePositionUpdate(pos),
          err => {
            console.warn('Geolocation watch error, using interval polling:', err.message);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 15000,
            timeout: 10000
          }
        );
      } catch (err) {
        console.warn('watchPosition setup failed:', err);
      }
    }

    // Interval heartbeat check every 3 minutes
    this.intervalId = window.setInterval(async () => {
      if (!isWithinWorkingHours()) {
        this.stopTracking();
        this.notifyStatus(false, 'Shift ended (5:00 PM EAT). Tracking automatically stopped.');
        return;
      }
      await this.captureAndLogLocation();
    }, 3 * 60 * 1000);

    this.notifyStatus(true, 'Tracking active');
    return true;
  }

  static stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.notifyStatus(false, 'Shift stopped');
  }

  private static async handlePositionUpdate(pos: GeolocationPosition) {
    if (!this.currentAgent) return;
    if (!isWithinWorkingHours()) {
      this.stopTracking();
      return;
    }

    const { serverTime, skewSeconds } = await verifyServerTimeSkew();
    const evaluation = evaluateLocationIntegrity(
      { coords: pos.coords, timestamp: pos.timestamp },
      this.lastLog,
      skewSeconds
    );

    const ip = await fetchClientIp();

    const newLog: LocationLog = {
      id: `loc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      agent_id: this.currentAgent.id,
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      speed: pos.coords.speed !== null ? Math.round(pos.coords.speed * 3.6) : (evaluation.calculatedSpeedKmH || 0),
      is_mocked: evaluation.isMocked || evaluation.isFlagged,
      ip_address: ip,
      recorded_at: serverTime.toISOString()
    };

    this.lastLog = newLog;
    await SyncService.enqueueLocationLog(newLog);
    this.listeners.forEach(cb => cb(newLog));
  }

  /**
   * Manual or periodic trigger to capture current GPS fix
   */
  static async captureAndLogLocation(): Promise<LocationLog | null> {
    if (!this.currentAgent) return null;

    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) {
        // Fallback default coordinates (Nakuru Commercial / Industrial Area)
        const fallbackLog: LocationLog = {
          id: `loc-${Date.now()}`,
          agent_id: this.currentAgent!.id,
          latitude: -0.2827,
          longitude: 36.0673,
          accuracy: 25,
          speed: 0,
          is_mocked: false,
          recorded_at: new Date().toISOString()
        };
        this.lastLog = fallbackLog;
        SyncService.enqueueLocationLog(fallbackLog);
        resolve(fallbackLog);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          await this.handlePositionUpdate(pos);
          resolve(this.lastLog);
        },
        async (err) => {
          console.warn('getCurrentPosition failed:', err.message);
          // Nakuru CBD fallback default
          const fallbackLog: LocationLog = {
            id: `loc-${Date.now()}`,
            agent_id: this.currentAgent!.id,
            latitude: -0.2827,
            longitude: 36.0673,
            accuracy: 50,
            speed: 0,
            is_mocked: false,
            recorded_at: new Date().toISOString()
          };
          this.lastLog = fallbackLog;
          await SyncService.enqueueLocationLog(fallbackLog);
          resolve(fallbackLog);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    });
  }

  static getLastLocation(): LocationLog | null {
    return this.lastLog;
  }
}
