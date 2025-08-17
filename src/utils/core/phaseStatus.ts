// Centralized Phase Status utilities for BuildEase
// Keep in sync with Supabase enum construction_mgr.project_status

// Database phase status enum (canonical)
export enum PhaseStatusDB {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS', 
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED'
}

// UI-friendly phase status enum
export enum PhaseStatusUI {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  ON_HOLD = 'on-hold', 
  COMPLETED = 'completed'
}

// Type aliases for backward compatibility
export type PhaseStatus = PhaseStatusDB;
export type ProjectStatus = PhaseStatus;

export const PHASE_STATUSES: PhaseStatusDB[] = Object.values(PhaseStatusDB);

// Mappings between UI and DB using enums
export const PhaseStatusUI_TO_DB: Record<PhaseStatusUI, PhaseStatusDB> = {
  [PhaseStatusUI.PENDING]: PhaseStatusDB.PLANNING,
  [PhaseStatusUI.IN_PROGRESS]: PhaseStatusDB.IN_PROGRESS,
  [PhaseStatusUI.ON_HOLD]: PhaseStatusDB.PAUSED,
  [PhaseStatusUI.COMPLETED]: PhaseStatusDB.COMPLETED,
};

export const PhaseStatusDB_TO_UI: Record<PhaseStatusDB, PhaseStatusUI> = {
  [PhaseStatusDB.PLANNING]: PhaseStatusUI.PENDING,
  [PhaseStatusDB.IN_PROGRESS]: PhaseStatusUI.IN_PROGRESS,
  [PhaseStatusDB.PAUSED]: PhaseStatusUI.ON_HOLD,
  [PhaseStatusDB.COMPLETED]: PhaseStatusUI.COMPLETED,
};

export function toDbPhaseStatus(input: PhaseStatusUI | string): PhaseStatusDB {
  const norm = String(input || '').trim().toLowerCase();
  if (norm in PhaseStatusUI_TO_DB) {
    return PhaseStatusUI_TO_DB[norm as PhaseStatusUI];
  }
  // Accept already-DB-like inputs
  const upper = norm.toUpperCase() as PhaseStatusDB;
  if (Object.values(PhaseStatusDB).includes(upper)) {
    return upper;
  }
  return PhaseStatusDB.PLANNING;
}

export function toUiPhaseStatus(input: PhaseStatusDB | string): PhaseStatusUI {
  const upper = String(input || '').trim().toUpperCase() as PhaseStatusDB;
  if (upper in PhaseStatusDB_TO_UI) {
    return PhaseStatusDB_TO_UI[upper as PhaseStatusDB];
  }
  // Accept already-UI-like inputs
  const lower = String(input || '').trim().toLowerCase() as PhaseStatusUI;
  if (Object.values(PhaseStatusUI).includes(lower)) {
    return lower;
  }
  return PhaseStatusUI.PENDING;
}

export function formatPhaseStatusLabel(status: PhaseStatusDB | string): string {
  const s = String(status || '').toUpperCase() as PhaseStatusDB;
  switch (s) {
    case PhaseStatusDB.PLANNING:
      return 'Planning';
    case PhaseStatusDB.IN_PROGRESS:
      return 'In Progress';
    case PhaseStatusDB.PAUSED:
      return 'Paused';
    case PhaseStatusDB.COMPLETED:
      return 'Completed';
    default:
      return 'Planning';
  }
}

export function getPhaseBadgeColor(status: PhaseStatusDB | string): string {
  const s = String(status || '').toUpperCase() as PhaseStatusDB;
  switch (s) {
    case PhaseStatusDB.COMPLETED:
      return 'bg-green-100 text-green-700 border-green-200';
    case PhaseStatusDB.IN_PROGRESS:
      return 'bg-buildease-blue-100 text-buildease-blue-700 border-buildease-blue-200';
    case PhaseStatusDB.PLANNING:
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case PhaseStatusDB.PAUSED:
      return 'bg-amber-100 text-amber-700 border-amber-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function getPhaseDotColor(status: PhaseStatusDB | string): string {
  const s = String(status || '').toUpperCase() as PhaseStatusDB;
  switch (s) {
    case PhaseStatusDB.COMPLETED:
      return 'bg-green-500';
    case PhaseStatusDB.IN_PROGRESS:
      return 'bg-buildease-blue-500';
    case PhaseStatusDB.PAUSED:
      return 'bg-amber-500';
    case PhaseStatusDB.PLANNING:
    default:
      return 'bg-slate-400';
  }
}
