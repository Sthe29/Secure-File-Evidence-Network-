import React, { useState, useMemo } from 'react';
import { AdminUserRecord, AccountType, AccountStatus, ConfiguredPoliceStation } from '../../types/admin';
import { UserRole, UserProfile } from '../../types/auth';
import { 
  Users, 
  Search, 
  UserPlus, 
  Filter, 
  ShieldCheck, 
  User, 
  KeyRound, 
  Eye, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Building2,
  Mail,
  Phone,
  Calendar,
  Lock,
  X,
  Copy,
  Check,
  ChevronRight
} from 'lucide-react';

interface AdminUsersViewProps {
  users: AdminUserRecord[];
  configuredStation: ConfiguredPoliceStation;
  currentUser: UserProfile;
  onAddPersonnel: (data: {
    fullName: string;
    personnelNumber: string;
    email: string;
    phoneNumber?: string;
    rank: string;
    role: UserRole;
    division?: string;
  }) => void;
  onUpdateUser: (id: string, updates: Partial<AdminUserRecord>) => void;
  onSetUserStatus: (id: string, status: AccountStatus) => void;
  onResetPassword: (id: string) => { success: boolean; tempPassword: string; message: string };
  isAddModalOpenInitially?: boolean;
  onCloseAddModal?: () => void;
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({
  users,
  configuredStation,
  currentUser,
  onAddPersonnel,
  onUpdateUser,
  onSetUserStatus,
  onResetPassword,
  isAddModalOpenInitially = false,
  onCloseAddModal
}) => {
  // Filter States
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'PERSONNEL' | 'COMPLAINANT'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AccountStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(isAddModalOpenInitially);
  const [viewingUser, setViewingUser] = useState<AdminUserRecord | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUserRecord | null>(null);
  const [resetResult, setResetResult] = useState<{ user: AdminUserRecord; tempPassword: string } | null>(null);
  const [copiedResetPin, setCopiedResetPin] = useState(false);

  // New Personnel Form State
  const [formData, setFormData] = useState({
    fullName: '',
    personnelNumber: '',
    email: '',
    phoneNumber: '',
    rank: 'Constable',
    role: 'CSC_OFFICER' as UserRole,
    division: 'Community Service Centre Intake'
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    rank: '',
    division: '',
    role: 'CSC_OFFICER' as UserRole | 'COMPLAINANT'
  });

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Type filter
      if (typeFilter !== 'ALL' && u.accountType !== typeFilter) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'ALL' && u.status !== statusFilter) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = u.fullName.toLowerCase().includes(q);
        const matchesId = u.identifier.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesPhone = u.phoneNumber ? u.phoneNumber.toLowerCase().includes(q) : false;
        const matchesRole = u.role.toLowerCase().includes(q);
        return matchesName || matchesId || matchesEmail || matchesPhone || matchesRole;
      }
      return true;
    });
  }, [users, typeFilter, statusFilter, searchQuery]);

  const handleOpenAddModal = () => {
    setFormData({
      fullName: '',
      personnelNumber: `POL-${Math.floor(10000 + Math.random() * 90000)}`,
      email: '',
      phoneNumber: '011 722 4200',
      rank: 'Constable',
      role: 'CSC_OFFICER',
      division: 'Community Service Centre Intake'
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleCloseAdd = () => {
    setIsAddModalOpen(false);
    if (onCloseAddModal) onCloseAddModal();
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.fullName.trim()) {
      setFormError('Official full name is required.');
      return;
    }
    if (!formData.personnelNumber.trim()) {
      setFormError('Personnel number (e.g. POL-84920) is required.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('A valid official departmental email address is required.');
      return;
    }

    try {
      onAddPersonnel({
        fullName: formData.fullName.trim(),
        personnelNumber: formData.personnelNumber.trim().toUpperCase(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        rank: formData.rank.trim(),
        role: formData.role,
        division: formData.division.trim()
      });
      handleCloseAdd();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create personnel account.');
    }
  };

  const handleStartEdit = (user: AdminUserRecord) => {
    setEditingUser(user);
    setEditFormData({
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      rank: user.rank || '',
      division: user.division || '',
      role: user.role
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    onUpdateUser(editingUser.id, {
      fullName: editFormData.fullName.trim(),
      email: editFormData.email.trim(),
      phoneNumber: editFormData.phoneNumber.trim(),
      rank: editFormData.rank.trim() || undefined,
      division: editFormData.division.trim() || undefined,
      role: editFormData.role
    });

    setEditingUser(null);
  };

  const handlePerformReset = (user: AdminUserRecord) => {
    const res = onResetPassword(user.id);
    setResetResult({
      user,
      tempPassword: res.tempPassword
    });
  };

  const handleCopyPassword = () => {
    if (resetResult?.tempPassword) {
      navigator.clipboard.writeText(resetResult.tempPassword);
      setCopiedResetPin(true);
      setTimeout(() => setCopiedResetPin(false), 2000);
    }
  };

  const getPositionText = (u: AdminUserRecord) => {
    if (u.accountType === 'COMPLAINANT') {
      return 'Complainant';
    }
    const roleNameMap: Record<string, string> = {
      CSC_OFFICER: 'CSC / Police Officer',
      DETECTIVE: 'Detective / Investigating Officer',
      COMMANDER: 'Commander / Supervisor',
      ADMINISTRATOR: 'System Administrator'
    };
    const roleTitle = roleNameMap[u.role] || u.role;
    return u.rank ? `${u.rank} • ${roleTitle}` : roleTitle;
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'CSC_OFFICER':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 border border-blue-500/30 text-blue-300">CSC Officer</span>;
      case 'DETECTIVE':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300">Detective</span>;
      case 'COMMANDER':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">Commander</span>;
      case 'ADMINISTRATOR':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-300">Administrator</span>;
      case 'COMPLAINANT':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/15 border border-teal-500/30 text-teal-300">Complainant</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400">{role}</span>;
    }
  };

  const getStatusBadge = (status: AccountStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Active</span>
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Inactive</span>
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 border border-rose-500/30 text-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>Suspended</span>
          </span>
        );
    }
  };

  return (
    <div id="admin-users-view" className="space-y-6">
      {/* Floating Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-1">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            User Accounts
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage authorized police personnel and registered complainant accounts across SFEN.
          </p>
        </div>

        <button
          type="button"
          id="btn-open-add-personnel"
          onClick={handleOpenAddModal}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer self-start sm:self-center"
        >
          <UserPlus size={15} />
          <span>Add Police Personnel</span>
        </button>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Simple Type Filters */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start">
          <button
            type="button"
            onClick={() => setTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              typeFilter === 'ALL'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Accounts ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('PERSONNEL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              typeFilter === 'PERSONNEL'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Personnel ({users.filter(u => u.accountType === 'PERSONNEL').length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('COMPLAINANT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              typeFilter === 'COMPLAINANT'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Complainants ({users.filter(u => u.accountType === 'COMPLAINANT').length})
          </button>
        </div>

        {/* Right: Status Filter & Search Input */}
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <select
            aria-label="Filter by account status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
            <option value="SUSPENDED">Suspended Only</option>
          </select>

          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, ID, POL#, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Users List / Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users size={28} className="mx-auto text-slate-600" />
            <p className="text-sm font-bold text-white">No user accounts found</p>
            <p className="text-xs text-slate-400">
              Try adjusting your search criteria or switch the account filter.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                onClick={() => setViewingUser(u)}
                className="p-4 sm:p-5 hover:bg-slate-800/40 transition-all flex items-center justify-between gap-4 cursor-pointer group"
              >
                {/* User Identity: Name & Position */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${
                    u.accountType === 'PERSONNEL' 
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
                      : 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {u.fullName.charAt(0)}
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <h3 className="font-bold text-white text-sm sm:text-base group-hover:text-purple-300 transition-colors truncate">
                      {u.fullName}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium truncate">
                      {getPositionText(u)}
                    </p>
                  </div>
                </div>

                {/* Right Arrow / View Details Action */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-purple-400 group-hover:text-purple-300 font-semibold hidden sm:inline transition-colors">
                    View Details
                  </span>
                  <ChevronRight size={18} className="text-slate-500 group-hover:text-purple-300 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL: ADD POLICE PERSONNEL
          ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck size={15} />
                  <span>Police Official Provisioning</span>
                </div>
                <h3 className="text-xl font-extrabold text-white mt-1">
                  Add Police Personnel Account
                </h3>
                <p className="text-xs text-slate-400">
                  Police officials must not register themselves. Provision verified law enforcement credentials.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseAdd}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitAdd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Official Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Ndlovu"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                {/* Personnel Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Personnel Number (POL-ID) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. POL-10824"
                    value={formData.personnelNumber}
                    onChange={(e) => setFormData({ ...formData, personnelNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Official Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Departmental Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="officer@police.sfen.gov"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                {/* Contact Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Official Contact Number
                  </label>
                  <input
                    type="text"
                    placeholder="011 722 4200"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Police Rank */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Police Rank *
                  </label>
                  <select
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="Constable">Constable</option>
                    <option value="Sergeant">Sergeant</option>
                    <option value="Detective Constable">Detective Constable</option>
                    <option value="Detective Sergeant">Detective Sergeant</option>
                    <option value="Detective Inspector">Detective Inspector</option>
                    <option value="Captain">Captain</option>
                    <option value="Superintendent">Superintendent</option>
                    <option value="Senior Superintendent">Senior Superintendent</option>
                    <option value="Brigadier">Brigadier</option>
                    <option value="Chief ICT Security Officer">Chief ICT Security Officer</option>
                  </select>
                </div>

                {/* System Role */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    SFEN Operational Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="CSC_OFFICER">CSC / Police Officer (Level 1 Frontline Desk)</option>
                    <option value="DETECTIVE">Detective / Investigating Officer (Level 2 CID)</option>
                    <option value="COMMANDER">Commander / Supervisor (Level 3 Station Oversight)</option>
                    <option value="ADMINISTRATOR">System Administrator (Level 4 System Admin)</option>
                  </select>
                </div>
              </div>

              {/* Station Affiliation */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Assigned Station:</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 font-bold">
                    Automatic
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white font-bold">
                  <Building2 size={14} className="text-blue-400 shrink-0" />
                  <span>{configuredStation.name}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Personnel automatically belong to this managed police station.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseAdd}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Create Personnel Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: VIEW USER DETAILS
          ========================================================================= */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
                  viewingUser.accountType === 'PERSONNEL'
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                    : 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {viewingUser.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white">
                    {viewingUser.fullName}
                  </h3>
                  <p className="text-xs text-purple-300 font-medium">
                    {getPositionText(viewingUser)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 divide-y divide-slate-800/80 text-xs space-y-2.5">
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Position / Title</span>
                <span className="font-semibold text-white">{getPositionText(viewingUser)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Account Type</span>
                <span className="font-bold text-white">{viewingUser.accountType}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">System Role</span>
                <span>{getRoleBadge(viewingUser.role)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Account Status</span>
                <span>{getStatusBadge(viewingUser.status)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Account Identifier</span>
                <span className="text-purple-300 font-mono font-bold">{viewingUser.identifier}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Email Address</span>
                <span className="text-slate-200 font-mono">{viewingUser.email}</span>
              </div>
              {viewingUser.phoneNumber && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Contact Phone</span>
                  <span className="text-slate-200 font-mono">{viewingUser.phoneNumber}</span>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Station Affiliation</span>
                <span className="text-slate-200">{viewingUser.station}</span>
              </div>
              {viewingUser.division && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Division</span>
                  <span className="text-slate-200">{viewingUser.division}</span>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Last Login</span>
                <span className="text-slate-300 font-mono">{viewingUser.lastLogin}</span>
              </div>
            </div>

            {/* Actions: Edit, Status Toggle, Reset Password, Close */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Edit Button */}
                <button
                  type="button"
                  id="btn-modal-edit-user"
                  onClick={() => {
                    const target = viewingUser;
                    setViewingUser(null);
                    handleStartEdit(target);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Edit3 size={13} />
                  <span>Edit Account</span>
                </button>

                {/* Status Toggle (Activate / Deactivate) */}
                {viewingUser.status === 'ACTIVE' ? (
                  <button
                    type="button"
                    onClick={() => {
                      onSetUserStatus(viewingUser.id, 'INACTIVE');
                      setViewingUser({ ...viewingUser, status: 'INACTIVE' });
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 hover:bg-amber-500/10 text-amber-400 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <XCircle size={13} />
                    <span>Deactivate</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onSetUserStatus(viewingUser.id, 'ACTIVE');
                      setViewingUser({ ...viewingUser, status: 'ACTIVE' });
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-400 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 size={13} />
                    <span>Activate</span>
                  </button>
                )}

                {/* Password / Account Reset */}
                <button
                  type="button"
                  onClick={() => {
                    const target = viewingUser;
                    setViewingUser(null);
                    handlePerformReset(target);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 hover:bg-purple-500/10 text-purple-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <KeyRound size={13} />
                  <span>Reset Password</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT USER
          ========================================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Edit Account Information
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {editingUser.identifier} ({editingUser.fullName})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={editFormData.phoneNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {editingUser.accountType === 'PERSONNEL' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      Rank
                    </label>
                    <input
                      type="text"
                      value={editFormData.rank}
                      onChange={(e) => setEditFormData({ ...editFormData, rank: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      System Role
                    </label>
                    <select
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="CSC_OFFICER">CSC / Police Officer</option>
                      <option value="DETECTIVE">Detective / Investigating Officer</option>
                      <option value="COMMANDER">Commander / Supervisor</option>
                      <option value="ADMINISTRATOR">System Administrator</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: PASSWORD RESET CONFIRMATION
          ========================================================================= */}
      {resetResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-purple-400">
              <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30">
                <KeyRound size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Password Reset Successful
                </h3>
                <p className="text-xs text-slate-400">
                  Temporary credentials generated
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              The password for <strong className="text-white">{resetResult.user.fullName}</strong> ({resetResult.user.identifier}) has been reset. Provide this temporary credential to the user:
            </p>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="font-mono text-base font-extrabold text-purple-300">
                {resetResult.tempPassword}
              </span>
              <button
                type="button"
                onClick={handleCopyPassword}
                className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedResetPin ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedResetPin ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              The user will be prompted to choose a permanent secure password upon their next login.
            </p>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setResetResult(null)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
