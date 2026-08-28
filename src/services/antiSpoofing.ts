import type { LocationLog, ClientVisit, AntiSpoofingResult } from '../types';

/**
 * Calculates Haversine distance in kilometers between two GPS coordinates
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates velocity in km/h between two timestamped coordinates
 */
export function calculateVelocityKmH(
  prevPoint: { lat: number; lng: number; time: string | Date },
  currentPoint: { lat: number; lng: number; time: string | Date }
): number {
  const distKm = calculateDistanceKm(
    prevPoint.lat,
    prevPoint.lng,
    currentPoint.lat,
    currentPoint.lng
  );

  const prevTimeMs = new Date(prevPoint.time).getTime();
  const currTimeMs = new Date(currentPoint.time).getTime();
  const timeDiffHours = Math.abs(currTimeMs - prevTimeMs) / (1000 * 60 * 60);

  if (timeDiffHours <= 0.0001) {
    // Under 0.36 seconds
    return 0;
  }

  return distKm / timeDiffHours;
}

/**
 * Generates SHA-256 integrity hash for visit payload
 */
export async function generatePayloadHash(payload: Partial<ClientVisit | LocationLog>): Promise<string> {
  const normalizedString = JSON.stringify(payload, Object.keys(payload).sort());
  const encoder = new TextEncoder();
  const data = encoder.encode(normalizedString);
  
  if (crypto && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback simple hash for older environments
  let hash = 0;
  for (let i = 0; i < normalizedString.length; i++) {
    const char = normalizedString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `fallback-${Math.abs(hash).toString(16)}`;
}

/**
 * Fetches server timestamp (NTP/HTTP header) to detect device clock tampering
 */
export async function verifyServerTimeSkew(): Promise<{
  serverTime: Date;
  skewSeconds: number;
  isTampered: boolean;
}> {
  const localTime = Date.now();
  let serverTime: Date = new Date();
  let skewSeconds = 0;

  try {
    // Attempt to fetch from worldtimeapi or current origin headers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch('https://worldtimeapi.org/api/timezone/Africa/Nairobi', {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      serverTime = new Date(data.datetime);
    } else {
      // Fallback: check Date header of response
      const dateHeader = response.headers.get('date');
      if (dateHeader) {
        serverTime = new Date(dateHeader);
      }
    }
  } catch {
    // If offline or network timeout, fall back to current time with 0 skew
    serverTime = new Date(localTime);
  }

  skewSeconds = Math.abs(Math.floor((serverTime.getTime() - localTime) / 1000));
  // Tampered if clock skew exceeds 300 seconds (5 minutes)
  const isTampered = skewSeconds > 300;

  return {
    serverTime,
    skewSeconds,
    isTampered
  };
}

/**
 * Comprehensive anti-spoofing evaluation on a newly captured location
 */
export function evaluateLocationIntegrity(
  currentPos: {
    coords: GeolocationCoordinates;
    timestamp: number;
  },
  lastLog?: LocationLog | null,
  timeSkewSeconds: number = 0
): AntiSpoofingResult {
  const flagReasons: string[] = [];
  let isMocked = false;

  // 1. Check native Geolocation isMocked flag (supported by Chrome on Android)
  const extendedCoords = currentPos.coords as unknown as { isMocked?: boolean; mocked?: boolean };
  if (extendedCoords.isMocked === true || extendedCoords.mocked === true) {
    isMocked = true;
    flagReasons.push('Hardware/Browser reported isMocked=true');
  }

  // 2. Velocity Jump Detection (> 100 km/h)
  let calculatedSpeed: number | undefined = undefined;
  if (lastLog) {
    calculatedSpeed = calculateVelocityKmH(
      { lat: lastLog.latitude, lng: lastLog.longitude, time: lastLog.recorded_at },
      { lat: currentPos.coords.latitude, lng: currentPos.coords.longitude, time: new Date(currentPos.timestamp).toISOString() }
    );

    if (calculatedSpeed > 100) {
      flagReasons.push(
        `Irregular velocity jump: ${calculatedSpeed.toFixed(1)} km/h (> 100 km/h limit)`
      );
    }
  }

  // 3. Accuracy threshold check
  const accuracy = currentPos.coords.accuracy;
  if (accuracy > 350) {
    flagReasons.push(`Low GPS accuracy: ±${Math.round(accuracy)}m (limit 350m)`);
  }

  // 4. Time skew tampering check
  if (timeSkewSeconds > 300) {
    flagReasons.push(`Device clock tampered: ${timeSkewSeconds}s discrepancy with NTP server`);
  }

  return {
    isMocked,
    isFlagged: flagReasons.length > 0,
    flagReasons,
    calculatedSpeedKmH: calculatedSpeed,
    timeSkewSeconds,
    accuracyMeters: accuracy
  };
}
