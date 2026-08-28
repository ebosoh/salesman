/**
 * Device metadata & client fingerprinting service
 */

export function getDeviceName(): string {
  const ua = navigator.userAgent;

  // Check common Android vendors in Kenya
  if (/SM-[A-Z0-9]+/i.test(ua)) {
    const match = ua.match(/SM-[A-Z0-9]+/i);
    return `Samsung (${match ? match[0] : 'Galaxy'})`;
  }
  if (/Tecno/i.test(ua)) {
    return 'Tecno Mobile Device';
  }
  if (/Infinix/i.test(ua)) {
    return 'Infinix Mobile Device';
  }
  if (/Redmi|Xiaomi/i.test(ua)) {
    return 'Xiaomi / Redmi Device';
  }
  if (/Oppo/i.test(ua)) {
    return 'Oppo Mobile Device';
  }
  if (/iPhone/i.test(ua)) {
    return 'Apple iPhone';
  }
  if (/Android/i.test(ua)) {
    return 'Android Handset';
  }
  if (/Windows/i.test(ua)) {
    return 'Windows Workstation';
  }
  if (/Macintosh/i.test(ua)) {
    return 'Mac OS Device';
  }
  return 'Mobile Browser Client';
}

export function getDeviceFingerprint(): string {
  const cached = localStorage.getItem('sewak_device_fp');
  if (cached) return cached;

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    navigator.hardwareConcurrency || 4,
    new Date().getTimezoneOffset()
  ];

  let hash = 0;
  const str = components.join('###');
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }

  const fp = `FP-${Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')}`;
  localStorage.setItem('sewak_device_fp', fp);
  return fp;
}

export async function fetchClientIp(): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch('https://api.ipify.org?format=json', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return data.ip || '127.0.0.1';
    }
  } catch {
    // ignore
  }
  return 'Local / Cellular IP (Offline)';
}

/**
 * Validates Kenyan Phone Numbers
 * Formats supported: 0712345678, 0112345678, +254712345678, 254712345678
 */
export function validateKenyanPhone(phone: string): { isValid: boolean; formatted: string; error?: string } {
  const cleaned = phone.replace(/[\s\-()]/g, '');

  if (!cleaned) {
    return { isValid: false, formatted: '', error: 'Phone number is required' };
  }

  // Check 07XX or 01XX (10 digits)
  if (/^(07|01)\d{8}$/.test(cleaned)) {
    return { isValid: true, formatted: cleaned };
  }

  // Check +2547XX or +2541XX (13 chars)
  if (/^\+254(7|1)\d{8}$/.test(cleaned)) {
    const standard = '0' + cleaned.slice(4);
    return { isValid: true, formatted: standard };
  }

  // Check 2547XX or 2541XX (12 digits)
  if (/^254(7|1)\d{8}$/.test(cleaned)) {
    const standard = '0' + cleaned.slice(3);
    return { isValid: true, formatted: standard };
  }

  return {
    isValid: false,
    formatted: cleaned,
    error: 'Enter a valid Kenya phone number (e.g. 0712345678 or 0112345678)'
  };
}
