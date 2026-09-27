import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Loader2, 
  UserPlus, 
  LogIn, 
  Info,
  Key
} from 'lucide-react';
import { CitizenLoginCredentials, CitizenSignUpData, CitizenProfile } from '../types/auth';
import { authenticateCitizen, registerCitizen, evaluatePasswordStrength } from '../services/authService';
import { SfenLogo } from './SfenLogo';
import { ConsentInfoModal } from './ConsentInfoModal';
import { useTheme } from '../context/ThemeContext';

interface CitizenPortalProps {
  onSuccess: (citizen: CitizenProfile) => void;
  onForgotPassword: (identifier: string) => void;
  targetRoleNotice?: string | null;
  initialAuthMode?: 'login' | 'signup';
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  onSuccess,
  onForgotPassword,
  targetRoleNotice,
  initialAuthMode = 'login'
}) => {
  const { isDark } = useTheme();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialAuthMode);

  useEffect(() => {
    if (initialAuthMode) {
      setAuthMode(initialAuthMode);
    }
  }, [initialAuthMode]);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Sign Up State
  const [fullName, setFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const passwordStrength = evaluatePasswordStrength(signUpPassword);

  // Auto-populate saved citizen email and phone
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('sfen_citizen_last_email');
      const savedPhone = localStorage.getItem('sfen_citizen_last_phone');
      if (savedEmail) {
        setLoginEmail(savedEmail);
        setRememberMe(true);
      }
      if (savedPhone) {
        setLoginPhone(savedPhone);
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleQuickFillDemo = () => {
    setAuthMode('login');
    setLoginEmail('thandi.molefe@example.com');
    setLoginPhone('0825550192');
    setLoginPassword('DocketSecure2026!');
    setErrorMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    const credentials: CitizenLoginCredentials = {
      email: loginEmail,
      phoneNumber: loginPhone,
      password: loginPassword,
      rememberMe
    };

    setIsLoading(true);

    try {
      const result = await authenticateCitizen(credentials);
      if (result.success && result.citizen) {
        onSuccess(result.citizen);
      } else {
        setErrorMessage(result.message);
      }
    } catch {
      setErrorMessage('Communication error with SFEN Public Portal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    const data: CitizenSignUpData = {
      fullName,
      email: signUpEmail,
      phoneNumber: signUpPhone,
      password: signUpPassword,
      confirmPassword,
      acceptedTerms
    };

    setIsLoading(true);

    try {
      const result = await registerCitizen(data);
      if (result.success && result.citizen) {
        onSuccess(result.citizen);
      } else {
        setErrorMessage(result.message);
      }
    } catch {
      setErrorMessage('Registration server error. Please verify your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      id="citizen-auth-card" 
      className={`w-full max-w-md mx-auto py-8 px-6 sm:px-8 border-y ${
        isDark ? 'border-white/15 bg-black text-white' : 'border-black/15 bg-white text-black'
      }`}
    >
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="flex justify-center">
          <SfenLogo size="md" />
        </div>

        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
            SFEN
          </h1>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mt-0.5">
            Public Incident Reporting and Docket Access
          </p>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Secure portal for complainants, victims, and witnesses
          </p>
        </div>
      </div>

      {/* Target capability notice if redirected from welcoming page */}
      {targetRoleNotice && (
        <div className="mb-4 py-2 px-3 border border-blue-600 text-blue-600 text-xs font-semibold rounded-md">
          {targetRoleNotice}
        </div>
      )}

      {/* Mode Switcher: Sign In vs Sign Up - clean flat line-based tabs */}
      <div className={`flex border-b mb-6 ${isDark ? 'border-white/15' : 'border-black/15'}`}>
        <button
          type="button"
          id="btn-citizen-tab-login"
          onClick={() => {
            setAuthMode('login');
            setErrorMessage(null);
          }}
          className={`flex-1 py-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            authMode === 'login'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <LogIn size={14} />
          Sign In
        </button>
        <button
          type="button"
          id="btn-citizen-tab-signup"
          onClick={() => {
            setAuthMode('signup');
            setErrorMessage(null);
          }}
          className={`flex-1 py-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            authMode === 'signup'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserPlus size={14} />
          Sign Up (New Account)
        </button>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div 
          id="citizen-error-alert" 
          className={`mb-4 p-3 rounded-md border text-xs flex items-start gap-2.5 ${
            isDark ? 'border-blue-500 bg-black text-blue-400' : 'border-blue-600 bg-slate-50 text-blue-800'
          }`}
          role="alert"
        >
          <AlertCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold">Notice:</span> {errorMessage}
          </div>
        </div>
      )}

      {/* Success Notice */}
      {successNotice && (
        <div className={`mb-4 p-3 rounded-md border text-xs flex items-start gap-2.5 ${
          isDark ? 'border-blue-500 bg-black text-blue-400' : 'border-blue-600 bg-slate-50 text-blue-800'
        }`}>
          <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <div>{successNotice}</div>
        </div>
      )}

      {/* LOGIN VIEW */}
      {authMode === 'login' ? (
        <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
          {/* Quick Demo Login Option */}
          <div className={`p-2.5 rounded-md border flex items-center justify-between text-xs ${
            isDark ? 'bg-black border-blue-900/60 text-slate-300' : 'bg-blue-50/50 border-blue-200 text-blue-900'
          }`}>
            <span className="text-[11px]">Testing as citizen?</span>
            <button
              type="button"
              onClick={handleQuickFillDemo}
              className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Fill Demo Citizen (Thandi Molefe)
            </button>
          </div>

          {/* Email or Phone input */}
          <div className="space-y-1.5">
            <label htmlFor="citizen-login-email" className={`text-xs font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              Email Address or Mobile Phone Number <span className="text-blue-600">*</span>
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <Mail size={16} />
              </div>
              <input
                id="citizen-login-email"
                type="text"
                required
                autoComplete="username"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="e.g. name@example.com or 082 123 4567"
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-md text-sm border font-mono focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  isDark ? 'bg-black border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-black placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          {/* Optional Phone Number input */}
          <div className="space-y-1.5">
            <label htmlFor="citizen-login-phone" className={`text-xs font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              Phone Number <span className="text-slate-400 font-normal">(Optional if email provided above)</span>
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <Phone size={16} />
              </div>
              <input
                id="citizen-login-phone"
                type="tel"
                autoComplete="tel"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                placeholder="e.g. 082 555 0192"
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-md text-sm border font-mono focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  isDark ? 'bg-black border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-black placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <label htmlFor="citizen-login-password" className={`text-xs font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              Password
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <Lock size={16} />
              </div>
              <input
                id="citizen-login-password"
                type={showLoginPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter your password"
                className={`w-full pl-10 pr-11 py-2.5 rounded-md text-sm border focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  isDark ? 'bg-black border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-black placeholder-slate-400'
                }`}
              />
              <button
                type="button"
                id="btn-toggle-citizen-password"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className={`absolute inset-y-0 right-0 pr-3.5 flex items-center hover:text-blue-600 transition-colors ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
                aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                title={showLoginPassword ? 'Hide password' : 'Show password'}
              >
                {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between pt-1">
            <label 
              htmlFor="citizen-remember-me"
              className={`flex items-center gap-2 text-xs cursor-pointer select-none ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
            >
              <input
                id="citizen-remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-sm border-slate-600 text-blue-600 focus:ring-blue-600 accent-blue-600 cursor-pointer"
              />
              <span>Remember Me</span>
            </label>

            <button
              id="citizen-link-forgot-password"
              type="button"
              onClick={() => onForgotPassword(loginEmail || loginPhone)}
              className="text-xs font-semibold text-blue-600 hover:underline transition-colors cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {/* Sign In Button */}
          <div className="pt-2">
            <button
              id="btn-citizen-sign-in"
              type="submit"
              disabled={isLoading || !loginEmail || !loginPhone || !loginPassword}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  <span>Verifying Citizen Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to SFEN</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          {/* Quick Demo Citizen Helper */}
          <div className={`pt-4 border-t text-center ${isDark ? 'border-white/10' : 'border-black/10'}`}>
            <button
              type="button"
              id="btn-quick-fill-citizen-sample"
              onClick={handleQuickFillDemo}
              className="text-[11px] text-blue-600 hover:underline flex items-center justify-center gap-1.5 mx-auto font-medium cursor-pointer"
            >
              <Key size={12} />
              <span>Click to auto-fill sample citizen test credentials</span>
            </button>
          </div>
        </form>
      ) : (
        /* SIGN UP VIEW */
        <form onSubmit={handleSignUpSubmit} className="space-y-4" noValidate>
          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="citizen-signup-name" className={`text-xs font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              Full Legal Name
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <User size={16} />
              </div>
              <input
                id="citizen-signup-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Sipho Sithole"
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-md text-sm border focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  isDark ? 'bg-black border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-black placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label htmlFor="citizen-signup-email" className={`text-xs font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              Email Address
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <Mail size={16} />
              </div>
              <input
                id="citizen-signup-email"
                type="email"
                required
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                placeholder="you@email.com"
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-md text-sm border font-mono focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  isDark ? 'bg-black border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-black placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label htmlFor="citizen-signup-phone" className={`text-xs font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              Mobile Phone Number
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <Phone size={16} />
              </div>
              <input
                id="citizen-signup-phone"
                type="tel"
                required
                value={signUpPhone}
                onChange={(e) => setSignUpPhone(e.target.value)}
                placeholder="e.g. 082 123 4567"
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-md text-sm border font-mono focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  isDark ? 'bg-black border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-black placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="citizen-signup-password" className={`text-xs font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              Create Secure Password <span className="text-blue-600">*</span>
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <Lock size={16} />
              </div>
              <input
                id="citizen-signup-password"
                type={showSignUpPassword ? 'text' : 'password'}
                required
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                placeholder="Create a strong password"
                className={`w-full pl-10 pr-11 py-2.5 rounded-md text-sm border focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  isDark ? 'bg-black border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-black placeholder-slate-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                className={`absolute inset-y-0 right-0 pr-3.5 flex items-center hover:text-blue-600 transition-colors ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
                aria-label={showSignUpPassword ? 'Hide password' : 'Show password'}
              >
                {showSignUpPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Interactive Password Strength Instructions */}
            <div className={`p-3 rounded-md border text-xs space-y-2 mt-2 ${
              isDark ? 'bg-black border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">
                  Password Strength:
                </span>
                <span className={`text-[11px] font-bold ${
                  passwordStrength.score >= 3 ? 'text-emerald-500' : passwordStrength.score === 2 ? 'text-blue-500' : 'text-amber-500'
                }`}>
                  {signUpPassword ? passwordStrength.label : 'Not entered'}
                </span>
              </div>

              {/* Strength Meter Bar */}
              <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full transition-all ${
                  passwordStrength.score >= 1 
                    ? passwordStrength.score >= 3 ? 'bg-emerald-500' : 'bg-amber-500' 
                    : 'bg-transparent'
                }`} />
                <div className={`h-full transition-all ${
                  passwordStrength.score >= 2 
                    ? passwordStrength.score >= 3 ? 'bg-emerald-500' : 'bg-amber-500' 
                    : 'bg-transparent'
                }`} />
                <div className={`h-full transition-all ${
                  passwordStrength.score >= 3 ? 'bg-emerald-500' : 'bg-transparent'
                }`} />
                <div className={`h-full transition-all ${
                  passwordStrength.score >= 4 ? 'bg-emerald-500' : 'bg-transparent'
                }`} />
              </div>

              {/* Requirement Checklist */}
              <div className="space-y-1 pt-1 text-[11px]">
                <div className={`flex items-center gap-1.5 ${passwordStrength.hasMinLength ? 'text-emerald-500 font-medium' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {passwordStrength.hasMinLength ? <CheckCircle2 size={13} className="shrink-0 text-emerald-500" /> : <span className="w-3 h-3 rounded-full border border-slate-500 inline-block shrink-0" />}
                  <span>At least 8 characters in length</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordStrength.hasUppercase ? 'text-emerald-500 font-medium' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {passwordStrength.hasUppercase ? <CheckCircle2 size={13} className="shrink-0 text-emerald-500" /> : <span className="w-3 h-3 rounded-full border border-slate-500 inline-block shrink-0" />}
                  <span>At least one uppercase letter (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordStrength.hasLowercase ? 'text-emerald-500 font-medium' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {passwordStrength.hasLowercase ? <CheckCircle2 size={13} className="shrink-0 text-emerald-500" /> : <span className="w-3 h-3 rounded-full border border-slate-500 inline-block shrink-0" />}
                  <span>At least one lowercase letter (a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordStrength.hasNumber ? 'text-emerald-500 font-medium' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {passwordStrength.hasNumber ? <CheckCircle2 size={13} className="shrink-0 text-emerald-500" /> : <span className="w-3 h-3 rounded-full border border-slate-500 inline-block shrink-0" />}
                  <span>At least one numeric digit (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordStrength.hasSpecial ? 'text-emerald-500 font-medium' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {passwordStrength.hasSpecial ? <CheckCircle2 size={13} className="shrink-0 text-emerald-500" /> : <span className="w-3 h-3 rounded-full border border-slate-500 inline-block shrink-0" />}
                  <span>At least one special character (@$!%*?&#)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label htmlFor="citizen-signup-confirm-password" className={`text-xs font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              Confirm Password
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <Lock size={16} />
              </div>
              <input
                id="citizen-signup-confirm-password"
                type={showSignUpPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-md text-sm border focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  isDark ? 'bg-black border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-black placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          {/* Consent Section - clean line separated */}
          <div className={`py-3 border-y space-y-2 ${isDark ? 'border-white/10' : 'border-black/10'}`}>
            <div className="flex items-start gap-2.5">
              <input
                id="citizen-accept-terms"
                type="checkbox"
                required
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-4 h-4 rounded-sm border-slate-600 text-blue-600 focus:ring-blue-600 mt-0.5 accent-blue-600 cursor-pointer shrink-0"
              />
              <div className="space-y-1 text-xs">
                <label 
                  htmlFor="citizen-accept-terms" 
                  className={`font-medium cursor-pointer select-none leading-snug block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                >
                  I have read and accept the personal information and case docket consent terms.
                </label>
                
                <button
                  type="button"
                  id="btn-agree-to-consent-link"
                  onClick={() => setIsConsentModalOpen(true)}
                  className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Agree to Consent Info (View Details)</span>
                  <ArrowRight size={11} />
                </button>
              </div>
            </div>
          </div>

          {/* Sign Up Submit Button */}
          <div className="pt-2">
            <button
              id="btn-citizen-create-account"
              type="submit"
              disabled={
                isLoading || 
                !fullName.trim() || 
                !signUpEmail.trim() || 
                !signUpPhone.trim() || 
                !acceptedTerms || 
                signUpPassword !== confirmPassword || 
                passwordStrength.score < 2
              }
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  <span>Creating Secure Citizen Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account and Access SFEN</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          <div className="pt-2 text-center">
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                Sign in with your email and phone
              </button>
            </p>
          </div>
        </form>
      )}

      {/* Security footer */}
      <div className={`mt-6 pt-4 border-t text-center ${isDark ? 'border-white/10 text-slate-400' : 'border-black/10 text-slate-600'}`}>
        <p className="text-[10px] font-mono">
          Official Republic Docket Access - Dual Factor (Email + SMS Verified)
        </p>
      </div>

      {/* Consent Info Modal */}
      <ConsentInfoModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        onAgree={() => setAcceptedTerms(true)}
        isAgreed={acceptedTerms}
      />
    </div>
  );
};
