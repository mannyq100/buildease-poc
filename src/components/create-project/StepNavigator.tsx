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

// Step definitions - streamlined 4-step wizard structure
const steps: Step[] = [
  { 
    id: 1, 
    title: 'Project Essentials', 
    icon: <Building className="h-4 w-4" />,
    description: 'Basic project details and type'
  },
  { 
    id: 2, 
    title: 'Location & Plot', 
    icon: <MapPin className="h-4 w-4" />,
    description: 'Where your project will be built'
  },
  { 
    id: 3, 
    title: 'Building & Budget', 
    icon: <Home className="h-4 w-4" />,
    description: 'Building specs and financial planning'
  },
  { 
    id: 4, 
    title: 'Review & Submit', 
    icon: <Check className="h-4 w-4" />,
    description: 'Review details and create project'
  },
];

export function StepNavigator({ 
  currentStep, 
  totalSteps, 
  onStepClick,
  className = '' 
}: StepNavigatorProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

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
      <div className={cn("mb-4 md:mb-6", className)}>
        {/* Step Indicators */}
        <div className="flex items-start justify-center max-w-3xl mx-auto mb-6">
          {visibleSteps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const isLast = index === visibleSteps.length - 1;
            const isClickable = isCompleted && onStepClick;
            
            return (
              <div key={step.id} className="flex items-start">
                <div className="flex flex-col items-center">
                  {/* Professional Step Circle */}
                  <m.button
                    onClick={() => handleStepClick(step.id)}
                    disabled={!isClickable}
                    whileHover={isClickable ? { scale: 1.05 } : {}}
                    whileTap={isClickable ? { scale: 0.95 } : {}}
                    className={cn(
                      "relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl transition-all duration-200 mb-4 border-2 shadow-md",
                      isActive 
                        ? "bg-gradient-to-br from-buildease-blue-500 to-buildease-blue-600 text-white border-buildease-blue-400 shadow-buildease-blue-500/25 ring-3 ring-buildease-blue-100 dark:ring-buildease-blue-900/50" 
                        : isCompleted 
                          ? "bg-gradient-to-br from-buildease-blue-400 to-buildease-blue-500 text-white border-buildease-blue-300 shadow-buildease-blue-400/25 ring-2 ring-buildease-blue-100 dark:ring-buildease-blue-900/50" 
                          : "bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-500 border-slate-300 dark:border-slate-600 hover:border-buildease-blue-300 dark:hover:border-buildease-blue-500",
                      isClickable && "cursor-pointer hover:shadow-lg"
                    )}
                    aria-label={`${isClickable ? 'Go to' : ''} step ${step.id}: ${step.title}`}
                  >
                    {/* Simplified active step pulse */}
                    {isActive && (
                      <m.div
                        className="absolute inset-0 rounded-full bg-[#2B6CB0]/20"
                        animate={{
                          scale: [1, 1.15, 1],
                          opacity: [0.6, 0, 0.6]
                        }}
                        transition={{
                          duration: 2.5,
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
                  
                  {/* Professional Step Label */}
                  <div className="text-center max-w-[80px] md:max-w-[120px]">
                    <m.p 
                      className={cn(
                        "text-sm md:text-base font-semibold transition-colors duration-300 font-inter mb-1",
                        isActive 
                          ? "text-buildease-blue-600 dark:text-buildease-blue-400" 
                          : isCompleted 
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-slate-500 dark:text-slate-400"
                      )}>
                      {isMobile ? step.id : step.title}
                    </m.p>
                    {!isMobile && (
                      <m.p 
                        className={cn(
                          "text-xs leading-tight font-opensans transition-colors duration-300",
                          isActive 
                            ? "text-buildease-blue-500 dark:text-buildease-blue-300" 
                            : isCompleted 
                              ? "text-orange-500 dark:text-orange-300"
                              : "text-slate-400 dark:text-slate-500"
                        )}
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
        
        {/* Professional Progress Bar Section */}
        <div className="max-w-3xl mx-auto">
          {/* Progress Info */}
          <div className="flex items-center justify-between text-sm mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-buildease-blue-500 to-buildease-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-buildease-blue-500/20">
                <span className="text-xs font-bold text-white">{currentStep}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 font-inter text-sm">
                  Step {currentStep} of {totalSteps}
                </span>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-opensans">
                  {steps[currentStep - 1]?.description}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-buildease-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs px-3 py-1.5 bg-gradient-to-r from-buildease-blue-50 to-buildease-blue-100 dark:from-buildease-blue-950/50 dark:to-buildease-blue-900/50 text-buildease-blue-700 dark:text-buildease-blue-300 rounded-xl font-medium font-opensans border border-buildease-blue-200/50 dark:border-buildease-blue-700/50 shadow-sm">
                {Math.round(progress)}% complete
              </span>
            </div>
          </div>
          
          {/* Professional Progress Bar */}
          <div className="relative h-3 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full overflow-hidden shadow-inner">
            <m.div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-buildease-blue-500 to-buildease-blue-600 rounded-full shadow-sm"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ 
                duration: 0.6, 
                ease: "easeOut"
              }}
            />
            {/* Subtle shimmer effect */}
            <m.div 
              className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "linear"
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
                      ? "bg-buildease-blue-500 w-6"
                      : step.id < currentStep
                        ? "bg-orange-500"
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