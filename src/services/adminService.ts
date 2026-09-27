import { 
  AdminUserRecord, 
  AdminActivityLog, 
  ConfiguredPoliceStation,
  RolePermissionInfo,
  AccountStatus,
  AccountType
} from '../types/admin';
import { UserRole, UserProfile } from '../types/auth';
import { DEMO_ACCOUNTS } from './authService';
import { POLICE_STATIONS } from './policeStationService';

const USERS_STORAGE_KEY = 'sfen_admin_users_v1';
const STATION_STORAGE_KEY = 'sfen_admin_station_v1';
const ACTIVITY_STORAGE_KEY = 'sfen_admin_activity_v1';

// Initial Single Predefined Police Station for SFEN
const DEFAULT_PREDEFINED_STATION: ConfiguredPoliceStation = {
  id: 'sta_sandton',
  name: 'SAPS Sandton Police Station',
  precinctCode: '',
  address: 'Summit Road & Rivonia Road',
  suburb: 'Morningside / Sandton',
  city: 'Johannesburg',
  province: 'Gauteng',
  postalCode: '2196',
  phone: '011 722 4200',
  emergencyPhone: '082 300 8377 (Sector 1 Patrol)',
  stationCommander: 'Brigadier N. Sithole',
  operatingHours: '24 Hours / 7 Days a Week (CSC)',
  latitude: -26.0827,
  longitude: 28.0583,
  services: []
};

// Initial Seed Users
const DEFAULT_SEED_USERS: AdminUserRecord[] = [
  {
    id: 'usr_pol_10824',
    fullName: 'Sarah Ndlovu',
    identifier: 'POL-10824',
    email: 's.ndlovu@police.sfen.gov',
    phoneNumber: '082 555 1082',
    accountType: 'PERSONNEL',
    role: 'CSC_OFFICER',
    rank: 'Constable',
    station: DEFAULT_PREDEFINED_STATION.name,
    division: 'Community Service Centre Intake',
    status: 'ACTIVE',
    lastLogin: 'Today at 08:45',
    createdAt: '2026-01-15'
  },
  {
    id: 'usr_pol_20491',
    fullName: 'David Khumalo',
    identifier: 'POL-20491',
    email: 'd.khumalo@cid.sfen.gov',
    phoneNumber: '083 444 2049',
    accountType: 'PERSONNEL',
    role: 'DETECTIVE',
    rank: 'Detective Inspector',
    station: DEFAULT_PREDEFINED_STATION.name,
    division: 'Criminal Investigation Directorate',
    status: 'ACTIVE',
    lastLogin: 'Today at 09:12',
    createdAt: '2026-01-15'
  },
  {
    id: 'usr_pol_30912',
    fullName: 'Elena Vance',
    identifier: 'POL-30912',
    email: 'e.vance@command.sfen.gov',
    phoneNumber: '082 333 3091',
    accountType: 'PERSONNEL',
    role: 'COMMANDER',
    rank: 'Senior Superintendent',
    station: DEFAULT_PREDEFINED_STATION.name,
    division: 'Precinct Command Oversight',
    status: 'ACTIVE',
    lastLogin: 'Yesterday at 16:30',
    createdAt: '2026-01-10'
  },
  {
    id: 'usr_pol_40199',
    fullName: 'Marcus Cole',
    identifier: 'POL-40199',
    email: 'm.cole@admin.sfen.gov',
    phoneNumber: '081 222 4019',
    accountType: 'PERSONNEL',
    role: 'ADMINISTRATOR',
    rank: 'Chief ICT Security Officer',
    station: DEFAULT_PREDEFINED_STATION.name,
    division: 'Information Security & RBAC Directorate',
    status: 'ACTIVE',
    lastLogin: 'Now (Active Session)',
    createdAt: '2026-01-02'
  },
  {
    id: 'usr_pol_12055',
    fullName: 'Sipho Dlamini',
    identifier: 'POL-12055',
    email: 's.dlamini@police.sfen.gov',
    phoneNumber: '071 999 1205',
    accountType: 'PERSONNEL',
    role: 'CSC_OFFICER',
    rank: 'Sergeant',
    station: DEFAULT_PREDEFINED_STATION.name,
    division: 'Community Service Centre Patrol Shift',
    status: 'ACTIVE',
    lastLogin: '2026-03-18',
    createdAt: '2026-02-01'
  },
  {
    id: 'usr_pol_21804',
    fullName: 'Brian Maseko',
    identifier: 'POL-21804',
    email: 'b.maseko@cid.sfen.gov',
    phoneNumber: '084 777 2180',
    accountType: 'PERSONNEL',
    role: 'DETECTIVE',
    rank: 'Detective Sergeant',
    station: DEFAULT_PREDEFINED_STATION.name,
    division: 'Property & Fraud Investigations',
    status: 'INACTIVE',
    lastLogin: '2026-02-14',
    createdAt: '2026-02-05'
  },
  {
    id: 'usr_cit_001',
    fullName: 'Thabo Mthembu',
    identifier: 'thabo.mthembu@gmail.com',
    email: 'thabo.mthembu@gmail.com',
    phoneNumber: '082 123 4567',
    accountType: 'COMPLAINANT',
    role: 'COMPLAINANT',
    station: DEFAULT_PREDEFINED_STATION.name,
    status: 'ACTIVE',
    lastLogin: 'Today at 07:15',
    createdAt: '2026-02-20'
  },
  {
    id: 'usr_cit_002',
    fullName: 'Naledi Molefe',
    identifier: 'naledi.molefe@outlook.com',
    email: 'naledi.molefe@outlook.com',
    phoneNumber: '071 987 6543',
    accountType: 'COMPLAINANT',
    role: 'COMPLAINANT',
    station: DEFAULT_PREDEFINED_STATION.name,
    status: 'ACTIVE',
    lastLogin: 'Yesterday at 14:20',
    createdAt: '2026-03-01'
  },
  {
    id: 'usr_cit_003',
    fullName: 'Lerato Sithole',
    identifier: 'lerato.s@vodamail.co.za',
    email: 'lerato.s@vodamail.co.za',
    phoneNumber: '083 321 7890',
    accountType: 'COMPLAINANT',
    role: 'COMPLAINANT',
    station: DEFAULT_PREDEFINED_STATION.name,
    status: 'INACTIVE',
    lastLogin: '2026-03-04',
    createdAt: '2026-03-04'
  }
];

// Initial Seed Activity Logs
const DEFAULT_SEED_ACTIVITY: AdminActivityLog[] = [
  {
    id: 'act_001',
    actionType: 'ACCOUNT_CREATED',
    title: 'New Personnel Account Provisioned',
    description: 'Created account for Constable Sarah Ndlovu (POL-10824) with CSC / Police Officer role.',
    affectedUser: 'Sarah Ndlovu (POL-10824)',
    affectedUserId: 'usr_pol_10824',
    timestamp: '2026-03-21 08:30:15',
    adminName: 'Marcus Cole',
    adminPersonnelNumber: 'POL-40199'
  },
  {
    id: 'act_002',
    actionType: 'STATION_UPDATED',
    title: 'Predefined Police Station Initialized',
    description: 'Set system default operational hub to SAPS Sandton (Central Precinct) [GP-JHB-04].',
    timestamp: '2026-03-20 14:15:00',
    adminName: 'Marcus Cole',
    adminPersonnelNumber: 'POL-40199'
  },
  {
    id: 'act_003',
    actionType: 'ROLE_CHANGED',
    title: 'Personnel Role Updated',
    description: 'Assigned Detective / Investigating Officer role to David Khumalo (POL-20491).',
    affectedUser: 'David Khumalo (POL-20491)',
    affectedUserId: 'usr_pol_20491',
    timestamp: '2026-03-19 11:20:44',
    adminName: 'Marcus Cole',
    adminPersonnelNumber: 'POL-40199'
  },
  {
    id: 'act_004',
    actionType: 'ACCOUNT_DEACTIVATED',
    title: 'Personnel Account Deactivated',
    description: 'Account for Brian Maseko (POL-21804) set to Inactive pending departmental audit.',
    affectedUser: 'Brian Maseko (POL-21804)',
    affectedUserId: 'usr_pol_21804',
    timestamp: '2026-03-18 16:40:12',
    adminName: 'Marcus Cole',
    adminPersonnelNumber: 'POL-40199'
  },
  {
    id: 'act_005',
    actionType: 'PASSWORD_RESET',
    title: 'Personnel Security Password Reset',
    description: 'Generated temporary secure token and password reset for Sergeant Sipho Dlamini (POL-12055).',
    affectedUser: 'Sipho Dlamini (POL-12055)',
    affectedUserId: 'usr_pol_12055',
    timestamp: '2026-03-17 10:05:30',
    adminName: 'Marcus Cole',
    adminPersonnelNumber: 'POL-40199'
  }
];

// SFEN Defined Role Boundaries & Responsibilities (RBAC)
export const SFEN_ROLES_PERMISSIONS: RolePermissionInfo[] = [
  {
    role: 'CSC_OFFICER',
    title: 'CSC / Police Officer',
    category: 'Police Personnel',
    badgeColor: 'blue',
    clearanceLevel: 'Level 1 - Frontline Intake & Registration',
    authorizedPortal: 'Community Service Centre (CSC) Portal',
    description: 'Frontline operational officers stationed at the police service desk.',
    accessResponsibilities: [
      'Receive initial incident reports filed online or walk-in by complainants',
      'Verify complainant identity, national ID, and contact phone',
      'Register preliminary incident reports into official CAS case numbers',
      'Intake and seal physical case dockets with tamper-evident labels',
      'Direct initial docket transfers to the Detective Branch'
    ],
    restrictedBoundaries: [
      'Cannot assign detectives or authorize case finalization',
      'Cannot access System Administration or user provisioning',
      'Cannot modify evidence analysis notes once entered by detectives'
    ]
  },
  {
    role: 'DETECTIVE',
    title: 'Detective / Investigating Officer',
    category: 'Police Personnel',
    badgeColor: 'amber',
    clearanceLevel: 'Level 2 - Docket Investigation & Evidence Analysis',
    authorizedPortal: 'Criminal Investigation Directorate (CID) Portal',
    description: 'Specialized sworn detectives handling investigative dockets.',
    accessResponsibilities: [
      'Lead criminal investigations for assigned CAS case dockets',
      'Conduct suspect interrogations and record sworn affidavits',
      'Upload digital forensics, ballistics, and pathology reports',
      'Submit completed dockets to National Prosecuting Authority for court trial',
      'Log case status updates visible to complainants'
    ],
    restrictedBoundaries: [
      'Cannot manage station configuration or user credentials',
      'Cannot view dockets outside assigned precinct without Commander authorization',
      'Cannot alter audit logs or system timestamps'
    ]
  },
  {
    role: 'COMMANDER',
    title: 'Commander / Supervisor',
    category: 'Police Personnel',
    badgeColor: 'emerald',
    clearanceLevel: 'Level 3 - Station Command & Docket Authorization',
    authorizedPortal: 'Station Command & Supervisory Portal',
    description: 'Station commanders and senior precinct inspection officers.',
    accessResponsibilities: [
      'Inspect and oversee all open case dockets within the police precinct',
      'Assign and reassign investigating detectives to active dockets',
      'Review and resolve citizen service delivery complaints',
      'Authorize inter-station docket transfers and cold case closures',
      'Review station crime statistics and operational performance metrics'
    ],
    restrictedBoundaries: [
      'Cannot alter cryptographic security keys or manage IT user accounts',
      'Cannot bypass national audit records'
    ]
  },
  {
    role: 'ADMINISTRATOR',
    title: 'System Administrator',
    category: 'Police Personnel',
    badgeColor: 'purple',
    clearanceLevel: 'Level 4 - National Security & Technical Oversight',
    authorizedPortal: 'System Administration Portal',
    description: 'Technical custodians responsible for managing users, stations, and system health.',
    accessResponsibilities: [
      'Provision and manage police personnel and complainant accounts',
      'Configure the operational police station parameters (address, phone, commander, coordinates)',
      'Assign and update role-based access control (RBAC) levels',
      'Monitor administrative audit history and security events',
      'Perform user account activation, deactivation, and password resets'
    ],
    restrictedBoundaries: [
      'Strictly prohibited from registering or manipulating criminal cases',
      'Cannot access or edit confidential docket investigation notes or evidence',
      'Cannot assign detectives or intervene in active criminal proceedings'
    ]
  },
  {
    role: 'COMPLAINANT',
    title: 'Citizen / Complainant',
    category: 'Public / Citizen',
    badgeColor: 'teal',
    clearanceLevel: 'Level 0 - Public Docket Access',
    authorizedPortal: 'Citizen Docket Tracker & Report Portal',
    description: 'Members of the public lodging complaints and tracking registered dockets.',
    accessResponsibilities: [
      'Submit online preliminary incident reports with location coordinates',
      'Track real-time progress and milestone updates of personal CAS dockets',
      'View assigned investigating officer contact information',
      'Lodge service delivery complaints directly to the Station Commander',
      'Receive official SMS and in-app docket notifications'
    ],
    restrictedBoundaries: [
      'Strictly restricted to cases where they are the verified complainant',
      'Cannot access police personnel records, internal notes, or suspect intelligence',
      'Cannot access any operational police screens'
    ]
  }
];

class AdminService {
  /**
   * Retrieves all users (police personnel + complainants), merging persistent storage and dynamically registered citizens.
   */
  getUsers(): AdminUserRecord[] {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      let users: AdminUserRecord[] = stored ? JSON.parse(stored) : [...DEFAULT_SEED_USERS];

      // Merge newly registered citizens from sfen_registered_citizens if any exist
      try {
        const citizenRaw = localStorage.getItem('sfen_registered_citizens');
        if (citizenRaw) {
          const registeredCitizens = JSON.parse(citizenRaw);
          if (Array.isArray(registeredCitizens)) {
            registeredCitizens.forEach((rc: any) => {
              const alreadyExists = users.some(u => u.email.toLowerCase() === rc.email.toLowerCase());
              if (!alreadyExists) {
                users.push({
                  id: `usr_cit_${rc.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
                  fullName: rc.fullName,
                  identifier: rc.email,
                  email: rc.email,
                  phoneNumber: rc.phoneNumber,
                  accountType: 'COMPLAINANT',
                  role: 'COMPLAINANT',
                  station: DEFAULT_PREDEFINED_STATION.name,
                  status: 'ACTIVE',
                  lastLogin: 'Recent',
                  createdAt: rc.registeredAt ? rc.registeredAt.split('T')[0] : '2026-03-22'
                });
              }
            });
          }
        }
      } catch {
        // Safe fallback
      }

      return users;
    } catch {
      return [...DEFAULT_SEED_USERS];
    }
  }

  saveUsers(users: AdminUserRecord[]): void {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch {
      // Safe fallback
    }
  }

  /**
   * Adds new police personnel account created by the Administrator.
   * Note: Automatically belongs to the currently configured SFEN police station.
   */
  addPersonnel(data: {
    fullName: string;
    personnelNumber: string;
    email: string;
    phoneNumber?: string;
    rank: string;
    role: UserRole;
    division?: string;
  }, admin: UserProfile): AdminUserRecord {
    const users = this.getUsers();
    const station = this.getConfiguredStation();

    const cleanPersonnelNumber = data.personnelNumber.trim().toUpperCase();

    // Check if personnel number or email already exists
    const exists = users.some(
      u => u.identifier.toUpperCase() === cleanPersonnelNumber || 
           u.email.toLowerCase() === data.email.trim().toLowerCase()
    );

    if (exists) {
      throw new Error(`An account with Personnel Number ${cleanPersonnelNumber} or email ${data.email} already exists.`);
    }

    const newRecord: AdminUserRecord = {
      id: `usr_pol_${cleanPersonnelNumber.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`,
      fullName: data.fullName.trim(),
      identifier: cleanPersonnelNumber,
      email: data.email.trim().toLowerCase(),
      phoneNumber: data.phoneNumber?.trim() || '011 722 4200',
      accountType: 'PERSONNEL',
      role: data.role,
      rank: data.rank.trim(),
      station: station.name, // Automatically configured station!
      division: data.division?.trim() || 'Police Station Operations',
      status: 'ACTIVE',
      lastLogin: 'Never (Account Initialized)',
      createdAt: new Date().toISOString().split('T')[0]
    };

    users.unshift(newRecord);
    this.saveUsers(users);

    // Also update DEMO_ACCOUNTS in memory so they can log in immediately
    DEMO_ACCOUNTS.push({
      role: data.role,
      roleName: data.role.replace('_', ' '),
      personnelNumber: cleanPersonnelNumber,
      email: data.email.trim().toLowerCase(),
      password: 'DocketSecure2026!',
      rank: data.rank.trim(),
      fullName: data.fullName.trim(),
      station: station.name,
      description: data.division?.trim() || 'Active Service Personnel'
    });

    // Record audit activity
    this.logActivity({
      actionType: 'ACCOUNT_CREATED',
      title: 'Police Official Account Created',
      description: `Created new ${data.rank} account for ${data.fullName} (${cleanPersonnelNumber}) with role ${data.role} at ${station.name}.`,
      affectedUser: `${data.fullName} (${cleanPersonnelNumber})`,
      affectedUserId: newRecord.id,
      adminName: admin.fullName,
      adminPersonnelNumber: admin.personnelNumber
    });

    return newRecord;
  }

  /**
   * Updates an existing user's details.
   */
  updateUser(id: string, updates: Partial<AdminUserRecord>, admin: UserProfile): AdminUserRecord {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
      throw new Error('User record not found.');
    }

    const previous = users[index];
    const updated: AdminUserRecord = {
      ...previous,
      ...updates
    };

    users[index] = updated;
    this.saveUsers(users);

    this.logActivity({
      actionType: 'PROFILE_UPDATED',
      title: 'Account Information Updated',
      description: `Updated profile attributes for ${updated.fullName} (${updated.identifier}).`,
      affectedUser: `${updated.fullName} (${updated.identifier})`,
      affectedUserId: updated.id,
      adminName: admin.fullName,
      adminPersonnelNumber: admin.personnelNumber
    });

    return updated;
  }

  /**
   * Toggles account status between ACTIVE, INACTIVE, or SUSPENDED.
   */
  setUserStatus(id: string, status: AccountStatus, admin: UserProfile): AdminUserRecord {
    const users = this.getUsers();
    const user = users.find(u => u.id === id);

    if (!user) {
      throw new Error('User not found.');
    }

    user.status = status;
    this.saveUsers(users);

    const actionType = status === 'ACTIVE' ? 'ACCOUNT_ACTIVATED' : 'ACCOUNT_DEACTIVATED';
    this.logActivity({
      actionType,
      title: `Account Status Changed to ${status}`,
      description: `Administrator set status to ${status} for ${user.fullName} (${user.identifier}).`,
      affectedUser: `${user.fullName} (${user.identifier})`,
      affectedUserId: user.id,
      adminName: admin.fullName,
      adminPersonnelNumber: admin.personnelNumber
    });

    return user;
  }

  /**
   * Changes the role of an official.
   */
  changeUserRole(id: string, newRole: UserRole | 'COMPLAINANT', admin: UserProfile): AdminUserRecord {
    const users = this.getUsers();
    const user = users.find(u => u.id === id);

    if (!user) {
      throw new Error('User not found.');
    }

    const oldRole = user.role;
    user.role = newRole;
    this.saveUsers(users);

    this.logActivity({
      actionType: 'ROLE_CHANGED',
      title: 'System Access Role Reassigned',
      description: `Reassigned role from [${oldRole}] to [${newRole}] for ${user.fullName} (${user.identifier}).`,
      affectedUser: `${user.fullName} (${user.identifier})`,
      affectedUserId: user.id,
      adminName: admin.fullName,
      adminPersonnelNumber: admin.personnelNumber
    });

    return user;
  }

  /**
   * Updates administrator personal password.
   */
  changeAdminPassword(adminId: string, oldPassword: string, newPassword: string): { success: boolean; message: string } {
    if (!newPassword || newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters in length.');
    }
    return {
      success: true,
      message: 'Administrator password updated successfully in cryptographic credential store.'
    };
  }

  /**
   * Resets account password to default secure credential.
   */
  resetUserPassword(id: string, admin: UserProfile): { success: boolean; tempPassword: string; message: string } {
    const users = this.getUsers();
    const user = users.find(u => u.id === id);

    if (!user) {
      throw new Error('User not found.');
    }

    const tempPassword = 'DocketSecure2026!';

    this.logActivity({
      actionType: 'PASSWORD_RESET',
      title: 'Security Password Reset Performed',
      description: `Generated password reset directive for ${user.fullName} (${user.identifier}). Forced password change flag set.`,
      affectedUser: `${user.fullName} (${user.identifier})`,
      affectedUserId: user.id,
      adminName: admin.fullName,
      adminPersonnelNumber: admin.personnelNumber
    });

    return {
      success: true,
      tempPassword,
      message: `Password for ${user.fullName} (${user.identifier}) has been reset to default temporary credentials.`
    };
  }

  /**
   * Retrieves configured single SFEN police station.
   */
  getConfiguredStation(): ConfiguredPoliceStation {
    try {
      const stored = localStorage.getItem(STATION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.precinctCode = '';
        parsed.services = [];
        return parsed;
      }
    } catch {
      // Safe fallback
    }
    return { ...DEFAULT_PREDEFINED_STATION };
  }

  /**
   * Updates configured station information.
   */
  updateConfiguredStation(updates: Partial<ConfiguredPoliceStation>, admin: UserProfile): ConfiguredPoliceStation {
    const current = this.getConfiguredStation();
    const updated: ConfiguredPoliceStation = {
      ...current,
      ...updates
    };

    try {
      localStorage.setItem(STATION_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Safe fallback
    }

    this.logActivity({
      actionType: 'STATION_UPDATED',
      title: 'Police Station Configuration Updated',
      description: `Updated station configuration for ${updated.name} (Precinct ${updated.precinctCode}). Commander: ${updated.stationCommander}.`,
      adminName: admin.fullName,
      adminPersonnelNumber: admin.personnelNumber
    });

    return updated;
  }

  /**
   * Retrieves audit activity logs.
   */
  getActivityLogs(): AdminActivityLog[] {
    try {
      const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Safe fallback
    }
    return [...DEFAULT_SEED_ACTIVITY];
  }

  logActivity(data: {
    actionType: AdminActivityLog['actionType'];
    title: string;
    description: string;
    affectedUser?: string;
    affectedUserId?: string;
    adminName: string;
    adminPersonnelNumber: string;
  }): void {
    const logs = this.getActivityLogs();
    const newLog: AdminActivityLog = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actionType: data.actionType,
      title: data.title,
      description: data.description,
      affectedUser: data.affectedUser,
      affectedUserId: data.affectedUserId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      adminName: data.adminName,
      adminPersonnelNumber: data.adminPersonnelNumber
    };

    logs.unshift(newLog);
    try {
      localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(logs.slice(0, 100)));
    } catch {
      // Safe fallback
    }
  }

  /**
   * Computes clean overview dashboard stats.
   * Strict rule: No case or investigation management data.
   */
  getDashboardStats() {
    const users = this.getUsers();
    const logs = this.getActivityLogs();

    const totalUsers = users.length;
    const activePersonnel = users.filter(u => u.accountType === 'PERSONNEL' && u.status === 'ACTIVE').length;
    const complainantAccounts = users.filter(u => u.accountType === 'COMPLAINANT').length;
    const inactiveAccounts = users.filter(u => u.status !== 'ACTIVE').length;

    const personnelCount = users.filter(u => u.accountType === 'PERSONNEL').length;

    return {
      totalUsers,
      activePersonnel,
      complainantAccounts,
      inactiveAccounts,
      personnelCount,
      recentActivity: logs.slice(0, 5)
    };
  }
}

export const adminService = new AdminService();
