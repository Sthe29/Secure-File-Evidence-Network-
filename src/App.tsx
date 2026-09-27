import React, { useState } from 'react';
import { LoginForm } from './components/LoginForm';
import { CitizenPortal } from './components/CitizenPortal';
import { WelcomePage } from './components/WelcomePage';
import { ComplainantDashboard } from './components/complainant/ComplainantDashboard';
import { AdminPage } from './components/admin/AdminPage';
import { OfficerPage } from './components/officer/OfficerPage';
import { DetectivePage } from './components/detective/DetectivePage';
import { CommanderPage } from './components/commander/CommanderPage';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { AuthenticationSuccessModal } from './components/AuthenticationSuccessModal';
import { DemoAccountsDrawer } from './components/DemoAccountsDrawer';
import { UserProfile, DemoAccount, PortalType, CitizenProfile } from './types/auth';
import { Users, ShieldCheck, ArrowLeft, Sun, Moon, ArrowRight, Key } from 'lucide-react';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function AppContent() {
  const { theme, toggleTheme, isDark } = useTheme();

  // Welcoming Page is default landing
  const [viewMode, setViewMode] = useState<'welcome' | 'portal'>('welcome');

  // Active portal: 'citizen' or 'official'
  const [activePortal, setActivePortal] = useState<PortalType>('citizen');
  const [citizenInitialMode, setCitizenInitialMode] = useState<'login' | 'signup'>('login');
  
  // Specific notification if navigated from a welcome capability card
  const [targetRoleNotice, setTargetRoleNotice] = useState<string | null>(null);

  // Police Official Session State
  const [authenticatedOfficer, setAuthenticatedOfficer] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('sfen_authenticated_officer');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [selectedDemoAccount, setSelectedDemoAccount] = useState<DemoAccount | null>(null);

  // Citizen Session State
  const [authenticatedCitizen, setAuthenticatedCitizen] = useState<CitizenProfile | null>(() => {
    try {
      const stored = localStorage.getItem('sfen_active_citizen_session');
      const session = stored ? JSON.parse(stored) as CitizenProfile : null;
      // Browser-only citizen sessions from the earlier prototype cannot submit to the API.
      return session?.token ? session : null;
    } catch {
      return null;
    }
  });

  // Shared Modals
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotPasswordIdentifier, setForgotPasswordIdentifier] = useState('');

  const handleOfficerLoginSuccess = (user: UserProfile) => {
    setAuthenticatedOfficer(user);
    setTargetRoleNotice(null);
  };

  const handleCitizenLoginSuccess = (citizen: CitizenProfile) => {
    setAuthenticatedCitizen(citizen);
    setTargetRoleNotice(null);
    try {
      localStorage.setItem('sfen_active_citizen_session', JSON.stringify(citizen));
    } catch {
      // safe fallback
    }
  };

  const handleSignOutOfficer = () => {
    setAuthenticatedOfficer(null);
    setViewMode('welcome');
    setTargetRoleNotice(null);
    try {
      localStorage.removeItem('sfen_auth_token');
      localStorage.removeItem('sfen_authenticated_officer');
    } catch {
      // Safe fallback if browser storage is restricted.
    }
  };

  const handleSignOutCitizen = () => {
    setAuthenticatedCitizen(null);
    setViewMode('welcome');
    setTargetRoleNotice(null);
    try {
      localStorage.removeItem('sfen_active_citizen_session');
    } catch {
      // safe fallback
    }
  };

  // Direct quick demo logins for testing
  const handleDirectDemoCitizenLogin = () => {
    const demoCitizen: CitizenProfile = {
      id: 'ctz_thandi_01',
      fullName: 'Thandi Molefe',
      email: 'thandi.molefe@gmail.com',
      phoneNumber: '0825550192',
      registeredAt: '2026-03-10T09:15:00Z',
      activeDocketsCount: 1,
      residentialAddress: '42 Nelson Mandela Boulevard, Morningside, Johannesburg',
      nationalId: '920412 5082 089'
    };
    setAuthenticatedCitizen(demoCitizen);
  };

  const handleDirectDemoAdminLogin = () => {
    const demoAdmin: UserProfile = {
      id: 'usr_admin_01',
      personnelNumber: 'POL-40199',
      fullName: 'Marcus Cole',
      rank: 'Chief ICT Security Officer',
      email: 'm.cole@admin.sfen.gov',
      station: 'National Police Directorate',
      division: 'Information & Cryptographic Security',
      role: 'ADMINISTRATOR',
      clearanceLevel: 'Level 4 - National Security & Full Docket Audits',
      lastLogin: new Date().toISOString(),
      token: 'jwt_mock_admin_token_sfen_2026'
    };
    setAuthenticatedOfficer(demoAdmin);
  };

  const handleDirectDemoOfficerLogin = () => {
    const demoOfficer: UserProfile = {
      id: 'usr_csc_01',
      personnelNumber: 'POL-10824',
      fullName: 'Sarah Ndlovu',
      rank: 'Constable',
      email: 's.ndlovu@saps.gov.za',
      station: 'SAPS Sandton Police Station',
      division: 'Community Service Centre (CSC) Frontline Intake',
      role: 'CSC_OFFICER',
      clearanceLevel: 'Level 1 - Frontline Intake & Registration',
      lastLogin: new Date().toISOString(),
      token: 'jwt_mock_officer_token_sfen_2026'
    };
    setAuthenticatedOfficer(demoOfficer);
  };

  const handleDirectDemoDetectiveLogin = () => {
    const demoDetective: UserProfile = {
      id: 'usr_pol_20491',
      personnelNumber: 'POL-20491',
      fullName: 'David Khumalo',
      rank: 'Detective Inspector',
      email: 'd.khumalo@saps.gov.za',
      station: 'SAPS Sandton Police Station',
      division: 'Commercial Crime Section - Specialist Desk',
      role: 'DETECTIVE',
      clearanceLevel: 'Level 2 - Specialist Docket Custody & CID',
      lastLogin: new Date().toISOString(),
      token: 'jwt_mock_detective_token_sfen_2026'
    };
    setAuthenticatedOfficer(demoDetective);
  };

  const handleDirectDemoCommanderLogin = () => {
    const demoCommander: UserProfile = {
      id: 'usr_pol_30912',
      personnelNumber: 'POL-30912',
      fullName: 'Elena Vance',
      rank: 'Senior Superintendent',
      email: 'e.vance@command.sfen.gov',
      station: 'SAPS Sandton Police Station',
      division: 'Station Commander / CID Executive Oversight',
      role: 'COMMANDER',
      clearanceLevel: 'Level 3 - Station Command & Docket Authorization',
      lastLogin: new Date().toISOString(),
      token: 'jwt_mock_commander_token_sfen_2026'
    };
    setAuthenticatedOfficer(demoCommander);
  };

  const handleOpenForgotPassword = (identifier: string) => {
    setForgotPasswordIdentifier(identifier);
    setIsForgotPasswordOpen(true);
  };

  const handleSelectDemoAccount = (account: DemoAccount) => {
    setSelectedDemoAccount(account);
  };

  // When user clicks one of the 4 capability buttons on the welcoming page:
  // "then if user clicks them they have to login first then be able to do what they wanna do"
  const handleActionRequiresLogin = (target: 'citizen' | 'officer' | 'detective' | 'commander') => {
    if (target === 'citizen') {
      setActivePortal('citizen');
      setTargetRoleNotice('Please sign in as a citizen to lodge and track your case dockets.');
    } else if (target === 'officer') {
      setActivePortal('official');
      setTargetRoleNotice('Please sign in as a Police Officer (CSC) to capture and manage case dockets.');
    } else if (target === 'detective') {
      setActivePortal('official');
      setTargetRoleNotice('Please sign in as a Detective to investigate dockets and update evidence.');
    } else if (target === 'commander') {
      setActivePortal('official');
      setTargetRoleNotice('Please sign in as a Commander or Administrator to inspect and oversee dockets.');
    }
    setViewMode('portal');
  };

  // If citizen is authenticated, render the complete Complainant Dashboard
  if (authenticatedCitizen) {
    return (
      <ComplainantDashboard
        citizen={authenticatedCitizen}
        onSignOut={handleSignOutCitizen}
        onUpdateCitizen={(updated) => setAuthenticatedCitizen(updated)}
      />
    );
  }

  // If station commander is authenticated, render Station Commander Portal
  if (authenticatedOfficer && authenticatedOfficer.role === 'COMMANDER') {
    return (
      <CommanderPage
        user={authenticatedOfficer}
        onSignOut={handleSignOutOfficer}
      />
    );
  }

  // If detective is authenticated, render Detective Page
  if (authenticatedOfficer && authenticatedOfficer.role === 'DETECTIVE') {
    return (
      <DetectivePage
        user={authenticatedOfficer}
        onSignOut={handleSignOutOfficer}
      />
    );
  }

  // If police officer / CSC officer is authenticated, render Police Officer Page
  if (authenticatedOfficer && authenticatedOfficer.role === 'CSC_OFFICER') {
    return (
      <OfficerPage
        user={authenticatedOfficer}
        onSignOut={handleSignOutOfficer}
      />
    );
  }

  // If system administrator is authenticated, render System Administrator Page
  if (authenticatedOfficer && authenticatedOfficer.role === 'ADMINISTRATOR') {
    return (
      <AdminPage
        user={authenticatedOfficer}
        onSignOut={handleSignOutOfficer}
      />
    );
  }

  // Welcoming Page (Default Landing Screen)
  if (viewMode === 'welcome') {
    return (
      <>
        <WelcomePage
          onSignInCitizen={() => {
            setCitizenInitialMode('login');
            setActivePortal('citizen');
            setTargetRoleNotice(null);
            setViewMode('portal');
          }}
          onSignUpCitizen={() => {
            setCitizenInitialMode('signup');
            setActivePortal('citizen');
            setTargetRoleNotice(null);
            setViewMode('portal');
          }}
          onSignInOfficial={() => {
            setActivePortal('official');
            setTargetRoleNotice(null);
            setViewMode('portal');
          }}
          onActionRequiresLogin={handleActionRequiresLogin}
        />

        <ForgotPasswordModal
          isOpen={isForgotPasswordOpen}
          onClose={() => setIsForgotPasswordOpen(false)}
          initialIdentifier={forgotPasswordIdentifier}
        />
      </>
    );
  }

  // Portal Mode (Sign In / Registration Screen)
  return (
    <div className={`min-h-screen flex flex-col justify-between selection:bg-blue-600 selection:text-white ${
      isDark ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      
      {/* Top Navigation Bar - Separated by a clean line side by side */}
      <header className={`w-full border-b py-3 px-4 sm:px-8 flex items-center justify-between ${
        isDark ? 'border-white/10' : 'border-black/10'
      }`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setViewMode('welcome')}
            className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-md border transition-colors cursor-pointer ${
              isDark 
                ? 'border-white/20 text-white hover:bg-slate-900' 
                : 'border-black/20 text-black hover:bg-slate-100'
            }`}
          >
            <ArrowLeft size={14} className="text-blue-600" />
            <span>Back to Welcoming Page</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-blue-600 font-mono hidden sm:inline">
            SFEN POLICE DOCKET SYSTEM
          </span>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark/light theme"
            className={`p-1.5 rounded-md border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              isDark 
                ? 'border-white/20 text-white hover:bg-slate-900' 
                : 'border-black/20 text-black hover:bg-slate-100'
            }`}
          >
            {isDark ? <Sun size={15} className="text-blue-500" /> : <Moon size={15} className="text-blue-600" />}
            <span className="hidden md:inline font-mono">{isDark ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-5xl mx-auto w-full">
        
        {/* Main Portal Switcher - Flat tabs separated by a line going side by side */}
        <div className={`w-full max-w-md mx-auto mb-6 flex border-b ${
          isDark ? 'border-white/15' : 'border-black/15'
        }`}>
          <button
            type="button"
            id="portal-tab-citizen"
            onClick={() => {
              setActivePortal('citizen');
              setAuthenticatedOfficer(null);
            }}
            className={`flex-1 py-2.5 px-3 font-bold text-xs sm:text-sm border-b-2 transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              activePortal === 'citizen'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users size={16} />
            <span>Citizen Portal</span>
          </button>

          <button
            type="button"
            id="portal-tab-officials"
            onClick={() => {
              setActivePortal('official');
              setAuthenticatedCitizen(null);
            }}
            className={`flex-1 py-2.5 px-3 font-bold text-xs sm:text-sm border-b-2 transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              activePortal === 'official'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck size={16} />
            <span>Police Officials</span>
          </button>
        </div>

        {/* CITIZEN PORTAL */}
        {activePortal === 'citizen' && (
          <div className="w-full flex flex-col items-center">
            <CitizenPortal
              onSuccess={handleCitizenLoginSuccess}
              onForgotPassword={handleOpenForgotPassword}
              targetRoleNotice={targetRoleNotice}
              initialAuthMode={citizenInitialMode}
            />

            {/* Quick Demo Access for Complainant */}
            <div className="mt-4 w-full max-w-md">
              <button
                type="button"
                id="btn-quick-demo-complainant"
                onClick={handleDirectDemoCitizenLogin}
                className={`w-full py-2.5 px-3 rounded-md border text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                  isDark 
                    ? 'border-blue-600/40 hover:border-blue-600 bg-black text-blue-400' 
                    : 'border-blue-600/40 hover:border-blue-600 bg-white text-blue-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Key size={14} className="text-blue-600" />
                  <span>Instant Test Login: Complainant (Thandi Molefe)</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-blue-600 font-bold">
                  <span>Enter</span>
                  <ArrowRight size={13} />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* POLICE OFFICIALS PORTAL */}
        {activePortal === 'official' && (
          <div className="w-full flex flex-col items-center">
            {authenticatedOfficer ? (
              <AuthenticationSuccessModal
                user={authenticatedOfficer}
                onSignOut={handleSignOutOfficer}
              />
            ) : (
              <div className="w-full flex flex-col items-center">
                <LoginForm
                  onSuccess={handleOfficerLoginSuccess}
                  onForgotPassword={handleOpenForgotPassword}
                  prefillAccount={selectedDemoAccount}
                  targetRoleNotice={targetRoleNotice}
                />

                {/* Direct Role Test Buttons */}
                <div className="mt-4 w-full max-w-md space-y-2">
                  <button
                    type="button"
                    id="btn-quick-demo-commander"
                    onClick={handleDirectDemoCommanderLogin}
                    className={`w-full py-2 px-3 rounded-md border text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                      isDark 
                        ? 'border-white/10 hover:border-blue-600 bg-black text-slate-300' 
                        : 'border-black/10 hover:border-blue-600 bg-white text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Key size={13} className="text-blue-600" />
                      <span>Station Commander (Snr. Supt. Elena Vance)</span>
                    </div>
                    <ArrowRight size={13} className="text-blue-600" />
                  </button>

                  <button
                    type="button"
                    id="btn-quick-demo-detective"
                    onClick={handleDirectDemoDetectiveLogin}
                    className={`w-full py-2 px-3 rounded-md border text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                      isDark 
                        ? 'border-white/10 hover:border-blue-600 bg-black text-slate-300' 
                        : 'border-black/10 hover:border-blue-600 bg-white text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Key size={13} className="text-blue-600" />
                      <span>Detective Inspector (David Khumalo)</span>
                    </div>
                    <ArrowRight size={13} className="text-blue-600" />
                  </button>

                  <button
                    type="button"
                    id="btn-quick-demo-officer"
                    onClick={handleDirectDemoOfficerLogin}
                    className={`w-full py-2 px-3 rounded-md border text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                      isDark 
                        ? 'border-white/10 hover:border-blue-600 bg-black text-slate-300' 
                        : 'border-black/10 hover:border-blue-600 bg-white text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Key size={13} className="text-blue-600" />
                      <span>Police Officer (Constable Sarah Ndlovu)</span>
                    </div>
                    <ArrowRight size={13} className="text-blue-600" />
                  </button>

                  <button
                    type="button"
                    id="btn-quick-demo-admin"
                    onClick={handleDirectDemoAdminLogin}
                    className={`w-full py-2 px-3 rounded-md border text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                      isDark 
                        ? 'border-white/10 hover:border-blue-600 bg-black text-slate-300' 
                        : 'border-black/10 hover:border-blue-600 bg-white text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Key size={13} className="text-blue-600" />
                      <span>System Administrator (Marcus Cole)</span>
                    </div>
                    <ArrowRight size={13} className="text-blue-600" />
                  </button>
                </div>

                <div className="mt-4 w-full max-w-md">
                  <DemoAccountsDrawer onSelectAccount={handleSelectDemoAccount} />
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        initialIdentifier={forgotPasswordIdentifier}
      />

      {/* Official Legal Footer */}
      <footer className={`w-full border-t py-4 px-6 text-center text-xs ${
        isDark ? 'border-white/10 text-slate-500' : 'border-black/10 text-slate-500'
      }`}>
        <p>National Police Service - Docket and Evidence Administration - Ver. 2.4</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
