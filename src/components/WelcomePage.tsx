import React from 'react';
import { 
  FileText, 
  UserCheck, 
  Search, 
  ShieldCheck, 
  LogIn, 
  Sun, 
  Moon,
  ArrowRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import policeStationHero from '../assets/images/police_station_hero_1790253890766.jpg';

interface WelcomePageProps {
  onSignInCitizen: () => void;
  onSignUpCitizen: () => void;
  onSignInOfficial: (roleIntent?: 'officer' | 'detective' | 'commander' | 'admin') => void;
  onActionRequiresLogin: (target: 'citizen' | 'officer' | 'detective' | 'commander') => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onSignInCitizen,
  onSignUpCitizen,
  onSignInOfficial,
  onActionRequiresLogin
}) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <div className={`relative min-h-screen w-full flex flex-col justify-between selection:bg-blue-600 selection:text-white font-sans ${
      isDark ? 'bg-black text-white' : 'bg-slate-900 text-white'
    }`}>
      
      {/* Background Image - static, crisp, no pulsing animation or gradients */}
      <div className="absolute inset-0 z-0">
        <img
          src={policeStationHero}
          alt="South African Police Service station at dusk"
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.endsWith('/assets/police_station_hero.jpg')) {
              target.src = '/assets/police_station_hero.jpg';
            }
          }}
        />
        {/* Solid dark overlay blending with background picture */}
        <div className="absolute inset-0 bg-black/75 backdrop-blur-[1px]" />
      </div>

      {/* Top Bar - Official Portal & Dark Mode Button on Top Right (Citizen Sign In removed) */}
      <header className="relative z-10 w-full pt-5 px-6 sm:px-10 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-white font-mono">SFEN</span>
          <span className="text-blue-500 font-semibold text-xs tracking-wider uppercase">POLICE CASE SYSTEM</span>
        </div>

        {/* Right side controls: Official Portal and Dark Mode button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="btn-top-official-portal"
            onClick={() => onSignInOfficial()}
            className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-black/60 hover:bg-black text-white border border-white/20 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ShieldCheck size={14} className="text-blue-500" />
            <span>Official Portal</span>
          </button>

          <button
            type="button"
            id="btn-top-darkmode-toggle"
            onClick={toggleTheme}
            aria-label="Toggle dark/light theme"
            className="p-2 rounded-md bg-black/40 hover:bg-black/70 text-white border border-white/20 transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
          >
            {isDark ? <Sun size={14} className="text-blue-400" /> : <Moon size={14} className="text-blue-400" />}
            <span className="hidden sm:inline font-mono">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </header>

      {/* Center Main Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 max-w-5xl mx-auto w-full text-center">
        
        {/* SFEN Main Title */}
        <div className="space-y-1 mb-2">
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white font-['Space_Grotesk']">
            SFEN
          </h1>
          <div className="w-16 h-1 bg-blue-600 mx-auto" />
        </div>

        {/* Subtitle */}
        <p className="text-base sm:text-xl font-medium text-slate-200 tracking-wide mt-2">
          Police Case Management and Electronic Records System
        </p>

        {/* Core Pillars */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-blue-400 my-3">
          <span>SECURE</span>
          <span className="text-slate-500">|</span>
          <span>EFFICIENT</span>
          <span className="text-slate-500">|</span>
          <span>ACCOUNTABLE</span>
          <span className="text-slate-500">|</span>
          <span>CONNECTED</span>
        </div>

        {/* Empowering Justice Paragraph */}
        <div className="max-w-2xl mx-auto my-3 px-2">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            <span className="font-bold text-white">Empowering Justice. Protecting Communities.</span>{' '}
            A unified digital policing ecosystem connecting citizens and law enforcement. Lodge incident reports, track CAS docket milestones in real-time, safeguard evidence custody, and streamline investigations with complete transparency.
          </p>
        </div>

        {/* Horizontal Divider Line */}
        <div className="w-full max-w-4xl my-5 border-t border-white/15" />

        {/* The 4 Capability Buttons - Blending directly with the picture (NO BOXES, NO GRADIENTS) */}
        {/* They tell users what they can be able to do, and clicking prompts login first */}
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left my-3">
          
          {/* Item 1: Citizen / Complainant */}
          <button
            type="button"
            onClick={() => onActionRequiresLogin('citizen')}
            className="group p-3 transition-colors text-left cursor-pointer border-b sm:border-b-0 sm:border-r border-white/10 last:border-r-0 hover:bg-black/30"
          >
            <div className="flex items-center gap-2 text-blue-400 mb-1.5">
              <FileText size={18} className="shrink-0" />
              <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                Report & Track Cases
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Submit crime incidents, receive electronic references, and track CAS docket progress.
            </p>
            <div className="mt-2 text-[11px] font-semibold text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Sign in to report</span>
              <ArrowRight size={12} />
            </div>
          </button>

          {/* Item 2: Police Officer */}
          <button
            type="button"
            onClick={() => onActionRequiresLogin('officer')}
            className="group p-3 transition-colors text-left cursor-pointer border-b sm:border-b-0 sm:border-r border-white/10 last:border-r-0 hover:bg-black/30"
          >
            <div className="flex items-center gap-2 text-blue-400 mb-1.5">
              <UserCheck size={18} className="shrink-0" />
              <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                Capture & Manage Cases
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Frontline Community Service Centre intake, docket registration, and sworn witness statements.
            </p>
            <div className="mt-2 text-[11px] font-semibold text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Official sign in</span>
              <ArrowRight size={12} />
            </div>
          </button>

          {/* Item 3: Detective */}
          <button
            type="button"
            onClick={() => onActionRequiresLogin('detective')}
            className="group p-3 transition-colors text-left cursor-pointer border-b sm:border-b-0 sm:border-r border-white/10 last:border-r-0 hover:bg-black/30"
          >
            <div className="flex items-center gap-2 text-blue-400 mb-1.5">
              <Search size={18} className="shrink-0" />
              <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                Investigate & Update
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Specialist criminal investigations, forensic diary updates, suspect logs, and court evidence.
            </p>
            <div className="mt-2 text-[11px] font-semibold text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Detective sign in</span>
              <ArrowRight size={12} />
            </div>
          </button>

          {/* Item 4: Commander / Admin */}
          <button
            type="button"
            onClick={() => onActionRequiresLogin('commander')}
            className="group p-3 transition-colors text-left cursor-pointer hover:bg-black/30"
          >
            <div className="flex items-center gap-2 text-blue-400 mb-1.5">
              <ShieldCheck size={18} className="shrink-0" />
              <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                Monitor & Oversee
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Station commander oversight, docket disposal approvals, inspection diaries, and audit security.
            </p>
            <div className="mt-2 text-[11px] font-semibold text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Commander sign in</span>
              <ArrowRight size={12} />
            </div>
          </button>

        </div>

        {/* Horizontal Divider Line */}
        <div className="w-full max-w-4xl my-4 border-t border-white/15" />

        {/* Bottom 2 buttons: Sign In and Create Account for citizens / complainants (users) */}
        <div className="w-full max-w-md mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 mt-2">
          
          <button
            type="button"
            id="btn-welcome-citizen-signin"
            onClick={onSignInCitizen}
            className="w-full sm:w-1/2 py-3 px-5 rounded-md font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            id="btn-welcome-citizen-signup"
            onClick={onSignUpCitizen}
            className="w-full sm:w-1/2 py-3 px-5 rounded-md font-bold text-sm bg-black hover:bg-slate-900 text-white border border-white/30 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <UserCheck size={16} className="text-blue-500" />
            <span>Create Account</span>
          </button>

        </div>

      </main>

      {/* Subtle Bottom Footer - separated by a clean line */}
      <footer className="relative z-10 w-full pb-5 pt-3 px-4 text-center border-t border-white/10">
        <div className="flex flex-col items-center gap-1 text-slate-400">
          <div className="text-[11px] font-bold tracking-widest uppercase text-slate-300 font-['Space_Grotesk']">
            A Safer South Africa Through Better Records
          </div>
          <div className="text-[10px] text-slate-400">
            Secure File and Evidence Network - Official Docket Administration
          </div>
        </div>
      </footer>

    </div>
  );
};
