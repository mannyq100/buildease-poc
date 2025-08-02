/**
 * Project Navigation Store
 * Manages step navigation and wizard state for project creation
 * Follows BuildEase standards: focused responsibility, under 400 lines
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Navigation step type - streamlined to 4 core steps
export type WizardStep = 1 | 2 | 3 | 4;

// Step configuration
export interface StepConfig {
  id: WizardStep;
  title: string;
  description: string;
  isRequired: boolean;
  requiredFields: string[];
}

// Navigation store state
export interface NavigationStoreState {
  currentStep: WizardStep;
  completedSteps: Set<WizardStep>;
  visitedSteps: Set<WizardStep>;
  isNavigating: boolean;
  
  // Actions
  setCurrentStep: (step: WizardStep) => void;
  nextStep: () => boolean;
  previousStep: () => boolean;
  goToStep: (step: WizardStep) => void;
  markStepCompleted: (step: WizardStep) => void;
  markStepIncomplete: (step: WizardStep) => void;
  resetNavigation: () => void;
  canNavigateToStep: (step: WizardStep) => boolean;
  getStepConfig: (step: WizardStep) => StepConfig;
  getProgress: () => number;
}

// Step configurations - consolidated to 4 streamlined steps
const STEP_CONFIGS: Record<WizardStep, StepConfig> = {
  1: {
    id: 1,
    title: 'Project Essentials',
    description: 'Basic project details and type',
    isRequired: true,
    requiredFields: ['name', 'projectType']
  },
  2: {
    id: 2,
    title: 'Location & Plot',
    description: 'Where your project will be built',
    isRequired: true,
    requiredFields: ['location', 'country', 'region', 'plotSize', 'plotSizeUnit']
  },
  3: {
    id: 3,
    title: 'Building & Budget',
    description: 'Building specifications and financial planning',
    isRequired: true,
    requiredFields: ['buildingSize', 'buildingSizeUnit', 'storeys', 'bedrooms', 'bathrooms', 'budget', 'currency']
  },
  4: {
    id: 4,
    title: 'Review & Submit',
    description: 'Review your project details and submit',
    isRequired: false,
    requiredFields: []
  }
};

// Constants - updated for streamlined 4-step process
const TOTAL_STEPS = 4;
const INITIAL_STEP: WizardStep = 1;

// Validation helper
function isValidStep(step: number): step is WizardStep {
  return step >= 1 && step <= TOTAL_STEPS;
}

// Create the navigation store
export const useNavigationStore = create<NavigationStoreState>()(
  devtools(
    (set, get) => ({
      currentStep: INITIAL_STEP,
      completedSteps: new Set<WizardStep>(),
      visitedSteps: new Set<WizardStep>([INITIAL_STEP]),
      isNavigating: false,

      setCurrentStep: (step) => {
        if (!isValidStep(step)) return;
        
        set((state) => ({
          currentStep: step,
          visitedSteps: new Set([...state.visitedSteps, step])
        }), false, 'setCurrentStep');
      },

      nextStep: () => {
        const { currentStep } = get();
        const nextStep = currentStep + 1;
        
        if (!isValidStep(nextStep)) return false;
        
        set((state) => ({
          currentStep: nextStep as WizardStep,
          visitedSteps: new Set([...state.visitedSteps, nextStep as WizardStep])
        }), false, 'nextStep');
        
        return true;
      },

      previousStep: () => {
        const { currentStep } = get();
        const prevStep = currentStep - 1;
        
        if (!isValidStep(prevStep)) return false;
        
        set({
          currentStep: prevStep as WizardStep
        }, false, 'previousStep');
        
        return true;
      },

      goToStep: (step) => {
        const { canNavigateToStep } = get();
        
        if (!canNavigateToStep(step)) return;
        
        set((state) => ({
          currentStep: step,
          visitedSteps: new Set([...state.visitedSteps, step])
        }), false, 'goToStep');
      },

      markStepCompleted: (step) =>
        set((state) => ({
          completedSteps: new Set([...state.completedSteps, step])
        }), false, 'markStepCompleted'),

      markStepIncomplete: (step) =>
        set((state) => {
          const newCompletedSteps = new Set(state.completedSteps);
          newCompletedSteps.delete(step);
          return { completedSteps: newCompletedSteps };
        }, false, 'markStepIncomplete'),

      resetNavigation: () =>
        set({
          currentStep: INITIAL_STEP,
          completedSteps: new Set<WizardStep>(),
          visitedSteps: new Set<WizardStep>([INITIAL_STEP]),
          isNavigating: false
        }, false, 'resetNavigation'),

      canNavigateToStep: (step) => {
        if (!isValidStep(step)) return false;
        
        const { currentStep, visitedSteps } = get();
        
        // Can always go to current step or visited steps
        if (step === currentStep || visitedSteps.has(step)) return true;
        
        // Can go to next step if current step requirements are met
        if (step === currentStep + 1) return true;
        
        // Can go to previous steps
        if (step < currentStep) return true;
        
        return false;
      },

      getStepConfig: (step) => STEP_CONFIGS[step],

      getProgress: () => {
        const { completedSteps } = get();
        const requiredSteps = Object.values(STEP_CONFIGS)
          .filter(config => config.isRequired)
          .map(config => config.id);
        
        const completedRequiredSteps = requiredSteps.filter(step => 
          completedSteps.has(step)
        ).length;
        
        return (completedRequiredSteps / requiredSteps.length) * 100;
      }
    }),
    { name: 'navigation-store' }
  )
);

// Convenience hooks
// Stable selectors
const selectWizardNavigation = (state: NavigationStoreState) => ({
  currentStep: state.currentStep,
  completedSteps: state.completedSteps,
  visitedSteps: state.visitedSteps,
  isNavigating: state.isNavigating,
  canGoNext: state.currentStep < TOTAL_STEPS,
  canGoPrevious: state.currentStep > 1,
  progress: state.getProgress()
});

const selectNavigationActions = (state: NavigationStoreState) => ({
  setCurrentStep: state.setCurrentStep,
  nextStep: state.nextStep,
  previousStep: state.previousStep,
  goToStep: state.goToStep,
  markStepCompleted: state.markStepCompleted,
  markStepIncomplete: state.markStepIncomplete,
  resetNavigation: state.resetNavigation,
  canNavigateToStep: state.canNavigateToStep,
  getStepConfig: state.getStepConfig,
  getProgress: state.getProgress
});

export function useWizardNavigation() {
  return useNavigationStore(selectWizardNavigation);
}

export function useNavigationActions() {
  return useNavigationStore(selectNavigationActions);
}

export function useStepInfo(step: WizardStep) {
  return useNavigationStore((state) => {
    const config = state.getStepConfig(step);
    return {
      ...config,
      isCompleted: state.completedSteps.has(step),
      isVisited: state.visitedSteps.has(step),
      isCurrent: state.currentStep === step,
      canNavigateTo: state.canNavigateToStep(step)
    };
  });
}

// Export step configurations for external use
export { STEP_CONFIGS, TOTAL_STEPS };