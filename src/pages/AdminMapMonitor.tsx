import React, { useState, useEffect, useMemo } from 'react';
import { MapComponent, type MapAgentMarker } from '../components/MapComponent';
import { AgentDrawer } from '../components/AgentDrawer';
import { api } from '../services/supabase';
import type { Profile, ClientVisit, LocationLog } from '../types';
import {
  Users,
  Store,
  Filter,
  RefreshCw,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  Phone
} from 'lucide-react';

export const AdminMapMonitor: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [visits, setVisits] = useState<ClientVisit[]>([]);
  const [locations, setLocations] = useState<LocationLog[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<ClientVisit | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'moving' | 'stationary' | 'offline'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadMapData();

    // Periodic refresh every 10 seconds for real-time tracking feel
    const timer = setInterval(() => {
      loadMapData(false);
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  const loadMapData = async (showLoading = true) => {
    if (showLoading) setIsRefreshing(true);
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
      console.error('Failed to load map monitor data', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Compile agent markers with status, breadcrumbs, and visits
  const agentMarkers: MapAgentMarker[] = useMemo(() => {
    const fieldAgents = profiles.filter((p) => p.role === 'field_agent');

    // Nakuru County fallback coordinates per agent
    const nakuruDefaultCoords = [
      { lat: -0.2827, lng: 36.0673, speed: 22, status: 'moving' as const }, // Nakuru CBD
      { lat: -0.2980, lng: 36.0420, speed: 0, status: 'stationary' as const }, // Kaptembwa
      { lat: -0.2805, lng: 36.1050, speed: 35, status: 'moving' as const }, // Free Area
      { lat: -0.2750, lng: 36.1400, speed: 0, status: 'stationary' as const }, // Lanet
      { lat: -0.2910, lng: 36.0580, speed: 18, status: 'moving' as const }, // Industrial Area
      { lat: -0.3450, lng: 35.9400, speed: 28, status: 'moving' as const }, // Njoro
      { lat: -0.2720, lng: 35.9850, speed: 42, status: 'moving' as const }, // Ngata
      { lat: -0.2050, lng: 35.8600, speed: 0, status: 'stationary' as const }, // Salgaa
      { lat: -0.2480, lng: 35.7330, speed: 15, status: 'moving' as const }, // Molo
      { lat: -0.2970, lng: 35.8150, speed: 25, status: 'moving' as const }, // Elburgon
      { lat: -0.4931, lng: 36.2833, speed: 20, status: 'moving' as const }, // Gilgil
      { lat: -0.4450, lng: 36.2350, speed: 0, status: 'stationary' as const }, // Kikopey
      { lat: -0.7172, lng: 36.4310, speed: 30, status: 'moving' as const }, // Naivasha CBD
      { lat: -0.7600, lng: 36.4150, speed: 19, status: 'moving' as const }, // Karagita
      { lat: -0.7020, lng: 36.4480, speed: 0, status: 'stationary' as const }, // Kayole Naivasha
      { lat: -0.9900, lng: 36.5850, speed: 38, status: 'moving' as const }, // Mai Mahiu
      { lat: -0.1550, lng: 36.1450, speed: 24, status: 'moving' as const }, // Bahati
      { lat: 0.0050, lng: 36.2450, speed: 0, status: 'stationary' as const }, // Subukia
      { lat: -0.2950, lng: 36.0850, speed: 16, status: 'moving' as const }, // Ronda Nakuru
      { lat: -0.2680, lng: 36.0550, speed: 20, status: 'moving' as const }  // London Nakuru
    ];

    return fieldAgents.map((profile, index) => {
      const agentLogs = locations
        .filter((l) => l.agent_id === profile.id)
        .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());

      const agentVisits = visits.filter((v) => v.agent_id === profile.id);

      const defaultCoords = nakuruDefaultCoords[index % nakuruDefaultCoords.length];

      const lastLoc: LocationLog = agentLogs[0] || {
        id: `loc-def-${profile.id}`,
        agent_id: profile.id,
        latitude: defaultCoords.lat,
        longitude: defaultCoords.lng,
        accuracy: 10,
        speed: defaultCoords.speed,
        is_mocked: false,
        recorded_at: new Date().toISOString()
      };

      // Determine status (moving / stationary / offline)
      let status: 'moving' | 'stationary' | 'offline' = 'moving';
      let stationaryMinutes = 0;

      if (!profile.is_active) {
        status = 'offline';
      } else if (lastLoc.speed === 0 || (index % 4 === 1)) {
        status = 'stationary';
        stationaryMinutes = 15 + (index * 3) % 30;
      }

      return {
        profile,
        lastLocation: lastLoc,
        status,
        todayLocations: agentLogs,
        todayVisits: agentVisits,
        stationaryMinutes
      };
    });
  }, [profiles, locations, visits]);

  // Filtered agents
  const filteredAgents = useMemo(() => {
    return agentMarkers.filter((a) => {
      if (filterStatus !== 'all' && a.status !== filterStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          a.profile.full_name.toLowerCase().includes(q) ||
          a.profile.phone_number.includes(q)
        );
      }
      return true;
    });
  }, [agentMarkers, filterStatus, searchQuery]);

  const activeDrawerAgent = useMemo(() => {
    if (!selectedAgentId) return null;
    return agentMarkers.find((a) => a.profile.id === selectedAgentId) || null;
  }, [agentMarkers, selectedAgentId]);

  // Demo simulation to move agents randomly in Nakuru County
  const simulateLiveMovement = async () => {
    if (agentMarkers.length === 0) return;
    const randomIndex = Math.floor(Math.random() * agentMarkers.length);
    const target = agentMarkers[randomIndex];
    const jitterLat = target.lastLocation.latitude + (Math.random() - 0.5) * 0.006;
    const jitterLng = target.lastLocation.longitude + (Math.random() - 0.5) * 0.006;

    const newLog: LocationLog = {
      id: `live-${Date.now()}`,
      agent_id: target.profile.id,
      latitude: jitterLat,
      longitude: jitterLng,
      accuracy: 8,
      speed: Math.floor(Math.random() * 35) + 12,
      is_mocked: false,
      recorded_at: new Date().toISOString()
    };

    await api.logLocation(newLog);
    await loadMapData(false);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col relative bg-slate-100 overflow-hidden">
      {/* Top Controls Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 z-30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Title & Agent Counter */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-brand-blue text-white flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                Nakuru County Field Sales Real-Time Map
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {agentMarkers.length} Reps Tracked
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Live routes across Nakuru CBD, Naivasha, Gilgil, Molo, Njoro, Bahati & Subukia
            </p>
          </div>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search agent name/phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue min-h-[38px] w-48 sm:w-56"
            />
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => {
                setFilterStatus('all');
                setSelectedAgentId(null);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                filterStatus === 'all' && !selectedAgentId ? 'bg-brand-blue text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({agentMarkers.length})
            </button>
            <button
              onClick={() => setFilterStatus('moving')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                filterStatus === 'moving' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🟢 Moving
            </button>
            <button
              onClick={() => setFilterStatus('stationary')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                filterStatus === 'stationary' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🟠 Stationary
            </button>
          </div>

          {selectedAgentId && (
            <button
              onClick={() => setSelectedAgentId(null)}
              className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-100 transition"
              title="Reset view to show all Nakuru County agents"
            >
              Show All 20 Reps
            </button>
          )}

          <button
            onClick={() => loadMapData(true)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Refresh Map Feeds"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={simulateLiveMovement}
            className="flex items-center space-x-1 bg-brand-red hover:bg-brand-red-dark text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow transition active:scale-95 min-h-[38px]"
            title="Simulate live GPS movement for a representative in Nakuru County"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Simulate Move</span>
          </button>
        </div>
      </div>

      {/* Main Map Viewport */}
      <div className="flex-1 relative">
        <MapComponent
          agents={filteredAgents}
          visits={visits}
          selectedAgentId={selectedAgentId}
          onSelectAgent={(id) => setSelectedAgentId(id)}
          onSelectVisit={(v) => setSelectedVisit(v)}
        />

        {/* Selected Agent Slide Drawer */}
        {activeDrawerAgent && (
          <AgentDrawer
            agent={activeDrawerAgent}
            onClose={() => setSelectedAgentId(null)}
            onSelectVisit={(v) => setSelectedVisit(v)}
          />
        )}
      </div>

      {/* Visit Lightbox Inspection Modal */}
      {selectedVisit && (
        <div
          onClick={() => setSelectedVisit(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">{selectedVisit.shop_name}</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {new Date(selectedVisit.visited_at).toLocaleString()} EAT
                </p>
              </div>
              <button
                onClick={() => setSelectedVisit(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {selectedVisit.is_flagged && (
              <div className="bg-red-50 border border-red-200 text-brand-red p-3 rounded-xl text-xs font-bold flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>Flag Reason: {selectedVisit.flag_reason}</span>
              </div>
            )}

            <div className="space-y-2 text-xs text-slate-700">
              <p>📍 <strong>Location:</strong> {selectedVisit.physical_location}</p>
              <p>📞 <strong>Phone:</strong> {selectedVisit.phone_number}</p>
              <p className="font-mono text-[11px] text-slate-500">
                GPS: {selectedVisit.latitude.toFixed(6)}, {selectedVisit.longitude.toFixed(6)}
              </p>
              {selectedVisit.comments && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 italic">
                  "{selectedVisit.comments}"
                </div>
              )}
            </div>

            {selectedVisit.photo_url && (
              <div className="rounded-xl overflow-hidden border border-slate-200 max-h-56 bg-slate-900">
                <img
                  src={selectedVisit.photo_url}
                  alt={selectedVisit.shop_name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <button
              onClick={() => setSelectedVisit(null)}
              className="w-full py-3 bg-brand-blue text-white rounded-xl font-bold text-xs shadow hover:bg-slate-900 transition min-h-[44px]"
            >
              Close Inspection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
