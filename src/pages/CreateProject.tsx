
/**
 * CreateProject.tsx
 * Core wizard for the project creation process
 * BuildEase-themed mobile-first design with shadcn-ui components
 */
import React, { useState, lazy, Suspense, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/utils/core/ui';
import { useToast } from "@/components/ui/use-toast";
import { FormStepErrorBoundary } from "@/components/ui/form-step-error-boundary";
import { useStepValidation } from "@/hooks/useDebouncedValidation";
import { 
  ProjectDetailsFormSkeleton,
  LocationPlotFormSkeleton,
  BuildingSpecsFormSkeleton,
  BudgetTimelineFormSkeleton,
  MaterialsConstructionFormSkeleton,
  FeaturesFormSkeleton,
  ReviewSubmitFormSkeleton
} from "@/components/ui/form-step-skeleton";
import { useProjectFormAutoSave } from "@/hooks/useProjectFormAutoSave";
import { calculateFormProgress, validateStepData } from "@/utils/projectFormUtils";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { ProjectCreationProvider, useProjectCreation } from "@/contexts/ProjectCreationContext";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Building,
  MapPin,
  Home,
  DollarSign,
  Layers,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2
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
export type ProjectFormValues = z.infer<typeof projectFormSchema>;

// Default form values
const defaultValues: Partial<ProjectFormValues> = {
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
};

// Step field validation mapping
const STEP_FIELDS: Record<number, (keyof ProjectFormValues)[]> = {
  1: ['name', 'projectType'], // Essential Details
  2: ['location', 'country', 'region', 'plotSize', 'plotSizeUnit'], // Location
  3: ['buildingSize', 'buildingSizeUnit', 'storeys', 'bedrooms', 'bathrooms'], // Building Specs
  4: ['budget', 'currency'], // Budget
  5: [], // Materials (optional)
  6: [], // Features (optional)
  7: [], // Review (no validation)
};

// Step definitions - constant array (no need to memoize static data)
const steps = [
  { 
    id: 1, 
    title: 'Project Details', 
    icon: <Building className="h-4 w-4" />,
    description: 'Basic project information'
  },
  { 
    id: 2, 
    title: 'Location', 
    icon: <MapPin className="h-4 w-4" />,
    description: 'Location and plot details'
  },
  { 
    id: 3, 
    title: 'Building', 
    icon: <Home className="h-4 w-4" />,
    description: 'Building specifications'
  },
  { 
    id: 4, 
    title: 'Budget', 
    icon: <DollarSign className="h-4 w-4" />,
    description: 'Budget and timeline'
  },
  { 
    id: 5, 
    title: 'Materials', 
    icon: <Layers className="h-4 w-4" />,
    description: 'Construction materials'
  },
  { 
    id: 6, 
    title: 'Features', 
    icon: <Sparkles className="h-4 w-4" />,
    description: 'Special features'
  },
  { 
    id: 7, 
    title: 'Review', 
    icon: <Check className="h-4 w-4" />,
    description: 'Review and submit'
  },
];

// Main CreateProject component (now uses context)
function CreateProjectContent() {
  const { toast } = useToast();
  const { user } = useSupabaseAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Use context for form submission and image handling
  const { handleFormSubmit, isSubmitting } = useProjectCreation();
  
  // Total number of steps
  const totalSteps = steps.length;
  
  // Calculate progress percentage
  const progress = (currentStep / totalSteps) * 100;
  
  // Initialize form with react-hook-form and zod validation
  const methods = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues,
    mode: 'onChange',
  });
  
  const { handleSubmit, trigger, watch, formState: { isDirty } } = methods;
  
  // Memoized validation options to prevent hook recreation
  const validationOptions = useMemo(() => ({
    delay: 300,
    onValidationStart: () => {
      // Could show loading indicator
    },
    onValidationEnd: (isValid: boolean) => {
      // Could update UI based on validation result
      // Validation result logged for debugging in development only
      if (process.env.NODE_ENV === 'development') {
        console.log('Step validation completed:', isValid);
      }
    },
  }), []);
  
  // Debounced validation for better performance
  const stepValidation = useStepValidation(trigger, STEP_FIELDS, validationOptions);
  
  // Auto-save functionality
  const { clearSavedData } = useProjectFormAutoSave(watch, isDirty);
  
  // Function to refresh user profile after project creation
  const refreshUserProfile = async () => {
    if (!user) return;
    
    try {
      // Emit a custom event to trigger profile refresh in auth context
      window.dispatchEvent(new CustomEvent('refreshUserProfile', {
        detail: { userId: user.id, reason: 'projectCreated' }
      }));
    } catch (error) {
      console.warn('Failed to refresh user profile:', error);
    }
  };
  
  // Watch form data for progress calculation
  const formData = watch();
  
  // Calculate dynamic progress based on form completion (memoized using string comparison for efficiency)
  const formDataString = useMemo(() => JSON.stringify(formData), [formData]);
  const formProgress = useMemo(() => {
    return calculateFormProgress(formData);
  }, [formDataString, formData]);
  
  // Handle next step navigation with improved validation (memoized)
  const handleNext = useCallback(async () => {
    // Handle final step submission
    if (currentStep === 7) {
      handleSubmit(onSubmit)();
      return;
    }
    
    // Use debounced validation for current step
    const isStepValid = await stepValidation.validateStep(currentStep);
    
    // Additionally validate using our utility function for business logic
    const stepErrors = validateStepData(formData, currentStep);
    if (stepErrors.length > 0) {
      toast({
        title: "Please check your inputs",
        description: stepErrors[0], // Show first error
        variant: "destructive",
      });
      return;
    }
    
    if (isStepValid) {
      // If validation passes, move to next step
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Show validation errors
      toast({
        title: "Please check your inputs",
        description: "Some required fields need your attention.",
        variant: "destructive",
      });
    }
  }, [currentStep, stepValidation, formData, totalSteps, toast, handleSubmit]);
  
  // Handle back navigation (memoized)
  const handleBack = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  

  // Handle form submission using context
  const onSubmit = async (data: ProjectFormValues) => {
    try {
      await handleFormSubmit(data);
      
      // Clear auto-saved data on successful submission
      clearSavedData();
      
      // Refresh user profile to include new project in permissions
      await refreshUserProfile();
      
      // Navigation is handled by the context through onProjectCreated callback
      
    } catch (error: unknown) {
      // Error handling is done in the context
      console.error('Error submitting form:', error);
    }
  };
  
  // Render step content with error boundary and suspense protection
  const renderStepContent = () => {
    const stepInfo = steps[currentStep - 1];
    
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
          stepTitle={stepInfo.title}
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

  // Jump to a specific step (only if it's a previous step) - memoized
  const jumpToStep = useCallback((stepId: number) => {
    if (currentStep > stepId) {
      setCurrentStep(stepId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

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

        {/* Enhanced Step Indicator with Squares */}
        <div className="mb-6 md:mb-10">
          <div className="flex items-start justify-center max-w-5xl mx-auto mb-8">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const isLast = index === steps.length - 1;
              
              // On mobile, only show current step, previous, and next
              if (isMobile && Math.abs(step.id - currentStep) > 1) {
                return null;
              }
              
              return (
                <div key={step.id} className="flex items-start">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => jumpToStep(step.id)}
                      disabled={currentStep <= step.id}
                      className={cn(
                        "relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl transition-all duration-300 mb-3",
                        isActive 
                          ? "bg-gradient-to-br from-[#2B6CB0] to-[#2B6CB0]/90 text-white shadow-lg" 
                          : isCompleted 
                            ? "bg-gradient-to-br from-[#ED8936] to-[#ED8936]/90 text-white shadow-md"
                            : "bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700",
                        currentStep > step.id ? "cursor-pointer hover:shadow-md" : ""
                      )}
                      aria-label={`Go to step ${step.id}: ${step.title}`}
                    >
                      {isCompleted ? <Check className="h-5 w-5" /> : step.icon}
                    </button>
                    <div className="text-center max-w-20">
                      <p className={cn(
                        "text-sm font-semibold font-inter",
                        isActive 
                          ? "text-[#2B6CB0] dark:text-[#2B6CB0]" 
                          : isCompleted 
                            ? "text-[#ED8936] dark:text-[#ED8936]"
                            : "text-slate-500 dark:text-slate-400"
                      )}>
                        {isMobile ? `${step.id}` : step.title}
                      </p>
                      {!isMobile && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-1 font-opensans">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {!isLast && !isMobile && (
                    <div className={cn(
                      "flex-1 h-px mx-4 mt-6 transition-all duration-300",
                      isCompleted ? "bg-[#ED8936]" : "bg-slate-300 dark:bg-slate-700"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
          
          {/* BuildEase Progress Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-3">
              <span className="font-medium font-inter">Step {currentStep} of {totalSteps}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full font-opensans">
                  {Math.round(progress)}% Steps
                </span>
                <span className="text-xs px-2 py-1 bg-[#2B6CB0]/10 dark:bg-[#2B6CB0]/20 text-[#2B6CB0] rounded-full font-opensans">
                  {formProgress}% Complete
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#2B6CB0] to-[#ED8936] transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
        
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
                      {/* BuildEase Step Header */}
                      <div className="mb-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-[#2B6CB0]/10 dark:bg-[#2B6CB0]/20 rounded-lg text-[#2B6CB0]">
                            {steps[currentStep - 1].icon}
                          </div>
                          <h2 className="text-xl font-semibold text-slate-900 dark:text-white font-inter">
                            {steps[currentStep - 1].title}
                          </h2>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 ml-11 font-opensans">
                          {steps[currentStep - 1].description}
                        </p>
                      </div>
                      
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

// Wrapper component with ProjectCreationProvider
export function CreateProject() {
  const navigate = useNavigate();

  const handleProjectCreated = useCallback((_projectId: string) => {
    // Navigate to the project details or dashboard
    navigate('/dashboard');
  }, [navigate]);

  return (
    <ProjectCreationProvider onProjectCreated={handleProjectCreated}>
      <CreateProjectContent />
    </ProjectCreationProvider>
  );
}

export default CreateProject;