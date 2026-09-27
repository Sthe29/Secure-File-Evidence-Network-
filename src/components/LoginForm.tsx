import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Lock, User, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { LoginCredentials, UserProfile, DemoAccount } from '../types/auth';
import { authenticatePersonnel, validateCredentials } from '../services/authService';
import { SfenLogo } from './SfenLogo';
import { SecurityNoticeBanner } from './SecurityNoticeBanner';
import { useTheme } from '../context/ThemeContext';

interface LoginFormProps {
  onSuccess: (user: UserProfile) => void;
  onForgotPassword: (identifier: string) => void;
  prefillAccount?: DemoAccount | null;
  targetRoleNotice?: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onForgotPassword,
  prefillAccount,
  targetRoleNotice
}) => {
  const { isDark } = useTheme();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capsLockActive, setCapsLockActive] = useState(false);

  const identifierInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Load remembered identifier if saved
  useEffect(() => {
    try {
      const savedIdentifier = localStorage.getItem('sfen_last_identifier');
      if (savedIdentifier) {
        setIdentifier(savedIdentifier);
        setRememberMe(true);
      }
    } catch {
      // Ignore in restricted environments
    }
  }, []);

  // Update fields when prefillAccount changes
  useEffect(() => {
    if (prefillAccount) {
      setIdentifier(prefillAccount.personnelNumber);
      setPassword(prefillAccount.password);
      setErrorMessage(null);
    }
  }, [prefillAccount]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const isCaps = e.getModifierState && e.getModifierState('CapsLock');
    setCapsLockActive(Boolean(isCaps));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const credentials: LoginCredentials = {
      identifier,
      password,
      rememberMe
    };

    const validation = validateCredentials(credentials);
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Please fill in all mandatory fields.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authenticatePersonnel(credentials);

      if (response.success && response.user) {
        onSuccess(response.user);
      } else {
        setErrorMessage(response.message || 'Authentication rejected. Please verify your credentials.');
      }
    } catch {
      setErrorMessage('Network connection error. Unable to establish secure link with SFEN authentication server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      id="sfen-login-card" 
      className={`w-full max-w-md mx-auto py-8 px-6 sm:px-8 border-y ${
        isDark ? 'border-white/15 bg-black text-white' : 'border-black/15 bg-white text-black'
      }`}
    >
      {/* Top SFEN Branding Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="flex justify-center">
          <SfenLogo size="md" />
        </div>

        <div>
          <h1 id="sfen-brand-title" className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
            SFEN
          </h1>
          <p id="sfen-full-title" className="text-xs font-semibold text-blue-600 uppercase tracking-wider mt-0.5">
            Secure File and Evidence Network
          </p>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Police Docket and Chain-of-Custody Management System
          </p>
        </div>
      </div>

      {/* Target capability notification banner if redirected from capability button */}
      {targetRoleNotice && (
        <div className="mb-4 py-2 px-3 border border-blue-600 text-blue-600 text-xs font-semibold rounded-md">
          {targetRoleNotice}
        </div>
      )}

      {/* Security message */}
      <div className="mb-6">
        <SecurityNoticeBanner />
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div 
          id="login-error-alert" 
          className={`mb-5 p-3 rounded-md border text-xs flex items-start gap-2.5 ${
            isDark ? 'border-blue-500 bg-black text-blue-400' : 'border-blue-600 bg-slate-50 text-blue-800'
          }`}
          role="alert"
        >
          <AlertCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold">Authentication Failed:</span> {errorMessage}
          </div>
        </div>
      )}

      {/* Horizontal Divider Line */}
      <div className={`my-4 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`} />

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Input: Personnel Number or Email */}
        <div className="space-y-1.5">
          <label 
            htmlFor="personnel-identifier" 
            className={`text-xs font-semibold flex items-center justify-between ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
          >
            <span>Personnel Number or Email</span>
            <span className={`text-[11px] font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>e.g. POL-84920</span>
          </label>
          <div className="relative">
            <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <User size={16} />
            </div>
            <input
              id="personnel-identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              required
              ref={identifierInputRef}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Personnel Number or Email"
              className={`w-full pl-10 pr-3.5 py-2.5 rounded-md text-sm border font-mono tracking-normal focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                isDark 
                  ? 'bg-black border-slate-700 text-white placeholder-slate-500' 
                  : 'bg-white border-slate-300 text-black placeholder-slate-400'
              }`}
            />
          </div>
        </div>

        {/* Input: Password with Show/Hide toggle */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label 
              htmlFor="personnel-password" 
              className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
            >
              Password
            </label>
            {capsLockActive && (
              <span className="text-[10px] font-bold text-blue-600 border border-blue-600 px-1.5 py-0.5 rounded-sm">
                CAPS LOCK ON
              </span>
            )}
          </div>
          <div className="relative">
            <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <Lock size={16} />
            </div>
            <input
              id="personnel-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              ref={passwordInputRef}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your secure password"
              className={`w-full pl-10 pr-11 py-2.5 rounded-md text-sm border focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                isDark 
                  ? 'bg-black border-slate-700 text-white placeholder-slate-500' 
                  : 'bg-white border-slate-300 text-black placeholder-slate-400'
              }`}
            />
            {/* Show / Hide Toggle Button */}
            <button
              id="btn-toggle-password-visibility"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute inset-y-0 right-0 pr-3.5 flex items-center hover:text-blue-600 focus:outline-none transition-colors ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {/* Remember Me and Forgot Password row */}
        <div className="flex items-center justify-between pt-1">
          <label 
            id="label-remember-me"
            htmlFor="remember-me-checkbox" 
            className={`flex items-center gap-2 text-xs cursor-pointer select-none ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
          >
            <input
              id="remember-me-checkbox"
              name="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded-sm border-slate-600 text-blue-600 focus:ring-blue-600 accent-blue-600 cursor-pointer"
            />
            <span>Remember Me</span>
          </label>

          <button
            id="link-forgot-password"
            type="button"
            onClick={() => onForgotPassword(identifier)}
            className="text-xs font-semibold text-blue-600 hover:underline focus:outline-none rounded transition-colors"
          >
            Forgot Password?
          </button>
        </div>

        {/* Clear Sign In button - solid blue, zero pill */}
        <div className="pt-2">
          <button
            id="btn-sign-in"
            type="submit"
            disabled={isLoading || !identifier.trim() || !password}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Authenticating with SFEN...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Line going side by side */}
      <div className={`mt-6 pt-5 border-t text-center ${isDark ? 'border-white/10 text-slate-400' : 'border-black/10 text-slate-600'}`}>
        <p className="text-[11px] font-mono">
          SFEN National Police Docket Infrastructure - v2.4
        </p>
        <p className="text-[10px] mt-0.5">
          Role-Based Access Control enforced automatically upon authentication.
        </p>
      </div>
    </div>
  );
};
