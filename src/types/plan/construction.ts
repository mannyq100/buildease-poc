/**
 * Construction Plan Type Definitions
 * Main plan structure and related entities
 */

import { PlanPhase } from './phase';

// === Plan Structure Types ===

export interface Budget {
  laborCost: number;
  materialsCost: number;
  equipmentCost: number;
  permitsFees: number;
  contingency: number;
  totalCost: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  createdAt: string;
  createdBy: string;
}

export interface ConstructionPlan {
  id: string;
  name: string;
  description: string;
  projectType: string;
  clientName: string;
  location: string;
  estimatedDuration: string;
  startDate?: string;
  endDate?: string;
  status: 'draft' | 'final';
  phases: PlanPhase[];
  budget: Budget;
  team: TeamMember[];
  documents: Document[];
  lastUpdated: string;
  createdAt: string;
}