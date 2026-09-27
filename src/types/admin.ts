import { UserRole } from './auth';

export type AdminTab = 
  | 'dashboard'
  | 'users'
  | 'activity'
  | 'profile';

export type AccountType = 'PERSONNEL' | 'COMPLAINANT';
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface AdminUserRecord {
  id: string;
  fullName: string;
  identifier: string; // Police personnel number (POL-xxxxx) or citizen account ID / email
  email: string;
  phoneNumber?: string;
  accountType: AccountType;
  role: UserRole | 'COMPLAINANT';
  rank?: string;
  station: string; // The single configured station for current version
  division?: string;
  status: AccountStatus;
  lastLogin: string;
  createdAt: string;
}

export type AdminActivityType =
  | 'ACCOUNT_CREATED'
  | 'ACCOUNT_ACTIVATED'
  | 'ACCOUNT_DEACTIVATED'
  | 'ROLE_CHANGED'
  | 'PASSWORD_RESET'
  | 'STATION_UPDATED'
  | 'PROFILE_UPDATED'
  | 'SYSTEM_ACTIVITY';

export interface AdminActivityLog {
  id: string;
  actionType: AdminActivityType;
  title: string;
  description: string;
  affectedUser?: string;
  affectedUserId?: string;
  linkedReference?: string;
  eventDetails?: string;
  timestamp: string;
  adminName: string;
  adminPersonnelNumber: string;
}

export interface ConfiguredPoliceStation {
  id: string;
  name: string;
  precinctCode: string;
  address: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  emergencyPhone: string;
  stationCommander: string;
  operatingHours: string;
  latitude: number;
  longitude: number;
  services: string[];
}

export interface RolePermissionInfo {
  role: UserRole | 'COMPLAINANT';
  title: string;
  category: 'Police Personnel' | 'Public / Citizen';
  badgeColor: string;
  clearanceLevel: string;
  authorizedPortal: string;
  description: string;
  accessResponsibilities: string[];
  restrictedBoundaries: string[];
}
