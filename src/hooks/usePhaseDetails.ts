import { useState, useEffect } from 'react';
import { Phase } from '@/types/phase';

// Mock data for phases - in a real app, this would come from an API or context
const PHASE_DATA: Phase[] = [
  {
    id: 1,
    name: 'Foundation Phase',
    progress: 100,
    startDate: 'Jan 10, 2024',
    endDate: 'Feb 15, 2024',
    status: 'completed',
    budget: '$25,000',
    spent: '$24,300',
    description: 'Laying the foundation for the building structure, including excavation, formwork, and concrete pouring.'
  },
  {
    id: 2,
    name: 'Framing Phase',
    progress: 65,
    startDate: 'Feb 20, 2024',
    endDate: 'Mar 30, 2024',
    status: 'in-progress',
    budget: '$42,000',
    spent: '$28,400',
    description: 'Construction of the building\'s skeleton structure including walls, floors, and roof trusses.'
  },
  {
    id: 3,
    name: 'Roofing Phase',
    progress: 10,
    startDate: 'Apr 05, 2024',
    endDate: 'May 15, 2024',
    status: 'upcoming',
    budget: '$32,000',
    spent: '$3,200',
    description: 'Installation of roof decking, underlayment, and final roofing materials for weather protection.'
  },
  {
    id: 4,
    name: 'Plumbing & Electrical',
    progress: 0,
    startDate: 'May 20, 2024',
    endDate: 'Jul 10, 2024',
    status: 'upcoming',
    budget: '$36,000',
    spent: '$0',
    description: 'Installation of all electrical wiring, plumbing pipes, fixtures, and related systems.'
  }
];

/**
 * Custom hook for managing phase details loading and caching
 * @param phaseId ID of the phase to load details for
 */
export function usePhaseDetails(phaseId: number) {
  const [phase, setPhase] = useState<Phase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset states when phaseId changes
    setIsLoading(true);
    setError(null);
    setPhase(null);

    // Simulate API call delay
    const timer = setTimeout(() => {
      try {
        // Find phase by ID in mock data
        const foundPhase = PHASE_DATA.find(p => p.id === phaseId);
        
        if (foundPhase) {
          setPhase(foundPhase);
        } else {
          setError(`Phase with ID ${phaseId} not found`);
        }
      } catch (err) {
        setError('Error loading phase details');
        console.error('Error in usePhaseDetails:', err);
      } finally {
        setIsLoading(false);
      }
    }, 1000); // Simulate 1 second loading time

    // Clear timeout on cleanup
    return () => clearTimeout(timer);
  }, [phaseId]);

  return { phase, isLoading, error };
}
