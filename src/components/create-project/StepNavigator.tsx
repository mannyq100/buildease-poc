/**
 * StepNavigator Component
 * 
 * Enhanced step navigator for the Create Project wizard with:
 * - Visual progress indicators with completion states
 * - Clickable steps for completed sections
 * - Mobile-responsive design with condensed view
 * - Stunning BuildEase-themed design
 */

import React from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { cn } from '@/utils/core/ui';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  Building,
  MapPin,
  Home,
  DollarSign,
  Layers,
  Sparkles,
  Check,
} from 'lucide-react';

// Step definition interface
interface Step {
  id: number;
  title: string;
  icon: React.ReactNode;
  description: string;
}

// Component props
interface StepNavigatorProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (stepId: number) => void;
  className?: string;
}

// Step definitions - matches CreateProject wizard
const steps: Step[] = [
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

export function StepNavigator({ 
  currentStep, 
  totalSteps, 
  onStepClick,
  className = '' 
}: StepNavigatorProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const _isTablet = useMediaQuery('(max-width: 1024px)');

  // Calculate progress percentage
  const progress = (currentStep / totalSteps) * 100;

  // Handle step click
  const handleStepClick = (stepId: number) => {
    // Only allow clicking on completed steps
    if (currentStep > stepId && onStepClick) {
      onStepClick(stepId);
    }
  };

  // Filter steps for mobile view (show current, previous, and next)
  const getVisibleSteps = () => {
    if (!isMobile) return steps;
    
    return steps.filter(step => {
      return Math.abs(step.id - currentStep) <= 1;
    });
  };

  const visibleSteps = getVisibleSteps();

  return (
    <LazyMotion features={domAnimation}>
      <div className={cn("mb-6 md:mb-10", className)}>
        {/* Desktop & Tablet Step Indicators */}
        <div className="flex items-start justify-center max-w-5xl mx-auto mb-8">
          {visibleSteps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const isLast = index === visibleSteps.length - 1;
            const isClickable = isCompleted && onStepClick;
            
            return (
              <div key={step.id} className="flex items-start">
                <div className="flex flex-col items-center">
                  {/* Step Circle */}
                  <m.button
                    onClick={() => handleStepClick(step.id)}
                    disabled={!isClickable}
                    className={cn(
                      "relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl transition-all duration-300 mb-3 border-2",
                      isActive 
                        ? "bg-gradient-to-br from-[#2B6CB0] to-[#2B6CB0]/90 text-white shadow-lg border-[#2B6CB0]" 
                        : isCompleted 
                          ? "bg-gradient-to-br from-[#ED8936] to-[#ED8936]/90 text-white shadow-md border-[#ED8936]"
                          : "bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700",
                      isClickable ? "cursor-pointer hover:shadow-lg hover:scale-105" : "cursor-default"
                    )}
                    whileHover={isClickable ? { scale: 1.05 } : {}}
                    whileTap={isClickable ? { scale: 0.95 } : {}}
                    aria-label={`${isClickable ? 'Go to' : ''} step ${step.id}: ${step.title}`}
                  >
                    {/* Active step pulse animation */}
                    {isActive && (
                      <m.div
                        className="absolute inset-0 rounded-xl bg-[#2B6CB0]/20"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0, 0.5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                    
                    {/* Step content */}
                    <div className="relative z-10">
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        step.icon
                      )}
                    </div>
                  </m.button>
                  
                  {/* Step Info */}
                  <div className="text-center max-w-20">
                    <p className={cn(
                      "text-sm font-semibold font-inter transition-colors duration-300",
                      isActive 
                        ? "text-[#2B6CB0] dark:text-[#2B6CB0]" 
                        : isCompleted 
                          ? "text-[#ED8936] dark:text-[#ED8936]"
                          : "text-slate-500 dark:text-slate-400"
                    )}>
                      {isMobile ? step.id : step.title}
                    </p>
                    {!isMobile && (
                      <m.p 
                        className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-1 font-opensans"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {step.description}
                      </m.p>
                    )}
                  </div>
                </div>
                
                {/* Connecting Line (Desktop only) */}
                {!isLast && !isMobile && (
                  <m.div 
                    className={cn(
                      "flex-1 h-px mx-4 mt-6 transition-all duration-500",
                      isCompleted ? "bg-[#ED8936]" : "bg-slate-300 dark:bg-slate-700"
                    )}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: index * 0.2, duration: 0.5 }}
                  />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Progress Bar Section */}
        <div className="max-w-2xl mx-auto">
          {/* Progress Info */}
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-3">
            <span className="font-medium font-inter">
              Step {currentStep} of {totalSteps}
            </span>
            <div className="flex items-center gap-2">
              <m.span 
                className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full font-opensans"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={`steps-${progress}`}
              >
                {Math.round(progress)}% Steps
              </m.span>
            </div>
          </div>
          
          {/* Animated Progress Bar */}
          <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <m.div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#2B6CB0] to-[#ED8936] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ 
                duration: 0.8, 
                ease: "easeOut",
                type: "spring",
                stiffness: 100
              }}
            />
            
            {/* Shine effect */}
            <m.div
              className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                left: [`-2rem`, `${progress + 2}%`]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut"
              }}
            />
          </div>
          
          {/* Mobile Step Breadcrumb */}
          {isMobile && (
            <m.div 
              className="flex items-center justify-center mt-4 space-x-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    step.id === currentStep
                      ? "bg-[#2B6CB0] w-6"
                      : step.id < currentStep
                        ? "bg-[#ED8936]"
                        : "bg-slate-300 dark:bg-slate-600"
                  )}
                />
              ))}
            </m.div>
          )}
        </div>
        
        {/* Mobile Current Step Display */}
        {isMobile && (
          <m.div 
            className="text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white font-inter">
              {steps[currentStep - 1]?.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-opensans">
              {steps[currentStep - 1]?.description}
            </p>
          </m.div>
        )}
      </div>
    </LazyMotion>
  );
}