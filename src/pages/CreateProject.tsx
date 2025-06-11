
/**
 * CreateProject.tsx
 * Core wizard for the project creation process
 * BuildEase-themed mobile-first design with shadcn-ui components
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/utils/core/ui';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { createProject, validateProjectData } from "@/services/projectCreationService";
import { useProjectFormAutoSave } from "@/hooks/useProjectFormAutoSave";
import { calculateFormProgress, validateStepData } from "@/utils/projectFormUtils";
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

// Import wizard steps
import { ProjectDetailsForm } from '../components/create-project/ProjectDetailsForm';
import { LocationPlotForm } from '../components/create-project/LocationPlotForm';
import { BuildingSpecsForm } from '../components/create-project/BuildingSpecsForm';
import { BudgetTimelineForm } from '../components/create-project/BudgetTimelineForm';
import { MaterialsConstructionForm } from '../components/create-project/MaterialsConstructionForm';
import { FeaturesForm } from '../components/create-project/FeaturesForm';
import { ReviewSubmitForm } from '../components/create-project/ReviewSubmitForm';

// Optimized Project form schema - Simplified for better UX
export const projectFormSchema = z.object({
  // Essential Information - Step 1
  name: z.string().min(3, 'Project name must be at least 3 characters').max(100),
  description: z.string().optional(),
  type: z.string().min(1, 'Please select a project type'),
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
  
  // References
  images: z.array(z.string()).optional(),
});

// Form data type
export type ProjectFormValues = z.infer<typeof projectFormSchema>;

// Default form values
const defaultValues: Partial<ProjectFormValues> = {
  name: '',
  description: '',
  type: '',
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

// Step definitions
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

export function CreateProject() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
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
  
  // Auto-save functionality
  const { clearSavedData } = useProjectFormAutoSave(watch, isDirty);
  
  // Calculate dynamic progress based on form completion
  const formData = watch();
  const formProgress = calculateFormProgress(formData);
  
  // Handle next step navigation
  const handleNext = async () => {
    // Get fields to validate based on current step
    let fieldsToValidate: string[] = [];
    
    switch (currentStep) {
      case 1: // Essential Details - Only validate always required fields
        fieldsToValidate = ['name', 'type'];
        break;
      case 2: // Location Essentials
        fieldsToValidate = ['location', 'country', 'region', 'plotSize', 'plotSizeUnit'];
        break;
      case 3: // Core Building Requirements
        fieldsToValidate = ['buildingSize', 'buildingSizeUnit', 'storeys', 'bedrooms', 'bathrooms'];
        break;
      case 4: // Budget Essentials
        fieldsToValidate = ['budget', 'currency'];
        break;
      case 5: // Materials (all optional - AI will suggest)
        fieldsToValidate = [];
        break;
      case 6: // Features & Preferences (all optional)
        fieldsToValidate = [];
        break;
      case 7: // Review & Submit
        handleSubmit(onSubmit)();
        return;
    }
    
    // Validate the fields for the current step
    const isStepValid = await trigger(fieldsToValidate as any);
    
    // Additionally validate using our utility function
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
  };
  
  // Handle back navigation
  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle form submission
  const onSubmit = async (data: ProjectFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData?.user) {
        throw new Error('User not authenticated');
      }
      
      // Validate form data
      const validation = validateProjectData(data);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      // Create project using the service
      const result = await createProject(data, userData.user.id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create project');
      }
      
      // Show success toast
      toast({
        title: "Project created successfully!",
        description: "Your project has been saved and is ready for AI generation.",
      });
      
      // Clear auto-saved data on successful submission
      clearSavedData();
      
      // Navigate to dashboard or project details page
      navigate('/dashboard');
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "There was a problem creating your project. Please try again.";
      console.error('Error submitting form:', error);
      
      // Show error toast
      toast({
        title: "Error creating project",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ProjectDetailsForm />;
      case 2:
        return <LocationPlotForm />;
      case 3:
        return <BuildingSpecsForm />;
      case 4:
        return <BudgetTimelineForm />;
      case 5:
        return <MaterialsConstructionForm />;
      case 6:
        return <FeaturesForm />;
      case 7:
        return <ReviewSubmitForm />;
      default:
        return <ProjectDetailsForm />;
    }
  };
  
  // Jump to a specific step (only if it's a previous step)
  const jumpToStep = (stepId: number) => {
    if (currentStep > stepId) {
      setCurrentStep(stepId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
export default CreateProject;