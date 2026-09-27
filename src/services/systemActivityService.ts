import { AdminActivityLog } from '../types/admin';

interface ApiActivityEntry {
  id: string;
  action: string;
  description: string;
  referenceNumber?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  actor?: { fullName: string; role: string; personnelNumber?: string | null } | null;
}

function titleFor(action: string, referenceNumber?: string | null): string {
  const label = action.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
  return referenceNumber ? `${label} — ${referenceNumber}` : label;
}

export async function getSystemActivityLogs(token: string): Promise<AdminActivityLog[]> {
  const response = await fetch('/api/activity?limit=250', { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error('Unable to load the system activity log.');
  const entries = await response.json() as ApiActivityEntry[];
  return entries.map((entry) => ({
    id: `system_${entry.id}`,
    actionType: 'SYSTEM_ACTIVITY',
    title: titleFor(entry.action, entry.referenceNumber),
    description: entry.description,
    affectedUser: entry.referenceNumber || undefined,
    linkedReference: typeof entry.metadata?.onlineReportReference === 'string' ? entry.metadata.onlineReportReference : undefined,
    eventDetails: typeof entry.metadata?.incidentType === 'string' ? `Incident type: ${entry.metadata.incidentType}` : undefined,
    timestamp: new Date(entry.createdAt).toLocaleString(),
    adminName: entry.actor?.fullName || 'SFEN System',
    adminPersonnelNumber: entry.actor?.personnelNumber || entry.actor?.role || 'SYSTEM'
  }));
}
