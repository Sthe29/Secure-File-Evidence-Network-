import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Search, 
  Phone, 
  Clock, 
  Navigation, 
  ExternalLink, 
  ShieldCheck, 
  Filter,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { 
  POLICE_STATIONS, 
  PoliceStation,
  calculateDistanceKm
} from '../../services/policeStationService';
import { GoogleMapsWrapper } from '../maps/GoogleMapsWrapper';
import { 
  Map, 
  AdvancedMarker, 
  InfoWindow 
} from '@vis.gl/react-google-maps';
import { ComplainantTab, IncidentReport } from '../../types/complainant';

interface FindStationViewProps {
  onNavigate: (tab: ComplainantTab) => void;
  reports: IncidentReport[];
}

export const FindStationView: React.FC<FindStationViewProps> = ({
  onNavigate,
  reports
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('All');
  const [selectedStation, setSelectedStation] = useState<PoliceStation>(POLICE_STATIONS[0]);
  const [activeInfoStation, setActiveInfoStation] = useState<PoliceStation | null>(null);

  // Filter stations
  const filteredStations = POLICE_STATIONS.filter((s) => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.suburb.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProv = selectedProvince === 'All' || s.province === selectedProvince;

    return matchesSearch && matchesProv;
  });

  const provinces = ['All', 'Gauteng', 'Western Cape', 'KwaZulu-Natal'];

  // Google Maps directions url for selected station
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${selectedStation.name}, ${selectedStation.address}, ${selectedStation.city}`
  )}`;

  return (
    <div id="find-station-container" className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                SAPS Precinct Directory
              </span>
              <span className="text-xs text-slate-400">Google Maps Live Integration</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight pt-1">
              Find Nearest Police Station & Community Service Centre
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Locate designated police stations, access 24/7 Community Service Centre (CSC) desks, obtain emergency sector patrol numbers, and view directions to where your incident reports are processed.
            </p>
          </div>

          {/* Quick link to report incident */}
          <button
            type="button"
            onClick={() => onNavigate('report-incident')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer self-start sm:self-center"
          >
            <FileText size={15} />
            <span>Report Incident Online</span>
          </button>
        </div>
      </div>

      {/* Reported Incidents Quick Selector (if user has reports) */}
      {reports.length > 0 && (
        <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
            <Building2 size={15} className="text-blue-400" />
            <span>Stations Handling Your Active Online Incident Reports:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {reports.map((rpt) => (
              <button
                key={rpt.id}
                type="button"
                onClick={() => {
                  const match = POLICE_STATIONS.find(
                    (s) => s.name.toLowerCase().includes(rpt.policeStation.toLowerCase()) ||
                           rpt.policeStation.toLowerCase().includes(s.name.toLowerCase())
                  );
                  if (match) setSelectedStation(match);
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  selectedStation.name.includes(rpt.policeStation) || rpt.policeStation.includes(selectedStation.name)
                    ? 'bg-emerald-500/20 border-emerald-500 text-white ring-2 ring-emerald-500/30'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="font-mono text-[11px] text-emerald-400">{rpt.referenceNumber}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-medium truncate max-w-[200px]">
                    {rpt.policeStation}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Incident in {rpt.location.suburb}, {rpt.location.city}
                  </div>
                </div>
                <Navigation size={14} className="text-emerald-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Station List + Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Station Explorer List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Filters */}
          <div className="space-y-2.5">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search station name, suburb, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9.5 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Province Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {provinces.map((prov) => (
                <button
                  key={prov}
                  type="button"
                  onClick={() => setSelectedProvince(prov)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedProvince === prov
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {prov}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
            {filteredStations.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
                No police stations found matching "{searchQuery}".
              </div>
            ) : (
              filteredStations.map((station) => {
                const isSelected = selectedStation.id === station.id;
                return (
                  <div
                    key={station.id}
                    onClick={() => setSelectedStation(station)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500 ring-1 ring-emerald-500/30'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-emerald-400 font-bold">
                          {station.precinctCode}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-white pt-1">
                          {station.name}
                        </h4>
                      </div>
                      <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                        24/7 CSC
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <MapPin size={12} className="text-slate-400 shrink-0" />
                      <span className="truncate">{station.address}, {station.suburb}</span>
                    </div>

                    <div className="text-[11px] text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800/80">
                      <span className="font-mono text-slate-400 flex items-center gap-1">
                        <Phone size={11} />
                        {station.phone}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        {station.city}, {station.province}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Map & Selected Station Deep Particulars (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Map */}
          <div className="rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-xl h-[340px] sm:h-[380px] relative">
            <GoogleMapsWrapper>
              <Map
                mapId="DEMO_MAP_ID"
                center={{ lat: selectedStation.latitude, lng: selectedStation.longitude }}
                zoom={14}
                gestureHandling="greedy"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                className="w-full h-full"
              >
                {POLICE_STATIONS.map((station) => {
                  const isSelected = selectedStation.id === station.id;
                  return (
                    <AdvancedMarker
                      key={station.id}
                      position={{ lat: station.latitude, lng: station.longitude }}
                      title={station.name}
                      onClick={() => {
                        setSelectedStation(station);
                        setActiveInfoStation(station);
                      }}
                    >
                      <div
                        className={`p-2 rounded-full shadow-xl transition-transform cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-300 scale-125'
                            : 'bg-blue-600 text-white hover:scale-110'
                        }`}
                      >
                        <Building2 size={16} />
                      </div>
                    </AdvancedMarker>
                  );
                })}

                {activeInfoStation && (
                  <InfoWindow
                    position={{ lat: activeInfoStation.latitude, lng: activeInfoStation.longitude }}
                    onCloseClick={() => setActiveInfoStation(null)}
                  >
                    <div className="p-1 max-w-[240px] text-slate-900 font-sans text-xs space-y-1">
                      <div className="font-bold text-sm text-slate-950 flex items-center gap-1">
                        <Building2 size={15} className="text-emerald-700 shrink-0" />
                        <span>{activeInfoStation.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        {activeInfoStation.address}, {activeInfoStation.suburb}
                      </p>
                      <div className="text-[11px] font-mono text-slate-800">
                        Tel: {activeInfoStation.phone}
                      </div>
                      <div className="text-[10px] text-emerald-800 font-bold">
                        {activeInfoStation.operatingHours}
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </Map>
            </GoogleMapsWrapper>

            {/* Map overlay prompt */}
            <div className="absolute top-3 left-3 z-10 pointer-events-none">
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-700 text-white text-xs shadow-lg flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 " />
                <span className="font-bold">{selectedStation.name}</span>
              </div>
            </div>
          </div>

          {/* Detailed Station Dossier Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {selectedStation.precinctCode}
                  </span>
                  <span className="text-xs text-slate-400">
                    South African Police Service (SAPS)
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 pt-1">
                  <Building2 size={18} className="text-emerald-400" />
                  <span>{selectedStation.name}</span>
                </h3>
              </div>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
              >
                <Navigation size={13} />
                <span>Open Google Maps Directions</span>
                <ExternalLink size={12} className="opacity-70" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium block">Physical Location:</span>
                <p className="text-slate-200 font-bold">{selectedStation.address}</p>
                <p className="text-slate-400">{selectedStation.suburb}, {selectedStation.city}, {selectedStation.postalCode}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium block">Desk & Sector Emergency:</span>
                <p className="text-white font-mono font-bold text-sm">{selectedStation.phone}</p>
                <p className="text-slate-400 font-mono text-[11px]">Patrol: {selectedStation.emergencyPhone}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium block">Hours & Leadership:</span>
                <p className="text-emerald-400 font-bold">{selectedStation.operatingHours}</p>
                <p className="text-slate-300 text-[11px]">Cmdr: {selectedStation.stationCommander}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium block">GPS Coordinates:</span>
                <p className="text-slate-200 font-mono">{selectedStation.latitude}, {selectedStation.longitude}</p>
                <p className="text-slate-400 text-[11px]">Sector Policing Zone Active</p>
              </div>
            </div>

            {/* Station Services */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Available Services at this Community Service Centre:
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedStation.services.map((svc: string) => (
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
          </div>
        </div>
      </div>
    </div>
  );
};
