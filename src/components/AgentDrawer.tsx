import React from 'react';
import type { MapAgentMarker } from './MapComponent';
import type { ClientVisit } from '../types';
import { X, Phone, MapPin, Navigation, Clock, ShieldCheck, ShieldAlert, Store, ExternalLink } from 'lucide-react';

interface AgentDrawerProps {
  agent: MapAgentMarker | null;
  onClose: () => void;
  onSelectVisit?: (visit: ClientVisit) => void;
}

export const AgentDrawer: React.FC<AgentDrawerProps> = ({
  agent,
  onClose,
  onSelectVisit
}) => {
  if (!agent) return null;

  const sortedLocations = [...(agent.todayLocations || [])].sort(
    (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
  );

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-slideLeft">
      {/* Header */}
      <div className="p-4 bg-brand-blue text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-brand-red flex items-center justify-center font-bold text-white text-base">
            {agent.profile.full_name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-base text-white">{agent.profile.full_name}</h3>
            <p className="text-xs text-blue-200 font-mono">{agent.profile.phone_number}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body: Agent Info & Breadcrumbs */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Status Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Tracking Status:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded text-[11px] uppercase ${
                agent.status === 'moving'
                  ? 'bg-emerald-100 text-emerald-800'
                  : agent.status === 'stationary'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {agent.status === 'moving'
                ? '🟢 Active / Moving'
                : agent.status === 'stationary'
                ? `🟠 Stationary (${agent.stationaryMinutes || 15}m)`
                : '🔴 Offline / GPS Stopped'}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Current Speed:</span>
            <span className="font-bold text-slate-800">{agent.lastLocation.speed || 0} km/h</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Device Fingerprint:</span>
            <span className="font-mono text-slate-700 text-[11px]">{agent.profile.device_fingerprint || 'FP-MOBILE-KE'}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">GPS Accuracy:</span>
            <span className="font-semibold text-emerald-700">±{Math.round(agent.lastLocation.accuracy)}m</span>
          </div>
        </div>

        {/* Action Button */}
        <a
          href={`tel:${agent.profile.phone_number}`}
          className="flex items-center justify-center space-x-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow transition active:scale-95 min-h-[44px]"
        >
          <Phone className="w-4 h-4" />
          <span>Call Agent ({agent.profile.phone_number})</span>
        </a>

        {/* Today's Client Visits */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
              <Store className="w-4 h-4 text-brand-red" />
              <span>Today's Logged Visits ({agent.todayVisits.length})</span>
            </h4>
          </div>

          {agent.todayVisits.length === 0 ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-500">
              No store visits logged yet today.
            </div>
          ) : (
            <div className="space-y-2.5">
              {agent.todayVisits.map(visit => (
                <div
                  key={visit.id}
                  onClick={() => onSelectVisit?.(visit)}
                  className={`p-3 rounded-lg border cursor-pointer hover:border-blue-400 transition text-xs ${
                    visit.is_flagged ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900 truncate">{visit.shop_name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(visit.visited_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] truncate mt-0.5">📍 {visit.physical_location}</p>
                  {visit.is_flagged && (
                    <div className="mt-1 flex items-center space-x-1 text-brand-red font-semibold text-[10px]">
                      <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{visit.flag_reason}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Breadcrumb GPS Travel Log */}
        <div>
          <h4 className="font-bold text-sm text-slate-900 mb-2 flex items-center space-x-1.5">
            <Navigation className="w-4 h-4 text-blue-600" />
            <span>Today's GPS Breadcrumb Trail ({sortedLocations.length})</span>
          </h4>

          <div className="relative pl-5 border-l-2 border-slate-200 space-y-4">
            {sortedLocations.slice(0, 10).map((loc, idx) => {
              const time = new Date(loc.recorded_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              });
              return (
                <div key={loc.id || idx} className="relative text-xs">
                  {/* Dot */}
                  <span
                    className={`absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      idx === 0
                        ? 'bg-emerald-500 ring-2 ring-emerald-200'
                        : loc.is_mocked
                        ? 'bg-red-500'
                        : 'bg-blue-500'
                    }`}
                  ></span>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{time} EAT</span>
                    <span className="font-mono text-[11px] text-slate-500">
                      {loc.speed !== null ? `${loc.speed} km/h` : '0 km/h'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)} (±{Math.round(loc.accuracy)}m)
                  </p>

                  {loc.is_mocked && (
                    <span className="text-[10px] text-red-600 font-semibold">Flagged: Mock GPS or velocity anomaly</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
