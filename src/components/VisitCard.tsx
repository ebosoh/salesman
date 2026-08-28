import React from 'react';
import type { ClientVisit } from '../types';
import { MapPin, Phone, Clock, AlertTriangle, ShieldCheck, CheckCircle, ExternalLink, Image as ImageIcon } from 'lucide-react';

interface VisitCardProps {
  visit: ClientVisit;
  onSelect?: (visit: ClientVisit) => void;
  onViewPhoto?: (url: string) => void;
}

export const VisitCard: React.FC<VisitCardProps> = ({ visit, onSelect, onViewPhoto }) => {
  const visitTime = new Date(visit.visited_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  const visitDate = new Date(visit.visited_at).toLocaleDateString([], {
    month: 'short',
    day: 'numeric'
  });

  return (
    <div
      onClick={() => onSelect?.(visit)}
      className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition cursor-pointer relative ${
        visit.is_flagged ? 'border-red-300 bg-red-50/20' : 'border-slate-200'
      }`}
    >
      {/* Flagged Badge if Anti-Spoofing failed */}
      {visit.is_flagged ? (
        <div className="flex items-center space-x-1.5 bg-red-100 text-brand-red border border-red-200 px-2.5 py-1 rounded-lg text-xs font-bold mb-3">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-brand-red" />
          <span className="truncate">{visit.flag_reason || 'Anti-Spoofing Anomaly Detected'}</span>
        </div>
      ) : (
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="flex items-center space-x-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified GPS Fix</span>
          </span>
          <span className="text-slate-400">{visitDate}, {visitTime} EAT</span>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-slate-900 truncate">{visit.shop_name}</h3>
          
          <div className="flex items-center space-x-1.5 text-xs text-slate-600 mt-1">
            <MapPin className="w-3.5 h-3.5 text-brand-red flex-shrink-0" />
            <span className="truncate font-medium">{visit.physical_location}</span>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-slate-600 mt-1">
            <Phone className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <a
              href={`tel:${visit.phone_number}`}
              onClick={(e) => e.stopPropagation()}
              className="text-blue-700 hover:underline font-mono"
            >
              {visit.phone_number}
            </a>
          </div>

          {visit.comments && (
            <p className="text-xs text-slate-700 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100 italic line-clamp-2">
              "{visit.comments}"
            </p>
          )}

          <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-400">
            <span>Device: <strong className="text-slate-600">{visit.device_name || 'Mobile'}</strong></span>
            {visit.is_synced_offline && (
              <span className="text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">Offline Synced</span>
            )}
          </div>
        </div>

        {/* Photo thumbnail */}
        {visit.photo_url ? (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onViewPhoto?.(visit.photo_url!);
            }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 cursor-zoom-in relative group"
          >
            <img
              src={visit.photo_url}
              alt={visit.shop_name}
              className="w-full h-full object-cover group-hover:scale-110 transition duration-200"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
              <ExternalLink className="w-4 h-4 text-white" />
            </div>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 flex-shrink-0 text-[10px]">
            <ImageIcon className="w-5 h-5 mb-0.5" />
            <span>No Photo</span>
          </div>
        )}
      </div>
    </div>
  );
};
