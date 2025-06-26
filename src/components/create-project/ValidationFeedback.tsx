/**
 * ValidationFeedback Component
 * Displays real-time validation errors for the Create Project wizard
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/core/ui';

interface ValidationFeedbackProps {
  stepErrors?: string[];
  fieldErrors?: Record<string, string[]>;
  className?: string;
}

export function ValidationFeedback({ 
  stepErrors = [], 
  fieldErrors = {}, 
  className 
}: ValidationFeedbackProps) {
  const allErrors = [
    ...stepErrors,
    ...Object.values(fieldErrors).flat()
  ];

  if (allErrors.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className={cn("space-y-2", className)}
      >
        {allErrors.map((error, index) => (
          <motion.div
            key={`error-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/20">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm font-opensans">
                {error}
              </AlertDescription>
            </Alert>
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

interface InlineFieldErrorProps {
  errors?: string[];
  className?: string;
}

export function InlineFieldError({ errors = [], className }: InlineFieldErrorProps) {
  if (errors.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className={cn("mt-1", className)}
      >
        {errors.map((error, index) => (
          <motion.p
            key={`field-error-${index}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-red-600 dark:text-red-400 font-opensans"
          >
            {error}
          </motion.p>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}