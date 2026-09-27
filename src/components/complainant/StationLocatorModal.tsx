import React from 'react';
import { X, Building2, ShieldCheck, MapPin } from 'lucide-react';
import { GoogleMapsWrapper } from '../maps/GoogleMapsWrapper';
import { StationDirectionsMap } from '../maps/StationDirectionsMap';
import { IncidentLocation } from '../../types/complainant';

interface StationLocatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  location?: IncidentLocation;
  policeStationName: string;
  reportReference?: string;
  caseNumber?: string;
  incidentType?: string;
}

export const StationLocatorModal: React.FC<StationLocatorModalProps> = ({
  isOpen,
  onClose,
  location,
  policeStationName,
  reportReference,
  caseNumber,
  incidentType
}) => {
  if (!isOpen) return null;

  const resolvedLocation: IncidentLocation = location || {
    address: 'Incident location on record',
    suburb: '',
    city: 'South Africa',
    province: 'Gauteng',
    preferredStation: policeStationName
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                  Official Precinct Locator
                </span>
                {(caseNumber || reportReference) && (
                  <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                    {caseNumber || reportReference}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Nearest Police Station for Your Incident Report
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs flex items-center gap-2.5">
            <ShieldCheck size={16} className="text-blue-400 shrink-0" />
            <span>
              This map shows where your incident occurred and the designated South African Police Service (SAPS) station responsible for reviewing your statement and registering the docket.
            </span>
          </div>

          <GoogleMapsWrapper>
            <StationDirectionsMap
              location={resolvedLocation}
              stationName={policeStationName}
              reportReference={reportReference}
              caseNumber={caseNumber}
            />
          </GoogleMapsWrapper>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
};
