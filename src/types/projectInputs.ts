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
}

/**
 * Type representing possible values for form fields
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