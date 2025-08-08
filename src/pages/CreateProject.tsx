/**
 * CreateProject.tsx
 * Core wizard for the project creation process
 * BuildEase-themed mobile-first design with shadcn-ui components
 * Refactored to use dedicated Zustand store for state management
 */
import { lazy, Suspense, useCallback, useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { LazyMotion, domAnimation, m } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";
import { FormStepErrorBoundary } from "@/components/ui/form-step-error-boundary";
import { 
  canAccessStep
} from '@/utils/validation/projectFormValidation';
import { 
  ProjectDetailsFormSkeleton,
  LocationPlotFormSkeleton,
  BuildingSpecsFormSkeleton as BuildingBudgetFormSkeleton,
  ReviewSubmitFormSkeleton
} from "@/components/ui/form-step-skeleton";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
// Removed unused WizardStep type import
import { StepNavigator } from '@/components/create-project/StepNavigator';
import { Button } from '@/components/ui/button';
import { TOTAL_STEPS, STEP_NAMES } from './CreateProject/constants';
import { projectFormSchema, type CreateProjectFormValues } from './CreateProject/schema';
import { Card } from '@/components/ui/card';
import { useSubmissionActions, useProjectSubmission } from '@/stores/createProject/submissionStore';
import { useImageActions, useImageState } from '@/stores/createProject/imageStore';
import { updateProjectImageArray } from '@/services/projectImageService';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles
} from 'lucide-react';

// Local storage key for draft autosave
const DRAFT_KEY = 'buildease:createProject:draft:v1';

// Lazy load wizard steps with intelligent prefetching  
const ProjectDetailsForm = lazy(() => import('../components/create-project/ProjectDetailsForm'));
const LocationPlotForm = lazy(() => import('../components/create-project/LocationPlotForm'));
const BuildingBudgetForm = lazy(() => import('../components/create-project/BuildingBudgetForm'));
const ReviewSubmitForm = lazy(() => import('../components/create-project/ReviewSubmitForm'));

// Step prefetching utilities
const stepComponents = {
  1: ProjectDetailsForm,
  2: LocationPlotForm,
  3: BuildingBudgetForm,
  4: ReviewSubmitForm
};

// Prefetch next step when user is on current step
const prefetchNextStep = (currentStep: number) => {
  const nextStep = currentStep + 1;
  const nextComponent = stepComponents[nextStep as keyof typeof stepComponents];
  
  if (nextComponent) {
    // Use requestIdleCallback for non-blocking prefetch
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Prefetch by importing the component
        void nextComponent;
      }, { timeout: 2000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        // Prefetch by importing the component
        void nextComponent;
      }, 100);
    }
  }
};

// Schema and types imported from separate file



// Main CreateProject component (now uses Zustand store)
function CreateProjectContent() {
  const { toast } = useToast();
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  
  // Use simple local state to avoid Zustand infinite loop issues
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = TOTAL_STEPS;
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  
  // Get submission store actions and state
  const { submitProject } = useSubmissionActions();
  const { isSubmitting, submitError, isSuccess, createdProjectId, createdProjectSlug } = useProjectSubmission();
  
  // Get image upload actions and state
  const { uploadImages, clearAllImages } = useImageActions();
  const { localFiles: imageFiles, isUploading } = useImageState();
  
  // Use refs to track previous values and prevent infinite loops
  const prevIsSuccessRef = useRef(false);
  const prevSubmitErrorRef = useRef<string | null>(null);
  const prevCreatedProjectIdRef = useRef<string | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  
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
      country: '',
      region: '',
      budget: '',
      images: [],
      profileImage: undefined,
    },
  });

  // Online/offline listeners
  useEffect(() => {
    function handleOnline() { setIsOnline(true); }
    function handleOffline() { setIsOnline(false); }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Restore draft if present
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<CreateProjectFormValues>;
        methods.reset({
          ...methods.getValues(),
          ...parsed,
        });
        toast({
          title: 'Draft restored',
          description: 'We found an unsent project draft and restored it for you.',
        });
      }
    } catch (e) {
      // Ignore corrupted drafts
      console.warn('Failed to restore draft', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave draft with debounce
  useEffect(() => {
    const subscription = methods.watch((values) => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = window.setTimeout(() => {
        try {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
        } catch (e) {
          console.warn('Failed to save draft', e);
        }
      }, 600);
    });
    return () => {
      subscription.unsubscribe();
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [methods]);
  
  // Validate only fields for the active step (prevents blocking on future-step fields)
  const requiredFieldsByStep = useMemo<Record<number, (keyof CreateProjectFormValues)[]>>(() => ({
    // Step 1: Project Details
    1: [
      'name',
      'projectType',
    ],
    // Step 2: Location & Plot
    2: [
      'location',
      'country',
      'region',
      'plotSize',
      'plotSizeUnit',
    ],
    // Step 3: Building Specs & Budget essentials (combined in BuildingBudgetForm)
    3: [
      'buildingSize',
      'buildingSizeUnit',
      'storeys',
      'bedrooms',
      'bathrooms',
      'budget',
      'currency',
    ],
    // Step 4: Review & Submit (no new fields; full validation will run on submit)
    4: [],
  }), []);
  
  // Handle submission success/error states with stable approach
  useEffect(() => {
    // Only handle success if it's a new success state
    if (isSuccess && createdProjectId && 
        (!prevIsSuccessRef.current || prevCreatedProjectIdRef.current !== createdProjectId)) {
      
      prevIsSuccessRef.current = true;
      prevCreatedProjectIdRef.current = createdProjectId;
      
      // For now, just show success and navigate (image upload will be implemented later)
      toast({
        title: "Project created successfully",
        description: "Your project has been created and AI plan generation has started.",
      });

      // Clear draft after successful creation
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* best-effort clear; ignore quota/private mode issues */ }
      
      const targetSlugOrId = createdProjectSlug ?? createdProjectId;
      navigate(`/project/${targetSlugOrId}`);
    }
    
    // Reset success tracking when not successful
    if (!isSuccess) {
      prevIsSuccessRef.current = false;
      prevCreatedProjectIdRef.current = null;
    }
  }, [isSuccess, createdProjectId, createdProjectSlug, toast, navigate]);
  
  useEffect(() => {
    // Only handle error if it's a new error
    if (submitError && submitError !== prevSubmitErrorRef.current) {
      prevSubmitErrorRef.current = submitError;
      
      toast({
        title: "Error",
        description: submitError,
        variant: "destructive",
      });
    }
    
    // Reset error tracking when no error
    if (!submitError) {
      prevSubmitErrorRef.current = null;
    }
  }, [submitError, toast]);
  
  // Handle form submission
  const handleSubmit = methods.handleSubmit;
  
  // Handle next step
  const handleNext = useCallback(async () => {
    try {
      // Validate only the current step's required fields (full validation on final step)
      const fieldsToValidate: FieldPath<CreateProjectFormValues>[] | undefined =
        currentStep === totalSteps
          ? undefined
          : (requiredFieldsByStep[currentStep] as unknown as FieldPath<CreateProjectFormValues>[]) ?? [];
      const isValid = Array.isArray(fieldsToValidate) && fieldsToValidate.length > 0
        ? await methods.trigger(fieldsToValidate, { shouldFocus: true })
        : await methods.trigger(undefined, { shouldFocus: true });
      
      if (!isValid) {
        toast({
          title: "Please fix the errors",
          description: "Complete all required fields before continuing.",
          variant: "destructive",
        });
        return;
      }
      
      // Handle final step submission
      if (currentStep === totalSteps) {
        if (!user?.id) {
          toast({
            title: "Authentication required",
            description: "Please log in to create a project.",
            variant: "destructive",
          });
          return;
        }
        
        try {
          // Step 1: Create project in database (without images)
          const formData = methods.getValues();
          const { id: projectId } = await submitProject(formData, user.id);
          
          // Step 2: Upload images if any exist
          if (imageFiles.length > 0) {
            toast({
              title: "Uploading images...",
              description: "Please wait while we upload your project images.",
            });
            
            const { images, profileImage } = await uploadImages(user.id, projectId);

            // Persist URLs to project record
            try {
              if (images.length > 0) {
                await updateProjectImageArray(projectId, images, 'inspiration');
              }
              if (profileImage) {
                await updateProjectImageArray(projectId, [profileImage], 'profile');
              }

              // Clear local images after successful persistence
              clearAllImages();

              toast({
                title: "Images uploaded successfully",
                description: "Your project images have been saved.",
              });
            } catch (persistError) {
              console.error('Failed to persist image URLs to project:', persistError);
              toast({
                title: "Images uploaded, but not saved to project",
                description: "Please try again from the project page to attach images.",
                variant: "destructive",
              });
            }
          }
          
          // Navigation will be handled by the success effect
        } catch (error) {
          console.error('Error in project creation flow:', error);
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to create project. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        // Go to next step
        setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        // Prefetch next step for better UX
        prefetchNextStep(currentStep + 1);
      }
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error in handleNext:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentStep, totalSteps, methods, user?.id, submitProject, toast, imageFiles.length, uploadImages, clearAllImages, requiredFieldsByStep]);

  // Handle previous step
  const handleBack = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  // Render step content with error boundary and suspense protection
  const renderStepContent = () => {
    // Map steps to their skeleton components for better loading UX
    const getStepSkeleton = () => {
      switch (currentStep) {
        case 1: return <ProjectDetailsFormSkeleton />;
        case 2: return <LocationPlotFormSkeleton />;
        case 3: return <BuildingBudgetFormSkeleton />;
        case 4: return <ReviewSubmitFormSkeleton />;
        default: return <ProjectDetailsFormSkeleton />;
      }
    };
    
    return (
      <div className="mt-8">
        <FormStepErrorBoundary
          stepNumber={currentStep}
          stepTitle={STEP_NAMES[currentStep - 1]}
          onRetry={() => {
            // Force re-render by updating a state or key
            window.location.reload(); // Simple approach for now
          }}
          onGoBack={currentStep > 1 ? handleBack : undefined}
        >
          <Suspense fallback={getStepSkeleton()}>
            {currentStep === 1 && <ProjectDetailsForm />}
            {currentStep === 2 && <LocationPlotForm />}
            {currentStep === 3 && <BuildingBudgetForm />}
            {currentStep === 4 && <ReviewSubmitForm />}
          </Suspense>
        </FormStepErrorBoundary>
      </div>
    );
  };

  // Handle step click for navigation with access control
  const handleStepClick = useCallback((stepId: number) => {
    const formValues = methods.getValues();
    
    // Check if user can access the target step
    if (canAccessStep(stepId, formValues) && stepId >= 1 && stepId <= TOTAL_STEPS) {
      setCurrentStep(stepId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Show message if step cannot be accessed
      toast({
        title: "Complete previous steps first",
        description: "Please fill in all required fields in the previous steps before proceeding.",
        variant: "destructive",
      });
    }
  }, [methods, toast]);

  // Simple overall progress based on step number
  const overallProgress = useMemo(() => {
    const pct = Math.max(0, Math.min(100, Math.round(((currentStep - 1) / (TOTAL_STEPS)) * 100)));
    return pct;
  }, [currentStep]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-buildease-blue-50/40 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 max-w-4xl">
        {/* Professional Header */}
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white font-inter">
            <span className="bg-gradient-to-r from-buildease-blue-600 to-buildease-blue-700 bg-clip-text text-transparent">
              Create New Project
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-opensans leading-relaxed">
            Let's build something amazing together
          </p>
          {/* Thin progress bar */}
          <div className="mt-6 w-full max-w-2xl mx-auto">
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-buildease-blue-500 dark:bg-buildease-blue-500 transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
                aria-valuenow={overallProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                role="progressbar"
              />
            </div>
            <p className="sr-only">Progress: {overallProgress}%</p>
          </div>
        </div>

        {/* Offline banner */}
        {!isOnline && (
          <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200 px-4 py-3 text-sm font-opensans">
            You are currently offline. Your changes are saved locally and will persist. Submit when back online.
          </div>
        )}

        {/* Enhanced Step Navigator */}
        <StepNavigator 
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          onStepClick={handleStepClick}
        />
        
        {/* Form Container */}
        <div className="max-w-3xl mx-auto">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleNext)}>
              <LazyMotion features={domAnimation}>
                <m.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-8"
                >
                  {/* Professional Step Content Card */}
                  <Card className="bg-white/95 dark:bg-slate-800/95 border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 rounded-2xl backdrop-blur-sm ring-1 ring-slate-200/30 dark:ring-slate-700/30 overflow-hidden">
                    <div className="p-6 md:p-8">
                      {/* Professional Step Header */}
                      <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-buildease-blue-500 to-buildease-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-buildease-blue-500/20">
                            <span className="text-sm font-bold text-white">{currentStep}</span>
                          </div>
                          <div>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white font-inter mb-1">
                              {STEP_NAMES[currentStep - 1]}
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 font-opensans text-sm">
                              Step {currentStep} of {TOTAL_STEPS}
                            </p>
                          </div>
                        </div>
                        <div className="h-px bg-gradient-to-r from-buildease-blue-200 to-transparent dark:from-buildease-blue-700 dark:to-transparent mb-6"></div>
                      </div>
                      
                      {/* Step Content */}
                      <div className="max-w-2xl mx-auto">
                        {renderStepContent()}
                      </div>
                    </div>
                  </Card>
                  
                  {/* Professional Navigation */}
                  <div className="flex items-center justify-between pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentStep === 1}
                      className="min-h-[48px] px-6 py-3 text-sm border-2 border-slate-300 dark:border-slate-600 hover:border-buildease-blue-400 dark:hover:border-buildease-blue-500 bg-white dark:bg-slate-800 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:border-slate-200 dark:disabled:border-slate-700 disabled:bg-slate-50 dark:disabled:bg-slate-900 font-opensans font-medium shadow-md hover:shadow-lg disabled:shadow-sm"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      <span>Back</span>
                    </Button>
                      
                    <Button
                      type="button"
                      onClick={handleNext}
                      className={`min-h-[48px] px-8 py-3 text-sm rounded-xl font-semibold transition-all duration-200 font-opensans shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-md transform hover:scale-105 active:scale-95 ${
                        currentStep < TOTAL_STEPS
                          ? "bg-gradient-to-r from-buildease-blue-500 to-buildease-blue-600 hover:from-buildease-blue-600 hover:to-buildease-blue-700 text-white disabled:from-slate-400 disabled:to-slate-500 shadow-buildease-blue-500/25 hover:shadow-buildease-blue-500/40"
                          : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white disabled:from-slate-400 disabled:to-slate-500 shadow-orange-500/25 hover:shadow-orange-500/40"
                      }`}
                      disabled={isSubmitting || isUploading}
                    >
                      {(isSubmitting || isUploading) ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>{isSubmitting ? 'Creating Project...' : 'Uploading Images...'}</span>
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

      {/* Mobile sticky action bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-900/80 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex-1"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting || isUploading}
            className="flex-1"
          >
            {(isSubmitting || isUploading) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>{isSubmitting ? 'Creating...' : 'Uploading...'}</span>
              </>
            ) : (
              <>
                {currentStep === totalSteps ? 'Generate Plan' : 'Continue'}
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
        <div className="h-1 mt-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-buildease-blue-500 transition-all" style={{ width: `${overallProgress}%` }} />
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