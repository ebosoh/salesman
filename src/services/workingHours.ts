/**
 * Working hours enforcement for Kenya Data Protection compliance.
 * Field sales tracking is active strictly between 8:00 AM and 5:00 PM EAT (UTC+3), Mon-Sat.
 */

export function getKenyaNow(): Date {
  const now = new Date();
  // Kenya is UTC+3 (no daylight saving time)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const kenyaTime = new Date(utc + (3600000 * 3));
  return kenyaTime;
}

export function isWithinWorkingHours(date: Date = getKenyaNow()): boolean {
  const day = date.getDay(); // 0 is Sunday
  if (day === 0) {
    // Sunday is non-working by default (or can be configured)
    return false;
  }

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const currentTotalMinutes = hours * 60 + minutes;

  const startMinutes = 8 * 60;   // 8:00 AM (480)
  const endMinutes = 17 * 60;   // 5:00 PM (1020)

  return currentTotalMinutes >= startMinutes && currentTotalMinutes < endMinutes;
}

export function getWorkingHoursStatus(): {
  isWithinHours: boolean;
  eatTimeString: string;
  shiftHoursLabel: string;
  minutesRemaining: number;
  statusMessage: string;
} {
  const kenyaDate = getKenyaNow();
  const isWithin = isWithinWorkingHours(kenyaDate);
  const hours = kenyaDate.getHours();
  const minutes = kenyaDate.getMinutes();
  const currentMinutes = hours * 60 + minutes;
  const endMinutes = 17 * 60; // 5:00 PM

  const timeFormatter = new Intl.DateTimeFormat('en-KE', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Africa/Nairobi'
  });

  const eatTimeString = `${timeFormatter.format(new Date())} EAT`;
  const minutesRemaining = Math.max(0, endMinutes - currentMinutes);

  let statusMessage = '';
  if (kenyaDate.getDay() === 0) {
    statusMessage = 'Sunday - Field sales tracking is offline';
  } else if (currentMinutes < 8 * 60) {
    statusMessage = 'Shift starts at 8:00 AM EAT';
  } else if (currentMinutes >= endMinutes) {
    statusMessage = 'Shift ended at 5:00 PM EAT';
  } else {
    statusMessage = 'Tracking Active (8:00 AM - 5:00 PM EAT)';
  }

  return {
    isWithinHours: isWithin,
    eatTimeString,
    shiftHoursLabel: '8:00 AM - 5:00 PM EAT',
    minutesRemaining,
    statusMessage
  };
}
