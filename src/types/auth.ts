export type UserRole = 
  | 'CSC_OFFICER' 
  | 'DETECTIVE' 
  | 'COMMANDER' 
  | 'ADMINISTRATOR';

export interface RoleMetadata {
  code: UserRole;
  title: string;
  description: string;
  dashboardPath: string;
  clearanceLevel: string;
  badgeColor: string;
}

export interface LoginCredentials {
  identifier: string; // Personnel Number (e.g., POL-84920) or Email (e.g., officer@sfen.police.gov)
  password: string;
  rememberMe: boolean;
}

export interface UserProfile {
  id: string;
  personnelNumber: string;
  fullName: string;
  rank: string;
  email: string;
  station: string;
  division: string;
  role: UserRole;
  clearanceLevel: string;
  lastLogin: string;
  token: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: UserProfile;
  token?: string;
  requiresTwoFactor?: boolean;
}

export interface DemoAccount {
  role: UserRole;
  roleName: string;
  personnelNumber: string;
  email: string;
  password: string;
  rank: string;
  fullName: string;
  station: string;
  description: string;
}

export type PortalType = 'citizen' | 'official';

export interface CitizenSignUpData {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

export interface CitizenLoginCredentials {
  email: string;
  phoneNumber: string;
  password: string;
  rememberMe: boolean;
}

export interface CitizenProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  registeredAt: string;
  token?: string;
  activeDocketsCount: number;
  residentialAddress?: string;
  nationalId?: string;
}

export interface CitizenAuthResponse {
  success: boolean;
  message: string;
  citizen?: CitizenProfile;
  token?: string;
}

