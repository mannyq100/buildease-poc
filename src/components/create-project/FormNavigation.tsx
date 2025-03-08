/**
 * Form navigation component for project creation
 * Provides Back and Continue buttons for multi-step form navigation
 */
import { ArrowRight, ChevronRight, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  canContinue?: boolean;
  isLastStep?: boolean;
  isLoading?: boolean;
  onBack: () => void;
  onContinue: () => void;
  onSubmit?: () => void;
  isDarkMode: boolean;
}

export function FormNavigation({
  currentStep,
  totalSteps,
  canContinue = true,
  isLastStep = false,
  isLoading = false,
  onBack,
  onContinue,
  onSubmit,
  isDarkMode
}: FormNavigationProps) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
      <Button 
        variant="outline" 
        onClick={onBack}
        disabled={currentStep === 1 || isLoading}
        className={isDarkMode ? "border-slate-700 hover:border-slate-600" : ""}
      >
        Back
      </Button>
      
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div 
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index + 1 === currentStep 
                ? (isDarkMode ? 'bg-blue-500' : 'bg-blue-600') 
                : index + 1 < currentStep 
                  ? (isDarkMode ? 'bg-blue-700' : 'bg-blue-300')
                  : (isDarkMode ? 'bg-slate-700' : 'bg-slate-200')
            }`}
          />
        ))}
      </div>
      
      <Button 
        variant="default" 
        onClick={isLastStep ? onSubmit : onContinue}
        disabled={!canContinue || isLoading}
        className={`transition-all ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing
          </>
        ) : isLastStep ? (
          <>
            <Save className="h-4 w-4 mr-2" />
            Generate Plan
          </>
        ) : (
          <>
            Continue
            <ChevronRight className="h-4 w-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
} 