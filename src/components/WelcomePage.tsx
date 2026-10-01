import React from 'react';
import { 
  FileText, 
  UserCheck, 
  Search, 
  ShieldCheck, 
  LogIn, 
  Sun, 
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import policeStationHero from '../assets/images/police_station_hero_1790253890766.jpg';

interface WelcomePageProps {
  onSignInCitizen: () => void;
  onSignUpCitizen: () => void;
  onSignInOfficial: (roleIntent?: 'officer' | 'detective' | 'commander' | 'admin') => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onSignInCitizen,
  onSignUpCitizen,
  onSignInOfficial
}) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <div className={`sfen-shell relative isolate min-h-screen w-full flex flex-col justify-between selection:bg-blue-600 selection:text-white font-sans ${
      isDark ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <img
          src={policeStationHero}
          alt="South African Police Service station"
          className="h-full w-full object-cover"
        />
        <div className={`absolute inset-0 ${isDark ? 'bg-black/80' : 'bg-white/85'}`} />
      </div>

      <header className={`relative z-10 w-full py-4 px-6 sm:px-10 flex items-center justify-between border-b ${isDark ? 'border-white/15' : 'border-black/15'}`}>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight font-mono">SFEN</span>
          <span className="text-blue-600 font-semibold text-xs tracking-wider uppercase">POLICE CASE SYSTEM</span>
        </div>

        {/* Right side controls: Official Portal and Dark Mode button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="btn-top-official-portal"
            onClick={() => onSignInOfficial()}
            className={`px-3.5 py-1.5 text-xs font-semibold border cursor-pointer flex items-center gap-1.5 ${isDark ? 'border-white/20 text-white hover:bg-white hover:text-black' : 'border-black/20 text-black hover:bg-black hover:text-white'}`}
          >
            <ShieldCheck size={14} className="text-blue-500" />
            <span>Official Portal</span>
          </button>

          <button
            type="button"
            id="btn-top-darkmode-toggle"
            onClick={toggleTheme}
            aria-label="Toggle dark/light theme"
            className={`p-2 border flex items-center gap-1.5 text-xs cursor-pointer ${isDark ? 'border-white/20 text-white hover:bg-white hover:text-black' : 'border-black/20 text-black hover:bg-black hover:text-white'}`}
          >
            {isDark ? <Sun size={14} className="text-blue-400" /> : <Moon size={14} className="text-blue-400" />}
            <span className="hidden sm:inline font-mono">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 max-w-5xl mx-auto w-full text-center">
        <div className="space-y-2 mb-5">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight font-mono">Secure File and Evidence Network</h1>
          <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Police case management and electronic records.</p>
        </div>

        <div className={`w-full max-w-4xl border-t ${isDark ? 'border-white/15' : 'border-black/15'}`} />

        {/* Four plain descriptions of the SFEN work areas. */}
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left my-3">
          
          <div className={`p-3 border-b sm:border-b-0 sm:border-r last:border-r-0 ${isDark ? 'border-white/15' : 'border-black/15'}`}>
            <div className="flex items-center gap-2 text-blue-400 mb-1.5">
              <FileText size={18} className="shrink-0" />
              <span className="text-sm font-bold">
                Report & Track Cases
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Submit crime incidents, receive electronic references, and track CAS docket progress.
            </p>
            <p className="mt-2 text-[11px] font-semibold text-blue-600">Citizen reporting access</p>
          </div>

          <div className={`p-3 border-b sm:border-b-0 sm:border-r last:border-r-0 ${isDark ? 'border-white/15' : 'border-black/15'}`}>
            <div className="flex items-center gap-2 text-blue-400 mb-1.5">
              <UserCheck size={18} className="shrink-0" />
              <span className="text-sm font-bold">
                Capture & Manage Cases
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Frontline Community Service Centre intake, docket registration, and sworn witness statements.
            </p>
            <p className="mt-2 text-[11px] font-semibold text-blue-600">Community Service Centre access</p>
          </div>

          <div className={`p-3 border-b sm:border-b-0 sm:border-r last:border-r-0 ${isDark ? 'border-white/15' : 'border-black/15'}`}>
            <div className="flex items-center gap-2 text-blue-400 mb-1.5">
              <Search size={18} className="shrink-0" />
              <span className="text-sm font-bold">
                Investigate & Update
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Specialist criminal investigations, forensic diary updates, suspect logs, and court evidence.
            </p>
            <p className="mt-2 text-[11px] font-semibold text-blue-600">Detective branch access</p>
          </div>

          <div className="p-3">
            <div className="flex items-center gap-2 text-blue-400 mb-1.5">
              <ShieldCheck size={18} className="shrink-0" />
              <span className="text-sm font-bold">
                Monitor & Oversee
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Station commander oversight, docket disposal approvals, inspection diaries, and audit security.
            </p>
            <p className="mt-2 text-[11px] font-semibold text-blue-600">Station command access</p>
          </div>

        </div>

        <div className={`w-full max-w-4xl my-4 border-t ${isDark ? 'border-white/15' : 'border-black/15'}`} />

        {/* Bottom 2 buttons: Sign In and Create Account for citizens / complainants (users) */}
        <div className="w-full max-w-md mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 mt-2">
          
          <button
            type="button"
            id="btn-welcome-citizen-signin"
            onClick={onSignInCitizen}
            className="w-full sm:w-1/2 py-3 px-5 font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            id="btn-welcome-citizen-signup"
            onClick={onSignUpCitizen}
            className={`w-full sm:w-1/2 py-3 px-5 font-bold text-sm border flex items-center justify-center gap-2 cursor-pointer ${isDark ? 'bg-black hover:bg-white hover:text-black text-white border-white/30' : 'bg-white hover:bg-black hover:text-white text-black border-black/30'}`}
          >
            <UserCheck size={16} className="text-blue-500" />
            <span>Create Account</span>
          </button>

        </div>

      </main>

      <footer className={`relative z-10 w-full py-4 px-4 text-center border-t text-[10px] ${isDark ? 'border-white/15 text-slate-400' : 'border-black/15 text-slate-600'}`}>
        Secure File and Evidence Network | Official Docket Administration
      </footer>

    </div>
  );
};
