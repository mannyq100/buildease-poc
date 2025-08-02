/**
 * Project Form Data Store
 * Manages form data state for the project creation wizard
 * Follows BuildEase standards: focused, under 400 lines, clean architecture
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Form data types
export interface ProjectFormValues {
  // Essential Information - Step 1
  name: string;
  description?: string;
  projectType: string;
  owner?: string;
  phoneNumber?: string;
  email?: string;
  
  // Location Essentials - Step 2
  location: string;
  city?: string;
  country: string;
  region: string;
  plotSize: string;
  plotSizeUnit: string;
  terrain?: string;
  nearbyLandmarks?: string;
  
  // Core Building Requirements - Step 3
  buildingSize: string;
  buildingSizeUnit: string;
  storeys: string;
  bedrooms: string;
  bathrooms: string;
  kitchens?: string;
  livingAreas?: string;
  buildingStyle?: string;
  
  // Budget Essentials - Step 4
  budget: string;
  currency: string;
  timeframe?: string;
  expectedStartDate?: string;
  
  // Basic Materials - Step 5
  structureType?: string;
  foundationType?: string;
  roofType?: string;
  wallMaterial?: string;
  floorMaterial?: string;
  
  // Preferences & Features - Step 6
  specialFeatures?: string[];
  sustainabilityFeatures?: string[];
  
  // Additional Context - Step 7
  siteConstraints?: string;
  localRegulations?: string;
  additionalNotes?: string;
  
  // Inspiration Images
  images?: string[];
  profileImage?: string;
}

// Saved form data interface
interface SavedFormData {
  formData: Partial<ProjectFormValues>;
  timestamp: number;
  version: string;
}

// Form data store state
export interface FormDataStoreState {
  formData: ProjectFormValues;
  isDirty: boolean;
  lastSaved: number | null;
  
  // Actions
  updateFormData: (updates: Partial<ProjectFormValues>) => void;
  resetFormData: () => void;
  setFormField: <K extends keyof ProjectFormValues>(field: K, value: ProjectFormValues[K]) => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
  clearSavedData: () => void;
  markClean: () => void;
}

// Utility function to get suggested country from browser locale
function getSuggestedCountryFromLocale(): string {
  try {
    const locale = navigator.language || 'en-US';
    const countryCode = locale.split('-')[1];
    
    const countryMap: Record<string, string> = {
      'US': 'United States',
      'GB': 'United Kingdom', 
      'CA': 'Canada',
      'AU': 'Australia',
      'GH': 'Ghana',
      'NG': 'Nigeria',
      'KE': 'Kenya',
      'ZA': 'South Africa',
      'IN': 'India',
      'DE': 'Germany',
      'FR': 'France',
      'IT': 'Italy',
      'ES': 'Spain',
      'BR': 'Brazil',
      'MX': 'Mexico',
      'JP': 'Japan',
      'CN': 'China',
      'RU': 'Russia'
    };
    
    return countryMap[countryCode] || '';
  } catch {
    return '';
  }
}

// Default form values
const getDefaultFormData = (): ProjectFormValues => ({
  // Essential Information
  name: '',
  description: '',
  projectType: '',
  owner: '',
  phoneNumber: '',
  email: '',
  
  // Location
  location: '',
  city: '',
  country: getSuggestedCountryFromLocale(),
  region: '',
  plotSize: '',
  plotSizeUnit: 'sq-m',
  terrain: '',
  nearbyLandmarks: '',
  
  // Building Requirements
  buildingSize: '',
  buildingSizeUnit: 'sq-m',
  storeys: '',
  bedrooms: '',
  bathrooms: '',
  kitchens: '1',
  livingAreas: '1',
  buildingStyle: '',
  
  // Budget
  budget: '',
  currency: '',
  timeframe: '',
  expectedStartDate: '',
  
  // Materials
  structureType: '',
  foundationType: '',
  roofType: '',
  wallMaterial: '',
  floorMaterial: '',
  
  // Features
  specialFeatures: [],
  sustainabilityFeatures: [],
  
  // Additional Context
  siteConstraints: '',
  localRegulations: '',
  additionalNotes: '',
  
  // Images
  images: [],
  profileImage: ''
});

// Local storage key
const FORM_DATA_STORAGE_KEY = 'buildease_create_project_form';
const FORM_DATA_VERSION = '1.0.0';

// Save form data to localStorage with data sanitization
function saveFormDataToStorage(formData: ProjectFormValues): void {
  try {
    const savedData: SavedFormData = {
      formData,
      timestamp: Date.now(),
      version: FORM_DATA_VERSION
    };
    
    localStorage.setItem(FORM_DATA_STORAGE_KEY, JSON.stringify(savedData));
  } catch (error) {
    // localStorage might be full or disabled - silently handle
  }
}

// Load form data from localStorage
function loadFormDataFromStorage(): Partial<ProjectFormValues> | null {
  try {
    const savedDataStr = localStorage.getItem(FORM_DATA_STORAGE_KEY);
    if (!savedDataStr) return null;
    
    const savedData: SavedFormData = JSON.parse(savedDataStr);
    
    // Check version compatibility and age (expire after 7 days)
    const isExpired = Date.now() - savedData.timestamp > 7 * 24 * 60 * 60 * 1000;
    const isCompatible = savedData.version === FORM_DATA_VERSION;
    
    if (isExpired || !isCompatible) {
      localStorage.removeItem(FORM_DATA_STORAGE_KEY);
      return null;
    }
    
    return savedData.formData;
  } catch (error) {
    // Invalid JSON or other error - clear and return null
    localStorage.removeItem(FORM_DATA_STORAGE_KEY);
    return null;
  }
}

// Clear saved form data
function clearFormDataFromStorage(): void {
  try {
    localStorage.removeItem(FORM_DATA_STORAGE_KEY);
  } catch (error) {
    // Silently handle errors
  }
}

// Create the form data store
export const useFormDataStore = create<FormDataStoreState>()(
  devtools(
    (set, get) => ({
      formData: getDefaultFormData(),
      isDirty: false,
      lastSaved: null,

      updateFormData: (updates) =>
        set((state) => ({
          formData: { ...state.formData, ...updates },
          isDirty: true
        }), false, 'updateFormData'),

      resetFormData: () =>
        set({
          formData: getDefaultFormData(),
          isDirty: false,
          lastSaved: null
        }, false, 'resetFormData'),

      setFormField: (field, value) =>
        set((state) => ({
          formData: { ...state.formData, [field]: value },
          isDirty: true
        }), false, 'setFormField'),

      saveToLocalStorage: () => {
        const { formData } = get();
        saveFormDataToStorage(formData);
        set({ lastSaved: Date.now() }, false, 'saveToLocalStorage');
      },

      loadFromLocalStorage: () => {
        const savedData = loadFormDataFromStorage();
        if (savedData) {
          set((state) => ({
            formData: { ...state.formData, ...savedData },
            isDirty: false,
            lastSaved: Date.now()
          }), false, 'loadFromLocalStorage');
          return true;
        }
        return false;
      },

      clearSavedData: () => {
        clearFormDataFromStorage();
        set({ lastSaved: null }, false, 'clearSavedData');
      },

      markClean: () =>
        set({ isDirty: false }, false, 'markClean')
    }),
    { name: 'form-data-store' }
  )
);

// Convenience hooks
export function useProjectFormData() {
  return useFormDataStore((state) => state.formData);
}

// Create stable selector functions
const selectFormDataActions = (state: FormDataStoreState) => ({
  updateFormData: state.updateFormData,
  resetFormData: state.resetFormData,
  setFormField: state.setFormField,
  saveToLocalStorage: state.saveToLocalStorage,
  loadFromLocalStorage: state.loadFromLocalStorage,
  clearSavedData: state.clearSavedData,
  markClean: state.markClean
});

export function useFormDataActions() {
  return useFormDataStore(selectFormDataActions);
}

const selectFormDataStatus = (state: FormDataStoreState) => ({
  isDirty: state.isDirty,
  lastSaved: state.lastSaved
});

export function useFormDataStatus() {
  return useFormDataStore(selectFormDataStatus);
}