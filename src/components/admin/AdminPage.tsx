import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../../types/auth';
import { AdminTab, AdminUserRecord, ConfiguredPoliceStation, AdminActivityLog, AccountStatus } from '../../types/admin';
import { adminService } from '../../services/adminService';
import { getSystemActivityLogs } from '../../services/systemActivityService';
import { AdminSidebar } from './AdminSidebar';
import { AdminDashboardView } from './AdminDashboardView';
import { AdminUsersView } from './AdminUsersView';
import { AdminActivityView } from './AdminActivityView';
import { AdminProfileView } from './AdminProfileView';
import { SfenLogo } from '../SfenLogo';
import { 
  Building2, 
  LogOut, 
  Menu, 
  X, 
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface AdminPageProps {
  user: UserProfile;
  onSignOut: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ user, onSignOut }) => {
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dynamic Admin Service States
  const [usersList, setUsersList] = useState<AdminUserRecord[]>([]);
  const [stationData, setStationData] = useState<ConfiguredPoliceStation>(adminService.getConfiguredStation());
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile>(user);
  const [isAddPersonnelOpen, setIsAddPersonnelOpen] = useState(false);

  const refreshData = async () => {
    try {
      setUsersList(await adminService.getUsersFromApi(currentUserProfile.token));
    } catch {
      // Keeps the administrator page usable when the local API is unavailable.
      setUsersList(adminService.getUsers());
    }
    setStationData(adminService.getConfiguredStation());
    const localActivity = adminService.getActivityLogs();
    try {
      const systemActivity = await getSystemActivityLogs(currentUserProfile.token);
      setActivityLogs([...systemActivity, ...localActivity]);
    } catch {
      setActivityLogs(localActivity);
    }
  };

  useEffect(() => {
    void refreshData();
  }, []);

  const handleAddPersonnel = async (data: {
    fullName: string;
    personnelNumber: string;
    email: string;
    phoneNumber?: string;
    rank: string;
    role: UserRole;
    division?: string;
  }) => {
    const response = await fetch('/api/admin/personnel', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUserProfile.token}` }, body: JSON.stringify({ ...data, station: stationData.name }) });
    const payload = await response.json() as { message?: string; temporaryPassword?: string };
    if (!response.ok || !payload.temporaryPassword) throw new Error(payload.message || 'Could not create the personnel account.');
    const user = adminService.addPersonnel(data, currentUserProfile);
    await refreshData();
    return { user, temporaryPassword: payload.temporaryPassword };
  };

  const handleUpdateUser = (id: string, updates: Partial<AdminUserRecord>) => {
    adminService.updateUser(id, updates, currentUserProfile);
    refreshData();
  };

  const handleSetUserStatus = async (id: string, status: AccountStatus) => {
    const response = await fetch(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentUserProfile.token}`
      },
      body: JSON.stringify({ status })
    });
    const payload = await response.json() as { message?: string };
    if (!response.ok) throw new Error(payload.message || 'Could not update the account status.');
    await refreshData();
  };

  const handleResetPassword = (id: string) => {
    const res = adminService.resetUserPassword(id, currentUserProfile);
    refreshData();
    return res;
  };

  const handleUpdateProfile = (updates: { fullName: string; email: string; phoneNumber?: string }) => {
    const updated = {
      ...currentUserProfile,
      fullName: updates.fullName,
      email: updates.email
    };
    setCurrentUserProfile(updated);
    adminService.logActivity({
      actionType: 'PROFILE_UPDATED',
      title: 'Administrator Profile Updated',
      description: `Administrator ${updated.fullName} updated personal contact email to ${updated.email}.`,
      affectedUser: updated.fullName,
      adminName: updated.fullName,
      adminPersonnelNumber: updated.personnelNumber
    });
    refreshData();
  };

  const handleChangePassword = (oldPassword: string, newPassword: string) => {
    return adminService.changeAdminPassword(currentUserProfile.id, oldPassword, newPassword);
  };

  const dashboardStats = {
    totalUsers: usersList.length,
    activePersonnel: usersList.filter(u => u.accountType === 'PERSONNEL' && u.status === 'ACTIVE').length,
    complainantAccounts: usersList.filter(u => u.accountType === 'COMPLAINANT').length,
    inactiveAccounts: usersList.filter(u => u.status === 'INACTIVE' || u.status === 'SUSPENDED').length,
    personnelCount: usersList.filter(u => u.accountType === 'PERSONNEL').length,
    recentActivity: activityLogs.slice(0, 5)
  };

  const personnelUsers = usersList.filter(u => u.accountType === 'PERSONNEL');

  return (
    <div 
      id="admin-page-container" 
      className={`sfen-shell sfen-staff-shell min-h-screen flex flex-col justify-between selection:bg-blue-600 selection:text-white ${
        isDark ? 'bg-black text-white' : 'bg-white text-black'
      }`}
    >
      {/* Top Header */}
      <header 
        id="admin-topbar" 
        className={`sticky top-0 z-40 w-full border-b transition-colors ${
          isDark ? 'bg-black border-white/15 text-white' : 'bg-white border-black/15 text-black'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Mobile hamburger & Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-md border md:hidden cursor-pointer ${
                isDark ? 'border-white/10 text-white hover:bg-slate-900' : 'border-black/10 text-black hover:bg-slate-100'
              }`}
              aria-label="Toggle admin menu"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <SfenLogo size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-base tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>SFEN</span>
                <span className="text-[10px] font-bold px-2 py-0.5 border border-blue-600 text-blue-600 uppercase tracking-wider">
                  System Administration
                </span>
              </div>
              <p className={`text-[11px] hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Police Station Administration & Access Control
              </p>
            </div>
          </div>

          {/* Right: Station, Theme Toggle, Profile, and Sign Out */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs border ${
              isDark ? 'border-white/10 text-slate-300' : 'border-black/10 text-slate-700'
            }`}>
              <Building2 size={13} className="text-blue-600" />
              <span className="font-medium truncate max-w-[170px]">{stationData.name}</span>
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark/light theme"
              className={`p-2 border transition-colors cursor-pointer ${
                isDark 
                  ? 'border-white/20 text-white hover:bg-slate-900' 
                  : 'border-black/20 text-black hover:bg-slate-100'
              }`}
            >
              {isDark ? <Sun size={16} className="text-blue-500" /> : <Moon size={16} className="text-blue-600" />}
            </button>

            {/* Profile Avatar */}
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`hidden sm:flex items-center gap-2.5 px-3 py-1.5 border transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-blue-600 text-blue-600'
                  : isDark 
                    ? 'border-white/10 text-left hover:border-white/30 text-white' 
                    : 'border-black/10 text-left hover:border-black/30 text-black'
              }`}
            >
              <div className="w-6 h-6 bg-blue-600 flex items-center justify-center text-white font-bold text-xs uppercase">
                {currentUserProfile.fullName ? currentUserProfile.fullName.charAt(0) : 'A'}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold leading-tight">
                  {currentUserProfile.fullName}
                </p>
                <p className="text-[10px] text-blue-600 font-mono">
                  {currentUserProfile.rank || 'Admin'} • {currentUserProfile.personnelNumber}
                </p>
              </div>
            </button>

            {/* Sign Out Button */}
            <button
              type="button"
              id="btn-admin-logout"
              onClick={onSignOut}
              className={`flex items-center gap-2 px-3.5 py-1.5 border text-xs font-semibold transition-all cursor-pointer ${
                isDark 
                  ? 'border-white/20 text-white hover:bg-white hover:text-black' 
                  : 'border-black/20 text-black hover:bg-black hover:text-white'
              }`}
              title="Sign Out of Administration"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div 
          className={`md:hidden fixed inset-x-0 top-16 z-30 border-b p-4 shadow-xl ${
            isDark ? 'bg-black border-white/10' : 'bg-white border-black/10'
          }`}
        >
          <AdminSidebar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              setIsMobileMenuOpen(false);
            }}
            userCount={usersList.length}
            personnelCount={personnelUsers.length}
            onSignOut={onSignOut}
            isMobileDrawer
            onCloseMobileDrawer={() => setIsMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block shrink-0">
          <div className="sticky top-20">
            <AdminSidebar
              activeTab={activeTab}
              onSelectTab={(tab) => {
                setActiveTab(tab);
              }}
              userCount={usersList.length}
              personnelCount={personnelUsers.length}
              onSignOut={onSignOut}
            />
          </div>
        </div>

        {/* Content Area */}
        <main className={`sfen-content flex-1 min-w-0 py-6 sm:py-8 md:pl-8 ${activeTab === 'dashboard' ? 'sfen-dashboard' : ''}`}>
          {activeTab === 'dashboard' && (
            <AdminDashboardView
              stats={dashboardStats}
              station={stationData}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenAddPersonnel={() => {
                setActiveTab('users');
                setIsAddPersonnelOpen(true);
              }}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsersView
              users={usersList}
              configuredStation={stationData}
              currentUser={currentUserProfile}
              onAddPersonnel={handleAddPersonnel}
              onUpdateUser={handleUpdateUser}
              onSetUserStatus={handleSetUserStatus}
              onResetPassword={handleResetPassword}
              isAddModalOpenInitially={isAddPersonnelOpen}
              onCloseAddModal={() => setIsAddPersonnelOpen(false)}
            />
          )}

          {activeTab === 'activity' && (
            <AdminActivityView
              activityLogs={activityLogs}
            />
          )}

          {activeTab === 'profile' && (
            <AdminProfileView
              currentUser={currentUserProfile}
              onUpdateProfile={handleUpdateProfile}
              onChangePassword={handleChangePassword}
            />
          )}
        </main>
      </div>

      {/* Station Footer - separated by a clean line */}
      <footer className={`border-t py-4 px-4 text-center text-xs ${
        isDark ? 'border-white/10 text-slate-500' : 'border-black/10 text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {stationData.name || 'SAPS Berea Police Station'} • Republic of South Africa
          </span>
          <span className="font-mono">
            System Administrator: {currentUserProfile.rank} {currentUserProfile.fullName} ({currentUserProfile.personnelNumber})
          </span>
        </div>
      </footer>
    </div>
  );
};
