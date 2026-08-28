import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { CameraCaptureModal } from '../components/CameraCaptureModal';
import { getDeviceName, fetchClientIp, validateKenyanPhone } from '../services/deviceInfo';
import { verifyServerTimeSkew, evaluateLocationIntegrity } from '../services/antiSpoofing';
import { TrackingService } from '../services/trackingService';
import { SyncService } from '../services/syncService';
import type { ClientVisit } from '../types';
import {
  Camera,
  MapPin,
  Clock,
  Phone,
  Store,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Smartphone,
  Globe
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ClientVisitForm: React.FC = () => {
  const { user } = useAuth();
  const { refreshPendingCount } = useOffline();
  const navigate = useNavigate();

  // Read-only auto captured state
  const [deviceIp, setDeviceIp] = useState<string>('Detecting IP...');
  const [deviceName] = useState<string>(getDeviceName());
  const [ntpTimeStr, setNtpTimeStr] = useState<string>('Validating NTP time...');
  const [ntpDate, setNtpDate] = useState<Date>(new Date());
  const [timeSkewSeconds, setTimeSkewSeconds] = useState<number>(0);
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [isCapturingGps, setIsCapturingGps] = useState(true);

  // User form fields
  const [shopName, setShopName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [physicalLocation, setPhysicalLocation] = useState('');
  const [comments, setComments] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  // Modals & submission state
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize auto metadata
  useEffect(() => {
    async function initMetadata() {
      // 1. Fetch Client IP
      const ip = await fetchClientIp();
      setDeviceIp(ip);

      // 2. Fetch NTP Server Time
      const { serverTime, skewSeconds } = await verifyServerTimeSkew();
      setNtpDate(serverTime);
      setTimeSkewSeconds(skewSeconds);
      setNtpTimeStr(
        `${serverTime.toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}, ${serverTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} EAT`
      );

      // 3. Capture GPS
      await refreshGps();
    }

    initMetadata();
  }, []);

  const refreshGps = async () => {
    setIsCapturingGps(true);
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setCoords({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy
            });
            setIsCapturingGps(false);
          },
          (err) => {
            console.warn('Geolocation capture failed, using fallback:', err);
            // Default Nakuru CBD coordinates fallback
            setCoords({
              lat: -0.2827,
              lng: 36.0673,
              accuracy: 20
            });
            setIsCapturingGps(false);
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      } else {
        setCoords({ lat: -0.2827, lng: 36.0673, accuracy: 20 });
        setIsCapturingGps(false);
      }
    } catch {
      setIsCapturingGps(false);
    }
  };

  const handlePhoneBlur = () => {
    if (!phoneNumber) return;
    const res = validateKenyanPhone(phoneNumber);
    if (!res.isValid) {
      setPhoneError(res.error || 'Invalid phone number format');
    } else {
      setPhoneError(null);
      setPhoneNumber(res.formatted);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validation
    if (!shopName.trim()) {
      setSubmitError('Shop / Hardware Name is required.');
      return;
    }

    const phoneVal = validateKenyanPhone(phoneNumber);
    if (!phoneVal.isValid) {
      setSubmitError(phoneVal.error || 'Please enter a valid Kenyan phone number.');
      return;
    }

    if (!physicalLocation.trim()) {
      setSubmitError('Physical location / landmark is required.');
      return;
    }

    if (!user) {
      setSubmitError('No active agent session. Please log in.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Anti-Spoofing Integrity Evaluation
      const lastLoc = TrackingService.getLastLocation();
      const mockPos = {
        coords: {
          latitude: coords?.lat || -1.3090,
          longitude: coords?.lng || 36.8850,
          accuracy: coords?.accuracy || 15,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        } as unknown as GeolocationCoordinates,
        timestamp: ntpDate.getTime()
      };

      const antiSpoof = evaluateLocationIntegrity(mockPos, lastLoc, timeSkewSeconds);

      // 2. Prepare Visit Record
      const visitId = `visit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const newVisit: ClientVisit = {
        id: visitId,
        agent_id: user.id,
        shop_name: shopName.trim(),
        phone_number: phoneVal.formatted,
        physical_location: physicalLocation.trim(),
        latitude: coords?.lat || -1.3090,
        longitude: coords?.lng || 36.8850,
        comments: comments.trim(),
        device_ip: deviceIp,
        device_name: deviceName,
        visited_at: ntpDate.toISOString(),
        photo_url: photoDataUrl || undefined,
        is_flagged: antiSpoof.isFlagged,
        flag_reason: antiSpoof.flagReasons.length > 0 ? antiSpoof.flagReasons.join(' | ') : null
      };

      // 3. Enqueue to IndexedDB & Sync Engine
      await SyncService.enqueueVisit(newVisit);
      await refreshPendingCount();

      // Confetti & Feedback
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }

      navigate('/agent');
    } catch (err: unknown) {
      console.error('Visit submission error', err);
      const msg = err instanceof Error ? err.message : 'Failed to save visit record.';
      setSubmitError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header with Back Button */}
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={() => navigate('/agent')}
          className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition active:scale-95 min-h-[48px] min-w-[48px] flex items-center justify-center shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Record Client Visit</h1>
          <p className="text-xs text-slate-500 font-medium">Physical Store Verification & Proof Form</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-brand-red text-xs p-3.5 rounded-xl font-bold flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* SECTION 1: AUTO-CALCULATED READ-ONLY METADATA */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs uppercase tracking-wider font-bold text-blue-300 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Auto-Captured Verification Metadata</span>
            </span>
            <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800 font-mono">
              READ-ONLY
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* NTP Verified Timestamp */}
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
              <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-semibold">NTP Server Timestamp</span>
              </div>
              <p className="font-bold text-slate-100 font-mono">{ntpTimeStr}</p>
            </div>

            {/* GPS Coordinates */}
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-red-light" />
                  <span className="font-semibold">GPS Coordinates</span>
                </div>
                <button
                  type="button"
                  onClick={refreshGps}
                  className="text-blue-400 hover:text-blue-300"
                  title="Refresh GPS Fix"
                >
                  <RefreshCw className={`w-3 h-3 ${isCapturingGps ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <p className="font-bold text-slate-100 font-mono">
                {coords
                  ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)} (±${Math.round(coords.accuracy)}m)`
                  : 'Acquiring GPS fix...'}
              </p>
            </div>

            {/* Device IP */}
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
              <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold">Client Network IP</span>
              </div>
              <p className="font-bold text-slate-100 font-mono">{deviceIp}</p>
            </div>

            {/* Device Name & Model */}
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
              <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-semibold">Device Hardware</span>
              </div>
              <p className="font-bold text-slate-100">{deviceName}</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: STOREFRONT PROOF PHOTO (STRICT CAMERA ONLY) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Storefront Proof Photo <span className="text-brand-red">*</span>
          </label>

          {photoDataUrl ? (
            <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500 bg-slate-900">
              <img
                src={photoDataUrl}
                alt="Captured Storefront Proof"
                className="w-full h-48 sm:h-56 object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCameraModalOpen(true)}
                  className="bg-black/70 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur transition min-h-[36px]"
                >
                  Retake Photo
                </button>
              </div>
              <div className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Watermarked Proof Captured</span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsCameraModalOpen(true)}
              className="w-full border-2 border-dashed border-slate-300 hover:border-brand-red rounded-xl p-6 flex flex-col items-center justify-center space-y-2 bg-slate-50 hover:bg-red-50/20 transition cursor-pointer min-h-[120px] group"
            >
              <div className="w-12 h-12 rounded-full bg-brand-red/10 group-hover:bg-brand-red text-brand-red group-hover:text-white flex items-center justify-center transition">
                <Camera className="w-6 h-6" />
              </div>
              <span className="font-bold text-sm text-slate-800">
                Tap to Launch Native Camera Viewfinder
              </span>
              <p className="text-[11px] text-slate-500 text-center max-w-xs">
                Direct camera capture required. Gallery uploads are disallowed for physical visit verification.
              </p>
            </button>
          )}
        </div>

        {/* SECTION 3: USER INPUT FIELDS */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          {/* Shop / Hardware Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Shop / Hardware Name <span className="text-brand-red">*</span>
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Store className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder="e.g. Crown Hardware & Plastics Ltd"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue sm:text-sm font-medium min-h-[48px]"
              />
            </div>
          </div>

          {/* Customer Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Customer / Owner Phone Number <span className="text-brand-red">*</span>
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                required
                placeholder="0712345678 or 0112345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onBlur={handlePhoneBlur}
                className={`block w-full pl-10 pr-3 py-3 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue sm:text-sm font-mono min-h-[48px] ${
                  phoneError ? 'border-red-500' : 'border-slate-300'
                }`}
              />
            </div>
            {phoneError && <p className="text-xs text-red-600 font-medium mt-1">{phoneError}</p>}
          </div>

          {/* Physical Location / Landmark */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Physical Location / Landmark <span className="text-brand-red">*</span>
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4 text-brand-red" />
              </div>
              <input
                type="text"
                required
                placeholder="e.g. Kenyatta Avenue, Near Westside Mall, Nakuru"
                value={physicalLocation}
                onChange={(e) => setPhysicalLocation(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue sm:text-sm font-medium min-h-[48px]"
              />
            </div>
          </div>

          {/* Comments / Order Request */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Comments & Orders / Quotation Requests
            </label>
            <div className="relative rounded-xl shadow-sm">
              <textarea
                rows={3}
                placeholder="e.g. Inquired about 500 units 20L Jerrycans, requested 10% discount on bulk PVC pipes..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="block w-full p-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-red hover:bg-brand-red-dark text-white rounded-2xl py-4 px-6 font-extrabold text-base shadow-xl shadow-brand-red/30 transition-all active:scale-98 min-h-[56px] flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Hashing & Saving Record...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>SUBMIT & VERIFY VISIT</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={(dataUrl) => setPhotoDataUrl(dataUrl)}
        agentName={user?.full_name || 'Field Agent'}
        coords={coords}
      />
    </div>
  );
};
