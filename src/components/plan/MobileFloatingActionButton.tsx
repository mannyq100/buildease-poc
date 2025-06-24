/**
 * Mobile Floating Action Button (FAB) Component
 * Provides quick access to primary actions with expandable speed dial
 * Positioned for optimal thumb reach on mobile devices
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FABAction {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  disabled?: boolean;
  color?: 'blue' | 'orange' | 'green' | 'red';
}

interface MobileFloatingActionButtonProps {
  /** Primary action for the main FAB */
  primaryAction: FABAction;
  
  /** Secondary actions shown in speed dial */
  secondaryActions?: FABAction[];
  
  /** Whether to show the FAB */
  visible?: boolean;
  
  /** Position offset from bottom-right corner */
  offset?: {
    bottom?: number;
    right?: number;
  };
  
  /** Whether speed dial is initially expanded */
  defaultExpanded?: boolean;
}

export function MobileFloatingActionButton({
  primaryAction,
  secondaryActions = [],
  visible = true,
  offset = { bottom: 80, right: 16 }, // Account for sticky action bar
  defaultExpanded = false
}: MobileFloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't render on desktop or if no secondary actions
  if (!isMobile || secondaryActions.length === 0) return null;

  const handlePrimaryAction = () => {
    if (secondaryActions.length > 0) {
      setIsExpanded(!isExpanded);
    } else {
      primaryAction.onClick();
    }
  };

  const handleSecondaryAction = (action: FABAction) => {
    action.onClick();
    setIsExpanded(false);
  };

  const getColorClasses = (color: FABAction['color'] = 'orange') => {
    switch (color) {
      case 'blue':
        return 'bg-buildease-blue-600 hover:bg-buildease-blue-700 text-white shadow-lg shadow-buildease-blue-600/25';
      case 'green':
        return 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/25';
      case 'red':
        return 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/25';
      case 'orange':
      default:
        return 'bg-buildease-orange-600 hover:bg-buildease-orange-700 text-white shadow-lg shadow-buildease-orange-600/25';
    }
  };

  const PrimaryIcon = primaryAction.icon;

  return (
    <AnimatePresence>
      {visible && (
        <div
          className="fixed z-50 md:hidden"
          style={{
            bottom: `${offset.bottom}px`,
            right: `${offset.right}px`,
          }}
        >
          {/* Secondary Actions Speed Dial */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-16 right-0 flex flex-col-reverse gap-3"
              >
                {secondaryActions.map((action, index) => {
                  const ActionIcon = action.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20, scale: 0.8 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 20, scale: 0.8 }}
                      transition={{ 
                        duration: 0.2, 
                        delay: index * 0.05,
                        ease: 'easeOut'
                      }}
                      className="flex items-center gap-3"
                    >
                      {/* Action Label */}
                      <div className="bg-gray-900/90 dark:bg-gray-100/90 text-white dark:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium shadow-lg backdrop-blur-sm">
                        {action.label}
                      </div>
                      
                      {/* Action Button */}
                      <Button
                        onClick={() => handleSecondaryAction(action)}
                        disabled={action.disabled}
                        className={`h-12 w-12 p-0 rounded-full transition-all duration-200 active:scale-95 ${getColorClasses(action.color)}`}
                      >
                        <ActionIcon className="h-5 w-5" />
                        <span className="sr-only">{action.label}</span>
                      </Button>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Primary FAB */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 260, damping: 20 }}
          >
            <Button
              onClick={handlePrimaryAction}
              disabled={primaryAction.disabled}
              className={`h-14 w-14 p-0 rounded-full transition-all duration-200 active:scale-95 ${getColorClasses(primaryAction.color)}`}
            >
              <AnimatePresence mode="wait">
                {isExpanded ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="primary"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PrimaryIcon className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
              <span className="sr-only">
                {isExpanded ? 'Close menu' : primaryAction.label}
              </span>
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default MobileFloatingActionButton;