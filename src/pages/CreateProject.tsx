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
const ReviewSubmitForm = lazy(() => import('../components/create-project/ReviewSubmitForm').then(module => ({ default: module.ReviewSubmitForm })));

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
        missingFields.push(String(field));
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-buildease-blue-50/30 to-orange-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-4 md:px-6 md:py-8 max-w-5xl">
        {/* Enhanced Professional Header */}
        <div className="text-center mb-12 md:mb-16">

          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-slate-900 dark:text-white font-inter">
            <span className="bg-gradient-to-r from-buildease-blue-600 to-orange-500 bg-clip-text text-transparent">
              Create New Project
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-opensans leading-relaxed mb-8">
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
                  {/* Professional Step Content Card */}
                  <Card className="bg-white/95 dark:bg-slate-800/95 border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 rounded-2xl backdrop-blur-sm ring-1 ring-slate-200/30 dark:ring-slate-700/30">
                    <div className="p-8 md:p-10">
                      {/* Professional Step Header */}
                      <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-buildease-blue-500 to-orange-500 rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-sm font-bold text-white">{currentStep}</span>
                          </div>
                          <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white font-inter">
                              {stepTitles[currentStep - 1]}
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 font-opensans">
                              Step {currentStep} of {totalSteps}
                            </p>
                          </div>
                        </div>
                        <div className="h-px bg-gradient-to-r from-buildease-blue-200 via-orange-200 to-transparent dark:from-buildease-blue-700 dark:via-orange-700 dark:to-transparent"></div>
                      </div>
                      
                      {/* Step Content */}
                      <div className="max-w-2xl">
                        {renderStepContent()}
                      </div>
                    </div>
                  </Card>
                  
                  
                  {/* Professional Navigation */}
                  <div className="flex items-center justify-between pt-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentStep === 1}
                      className="min-h-[48px] px-8 py-3 text-sm border-2 border-slate-300 dark:border-slate-600 hover:border-buildease-blue-400 dark:hover:border-buildease-blue-500 bg-white/80 dark:bg-slate-800/80 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:border-slate-200 dark:disabled:border-slate-700 disabled:bg-slate-50 dark:disabled:bg-slate-900 font-opensans shadow-md hover:shadow-lg disabled:shadow-none backdrop-blur-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50 hover:ring-buildease-blue-200/50 dark:hover:ring-buildease-blue-700/50"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      <span>Back</span>
                    </Button>
                      
                    <Button
                      type="button"
                      onClick={handleNext}
                      className={`min-h-[48px] px-10 py-3 text-sm rounded-xl font-semibold transition-all duration-200 font-opensans shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-md transform hover:scale-105 active:scale-95 ${
                        currentStep === totalSteps
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white disabled:from-slate-400 disabled:to-slate-500 shadow-orange-500/25 hover:shadow-orange-500/40"
                          : "bg-gradient-to-r from-buildease-blue-500 to-buildease-blue-600 hover:from-buildease-blue-600 hover:to-buildease-blue-700 text-white disabled:from-slate-400 disabled:to-slate-500 shadow-buildease-blue-500/25 hover:shadow-buildease-blue-500/40"
                      }`}
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