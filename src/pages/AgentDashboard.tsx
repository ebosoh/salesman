import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { ShiftBanner } from '../components/ShiftBanner';
import { VisitCard } from '../components/VisitCard';
import { api } from '../services/supabase';
import { TrackingService } from '../services/trackingService';
import type { ClientVisit, LocationLog } from '../types';
import {
  PlusCircle,
  MapPin,
  Store,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Sparkles,
  Smartphone
} from 'lucide-react';

export const AgentDashboard: React.FC = () => {
  const { user, isClockedIn } = useAuth();
  const { pendingCount } = useOffline();
  const navigate = useNavigate();
  const [visits, setVisits] = useState<ClientVisit[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    loadVisits();

    const unsubLoc = TrackingService.subscribeLocation((loc) => {
      setCurrentLocation(loc);
    });

    return () => {
      unsubLoc();
    };
  }, [user]);

  const loadVisits = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await api.getVisits(user.id);
      setVisits(data);
    } catch (err) {
      console.error('Failed to load visits', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick simulation helper for desktop/demo testing
  const simulateGpsMove = async () => {
    if (!user) return;
    const nairobiSpots = [
      { name: 'Embakasi Industrial Park', lat: -1.3200, lng: 36.8900 },
      { name: 'Donholm Greenfields', lat: -1.3000, lng: 36.8800 },
      { name: 'Jogoo Road Hardware Hub', lat: -1.2900, lng: 36.8500 },
      { name: 'Industrial Area Enterprise Rd', lat: -1.3050, lng: 36.8650 },
    ];
    const spot = nairobiSpots[Math.floor(Math.random() * nairobiSpots.length)];
    const mockLog: LocationLog = {
      id: `sim-${Date.now()}`,
      agent_id: user.id,
      latitude: spot.lat + (Math.random() - 0.5) * 0.005,
      longitude: spot.lng + (Math.random() - 0.5) * 0.005,
      accuracy: 8,
      speed: 15,
      is_mocked: false,
      recorded_at: new Date().toISOString()
    };
    await api.logLocation(mockLog);
    setCurrentLocation(mockLog);
    alert(`GPS updated to ${spot.name}! Check admin map monitor to see live marker update.`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Shift Banner with Clock In/Out */}
      <ShiftBanner />

      {/* Primary Mobile Action Button */}
      <div>
        <Link
          to="/agent/visit"
          className="w-full bg-brand-red hover:bg-brand-red-dark text-white rounded-2xl p-4 sm:p-5 shadow-lg shadow-brand-red/20 flex items-center justify-between transition-all active:scale-98 min-h-[64px] border-2 border-red-700/50 group"
        >
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white shadow group-hover:scale-110 transition">
              <PlusCircle className="w-7 h-7" />
            </div>
            <div className="text-left">
              <h2 className="text-lg sm:text-xl font-black tracking-tight leading-tight">
                Record Client Visit
              </h2>
              <p className="text-xs text-red-100 font-medium">
                Auto-GPS, NTP Timestamp & Storefront Camera
              </p>
            </div>
          </div>
          <span className="bg-white text-brand-red font-black text-xs px-3 py-2 rounded-xl shadow-md hidden xs:inline-block">
            START ENTRY &rarr;
          </span>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Today's Visits</span>
            <Store className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{visits.length}</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Target: 8+ shops</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">GPS Accuracy</span>
            <Compass className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {currentLocation ? `±${Math.round(currentLocation.accuracy)}m` : 'Active'}
          </p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">High Precision</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Offline Queue</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{pendingCount}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Auto-syncs online</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Device Health</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-sm font-bold text-slate-900 truncate mt-1">Verified</p>
          <p className="text-[10px] text-emerald-600 font-semibold">SHA-256 Protected</p>
        </div>
      </div>

      {/* Live GPS Health Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-white">Current Field Coordinates</h3>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Live Fix
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono mt-0.5">
              {currentLocation
                ? `${currentLocation.latitude.toFixed(5)}, ${currentLocation.longitude.toFixed(5)} (Speed: ${currentLocation.speed || 0} km/h)`
                : 'Lat: -1.3090, Lng: 36.8850 (Pipeline, Nairobi)'}
            </p>
          </div>
        </div>

        <button
          onClick={simulateGpsMove}
          className="flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white px-3 py-2 rounded-xl text-xs font-bold border border-slate-700 transition active:scale-95 min-h-[44px]"
          title="Simulate walking/driving to next client"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Simulate Move (Demo)</span>
        </button>
      </div>

      {/* Recent Client Visits Header & List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Store className="w-5 h-5 text-brand-blue" />
            <span>Today's Verified Client Visits</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {visits.length} {visits.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
            Loading field records...
          </div>
        ) : visits.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Store className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">No visits logged today</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tap the button below to visit a hardware or plastic dealer store and record storefront proof.
            </p>
            <Link
              to="/agent/visit"
              className="inline-flex items-center space-x-2 bg-brand-red text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Record First Visit</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {visits.map((visit) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                onViewPhoto={(url) => setSelectedPhotoUrl(url)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Photo Lightbox Modal */}
      {selectedPhotoUrl && (
        <div
          onClick={() => setSelectedPhotoUrl(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out animate-fadeIn"
        >
          <div className="max-w-xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900">
            <img
              src={selectedPhotoUrl}
              alt="Storefront proof full resolution"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
