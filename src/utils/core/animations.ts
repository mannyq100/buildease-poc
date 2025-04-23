/**
 * Reusable animation variants for Framer Motion
 * Provides consistent animation patterns across the application
 */

/**
 * Staggered container animation
 * Parent container that staggers the animation of its children
 */
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

/**
 * Vertical item fade-in animation
 * Element fades in while moving up slightly
 */
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

/**
 * Left-to-right fade-in animation
 * Element fades in while moving from left to right
 */
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

/**
 * Right-to-left fade-in animation
 * Element fades in while moving from right to left
 */
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

/**
 * Scale fade-in animation
 * Element fades in while scaling up slightly
 */
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

/**
 * Content section variants
 * Section container that animates before its children
 */
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

/**
 * List item staggered animation
 * For items in a list that should animate sequentially
 */
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

/**
 * Card hover animation (for use with whileHover)
 * Subtle scale effect for cards on hover
 */
export const cardHoverVariants = {
  scale: 1.02,
  y: -2,
  transition: {
    type: "spring",
    stiffness: 300,
    damping: 15
  }
};

/**
 * Button hover animation (for use with whileHover)
 * Slight scale effect for buttons on hover
 */
export const buttonHoverVariants = {
  scale: 1.05,
  transition: {
    type: "spring",
    stiffness: 400,
    damping: 10
  }
};

/**
 * Hover scale with shadow effect (for use with whileHover)
 * Scale and shadow effect for interactive elements
 */
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
