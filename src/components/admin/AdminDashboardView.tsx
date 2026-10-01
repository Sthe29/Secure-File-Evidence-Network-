import React, { useState } from 'react';
import { AdminTab, AdminActivityLog, ConfiguredPoliceStation } from '../../types/admin';
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Building2, 
  UserPlus, 
  MapPin, 
  Phone, 
  Clock, 
  User, 
  ExternalLink, 
  X
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface AdminDashboardViewProps {
  stats: {
    totalUsers: number;
    activePersonnel: number;
    complainantAccounts: number;
    inactiveAccounts: number;
    personnelCount: number;
    recentActivity: AdminActivityLog[];
  };
  station: ConfiguredPoliceStation;
  onNavigate: (tab: AdminTab) => void;
  onOpenAddPersonnel: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  stats,
  station,
  onNavigate,
  onOpenAddPersonnel
}) => {
  const { isDark } = useTheme();
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);

  return (
    <div id="admin-dashboard-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-1">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
            Administrative Overview
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            System administration, user account metrics, and station management for SFEN.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            id="btn-dash-add-personnel"
            onClick={onOpenAddPersonnel}
            className={`px-3.5 py-1.5 border text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
              isDark 
                ? 'border-blue-600 text-blue-500 hover:bg-blue-600 hover:text-white' 
                : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
            }`}
          >
            <UserPlus size={15} />
            <span>Add Personnel</span>
          </button>
        </div>
      </div>

      {/* 4 Core Administrative Metrics (Boxes on Dashboard retained) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div 
          className={`p-4 rounded-md border flex flex-col justify-between ${
            isDark ? 'bg-black border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total Users</span>
            <div className="p-2 rounded-sm bg-blue-600/10 text-blue-600">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-black'}`}>
                {stats.totalUsers}
              </span>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>registered</span>
            </div>
            <p className={`text-[11px] pt-1 mt-2 border-t ${
              isDark ? 'border-white/10 text-slate-400' : 'border-black/10 text-slate-600'
            }`}>
              Personnel + Complainants
            </p>
          </div>
        </div>

        {/* Active Personnel Accounts */}
        <div 
          className={`p-4 rounded-md border flex flex-col justify-between ${
            isDark ? 'bg-black border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Active Personnel</span>
            <div className="p-2 rounded-sm bg-blue-600/10 text-blue-600">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-black'}`}>
                {stats.activePersonnel}
              </span>
              <span className="text-[11px] text-blue-600 font-semibold">Authorized</span>
            </div>
            <p className={`text-[11px] pt-1 mt-2 border-t ${
              isDark ? 'border-white/10 text-slate-400' : 'border-black/10 text-slate-600'
            }`}>
              Across police roles
            </p>
          </div>
        </div>

        {/* Complainant Accounts */}
        <div 
          className={`p-4 rounded-md border flex flex-col justify-between ${
            isDark ? 'bg-black border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Complainants</span>
            <div className="p-2 rounded-sm bg-blue-600/10 text-blue-600">
              <UserCheck size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-black'}`}>
                {stats.complainantAccounts}
              </span>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Public</span>
            </div>
            <p className={`text-[11px] pt-1 mt-2 border-t ${
              isDark ? 'border-white/10 text-slate-400' : 'border-black/10 text-slate-600'
            }`}>
              Verified docket access
            </p>
          </div>
        </div>

        {/* Inactive Accounts */}
        <div 
          className={`p-4 rounded-md border flex flex-col justify-between ${
            isDark ? 'bg-black border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Inactive Accounts</span>
            <div className="p-2 rounded-sm bg-blue-600/10 text-blue-600">
              <UserX size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-black'}`}>
                {stats.inactiveAccounts}
              </span>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Disabled</span>
            </div>
            <p className={`text-[11px] pt-1 mt-2 border-t ${
              isDark ? 'border-white/10 text-slate-400' : 'border-black/10 text-slate-600'
            }`}>
              Restricted or retired
            </p>
          </div>
        </div>
      </div>

      {/* Police Station Information & Recent Activity (Flat, separated by lines) */}
      <div className={`pt-4 border-t space-y-6 ${isDark ? 'border-white/10' : 'border-black/10'}`}>
        
        {/* Station Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-blue-600" />
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                Jurisdiction Station Configuration
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsStationModalOpen(true)}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View Full Station Specs
            </button>
          </div>

          <div className={`p-4 border grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs ${
            isDark ? 'border-white/10 bg-black text-slate-300' : 'border-black/10 bg-white text-slate-700'
          }`}>
            <div>
              <span className={`block font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Station Name</span>
              <span>{station.name}</span>
            </div>
            <div>
              <span className={`block font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Precinct Code</span>
              <span className="font-mono text-blue-600">{station.precinctCode}</span>
            </div>
            <div>
              <span className={`block font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Province & City</span>
              <span>{station.province} • {station.city}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>
              Recent Audit & Administrative Actions
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('activity')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View Activity Log
            </button>
          </div>

          <div className={`divide-y border-t ${isDark ? 'divide-white/10 border-white/10' : 'divide-black/10 border-black/10'}`}>
            {stats.recentActivity.map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-0.5">
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>{log.title}</p>
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{log.description}</p>
                </div>
                <span className={`text-[10px] font-mono shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Station Modal */}
      {isStationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className={`w-full max-w-lg border p-6 space-y-4 ${
            isDark ? 'bg-black border-white/20 text-white' : 'bg-white border-black/20 text-black'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-base">Station Configuration Details</h3>
              <button onClick={() => setIsStationModalOpen(false)} className="cursor-pointer text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 text-xs leading-relaxed">
              <p><strong>Name:</strong> {station.name}</p>
              <p><strong>Precinct Code:</strong> <span className="font-mono text-blue-600">{station.precinctCode}</span></p>
              <p><strong>Address:</strong> {station.address}, {station.suburb}</p>
              <p><strong>Emergency Contact:</strong> {station.phone}</p>
              <p><strong>Station Commander:</strong> {station.stationCommander}</p>
            </div>
            <div className="pt-3 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setIsStationModalOpen(false)}
                className={`px-4 py-1.5 border text-xs font-semibold cursor-pointer ${
                  isDark ? 'border-white/20 hover:bg-slate-900 text-white' : 'border-black/20 hover:bg-slate-100 text-black'
                }`}
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
