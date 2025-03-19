import { useToast } from '@/components/ui/use-toast';

/**
 * Hook for handling errors consistently across the application
 */
export function useErrorHandler() {
  const { toast } = useToast();

  /**
   * Handle general errors
   */
  const handleError = (error: unknown, title = 'Error') => {
    console.error(error);
    
    toast({
      title,
      description: error instanceof Error ? error.message : 'An unexpected error occurred',
      variant: 'destructive',
    });
  };

  /**
   * Handle validation errors
   */
  const handleValidationError = (message: string) => {
    toast({
      title: 'Validation Error',
      description: message,
      variant: 'destructive',
    });
  };

  return {
    handleError,
    handleValidationError,
  };
}
