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
import { UserProfile, PortalType, CitizenProfile } from './types/auth';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
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
      const session = stored ? JSON.parse(stored) as UserProfile : null;
      // Sessions created by the pre-backend prototype used placeholder tokens.
      // They cannot be authorised by PostgreSQL-backed API routes.
      if (session?.token?.startsWith('jwt_mock_')) {
        localStorage.removeItem('sfen_authenticated_officer');
        localStorage.removeItem('sfen_auth_token');
        return null;
      }
      if (session?.station?.includes('Sandton') || session?.station?.includes('Durban Central')) {
        const updatedSession = { ...session, station: 'SAPS Berea Police Station' };
        localStorage.setItem('sfen_authenticated_officer', JSON.stringify(updatedSession));
        return updatedSession;
      }
      return session;
    } catch {
      return null;
    }
  });

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
  const [forgotPasswordAudience, setForgotPasswordAudience] = useState<'citizen' | 'official'>('citizen');

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

  const handleOpenForgotPassword = (identifier: string, audience: 'citizen' | 'official') => {
    setForgotPasswordIdentifier(identifier);
    setForgotPasswordAudience(audience);
    setIsForgotPasswordOpen(true);
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
        />

        <ForgotPasswordModal
          isOpen={isForgotPasswordOpen}
          onClose={() => setIsForgotPasswordOpen(false)}
          initialIdentifier={forgotPasswordIdentifier}
          audience={forgotPasswordAudience}
        />
      </>
    );
  }

  // Portal Mode (Sign In / Registration Screen)
  return (
    <div className={`sfen-shell min-h-screen flex flex-col justify-between selection:bg-blue-600 selection:text-white ${
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
        
        {/* CITIZEN PORTAL */}
        {activePortal === 'citizen' && (
          <div className="w-full flex flex-col items-center">
            <CitizenPortal
              onSuccess={handleCitizenLoginSuccess}
              onForgotPassword={(identifier) => handleOpenForgotPassword(identifier, 'citizen')}
              targetRoleNotice={targetRoleNotice}
              initialAuthMode={citizenInitialMode}
            />

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
                  onForgotPassword={(identifier) => handleOpenForgotPassword(identifier, 'official')}
                  targetRoleNotice={targetRoleNotice}
                />
              </div>
            )}
          </div>
        )}

      </main>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        initialIdentifier={forgotPasswordIdentifier}
        audience={forgotPasswordAudience}
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
