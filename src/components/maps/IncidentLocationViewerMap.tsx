import React, { useState } from 'react';
import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow
} from '@vis.gl/react-google-maps';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { IncidentLocation } from '../../types/complainant';

interface IncidentLocationViewerMapProps {
  location: IncidentLocation;
  incidentType?: string;
  referenceNumber?: string;
}

export const IncidentLocationViewerMap: React.FC<IncidentLocationViewerMapProps> = ({
  location,
  incidentType = 'Incident',
  referenceNumber
}) => {
  // Fallback to Sandton coordinates if none provided
  const lat = location.latitude ?? -26.1076;
  const lng = location.longitude ?? 28.0567;
  const [showInfoWindow, setShowInfoWindow] = useState(true);

  return (
    <div className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
      <Map
        defaultCenter={{ lat, lng }}
        defaultZoom={15}
        mapId="sfen_incident_viewer_map"
        disableDefaultUI={false}
        gestureHandling="cooperative"
        className="w-full h-full"
      >
        <AdvancedMarker
          position={{ lat, lng }}
          onClick={() => setShowInfoWindow(!showInfoWindow)}
        >
          <Pin
            background="#ef4444"
            borderColor="#991b1b"
            glyphColor="#ffffff"
            scale={1.1}
          />
        </AdvancedMarker>

        {showInfoWindow && (
          <InfoWindow
            position={{ lat, lng }}
            onCloseClick={() => setShowInfoWindow(false)}
          >
            <div className="p-1 max-w-xs text-slate-900">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 mb-1">
                <MapPin size={13} />
                <span>Mapped Incident Scene</span>
              </div>
              <p className="text-xs font-semibold text-slate-800">
                {location.address || 'Reported Location'}
              </p>
              {location.suburb && (
                <p className="text-[11px] text-slate-600">
                  {location.suburb}, {location.city || 'Gauteng'}
                </p>
              )}
              {location.landmark && (
                <p className="text-[10px] text-slate-500 mt-1 italic">
                  Landmark: {location.landmark}
                </p>
              )}
              <div className="text-[9px] font-mono text-slate-500 mt-1.5 pt-1 border-t border-slate-200 flex justify-between">
                <span>Lat: {lat.toFixed(5)}</span>
                <span>Lng: {lng.toFixed(5)}</span>
              </div>
            </div>
          </InfoWindow>
        )}
      </Map>

      {/* Floating coordinates badge */}
      <div className="absolute top-2 left-2 z-10 px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center gap-1.5 shadow-md">
        <Navigation size={11} className="text-blue-400" />
        <span>GPS: {lat.toFixed(5)}, {lng.toFixed(5)}</span>
      </div>

      {/* Open Google Maps external link button */}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 z-10 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-900 backdrop-blur-md border border-slate-800 text-[10px] font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition-colors shadow-md"
      >
        <span>Open in Google Maps</span>
        <ExternalLink size={10} />
      </a>
    </div>
  );
};
