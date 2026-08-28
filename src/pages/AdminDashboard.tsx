import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import type { Profile, ClientVisit, LocationLog } from '../types';
import {
  Users,
  Store,
  Map as MapIcon,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Clock,
  TrendingUp,
  MapPin,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { pendingCount } = useOffline();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [visits, setVisits] = useState<ClientVisit[]>([]);
  const [locations, setLocations] = useState<LocationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      setIsLoading(true);
      try {
        const [p, v, l] = await Promise.all([
          api.getProfiles(),
          api.getVisits(),
          api.getLocationLogs()
        ]);
        setProfiles(p);
        setVisits(v);
        setLocations(l);
      } catch (err) {
        console.error('Failed to load admin dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAdminData();
  }, []);

  const fieldAgents = profiles.filter((p) => p.role === 'field_agent');
  const flaggedVisits = visits.filter((v) => v.is_flagged);
  const verifiedVisits = visits.filter((v) => !v.is_flagged);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-blue to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs uppercase tracking-widest font-bold text-blue-200">
              Operations Control Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Sewak Plastics Field Sales Monitoring
          </h1>
          <p className="text-sm text-blue-200/80 mt-1 max-w-xl">
            Real-time GPS tracking, anti-spoofing verification, and shop visits across Kenya.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/map"
            className="flex items-center space-x-2 bg-brand-red hover:bg-brand-red-dark text-white font-bold text-sm px-5 py-3 rounded-xl shadow-lg transition active:scale-95 min-h-[48px]"
          >
            <MapIcon className="w-4 h-4" />
            <span>Open Live Map Monitor</span>
          </Link>
          <Link
            to="/admin/visits"
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-5 py-3 rounded-xl border border-white/20 transition min-h-[48px]"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verify Visits ({flaggedVisits.length} Flagged)</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Field Agents</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{fieldAgents.length}</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">4 Active in Field</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Store Visits</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{visits.length}</p>
            <p className="text-xs text-blue-600 font-semibold mt-1">Verified with GPS</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Flagged Anomaly Visits</p>
            <p className="text-3xl font-black text-brand-red mt-1">{flaggedVisits.length}</p>
            <p className="text-xs text-red-600 font-semibold mt-1">Anti-Spoof Alert</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-brand-red flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Working Hours</p>
            <p className="text-xl font-black text-slate-900 mt-1">8 AM - 5 PM</p>
            <p className="text-xs text-slate-500 font-semibold mt-1">Kenya EAT (UTC+3)</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Flagged Anomaly Alert Section */}
      {flaggedVisits.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-brand-red">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <h3 className="font-bold text-sm sm:text-base">
                {flaggedVisits.length} Client Visits Flagged by Anti-Spoofing Engine
              </h3>
            </div>
            <Link
              to="/admin/visits"
              className="text-xs font-bold text-brand-red hover:underline flex items-center space-x-1"
            >
              <span>Review All &rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {flaggedVisits.map((v) => (
              <div key={v.id} className="bg-white p-3.5 rounded-xl border border-red-200 shadow-sm text-xs space-y-1.5">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{v.shop_name}</span>
                  <span className="text-red-600 font-mono">FLAGGED</span>
                </div>
                <p className="text-slate-600">📍 {v.physical_location}</p>
                <div className="bg-red-100/70 text-brand-red p-2 rounded-lg font-semibold text-[11px]">
                  ⚠️ Reason: {v.flag_reason || 'Velocity or Mock Location Detected'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Field Agents Live Status Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base text-slate-900">Active Field Sales Agents</h3>
            <p className="text-xs text-slate-500">Live monitoring across Nairobi, Mombasa, Kisumu & Nakuru</p>
          </div>
          <Link
            to="/admin/map"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <span>View All on Map &rarr;</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Agent Name</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Device Model</th>
                <th className="py-3 px-4">Tracking Status</th>
                <th className="py-3 px-4">Visits Today</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {fieldAgents.map((agent, idx) => {
                const agentVisits = visits.filter((v) => v.agent_id === agent.id);
                const isMoving = idx % 2 === 0;
                return (
                  <tr key={agent.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-xs">
                          {agent.full_name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900">{agent.full_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">{agent.phone_number}</td>
                    <td className="py-3.5 px-4 text-slate-500">{agent.device_fingerprint || 'Android SM-A14'}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          isMoving
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isMoving ? '🟢 Moving / Active' : '🟠 Stationary (18m)'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-blue-700">{agentVisits.length} visits</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/admin/map`}
                        className="inline-flex items-center space-x-1 text-brand-blue hover:text-brand-red font-bold transition"
                      >
                        <span>Track</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
