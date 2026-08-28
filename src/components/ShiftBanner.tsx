import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWorkingHoursStatus } from '../services/workingHours';
import { Clock, Play, Square, ShieldCheck, MapPin, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ShiftBanner: React.FC = () => {
  const { isClockedIn, clockInTime, clockIn, clockOut, user } = useAuth();
  const [shiftInfo, setShiftInfo] = useState(getWorkingHoursStatus());
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setShiftInfo(getWorkingHoursStatus());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockToggle = async () => {
    setIsProcessing(true);
    try {
      if (isClockedIn) {
        if (window.confirm('Are you sure you want to clock out and end GPS tracking for today?')) {
          clockOut();
        }
      } else {
        const success = await clockIn();
        if (success) {
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.8 }
            });
          } catch {
            // ignore
          }
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-brand-blue to-slate-900 text-white rounded-2xl p-5 shadow-xl border border-blue-900/40 relative overflow-hidden">
      {/* Background brand accent curve */}
      <div className="absolute -right-8 -top-8 w-36 h-36 bg-brand-red/15 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        {/* Left: Shift Meta & Clock */}
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className={`w-2.5 h-2.5 rounded-full ${isClockedIn ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`}></span>
            <span className="text-xs uppercase tracking-wider font-bold text-blue-200">
              {isClockedIn ? 'Shift In Progress' : 'Shift Not Started'}
            </span>
            <span className="text-xs text-blue-300/80">• EAT (UTC+3)</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>{shiftInfo.eatTimeString}</span>
          </h2>

          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-blue-100/90">
            <div className="flex items-center space-x-1 bg-white/10 px-2.5 py-1 rounded-md">
              <Clock className="w-3.5 h-3.5 text-blue-300" />
              <span>{shiftInfo.statusMessage}</span>
            </div>

            {isClockedIn && (
              <div className="flex items-center space-x-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-md font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Anti-Spoof GPS Active</span>
              </div>
            )}
          </div>

          {clockInTime && isClockedIn && (
            <p className="text-[11px] text-blue-300/70 mt-1.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-blue-400" />
              <span>Clocked in at {new Date(clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </p>
          )}
        </div>

        {/* Right: Big Toggle Button */}
        <div className="flex-shrink-0">
          <button
            onClick={handleClockToggle}
            disabled={isProcessing || (!isClockedIn && !shiftInfo.isWithinHours)}
            className={`w-full sm:w-auto px-6 py-4 rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-center space-x-2.5 transition-all shadow-lg min-h-[52px] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              isClockedIn
                ? 'bg-brand-red hover:bg-brand-red-dark text-white shadow-brand-red/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
            }`}
          >
            {isClockedIn ? (
              <>
                <Square className="w-5 h-5 fill-current" />
                <span>CLOCK OUT</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>CLOCK IN SHIFT</span>
              </>
            )}
          </button>
        </div>
      </div>

      {!shiftInfo.isWithinHours && !isClockedIn && (
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center space-x-2 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Tracking is scheduled for 8:00 AM – 5:00 PM EAT. You may browse records offline.</span>
        </div>
      )}
    </div>
  );
};
