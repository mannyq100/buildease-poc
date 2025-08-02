/**
 * Create Project Constants
 * Shared constants for the Create Project wizard
 */

// Total number of steps in the wizard
export const TOTAL_STEPS = 4;

// Step names for navigation
export const STEP_NAMES = [
  'Project Details',
  'Location & Plot',
  'Building & Budget', 
  'Review & Submit'
] as const;

// Animation variants for step transitions
export const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0
  })
};

// Transition configuration for animations
export const stepTransition = {
  x: { type: "spring", stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 }
};
