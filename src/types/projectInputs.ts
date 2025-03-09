/**
 * Types for project input forms and related components
 */
import { ReactNode } from 'react';

/**
 * Properties for insight item component
 */
export interface InsightItemProps {
  title: string;
  description: string;
  icon?: ReactNode;
  type?: 'default' | 'warning' | 'success';
  animationDelay?: number;
}

/**
 * Type for form field values to replace the use of 'any'
 */
export type FormFieldValue = string | boolean | string[] | number | undefined;

/**
 * Project form data structure
 */
export interface ProjectFormData {
  language: string;
  projectName: string;
  projectType: string;
  location: string;
  region: string;
  budget: string;
  currency: string;
  timeline: string;
  plotSize: string;
  plotSizeUnit: string;
  buildingSize: string;
  buildingSizeUnit: string;
  bedrooms: string;
  bathrooms: string;
  livingAreas: string;
  kitchens: string;
  buildingStructure: string;
  roofType: string;
  foundationType: string;
  wallMaterial: string;
  floorMaterial: string;
  ceilingMaterial: string;
  garage: string;
  outdoorSpace: string;
  style: string;
  specialFeatures: string[];
  objectives: string;
  constraints: string;
  additionalRequests: string;
  energyEfficiency: boolean;
  waterConservation: boolean;
  localMaterials: boolean;
  accessibilityFeatures: boolean;
  traditionalElements: boolean;
  modernAmenities: string[];
  description: string;
  windowType: string;
  images: string[];
}

/**
 * Default/initial values for project form data
 */
export const DEFAULT_PROJECT_FORM_DATA: ProjectFormData = {
  language: "english",
  projectName: "",
  projectType: "",
  location: "",
  region: "greater-accra",
  budget: "",
  currency: "cedi",
  timeline: "",
  plotSize: "",
  plotSizeUnit: "sqm",
  buildingSize: "",
  buildingSizeUnit: "sqm",
  bedrooms: "",
  bathrooms: "",
  livingAreas: "",
  kitchens: "",
  buildingStructure: "",
  roofType: "",
  foundationType: "",
  wallMaterial: "",
  floorMaterial: "",
  ceilingMaterial: "",
  garage: "",
  outdoorSpace: "",
  style: "",
  specialFeatures: [],
  objectives: "",
  constraints: "",
  additionalRequests: "",
  energyEfficiency: false,
  waterConservation: false,
  localMaterials: true,
  accessibilityFeatures: false,
  traditionalElements: false,
  modernAmenities: [],
  description: "",
  windowType: "",
  images: []
};

/**
 * Cost estimate structure
 */
export interface CostEstimate {
  min: number;
  max: number;
}

/**
 * Tab names type
 */
export type ProjectInputTab = 'intro' | 'basic' | 'building' | 'materials' | 'features' | 'final';

/**
 * Task interface for project phases
 */
export interface Task {
  id: string;
  title: string;
  duration?: string;
  description?: string;
  completed: boolean;
}

/**
 * Material interface for project phases
 */
export interface Material {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

/**
 * Phase interface for construction project
 */
export interface Phase {
  id: string;
  title: string;
  duration: string;
  startDate?: string;
  endDate?: string;
  tasks: Task[];
  materials: Material[];
  description?: string;
} 
export interface ProjectPhaseManagerProps {
  phases: Phase[]
  setPhases: (phases: Phase[]) => void
  isDarkMode: boolean
}

export interface ProjectData {
  name?: string
  description?: string
  type?: string
  location?: string
  region?: string
  budget?: string
  currency?: string
  timeframe?: string
  images?: string[]
  [key: string]: unknown
}

// Add this to src/types/projectInputs.ts
export type PlanStatus = 'draft' | 'in-progress' | 'completed' | 'approved' | 'rejected' | 'final';