import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary
} from '@vis.gl/react-google-maps';
import { 
  Navigation, 
  Building2, 
  Search, 
  Phone
} from 'lucide-react';
import { IncidentLocation, PoliceStation } from '../../types/complainant';
import { 
  POLICE_STATIONS, 
  findNearestPoliceStation, 
  NearestStationResult,
  getDefaultCoordsForLocation
} from '../../services/policeStationService';

interface IncidentLocationPickerMapProps {
  location: IncidentLocation;
  onLocationChange: (updated: IncidentLocation) => void;
  onNearestStationFound?: (station: PoliceStation, distanceKm: number) => void;
}

export const IncidentLocationPickerMap: React.FC<IncidentLocationPickerMapProps> = ({
  location,
  onLocationChange,
  onNearestStationFound
}) => {
  const map = useMap();
  const placesLibrary = useMapsLibrary('places');
  const geocodingLibrary = useMapsLibrary('geocoding');

  const onLocationChangeRef = useRef(onLocationChange);
  onLocationChangeRef.current = onLocationChange;

  const locationRef = useRef(location);
  locationRef.current = location;

  const onNearestRef = useRef(onNearestStationFound);
  onNearestRef.current = onNearestStationFound;

  // Center & Marker position
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number }>(() => {
    if (location.latitude && location.longitude) {
      return { lat: location.latitude, lng: location.longitude };
    }
    return getDefaultCoordsForLocation(location.city, location.province);
  });

  const [nearestResult, setNearestResult] = useState<NearestStationResult>(() => 
    findNearestPoliceStation(markerPosition.lat, markerPosition.lng)
  );

  const [selectedStation, setSelectedStation] = useState<PoliceStation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update nearest station whenever marker moves
  useEffect(() => {
    const res = findNearestPoliceStation(markerPosition.lat, markerPosition.lng);
    setNearestResult(res);
    if (onNearestRef.current) {
      onNearestRef.current(res.station, res.distanceKm);
    }
  }, [markerPosition.lat, markerPosition.lng]);

  // Setup Google Places Autocomplete once
  useEffect(() => {
    if (!placesLibrary || !inputRef.current) return;

    let listener: any = null;
    let autocomplete: any = null;

    try {
      autocomplete = new placesLibrary.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'za' }, // Focus on South Africa
        fields: ['geometry', 'name', 'formatted_address', 'address_components']
      });

      listener = autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place || !place.geometry || !place.geometry.location) return;

        const newLat = place.geometry.location.lat();
        const newLng = place.geometry.location.lng();
        const newPos = { lat: newLat, lng: newLng };

        setMarkerPosition(newPos);
        if (map) {
          map.panTo(newPos);
          map.setZoom(16);
        }

        // Parse address components
        let streetNumber = '';
        let route = '';
        let suburb = '';
        let city = '';
        let province = '';

        if (Array.isArray(place.address_components)) {
          for (const comp of place.address_components) {
            if (!comp || !Array.isArray(comp.types)) continue;
            const types = comp.types;
            if (types.includes('street_number')) streetNumber = comp.long_name || '';
            if (types.includes('route')) route = comp.long_name || '';
            if (types.includes('sublocality') || types.includes('sublocality_level_1') || types.includes('neighborhood')) {
              suburb = comp.long_name || '';
            }
            if (types.includes('locality')) city = comp.long_name || '';
            if (types.includes('administrative_area_level_1')) province = comp.long_name || '';
          }
        }

        const addressStr = streetNumber ? `${streetNumber} ${route}` : (route || place.name || place.formatted_address || '');
        const stationMatch = findNearestPoliceStation(newLat, newLng);

        onLocationChangeRef.current({
          ...locationRef.current,
          address: addressStr || place.formatted_address || locationRef.current.address || 'Selected Location',
          suburb: suburb || locationRef.current.suburb || 'Sandton',
          city: city || locationRef.current.city || 'Johannesburg',
          province: province || locationRef.current.province || 'Gauteng',
          latitude: newLat,
          longitude: newLng,
          preferredStation: stationMatch.station.name
        });
      });
    } catch (err) {
      console.warn('Autocomplete init skipped or failed:', err);
    }

    return () => {
      if (listener && (window as any).google?.maps?.event) {
        (window as any).google.maps.event.removeListener(listener);
      }
      try {
        const containers = document.querySelectorAll('.pac-container');
        containers.forEach((c) => c.remove());
      } catch {
        // ignore
      }
    };
  }, [placesLibrary, map]);

  // Reverse geocoding helper when user clicks map or drags pin
  const reverseGeocode = useCallback((lat: number, lng: number) => {
    if (!geocodingLibrary) return;
    setIsReverseGeocoding(true);

    try {
      const geocoder = new geocodingLibrary.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
        setIsReverseGeocoding(false);
        if (status === 'OK' && Array.isArray(results) && results[0]) {
          const res = results[0];
          let streetNumber = '';
          let route = '';
          let sub = '';
          let locality = '';
          let prov = '';

          if (Array.isArray(res.address_components)) {
            for (const c of res.address_components) {
              if (!c || !Array.isArray(c.types)) continue;
              if (c.types.includes('street_number')) streetNumber = c.long_name || '';
              if (c.types.includes('route')) route = c.long_name || '';
              if (c.types.includes('sublocality') || c.types.includes('neighborhood') || c.types.includes('sublocality_level_1')) {
                sub = c.long_name || '';
              }
              if (c.types.includes('locality')) locality = c.long_name || '';
              if (c.types.includes('administrative_area_level_1')) prov = c.long_name || '';
            }
          }

          const formatted = res.formatted_address || '';
          const street = streetNumber ? `${streetNumber} ${route}` : (route || (formatted ? formatted.split(',')[0] : 'Selected Location'));
          const stationMatch = findNearestPoliceStation(lat, lng);

          onLocationChangeRef.current({
            ...locationRef.current,
            address: street || locationRef.current.address || 'Selected Location',
            suburb: sub || locationRef.current.suburb || 'Sandton',
            city: locality || locationRef.current.city || 'Johannesburg',
            province: prov || locationRef.current.province || 'Gauteng',
            latitude: lat,
            longitude: lng,
            preferredStation: stationMatch.station.name
          });
        }
      });
    } catch {
      setIsReverseGeocoding(false);
    }
  }, [geocodingLibrary]);

  // Handle map click
  const handleMapClick = (e: any) => {
    if (!e || !e.detail || !e.detail.latLng) return;
    const lat = e.detail.latLng.lat;
    const lng = e.detail.latLng.lng;
    if (typeof lat !== 'number' || typeof lng !== 'number') return;
    const newPos = { lat, lng };

    setMarkerPosition(newPos);
    reverseGeocode(lat, lng);
  };

  // Use current GPS Location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const newPos = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setMarkerPosition(newPos);
        if (map) {
          map.panTo(newPos);
          map.setZoom(16);
        }
        reverseGeocode(newPos.lat, newPos.lng);
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        const fallback = getDefaultCoordsForLocation(location.city, location.province);
        setMarkerPosition(fallback);
        if (map) map.panTo(fallback);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-4">
      {/* Search & Action Controls */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search address, landmark or intersection (e.g. 42 Rivonia Rd, Sandton)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all shadow-inner"
          />
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
        >
          <Navigation size={14} className={`text-blue-400 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Detecting GPS...' : 'Use My GPS Location'}</span>
        </button>
      </div>

      {/* Map Canvas Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-lg h-[340px] sm:h-[400px]">
        <Map
          mapId="DEMO_MAP_ID"
          defaultCenter={markerPosition}
          defaultZoom={14}
          gestureHandling="greedy"
          disableDefaultUI={false}
          onClick={handleMapClick}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          className="w-full h-full"
        >
          {/* Incident Pin (Red) */}
          <AdvancedMarker
            position={markerPosition}
            title="Incident Location (Click map to move pin)"
          >
            <Pin
              background="#dc2626"
              borderColor="#991b1b"
              glyphColor="#ffffff"
              scale={1.25}
            />
          </AdvancedMarker>

          {/* Markers for Nearby Police Stations */}
          {POLICE_STATIONS.map((station) => {
            const isAssigned = location.preferredStation === station.name;
            const isNearest = nearestResult?.station.id === station.id;

            return (
              <AdvancedMarker
                key={station.id}
                position={{ lat: station.latitude, lng: station.longitude }}
                title={station.name}
                onClick={() => setSelectedStation(station)}
              >
                <div 
                  className={`p-1.5 rounded-full shadow-md flex items-center justify-center transition-transform hover:scale-115 cursor-pointer ${
                    isAssigned 
                      ? 'bg-blue-500 text-white ring-3 ring-blue-300' 
                      : isNearest 
                      ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-200'
                      : 'bg-blue-700 text-white ring-2 ring-blue-400/50'
                  }`}
                >
                  <Building2 size={15} />
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Info Window for clicked Police Station */}
          {selectedStation && (
            <InfoWindow
              position={{ lat: selectedStation.latitude, lng: selectedStation.longitude }}
              onCloseClick={() => setSelectedStation(null)}
            >
              <div className="p-1 max-w-[240px] text-slate-900 font-sans text-xs space-y-1.5">
                <div className="font-bold text-sm text-slate-950 flex items-center gap-1.5">
                  <Building2 size={15} className="text-blue-700 shrink-0" />
                  <span>{selectedStation.name}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  {selectedStation.address}, {selectedStation.suburb}
                </p>
                <div className="text-[11px] font-mono text-slate-700 flex items-center gap-1">
                  <Phone size={11} className="text-slate-500" />
                  <span>{selectedStation.phone}</span>
                </div>
                <div className="text-[10px] text-blue-700 font-medium">
                  {selectedStation.operatingHours}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onLocationChangeRef.current({ ...locationRef.current, preferredStation: selectedStation.name });
                    setSelectedStation(null);
                  }}
                  className="w-full mt-1.5 py-1 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold text-center transition-colors cursor-pointer"
                >
                  Select as Receiving Station
                </button>
              </div>
            </InfoWindow>
          )}
        </Map>

        {/* Map Instructions Badge */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-slate-200 text-[11px] shadow-lg flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="font-medium">Click map to drop or move incident location pin</span>
          </div>
        </div>

        {/* Reverse Geocoding Status */}
        {isReverseGeocoding && (
          <div className="absolute top-3 right-3 z-10 pointer-events-none">
            <div className="px-3 py-1.5 rounded-xl bg-blue-950/90 border border-blue-700 text-blue-200 text-[11px] shadow-lg flex items-center gap-2">
              <span className="animate-spin text-xs">⏳</span>
              <span>Resolving address...</span>
            </div>
          </div>
        )}

        {/* Map Legend */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-slate-300 text-[10px] shadow-lg flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              <span>Incident Pin</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>Police Station</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
