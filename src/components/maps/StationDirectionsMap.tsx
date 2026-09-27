import React, { useEffect, useState } from 'react';
import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap
} from '@vis.gl/react-google-maps';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Clock, 
  ExternalLink, 
  ShieldCheck, 
  User, 
  Navigation,
  CheckCircle2
} from 'lucide-react';
import { IncidentLocation, PoliceStation } from '../../types/complainant';
import { 
  getPoliceStationByName, 
  calculateDistanceKm, 
  POLICE_STATIONS,
  getDefaultCoordsForLocation
} from '../../services/policeStationService';

interface StationDirectionsMapProps {
  location: IncidentLocation;
  stationName: string;
  reportReference?: string;
  caseNumber?: string;
}

export const StationDirectionsMap: React.FC<StationDirectionsMapProps> = ({
  location,
  stationName,
  reportReference,
  caseNumber
}) => {
  const map = useMap();
  const station: PoliceStation = getPoliceStationByName(stationName) || POLICE_STATIONS[0];

  // Resolve incident coordinates
  const incidentCoords = {
    lat: location.latitude || getDefaultCoordsForLocation(location.city, location.province).lat,
    lng: location.longitude || getDefaultCoordsForLocation(location.city, location.province).lng
  };

  const stationCoords = {
    lat: station.latitude,
    lng: station.longitude
  };

  const distance = calculateDistanceKm(
    incidentCoords.lat,
    incidentCoords.lng,
    stationCoords.lat,
    stationCoords.lng
  );

  const driveMinutes = Math.max(3, Math.round((distance / 35) * 60) + 2);

  // Auto-fit bounds so both markers are nicely visible
  useEffect(() => {
    if (!map) return;
    const gmaps = (window as any).google?.maps;
    if (gmaps?.LatLngBounds) {
      const bounds = new gmaps.LatLngBounds();
      bounds.extend(incidentCoords);
      bounds.extend(stationCoords);
      map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
    }
  }, [map, incidentCoords.lat, incidentCoords.lng, stationCoords.lat, stationCoords.lng]);

  const [activeMarker, setActiveMarker] = useState<'station' | 'incident' | null>('station');

  // External Google Maps directions URL
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${incidentCoords.lat},${incidentCoords.lng}&destination=${stationCoords.lat},${stationCoords.lng}&travelmode=driving`;

  return (
    <div className="space-y-4">
      {/* Map View */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-lg h-[300px] sm:h-[360px]">
        <Map
          mapId="DEMO_MAP_ID"
          defaultCenter={stationCoords}
          defaultZoom={13}
          gestureHandling="greedy"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          className="w-full h-full"
        >
          {/* Incident Pin */}
          <AdvancedMarker
            position={incidentCoords}
            title="Incident Location"
            onClick={() => setActiveMarker('incident')}
          >
            <Pin
              background="#dc2626"
              borderColor="#991b1b"
              glyphColor="#ffffff"
              scale={1.2}
            />
          </AdvancedMarker>

          {/* Police Station Pin */}
          <AdvancedMarker
            position={stationCoords}
            title={station.name}
            onClick={() => setActiveMarker('station')}
          >
            <div className="p-2 rounded-full bg-emerald-500 text-slate-950 shadow-xl ring-3 ring-emerald-300 transform hover:scale-110 transition-transform cursor-pointer">
              <Building2 size={18} />
            </div>
          </AdvancedMarker>

          {/* Info Window */}
          {activeMarker === 'station' && (
            <InfoWindow
              position={stationCoords}
              onCloseClick={() => setActiveMarker(null)}
            >
              <div className="p-1 max-w-[240px] text-slate-900 font-sans text-xs space-y-1">
                <div className="font-bold text-sm text-slate-950 flex items-center gap-1.5">
                  <Building2 size={15} className="text-emerald-700 shrink-0" />
                  <span>{station.name}</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {station.address}, {station.suburb}
                </p>
                <div className="text-[11px] font-mono text-slate-800">
                  CSC: {station.phone}
                </div>
                <div className="text-[10px] text-emerald-800 font-bold">
                  {station.operatingHours}
                </div>
              </div>
            </InfoWindow>
          )}

          {activeMarker === 'incident' && (
            <InfoWindow
              position={incidentCoords}
              onCloseClick={() => setActiveMarker(null)}
            >
              <div className="p-1 max-w-[220px] text-slate-900 font-sans text-xs space-y-1">
                <div className="font-bold text-slate-950 flex items-center gap-1">
                  <MapPin size={13} className="text-red-600" />
                  <span>Incident Occurrence Location</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {location.address || 'Address on record'}, {location.suburb}
                </p>
              </div>
            </InfoWindow>
          )}
        </Map>

        {/* Floating Route Distance Header */}
        <div className="absolute top-3 left-3 z-10">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white text-xs shadow-lg flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <Navigation size={13} />
              <span>{distance} km</span>
            </div>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">~{driveMinutes} mins drive from incident scene</span>
          </div>
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-3 left-3 z-10">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-slate-300 text-[10px] shadow-lg flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              <span>Incident Site</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Assigned Station</span>
            </div>
          </div>
        </div>
      </div>

      {/* Police Station Comprehensive Particulars Card */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                <ShieldCheck size={11} />
                Designated Community Service Centre
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {station.precinctCode}
              </span>
            </div>
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 size={18} className="text-emerald-400" />
              <span>{station.name}</span>
            </h4>
          </div>

          {/* External Directions Link */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Navigation size={13} />
            <span>Open Directions in Google Maps</span>
            <ExternalLink size={12} className="opacity-70" />
          </a>
        </div>

        {/* Station Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-slate-400 font-medium flex items-center gap-1.5">
              <MapPin size={13} className="text-slate-400" />
              <span>Physical Street Address</span>
            </div>
            <p className="text-slate-200 font-semibold leading-relaxed">
              {station.address}
            </p>
            <p className="text-[11px] text-slate-400">
              {station.suburb}, {station.city}, {station.postalCode}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-slate-400 font-medium flex items-center gap-1.5">
              <Phone size={13} className="text-emerald-400" />
              <span>Frontline Desk Contact</span>
            </div>
            <p className="text-slate-200 font-mono font-bold text-sm">
              {station.phone}
            </p>
            <p className="text-[11px] text-slate-400 font-mono">
              Patrol: {station.emergencyPhone}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-slate-400 font-medium flex items-center gap-1.5">
              <Clock size={13} className="text-blue-400" />
              <span>Operating Hours & Commander</span>
            </div>
            <p className="text-emerald-400 font-bold">
              {station.operatingHours}
            </p>
            <p className="text-[11px] text-slate-300 flex items-center gap-1 pt-0.5">
              <User size={11} className="text-slate-400" />
              <span>Cmdr: {station.stationCommander}</span>
            </p>
          </div>
        </div>

        {/* On-Site Available Services */}
        <div className="pt-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Available Citizen Services at this Precinct:
          </span>
          <div className="flex flex-wrap gap-2">
            {station.services.map((svc) => (
              <span
                key={svc}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-[11px] flex items-center gap-1.5"
              >
                <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                <span>{svc}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Linked reference note */}
        {(reportReference || caseNumber) && (
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>
              Linked to:{' '}
              <strong className="text-white font-mono">
                {caseNumber || reportReference}
              </strong>
            </span>
            <span className="italic">
              Bring your report or case reference when presenting at the Community Service Centre.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
