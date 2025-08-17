// Centralized Phase Status utilities for BuildEase
// Keep in sync with Supabase enum construction_mgr.project_status

// DB enum values (canonical)
export type PhaseStatus = 'PLANNING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';

// Backward-compat alias (some places referred to this as ProjectStatus for phases)
export type ProjectStatus = PhaseStatus;

// UI-friendly statuses used across some components
export type PhaseStatusUI = 'pending' | 'in-progress' | 'on-hold' | 'completed';

export const PHASE_STATUSES: PhaseStatus[] = [
  'PLANNING',
  'IN_PROGRESS',
  'PAUSED',
  'COMPLETED',
];

// Mappings between UI and DB
export const PhaseStatusUI_TO_DB: Record<PhaseStatusUI, PhaseStatus> = {
  'pending': 'PLANNING',
  'in-progress': 'IN_PROGRESS',
  'on-hold': 'PAUSED',
  'completed': 'COMPLETED',
};

export const PhaseStatusDB_TO_UI: Record<PhaseStatus, PhaseStatusUI> = {
  'PLANNING': 'pending',
  'IN_PROGRESS': 'in-progress',
  'PAUSED': 'on-hold',
  'COMPLETED': 'completed',
};

export function toDbPhaseStatus(input: PhaseStatusUI | string): PhaseStatus {
  const norm = String(input || '').trim().toLowerCase();
  if (norm in PhaseStatusUI_TO_DB) {
    return PhaseStatusUI_TO_DB[norm as PhaseStatusUI];
  }
  // Accept already-DB-like inputs
  const upper = norm.toUpperCase() as PhaseStatus;
  if ((['PLANNING','IN_PROGRESS','PAUSED','COMPLETED'] as const).includes(upper)) {
    return upper;
  }
  return 'PLANNING';
}

export function toUiPhaseStatus(input: PhaseStatus | string): PhaseStatusUI {
  const upper = String(input || '').trim().toUpperCase() as PhaseStatus;
  if (upper in PhaseStatusDB_TO_UI) {
    return PhaseStatusDB_TO_UI[upper as PhaseStatus];
  }
  // Accept already-UI-like inputs
  const lower = String(input || '').trim().toLowerCase() as PhaseStatusUI;
  if ((['pending','in-progress','on-hold','completed'] as const).includes(lower)) {
    return lower;
  }
  return 'pending';
}

export function formatPhaseStatusLabel(status: PhaseStatus | string): string {
  const s = String(status || '').toUpperCase() as PhaseStatus;
  switch (s) {
    case 'PLANNING':
      return 'Planning';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'PAUSED':
      return 'Paused';
    case 'COMPLETED':
      return 'Completed';
    default:
      return 'Planning';
  }
}

export function getPhaseBadgeColor(status: PhaseStatus | string): string {
  const s = String(status || '').toUpperCase() as PhaseStatus;
  switch (s) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'IN_PROGRESS':
      return 'bg-buildease-blue-100 text-buildease-blue-700 border-buildease-blue-200';
    case 'PLANNING':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'PAUSED':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function getPhaseDotColor(status: PhaseStatus | string): string {
  const s = String(status || '').toUpperCase() as PhaseStatus;
  switch (s) {
    case 'COMPLETED':
      return 'bg-green-500';
    case 'IN_PROGRESS':
      return 'bg-buildease-blue-500';
    case 'PAUSED':
      return 'bg-amber-500';
    case 'PLANNING':
    default:
      return 'bg-slate-400';
  }
}
