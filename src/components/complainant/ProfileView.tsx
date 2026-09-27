import React, { useState } from 'react';
import { CitizenProfile } from '../../types/auth';
import { evaluatePasswordStrength } from '../../services/authService';
import { 
  User, 
  Mail, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Save,
  KeyRound
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ProfileViewProps {
  citizen: CitizenProfile;
  onUpdateCitizen: (updated: CitizenProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ citizen, onUpdateCitizen }) => {
  const { isDark } = useTheme();
  // Personal Info State
  const [fullName, setFullName] = useState(citizen.fullName || '');
  const [email, setEmail] = useState(citizen.email || '');
  const [phoneNumber, setPhoneNumber] = useState(citizen.phoneNumber || '');
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Feedback
  const [profileSuccessToast, setProfileSuccessToast] = useState<string | null>(null);
  const [passwordSuccessToast, setPasswordSuccessToast] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const passwordStrength = evaluatePasswordStrength(newPassword);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    setTimeout(() => {
      const updated: CitizenProfile = {
        ...citizen,
        fullName,
        email,
        phoneNumber
      };

      try {
        const stored = localStorage.getItem('sfen_registered_citizens');
        if (stored) {
          const parsed: CitizenProfile[] = JSON.parse(stored);
          const idx = parsed.findIndex((c) => c.id === citizen.id || c.email === citizen.email);
          if (idx !== -1) {
            parsed[idx] = { ...parsed[idx], ...updated };
            localStorage.setItem('sfen_registered_citizens', JSON.stringify(parsed));
          }
        }
      } catch {
        // ignore
      }

      onUpdateCitizen(updated);
      setIsSavingProfile(false);
      setProfileSuccessToast('Your contact details have been updated successfully.');
      setTimeout(() => setProfileSuccessToast(null), 5000);
    }, 400);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setIsSavingPassword(true);

    setTimeout(() => {
      try {
        const stored = localStorage.getItem('sfen_registered_citizens');
        if (stored) {
          const parsed = JSON.parse(stored);
          const idx = parsed.findIndex((c: any) => c.id === citizen.id || c.email === citizen.email);
          if (idx !== -1) {
            parsed[idx].password = newPassword;
            localStorage.setItem('sfen_registered_citizens', JSON.stringify(parsed));
          }
        }
      } catch {
        // ignore
      }

      setIsSavingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccessToast('Your password has been changed successfully.');
      setTimeout(() => setPasswordSuccessToast(null), 5000);
    }, 500);
  };

  return (
    <div id="complainant-profile-view" className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      
      {/* Header - separated by clean line */}
      <div className={`pb-4 border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
        <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
          Account Profile and Security Settings
        </h2>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Manage your verified contact information and password security.
        </p>
      </div>

      {/* Profile Particulars Form */}
      <div className={`py-4 border-b space-y-4 ${isDark ? 'border-white/10' : 'border-black/10'}`}>
        <div className="flex items-center gap-2">
          <User size={18} className="text-blue-600" />
          <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>Personal and Contact Details</h3>
        </div>

        {profileSuccessToast && (
          <div className="p-3 rounded-md border border-blue-600 bg-blue-600/10 text-blue-600 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{profileSuccessToast}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="prof-name" className={`text-xs font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Full Legal Name
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="prof-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-md text-xs border ${
                    isDark ? 'bg-black border-slate-700 text-white' : 'bg-white border-slate-300 text-black'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="prof-email" className={`text-xs font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Email Address
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="prof-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-md text-xs border ${
                    isDark ? 'bg-black border-slate-700 text-white' : 'bg-white border-slate-300 text-black'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="prof-phone" className={`text-xs font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Mobile Number
              </label>
              <div className="relative">
                <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="prof-phone"
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-md text-xs border font-mono ${
                    isDark ? 'bg-black border-slate-700 text-white' : 'bg-white border-slate-300 text-black'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save size={14} />
              <span>{isSavingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Section - separated by clean line */}
      <div className={`py-4 border-b space-y-4 ${isDark ? 'border-white/10' : 'border-black/10'}`}>
        <div className="flex items-center gap-2">
          <KeyRound size={18} className="text-blue-600" />
          <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>Change Account Password</h3>
        </div>

        {passwordSuccessToast && (
          <div className="p-3 rounded-md border border-blue-600 bg-blue-600/10 text-blue-600 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{passwordSuccessToast}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3 rounded-md border border-blue-600 text-blue-600 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="space-y-1.5">
              <label htmlFor="pwd-curr" className={`text-xs font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Current Password
              </label>
              <input
                id="pwd-curr"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Password"
                className={`w-full px-3 py-2.5 rounded-md text-xs border ${
                  isDark ? 'bg-black border-slate-700 text-white' : 'bg-white border-slate-300 text-black'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pwd-new" className={`text-xs font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                New Secure Password
              </label>
              <div className="relative">
                <input
                  id="pwd-new"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className={`w-full px-3 pr-9 py-2.5 rounded-md text-xs border ${
                    isDark ? 'bg-black border-slate-700 text-white' : 'bg-white border-slate-300 text-black'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pwd-conf" className={`text-xs font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Confirm New Password
              </label>
              <input
                id="pwd-conf"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className={`w-full px-3 py-2.5 rounded-md text-xs border ${
                  isDark ? 'bg-black border-slate-700 text-white' : 'bg-white border-slate-300 text-black'
                }`}
              />
            </div>
          </div>

          {/* Password Security Score */}
          {newPassword.length > 0 && (
            <div className={`p-3 rounded-md border space-y-1.5 text-xs ${
              isDark ? 'bg-black border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Password Security Score:</span>
                <span className="font-bold font-mono text-blue-600">
                  {passwordStrength.label} ({passwordStrength.score}/5)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-sm overflow-hidden flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`flex-1 h-full ${
                      level <= passwordStrength.score ? 'bg-blue-600' : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingPassword || !newPassword}
              className={`px-5 py-2.5 font-bold text-xs rounded-md transition-colors cursor-pointer border ${
                isDark 
                  ? 'bg-black border-white/20 text-white hover:bg-slate-900' 
                  : 'bg-white border-black/20 text-black hover:bg-slate-100'
              }`}
            >
              {isSavingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
