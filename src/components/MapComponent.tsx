import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LocationLog, ClientVisit, Profile } from '../types';
import { calculateDistanceKm } from '../services/antiSpoofing';
import { Phone, Navigation, Clock, ShieldAlert, CheckCircle2, Store } from 'lucide-react';

// Fix default Leaflet icon paths in Vite
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const NAKURU_COUNTY_CENTER: [number, number] = [-0.3031, 36.0800]; // Nakuru County Central Hub

// Helper component to center/fly map when focus changes or fit all agents
function MapRecenter({
  center,
  zoom,
  selectedAgentId,
  agents
}: {
  center: [number, number];
  zoom?: number;
  selectedAgentId?: string | null;
  agents: MapAgentMarker[];
}) {
  const map = useMap();
  useEffect(() => {
    if (selectedAgentId) {
      map.flyTo(center, zoom || 14, { duration: 1.2 });
    } else if (agents.length > 0) {
      const validPoints = agents
        .filter((a) => a.lastLocation && !isNaN(a.lastLocation.latitude) && !isNaN(a.lastLocation.longitude))
        .map((a) => [a.lastLocation.latitude, a.lastLocation.longitude] as [number, number]);
      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        map.fitBounds(bounds, { padding: [45, 45], maxZoom: 12 });
      } else {
        map.flyTo(center, zoom || 10, { duration: 1.2 });
      }
    }
  }, [center, zoom, selectedAgentId, agents, map]);
  return null;
}

export interface MapAgentMarker {
  profile: Profile;
  lastLocation: LocationLog;
  status: 'moving' | 'stationary' | 'offline';
  todayLocations: LocationLog[];
  todayVisits: ClientVisit[];
  stationaryMinutes?: number;
}

interface MapComponentProps {
  agents: MapAgentMarker[];
  visits: ClientVisit[];
  selectedAgentId?: string | null;
  onSelectAgent?: (agentId: string) => void;
  onSelectVisit?: (visit: ClientVisit) => void;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  agents,
  visits,
  selectedAgentId,
  onSelectAgent,
  onSelectVisit
}) => {
  // Custom Color-Coded Marker Generator
  const createAgentIcon = (status: 'moving' | 'stationary' | 'offline', name: string) => {
    let bgColor = '#10B981'; // Green
    let ringColor = 'rgba(16, 185, 129, 0.4)';
    let badgeText = 'ACTIVE';

    if (status === 'stationary') {
      bgColor = '#F97316'; // Orange
      ringColor = 'rgba(249, 115, 22, 0.4)';
      badgeText = 'STATIONARY';
    } else if (status === 'offline') {
      bgColor = '#EF4444'; // Red
      ringColor = 'rgba(239, 68, 68, 0.4)';
      badgeText = 'OFFLINE';
    }

    const initial = name ? name.charAt(0).toUpperCase() : 'A';

    return L.divIcon({
      className: 'custom-agent-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background-color: ${bgColor};
            box-shadow: 0 0 0 6px ${ringColor}, 0 4px 6px -1px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 800;
            font-size: 15px;
            border: 2px solid white;
          ">
            ${initial}
          </div>
          <div style="
            background-color: #172554;
            color: white;
            font-size: 10px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
            margin-top: 4px;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            border: 1px solid rgba(255,255,255,0.2);
          ">
            ${name.split(' ')[0]}
          </div>
        </div>
      `,
      iconSize: [40, 56],
      iconAnchor: [20, 28],
      popupAnchor: [0, -30]
    });
  };

  // Custom Blue Store Visit Pin
  const createVisitIcon = (isFlagged: boolean) => {
    const bgColor = isFlagged ? '#B91C1C' : '#2563EB'; // Red if flagged, Blue if normal
    return L.divIcon({
      className: 'custom-visit-pin',
      html: `
        <div style="
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background-color: ${bgColor};
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          border: 2px solid white;
          box-shadow: 0 3px 6px rgba(0,0,0,0.3);
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
            <path d="M2 7h20"/>
          </svg>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -18]
    });
  };

  // Find active focus agent
  const selectedAgent = useMemo(() => {
    if (!selectedAgentId) return null;
    return agents.find((a) => a.profile.id === selectedAgentId) || null;
  }, [agents, selectedAgentId]);

  // Route breadcrumbs polyline coordinates for selected agent
  const breadcrumbPositions = useMemo(() => {
    if (!selectedAgent || !selectedAgent.todayLocations || selectedAgent.todayLocations.length < 2) {
      return [];
    }
    return selectedAgent.todayLocations
      .slice()
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
      .map((loc) => [loc.latitude, loc.longitude] as [number, number]);
  }, [selectedAgent]);

  const mapCenter: [number, number] = useMemo(() => {
    if (selectedAgent && selectedAgent.lastLocation) {
      return [selectedAgent.lastLocation.latitude, selectedAgent.lastLocation.longitude];
    }
    return NAKURU_COUNTY_CENTER;
  }, [selectedAgent]);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-inner border border-slate-200">
      <MapContainer
        center={NAKURU_COUNTY_CENTER}
        zoom={10}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
        style={{ minHeight: '400px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter
          center={mapCenter}
          zoom={selectedAgentId ? 14 : 10}
          selectedAgentId={selectedAgentId}
          agents={agents}
        />

        {/* Selected Agent Route Breadcrumb Line */}
        {breadcrumbPositions.length > 1 && (
          <Polyline
            positions={breadcrumbPositions}
            pathOptions={{
              color: '#172554',
              weight: 4,
              dashArray: '8, 8',
              opacity: 0.8
            }}
          />
        )}

        {/* Agent Markers */}
        {agents.map(agent => (
          <Marker
            key={agent.profile.id}
            position={[agent.lastLocation.latitude, agent.lastLocation.longitude]}
            icon={createAgentIcon(agent.status, agent.profile.full_name)}
            eventHandlers={{
              click: () => onSelectAgent?.(agent.profile.id)
            }}
          >
            <Popup className="sewak-popup">
              <div className="p-1 max-w-xs">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-xs">
                    {agent.profile.full_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-tight">
                      {agent.profile.full_name}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono">{agent.profile.phone_number}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Status:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                        agent.status === 'moving'
                          ? 'bg-emerald-100 text-emerald-800'
                          : agent.status === 'stationary'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {agent.status === 'moving'
                        ? '🟢 Moving / Active'
                        : agent.status === 'stationary'
                        ? `🟠 Stationary (${agent.stationaryMinutes || 15}m)`
                        : '🔴 GPS Offline'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Speed:</span>
                    <span className="font-semibold">{agent.lastLocation.speed || 0} km/h</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Today Visits:</span>
                    <span className="font-bold text-blue-700">{agent.todayVisits.length} shops</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Last Fix:</span>
                    <span className="font-mono text-[11px]">
                      {new Date(agent.lastLocation.recorded_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}{' '}
                      EAT
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectAgent?.(agent.profile.id)}
                  className="w-full mt-3 bg-brand-blue hover:bg-slate-800 text-white font-bold py-1.5 px-3 rounded text-xs transition"
                >
                  View Route & Visits Drawer
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Client Shop Visit Pins (Blue / Flagged Red) */}
        {visits.map(visit => (
          <Marker
            key={visit.id}
            position={[visit.latitude, visit.longitude]}
            icon={createVisitIcon(visit.is_flagged)}
            eventHandlers={{
              click: () => onSelectVisit?.(visit)
            }}
          >
            <Popup>
              <div className="p-1 max-w-xs text-xs">
                <div className="flex items-center space-x-1.5 text-blue-700 font-bold mb-1">
                  <Store className="w-4 h-4" />
                  <span className="text-sm text-slate-900 truncate">{visit.shop_name}</span>
                </div>

                {visit.is_flagged && (
                  <div className="bg-red-100 text-brand-red p-1.5 rounded mb-2 font-bold text-[11px] flex items-center space-x-1">
                    <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{visit.flag_reason || 'Flagged Visit'}</span>
                  </div>
                )}

                <p className="text-slate-600 mb-1">📍 {visit.physical_location}</p>
                <p className="text-slate-600 mb-2">📞 {visit.phone_number}</p>

                {visit.photo_url && (
                  <img
                    src={visit.photo_url}
                    alt={visit.shop_name}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                )}

                <button
                  onClick={() => onSelectVisit?.(visit)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                >
                  Inspect Visit Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-slate-200 text-xs flex flex-wrap gap-3 pointer-events-auto">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          <span className="font-semibold text-slate-700">Moving / Active</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-orange-500"></span>
          <span className="font-semibold text-slate-700">Stationary &gt;15m</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span className="font-semibold text-slate-700">GPS Offline</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-blue-600"></span>
          <span className="font-semibold text-slate-700">Shop Visit</span>
        </div>
      </div>
    </div>
  );
};
