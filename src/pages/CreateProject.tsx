/**
 * CreateProject.tsx
 * Core wizard for the project creation process
 * BuildEase-themed mobile-first design with shadcn-ui components
 * Refactored to use dedicated Zustand store for state management
 */
import { lazy, Suspense, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { cn } from '@/utils/core/ui';
import { useToast } from "@/components/ui/use-toast";
import { FormStepErrorBoundary } from "@/components/ui/form-step-error-boundary";
import { 
  ProjectDetailsFormSkeleton,
  LocationPlotFormSkeleton,
  BuildingSpecsFormSkeleton,
  BudgetTimelineFormSkeleton,
  MaterialsConstructionFormSkeleton,
  FeaturesFormSkeleton,
  ReviewSubmitFormSkeleton
} from "@/components/ui/form-step-skeleton";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { 
  useCreateProjectStore,
  useCreateProjectNavigation,
  useCreateProjectSubmission
} from '@/stores/createProjectStore';
import { StepNavigator } from '@/components/create-project/StepNavigator';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles
} from 'lucide-react';

// Lazy load wizard steps for better performance
const ProjectDetailsForm = lazy(() => import('../components/create-project/ProjectDetailsForm').then(module => ({ default: module.ProjectDetailsForm })));
const LocationPlotForm = lazy(() => import('../components/create-project/LocationPlotForm').then(module => ({ default: module.LocationPlotForm })));
const BuildingSpecsForm = lazy(() => import('../components/create-project/BuildingSpecsForm').then(module => ({ default: module.BuildingSpecsForm })));
const BudgetTimelineForm = lazy(() => import('../components/create-project/BudgetTimelineForm').then(module => ({ default: module.BudgetTimelineForm })));
const MaterialsConstructionForm = lazy(() => import('../components/create-project/MaterialsConstructionForm').then(module => ({ default: module.MaterialsConstructionForm })));
const FeaturesForm = lazy(() => import('../components/create-project/FeaturesForm').then(module => ({ default: module.FeaturesForm })));
const ReviewSubmitForm = lazy(() => 
  import('../components/create-project/ReviewSubmitForm').then(module => ({ 
    default: module.ReviewSubmitForm 
  })).catch(error => {
    console.error('Failed to load ReviewSubmitForm:', error);
    throw error;
  })
);

// Optimized Project form schema - Simplified for better UX
export const projectFormSchema = z.object({
  // Essential Information - Step 1
  name: z.string().min(3, 'Project name must be at least 3 characters').max(100),
  description: z.string().optional(),
  projectType: z.string().min(1, 'Please select a project type'),
  owner: z.string().optional(), // Made optional - only required if different owner
  phoneNumber: z.string().optional(),
  email: z.string().optional(), // Made optional - only required if different owner
  
  // Location Essentials - Step 2
  location: z.string().min(1, 'Location is required'),
  country: z.string().min(1, 'Country is required'),
  region: z.string().min(1, 'Region is required'),
  plotSize: z.string().min(1, 'Plot size is required'),
  plotSizeUnit: z.string().min(1, 'Unit is required'),
  terrain: z.string().optional(),
  nearbyLandmarks: z.string().optional(),
  
  // Core Building Requirements - Step 3
  buildingSize: z.string().min(1, 'Building size is required'),
  buildingSizeUnit: z.string().min(1, 'Unit is required'),
  storeys: z.string().min(1, 'Number of storeys is required'),
  bedrooms: z.string().min(1, 'Number of bedrooms is required'),
  bathrooms: z.string().min(1, 'Number of bathrooms is required'),
  kitchens: z.string().optional(),
  livingAreas: z.string().optional(),
  buildingStyle: z.string().optional(),
  
  // Budget Essentials - Step 4
  budget: z.string().min(1, 'Budget is required'),
  currency: z.string().min(1, 'Currency is required'),
  timeframe: z.string().optional(), // Made optional - AI can suggest
  expectedStartDate: z.string().optional(), // Made optional - flexible planning
  
  // Basic Materials - Step 5 (simplified - AI can suggest specifics)
  structureType: z.string().optional(), // Made optional - AI can recommend
  foundationType: z.string().optional(), // Made optional - based on terrain
  roofType: z.string().optional(), // Made optional - based on style/climate
  wallMaterial: z.string().optional(), // Made optional - AI recommendation
  floorMaterial: z.string().optional(), // Made optional - AI recommendation
  
  // Preferences & Features - Step 6 (all optional for customization)
  specialFeatures: z.array(z.string()).optional(),
  sustainabilityFeatures: z.array(z.string()).optional(),
  
  // Additional Context - Step 7 (optional details)
  siteConstraints: z.string().optional(),
  localRegulations: z.string().optional(),
  additionalNotes: z.string().optional(),
  
  // Inspiration Images
  images: z.array(z.string()).optional(),
  profileImage: z.string().optional(), // Selected profile/display image
});

// Form data type
export type CreateProjectFormValues = z.infer<typeof projectFormSchema>;



// Step titles for reference (actual step logic is in StepNavigator)
const stepTitles = [
  'Project Details',
  'Location',
  'Building',
  'Budget',
  'Materials',
  'Features',
  'Review'
];

// Step field validation mapping
const STEP_FIELDS: Record<number, (keyof CreateProjectFormValues)[]> = {
  1: ['name', 'projectType'], // Essential Details
  2: ['location', 'country', 'region', 'plotSize', 'plotSizeUnit'], // Location
  3: ['buildingSize', 'buildingSizeUnit', 'storeys', 'bedrooms', 'bathrooms'], // Building Specs
  4: ['budget', 'currency'], // Budget
  5: [], // Materials (optional)
  6: [], // Features (optional)
  7: [], // Review (no validation)
};

// Main CreateProject component (now uses Zustand store)
function CreateProjectContent() {
  const { toast } = useToast();
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  
  // Use Zustand store for state management
  const { currentStep, totalSteps, goToNextStep, goToPrevStep, jumpToStep } = useCreateProjectNavigation();
  const { isSubmitting, submitProject } = useCreateProjectSubmission();
  
  // Initialize form with react-hook-form and zod validation
  const methods = useForm<CreateProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      description: '',
      projectType: '',
      owner: '',
      phoneNumber: '',
      email: '',
      location: '',
      country: 'ghana',
      region: 'greater-accra',
      plotSize: '',
      plotSizeUnit: 'sq-m',
      terrain: '',
      nearbyLandmarks: '',
      buildingSize: '',
      buildingSizeUnit: 'sq-m',
      storeys: '',
      bedrooms: '',
      bathrooms: '',
      kitchens: '',
      livingAreas: '',
      buildingStyle: '',
      budget: '',
      currency: 'GHS',
      timeframe: '',
      expectedStartDate: '',
      structureType: '',
      foundationType: '',
      roofType: '',
      wallMaterial: '',
      floorMaterial: '',
      specialFeatures: [],
      sustainabilityFeatures: [],
      siteConstraints: '',
      localRegulations: '',
      additionalNotes: '',
      images: [],
    },
    mode: 'onChange',
  });
  
  const { handleSubmit, trigger, getValues } = methods;
  
  // Function to refresh user profile after project creation
  const refreshUserProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      // Emit a custom event to trigger profile refresh in auth context
      window.dispatchEvent(new CustomEvent('refreshUserProfile', {
        detail: { userId: user.id, reason: 'projectCreated' }
      }));
    } catch (error) {
      console.warn('Failed to refresh user profile:', error);
    }
  }, [user]);

  // Handle form submission using store
  const onSubmit = useCallback(async (data: CreateProjectFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a project",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Update store with final form data before submission
      const updateFormData = useCreateProjectStore.getState().updateFormData;
      updateFormData(data);
      
      await submitProject(user.id);
      
      // Refresh user profile to include new project in permissions
      await refreshUserProfile();
      
      // Show success message
      toast({
        title: "Project created successfully",
        description: "Your project has been created and a plan is being generated.",
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (error: unknown) {
      // Error handling - show the actual error message to the user
      console.error('Error submitting form:', error);
      const errorMessage = error instanceof Error ? error.message : 'There was a problem creating your project. Please try again.';
      toast({
        title: "Please check your project details",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [user, submitProject, refreshUserProfile, toast, navigate]);
  
  // Handle next step navigation with validation
  const handleNext = useCallback(async () => {
    // Handle final step submission
    if (currentStep === 7) {
      handleSubmit(onSubmit)();
      return;
    }
    
    // Get current form values
    const formValues = getValues();
    
    // Get required fields for current step
    const requiredFields = STEP_FIELDS[currentStep] || [];
    
    // Check if required fields are filled
    const missingFields: string[] = [];
    requiredFields.forEach(field => {
      const value = formValues[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missingFields.push(field);
      }
    });
    
    // Also trigger react-hook-form validation for the current step fields
    const isFormValid = await trigger(requiredFields.length > 0 ? requiredFields : undefined);
    
    if (missingFields.length === 0 && isFormValid) {
      // If validation passes, move to next step
      goToNextStep();
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Show validation errors
      const fieldNames = missingFields.map(field => {
        // Convert camelCase to readable names
        return field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      });
      
      toast({
        title: "Please check your inputs",
        description: missingFields.length > 0 
          ? `Please fill in: ${fieldNames.join(', ')}`
          : "Some required fields need your attention.",
        variant: "destructive",
      });
    }
  }, [currentStep, goToNextStep, toast, handleSubmit, onSubmit, trigger, getValues]);
  
  // Handle back navigation
  const handleBack = useCallback(() => {
    goToPrevStep();
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [goToPrevStep]);
  
  // Render step content with error boundary and suspense protection
  const renderStepContent = () => {
    // Map steps to their skeleton components for better loading UX
    const getStepSkeleton = () => {
      switch (currentStep) {
        case 1: return <ProjectDetailsFormSkeleton />;
        case 2: return <LocationPlotFormSkeleton />;
        case 3: return <BuildingSpecsFormSkeleton />;
        case 4: return <BudgetTimelineFormSkeleton />;
        case 5: return <MaterialsConstructionFormSkeleton />;
        case 6: return <FeaturesFormSkeleton />;
        case 7: return <ReviewSubmitFormSkeleton />;
        default: return <ProjectDetailsFormSkeleton />;
      }
    };
    
    return (
      <div className="mt-8">
        <FormStepErrorBoundary
          stepNumber={currentStep}
          stepTitle={stepTitles[currentStep - 1]}
          onRetry={() => {
            // Force re-render by updating a state or key
            window.location.reload(); // Simple approach for now
          }}
          onGoBack={currentStep > 1 ? handleBack : undefined}
        >
          <Suspense fallback={getStepSkeleton()}>
            {currentStep === 1 && <ProjectDetailsForm />}
            {currentStep === 2 && <LocationPlotForm />}
            {currentStep === 3 && <BuildingSpecsForm />}
            {currentStep === 4 && <BudgetTimelineForm />}
            {currentStep === 5 && <MaterialsConstructionForm />}
            {currentStep === 6 && <FeaturesForm />}
            {currentStep === 7 && <ReviewSubmitForm />}
          </Suspense>
        </FormStepErrorBoundary>
      </div>
    );
  };

  // Handle step click for navigation
  const handleStepClick = useCallback((stepId: number) => {
    jumpToStep(stepId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [jumpToStep]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-6 py-6 md:py-8 max-w-6xl">
        {/* BuildEase Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-slate-900 dark:text-white font-inter">
            Create New Project
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto font-opensans">
            Let's build something amazing together
          </p>
        </div>

        {/* Enhanced Step Navigator */}
        <StepNavigator 
          currentStep={currentStep}
          totalSteps={totalSteps}
          onStepClick={handleStepClick}
        />
        
        {/* Form Container */}
        <div className="max-w-3xl mx-auto">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <LazyMotion features={domAnimation}>
                <m.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="space-y-6"
                >
                  {/* Simplified Step Content Card */}
                  <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm rounded-xl">
                    <div className="p-6 md:p-8">
                      {/* Step Content */}
                      <div className="max-w-2xl">
                        {renderStepContent()}
                      </div>
                    </div>
                  </Card>
                  
                  
                  {/* BuildEase Navigation */}
                  <div className="flex items-center justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentStep === 1}
                      className="px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-slate-800 rounded-lg transition-all duration-200 disabled:opacity-50 font-opensans"
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      <span>Back</span>
                    </Button>
                      
                    <Button
                      type="button"
                      onClick={handleNext}
                      className={cn(
                        "px-6 py-2 text-sm rounded-lg font-medium transition-all duration-200 font-opensans",
                        currentStep === totalSteps
                          ? "bg-gradient-to-r from-[#ED8936] to-[#ED8936]/90 hover:from-[#ED8936]/90 hover:to-[#ED8936]/80 text-white shadow-sm"
                          : "bg-gradient-to-r from-[#2B6CB0] to-[#2B6CB0]/90 hover:from-[#2B6CB0]/90 hover:to-[#2B6CB0]/80 text-white shadow-sm"
                      )}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        currentStep === totalSteps ? (
                          <>
                            <span>Generate Plan</span>
                            <Sparkles className="ml-2 h-4 w-4" />
                          </>
                        ) : (
                          <>
                            <span>Continue</span>
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </>
                        )
                      )}
                    </Button>
                  </div>
                </m.div>
              </LazyMotion>
            </form> 
          </FormProvider>
        </div>
      </div>
    </div>
  );
}

// Main CreateProject component export (no longer needs provider wrapper)
export function CreateProject() {
  return <CreateProjectContent />;
}

export default CreateProject;