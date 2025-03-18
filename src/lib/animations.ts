/**
 * animations.ts - Reusable animation variants for Framer Motion
 */

// Staggered container animation
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Vertical item fade-in animation
export const fadeInUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

// Left-to-right fade-in animation
export const fadeInLeftVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

// Right-to-left fade-in animation
export const fadeInRightVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

// Scale fade-in animation
export const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15
    }
  }
};

// Content section variants
export const contentSectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

// List item staggered animation
export const listItemVariants = {
  hidden: { opacity: 0, x: 0, y: 10 },
  visible: {
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

// Card hover animation (for use with whileHover)
export const cardHoverVariants = {
  scale: 1.02,
  y: -2,
  transition: {
    type: "spring",
    stiffness: 300,
    damping: 15
  }
};

// Button hover animation (for use with whileHover)
export const buttonHoverVariants = {
  scale: 1.05,
  transition: {
    type: "spring",
    stiffness: 400,
    damping: 10
  }
};

// Hover scale with shadow effect (for use with whileHover)
export const hoverWithShadowVariants = {
  scale: 1.02,
  y: -2,
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  transition: {
    type: "spring",
    stiffness: 300,
    damping: 15
  }
}; 