import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/supabase';
import type { ClientVisit, Profile } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Store,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export const AdminVisitVerification: React.FC = () => {
  const [visits, setVisits] = useState<ClientVisit[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFlagged, setFilterFlagged] = useState<'all' | 'flagged' | 'verified'>('all');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('all');
  const [inspectingVisit, setInspectingVisit] = useState<ClientVisit | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [v, p] = await Promise.all([api.getVisits(), api.getProfiles()]);
      setVisits(v);
      setProfiles(p);
    } catch (err) {
      console.error('Failed to load visit verification records', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVisits = useMemo(() => {
    return visits.filter((visit) => {
      // Flagged filter
      if (filterFlagged === 'flagged' && !visit.is_flagged) return false;
      if (filterFlagged === 'verified' && visit.is_flagged) return false;

      // Agent filter
      if (selectedAgentId !== 'all' && visit.agent_id !== selectedAgentId) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          visit.shop_name.toLowerCase().includes(q) ||
          visit.physical_location.toLowerCase().includes(q) ||
          visit.phone_number.includes(q) ||
          (visit.flag_reason && visit.flag_reason.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [visits, filterFlagged, selectedAgentId, searchQuery]);

  const toggleFlagStatus = async (visit: ClientVisit) => {
    const nextFlagged = !visit.is_flagged;
    const nextReason = nextFlagged ? 'Manual Admin Flag: Verification rejected' : null;

    await api.updateVisitStatus(visit.id, nextFlagged, nextReason);
    setVisits((prev) =>
      prev.map((v) =>
        v.id === visit.id ? { ...v, is_flagged: nextFlagged, flag_reason: nextReason } : v
      )
    );

    if (inspectingVisit && inspectingVisit.id === visit.id) {
      setInspectingVisit({
        ...inspectingVisit,
        is_flagged: nextFlagged,
        flag_reason: nextReason
      });
    }
  };

  const fieldAgents = profiles.filter((p) => p.role === 'field_agent');
  const totalFlagged = visits.filter((v) => v.is_flagged).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Client Visit Verification Table
            </h1>
            {totalFlagged > 0 && (
              <span className="bg-red-100 text-brand-red border border-red-200 text-xs font-bold px-2.5 py-1 rounded-full">
                {totalFlagged} Anomaly Alerts
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit storefront proof photos, GPS accuracy, and anti-spoofing flags
          </p>
        </div>

        <button
          onClick={loadData}
          className="self-start sm:self-auto flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition min-h-[40px]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Table</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by hardware shop name, phone number, location, or flag reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue min-h-[44px]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Agent Filter */}
          <select
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-blue min-h-[44px]"
          >
            <option value="all">All Field Agents</option>
            {fieldAgents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.full_name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setFilterFlagged('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                filterFlagged === 'all' ? 'bg-brand-blue text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({visits.length})
            </button>
            <button
              onClick={() => setFilterFlagged('flagged')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                filterFlagged === 'flagged' ? 'bg-brand-red text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🚨 Flagged ({totalFlagged})
            </button>
            <button
              onClick={() => setFilterFlagged('verified')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                filterFlagged === 'verified' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ✅ Verified ({visits.length - totalFlagged})
            </button>
          </div>
        </div>
      </div>

      {/* Main Verification Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading visit records...</div>
        ) : filteredVisits.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Store className="w-10 h-10 mx-auto text-slate-300" />
            <h4 className="font-bold text-sm text-slate-800">No matching visits found</h4>
            <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Status & Flag</th>
                  <th className="py-3.5 px-4">Store / Hardware</th>
                  <th className="py-3.5 px-4">Field Agent</th>
                  <th className="py-3.5 px-4">Physical Location</th>
                  <th className="py-3.5 px-4">Timestamp (EAT)</th>
                  <th className="py-3.5 px-4">Proof Photo</th>
                  <th className="py-3.5 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredVisits.map((visit) => {
                  const agent = profiles.find((p) => p.id === visit.agent_id);
                  return (
                    <tr
                      key={visit.id}
                      onClick={() => setInspectingVisit(visit)}
                      className={`hover:bg-slate-50/80 transition cursor-pointer ${
                        visit.is_flagged ? 'bg-red-50/20' : ''
                      }`}
                    >
                      {/* Status / Flag badge */}
                      <td className="py-3.5 px-4">
                        {visit.is_flagged ? (
                          <div className="flex flex-col gap-1 max-w-[200px]">
                            <span className="inline-flex items-center space-x-1 bg-red-100 text-brand-red border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit">
                              <AlertTriangle className="w-3 h-3" />
                              <span>FLAGGED ANOMALY</span>
                            </span>
                            <span className="text-[10px] text-red-700 font-semibold truncate">
                              {visit.flag_reason}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>VERIFIED</span>
                          </span>
                        )}
                      </td>

                      {/* Store Name & Phone */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{visit.shop_name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{visit.phone_number}</p>
                      </td>

                      {/* Agent */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-[10px]">
                            {agent?.full_name ? agent.full_name.charAt(0) : 'A'}
                          </div>
                          <span className="font-semibold text-slate-800">
                            {agent?.full_name || 'Field Agent'}
                          </span>
                        </div>
                      </td>

                      {/* Physical Location */}
                      <td className="py-3.5 px-4">
                        <p className="truncate max-w-xs">{visit.physical_location}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {visit.latitude.toFixed(4)}, {visit.longitude.toFixed(4)}
                        </p>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        {new Date(visit.visited_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      {/* Photo Thumbnail */}
                      <td className="py-3.5 px-4">
                        {visit.photo_url ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                            <img
                              src={visit.photo_url}
                              alt={visit.shop_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No Photo</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleFlagStatus(visit)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                            visit.is_flagged
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300'
                              : 'bg-red-50 hover:bg-red-100 text-brand-red border-red-300'
                          }`}
                        >
                          {visit.is_flagged ? 'Clear / Verify' : 'Flag Anomaly'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Visit Detail Modal */}
      {inspectingVisit && (
        <div
          onClick={() => setInspectingVisit(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-xl text-slate-900">{inspectingVisit.shop_name}</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {new Date(inspectingVisit.visited_at).toLocaleString()} EAT
                </p>
              </div>
              <button
                onClick={() => setInspectingVisit(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-base font-bold"
              >
                ✕
              </button>
            </div>

            {inspectingVisit.is_flagged && (
              <div className="bg-red-50 border border-red-200 text-brand-red p-3.5 rounded-2xl text-xs font-bold space-y-1">
                <div className="flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>ANTI-SPOOFING ANOMALY FLAG</span>
                </div>
                <p className="font-normal text-red-700">{inspectingVisit.flag_reason}</p>
              </div>
            )}

            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p>📍 <strong>Physical Location:</strong> {inspectingVisit.physical_location}</p>
              <p>📞 <strong>Customer Phone:</strong> {inspectingVisit.phone_number}</p>
              <p>📱 <strong>Hardware Device:</strong> {inspectingVisit.device_name}</p>
              <p>🌐 <strong>Network IP:</strong> {inspectingVisit.device_ip}</p>
              <p className="font-mono text-[11px] text-slate-500">
                GPS Fix: {inspectingVisit.latitude.toFixed(6)}, {inspectingVisit.longitude.toFixed(6)}
              </p>
              {inspectingVisit.integrity_hash && (
                <p className="font-mono text-[10px] text-slate-400 truncate">
                  SHA-256 Hash: {inspectingVisit.integrity_hash}
                </p>
              )}
              {inspectingVisit.comments && (
                <div className="mt-2 pt-2 border-t border-slate-200 italic">
                  "{inspectingVisit.comments}"
                </div>
              )}
            </div>

            {inspectingVisit.photo_url && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900">
                <img
                  src={inspectingVisit.photo_url}
                  alt={inspectingVisit.shop_name}
                  className="w-full h-auto object-contain max-h-72"
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => toggleFlagStatus(inspectingVisit)}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs transition min-h-[44px] ${
                  inspectingVisit.is_flagged
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                    : 'bg-brand-red hover:bg-brand-red-dark text-white shadow-md'
                }`}
              >
                {inspectingVisit.is_flagged ? 'Clear & Mark Verified' : 'Flag as Spoofed / Anomaly'}
              </button>
              <button
                onClick={() => setInspectingVisit(null)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs min-h-[44px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
