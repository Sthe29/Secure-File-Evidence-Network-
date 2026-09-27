import { AuthResponse, DemoAccount, LoginCredentials, UserProfile, UserRole } from '../types/auth';

/**
 * Pre-configured authorized test personnel representing all four future SFEN operational roles.
 * The system automatically determines the role upon successful credential verification.
 */
export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'CSC_OFFICER',
    roleName: 'CSC / Police Officer',
    personnelNumber: 'POL-10824',
    email: 's.ndlovu@police.sfen.gov',
    password: 'DocketSecure2026!',
    rank: 'Constable',
    fullName: 'Sarah Ndlovu',
    station: 'Central Precinct (Sector 4)',
    description: 'First-response docket registration, case opening, and physical evidence intake.'
  },
  {
    role: 'DETECTIVE',
    roleName: 'Detective',
    personnelNumber: 'POL-20491',
    email: 'd.khumalo@cid.sfen.gov',
    password: 'DocketSecure2026!',
    rank: 'Detective Inspector',
    fullName: 'David Khumalo',
    station: 'Serious & Violent Crimes Division',
    description: 'Docket investigation, sworn statements, ballistic/forensic logs, and court readiness.'
  },
  {
    role: 'COMMANDER',
    roleName: 'Commander / Supervisor',
    personnelNumber: 'POL-30912',
    email: 'e.vance@command.sfen.gov',
    password: 'DocketSecure2026!',
    rank: 'Senior Superintendent',
    fullName: 'Elena Vance',
    station: 'Metropolitan Police Headquarters',
    description: 'Docket sign-off, chain-of-custody authorization, audit logs, and docket transfers.'
  },
  {
    role: 'ADMINISTRATOR',
    roleName: 'Administrator',
    personnelNumber: 'POL-40199',
    email: 'm.cole@admin.sfen.gov',
    password: 'DocketSecure2026!',
    rank: 'Chief ICT Security Officer',
    fullName: 'Marcus Cole',
    station: 'National Police Directorate',
    description: 'System-wide access controls, cryptographic docket seals, and security monitoring.'
  }
];

export const ROLE_DETAILS: Record<UserRole, { label: string; clearance: string; redirectTarget: string; themeColor: string }> = {
  CSC_OFFICER: {
    label: 'CSC / Police Officer',
    clearance: 'Level 1 - Frontline Intake & Registration',
    redirectTarget: '/dashboard/csc-officer',
    themeColor: 'blue'
  },
  DETECTIVE: {
    label: 'Detective / Criminal Investigations',
    clearance: 'Level 2 - Docket Investigation & Evidence Analysis',
    redirectTarget: '/dashboard/detective',
    themeColor: 'amber'
  },
  COMMANDER: {
    label: 'Commander / Supervisor',
    clearance: 'Level 3 - Station Command & Docket Authorization',
    redirectTarget: '/dashboard/commander',
    themeColor: 'emerald'
  },
  ADMINISTRATOR: {
    label: 'System Administrator',
    clearance: 'Level 4 - National Security & Full Docket Audits',
    redirectTarget: '/dashboard/admin',
    themeColor: 'purple'
  }
};

/**
 * Validates login inputs before transmission.
 */
export function validateCredentials(credentials: LoginCredentials): { isValid: boolean; error?: string } {
  const trimmedId = credentials.identifier.trim();
  if (!trimmedId) {
    return { isValid: false, error: 'Please enter your Police Personnel Number or official email address.' };
  }

  if (!credentials.password) {
    return { isValid: false, error: 'Password is required to authenticate into SFEN.' };
  }

  if (credentials.password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters in length.' };
  }

  return { isValid: true };
}

/**
 * Authentication Service Client.
 * When the Node.js/Express backend with PostgreSQL is ready, this function can directly call:
 * return await fetch('/api/auth/login', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify(credentials)
 * }).then(res => res.json());
 */
export async function authenticatePersonnel(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: credentials.identifier, password: credentials.password })
  });

  const payload = await response.json() as {
    message?: string;
    token?: string;
    user?: Omit<UserProfile, 'clearanceLevel' | 'lastLogin' | 'token'>;
  };

  if (!response.ok || !payload.token || !payload.user) {
    return { success: false, message: payload.message || 'Authentication rejected.' };
  }

  const role = payload.user.role as UserRole;
  const userProfile: UserProfile = {
    ...payload.user,
    personnelNumber: payload.user.personnelNumber || '',
    rank: payload.user.rank || '',
    station: payload.user.station || '',
    division: payload.user.division || '',
    role,
    clearanceLevel: ROLE_DETAILS[role].clearance,
    lastLogin: new Date().toISOString(),
    token: payload.token
  };

  try {
    if (credentials.rememberMe) localStorage.setItem('sfen_last_identifier', credentials.identifier);
    else localStorage.removeItem('sfen_last_identifier');
    localStorage.setItem('sfen_auth_token', payload.token);
    localStorage.setItem('sfen_authenticated_officer', JSON.stringify(userProfile));
  } catch {
    // The application remains usable if browser storage is restricted.
  }

  return {
    success: true,
    message: `Authentication successful. Role verified as [${ROLE_DETAILS[role].label}].`,
    user: userProfile,
    token: payload.token
  };
}

/**
 * =========================================================================
 * CITIZEN / PUBLIC DOCKET ACCESS SERVICES
 * =========================================================
 */

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Secure';
  color: string;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  feedback: string[];
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (hasMinLength) score += 1;
  if (hasUppercase && hasLowercase) score += 1;
  if (hasNumber) score += 1;
  if (hasSpecial) score += 1;

  const feedback: string[] = [];
  if (!hasMinLength) feedback.push('At least 8 characters');
  if (!hasUppercase) feedback.push('An uppercase letter (A-Z)');
  if (!hasLowercase) feedback.push('A lowercase letter (a-z)');
  if (!hasNumber) feedback.push('At least one number (0-9)');
  if (!hasSpecial) feedback.push('A special symbol (e.g. !@#$%)');

  const labels: PasswordStrengthResult['label'][] = ['Weak', 'Weak', 'Fair', 'Good', 'Very Secure'];
  const colors = [
    'text-red-400 bg-red-500',
    'text-red-400 bg-red-500',
    'text-amber-400 bg-amber-500',
    'text-sky-400 bg-sky-500',
    'text-emerald-400 bg-emerald-500'
  ];

  return {
    score,
    label: labels[score] || 'Weak',
    color: colors[score] || 'text-red-400 bg-red-500',
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
    feedback
  };
}

// Default registered citizen in storage or memory
const DEFAULT_CITIZENS: Array<{
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  passwordHash: string;
  registeredAt: string;
  activeDocketsCount: number;
}> = [
  {
    id: 'ctz_thandi_01',
    fullName: 'Thandi Molefe',
    email: 'thandi.molefe@gmail.com',
    phoneNumber: '0825550192',
    passwordHash: 'SecureDocket2026!',
    registeredAt: '2026-03-10T09:15:00Z',
    activeDocketsCount: 1
  }
];

function getStoredCitizens(): Array<{
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  passwordHash: string;
  registeredAt: string;
  activeDocketsCount: number;
}> {
  try {
    const raw = localStorage.getItem('sfen_registered_citizens');
    if (raw) {
      const parsed = JSON.parse(raw);
      return [...DEFAULT_CITIZENS, ...parsed];
    }
  } catch {
    // fallback
  }
  return DEFAULT_CITIZENS;
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)\+]/g, '').toLowerCase();
}

/**
 * Register a new citizen account for public docket tracking.
 */
export async function registerCitizen(data: import('../types/auth').CitizenSignUpData): Promise<import('../types/auth').CitizenAuthResponse> {
  const response = await fetch('/api/citizens/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const payload = await response.json() as { message?: string; token?: string; user?: { id: string; fullName: string; email: string; phoneNumber?: string; createdAt: string } };
  if (!response.ok || !payload.token || !payload.user) return { success: false, message: payload.message || 'Registration failed.' };
  const citizen = { id: payload.user.id, fullName: payload.user.fullName, email: payload.user.email, phoneNumber: payload.user.phoneNumber || data.phoneNumber, registeredAt: payload.user.createdAt, activeDocketsCount: 0, token: payload.token };
  try { localStorage.setItem('sfen_auth_token', payload.token); } catch { /* storage is optional */ }
  return { success: true, message: 'Citizen account registered successfully.', citizen, token: payload.token };

}

/**
 * Authenticate an existing citizen using Email, Phone Number, or both, plus Password.
 */
export async function authenticateCitizen(credentials: import('../types/auth').CitizenLoginCredentials): Promise<import('../types/auth').CitizenAuthResponse> {
  const identifier = credentials.email.trim() || credentials.phoneNumber.trim();
  const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier, password: credentials.password }) });
  const payload = await response.json() as { message?: string; token?: string; user?: { id: string; fullName: string; email: string; phoneNumber?: string; role: string; createdAt?: string } };
  if (!response.ok || !payload.token || !payload.user || payload.user.role !== 'COMPLAINANT') return { success: false, message: payload.message || 'Authentication rejected.' };
  const citizen = { id: payload.user.id, fullName: payload.user.fullName, email: payload.user.email, phoneNumber: payload.user.phoneNumber || credentials.phoneNumber, registeredAt: payload.user.createdAt || new Date().toISOString(), activeDocketsCount: 0, token: payload.token };
  try { localStorage.setItem('sfen_auth_token', payload.token); } catch { /* storage is optional */ }
  return { success: true, message: 'Authentication successful.', citizen, token: payload.token };

}

