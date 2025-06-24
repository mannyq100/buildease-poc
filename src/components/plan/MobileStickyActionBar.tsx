/**
 * Mobile Sticky Action Bar Component
 * Provides quick access to primary actions from any scroll position
 * Optimized for construction site use with glove-friendly touch targets
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileStickyActionBarProps {
  /** Primary action based on current view context */
  primaryAction: {
    label: string;
    icon: React.ElementType;
    onClick: () => void;
    disabled?: boolean;
  };
  
  /** Secondary actions for quick access */
  secondaryActions?: Array<{
    label: string;
    icon: React.ElementType;
    onClick: () => void;
    disabled?: boolean;
    variant?: 'default' | 'outline' | 'ghost';
  }>;
  
  /** Whether to show the action bar (hidden when keyboard is active) */
  visible?: boolean;
  
  /** Current view context for styling */
  viewContext?: 'overview' | 'timeline' | 'materials' | 'budget' | 'team' | 'documents';
  
  /** Whether there are unsaved changes */
  hasUnsavedChanges?: boolean;
}

export function MobileStickyActionBar({
  primaryAction,
  secondaryActions = [],
  visible = true,
  viewContext: _viewContext = 'overview',
  hasUnsavedChanges = false
}: MobileStickyActionBarProps) {
  // Only show on mobile devices and hide when keyboard is active
  const [isMobile, setIsMobile] = React.useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Hide sticky bar when virtual keyboard appears
    const handleFocusIn = () => setIsKeyboardVisible(true);
    const handleFocusOut = () => setIsKeyboardVisible(false);
    
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  // Don't render on desktop
  if (!isMobile) return null;

  const PrimaryIcon = primaryAction.icon;

  return (
    <AnimatePresence>
      {visible && !isKeyboardVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        >
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-buildease-blue-200/30 dark:border-buildease-blue-800/30 shadow-xl">
            {/* Safe area padding for devices with home indicator */}
            <div className="px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center justify-between gap-3">
                {/* Primary Action Button - Large and prominent */}
                <Button
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.disabled}
                  className="flex-1 h-12 px-6 bg-buildease-orange-600 hover:bg-buildease-orange-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 active:scale-95"
                >
                  <PrimaryIcon className="h-5 w-5 mr-2" />
                  {primaryAction.label}
                </Button>

                {/* Secondary Actions */}
                <div className="flex items-center gap-2">
                  {secondaryActions.slice(0, 2).map((action, index) => {
                    const ActionIcon = action.icon;
                    return (
                      <Button
                        key={index}
                        onClick={action.onClick}
                        disabled={action.disabled}
                        variant={action.variant || 'outline'}
                        className="h-12 w-12 p-0 rounded-lg border-buildease-blue-300/60 dark:border-buildease-blue-700/60 shadow-md transition-all duration-200 active:scale-95"
                      >
                        <ActionIcon className="h-5 w-5" />
                        <span className="sr-only">{action.label}</span>
                      </Button>
                    );
                  })}

                  {/* More Actions Menu (if more than 2 secondary actions) */}
                  {secondaryActions.length > 2 && (
                    <Button
                      variant="outline"
                      className="h-12 w-12 p-0 rounded-lg border-buildease-blue-300/60 dark:border-buildease-blue-700/60 shadow-md transition-all duration-200 active:scale-95"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                      <span className="sr-only">More actions</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Unsaved changes indicator */}
              {hasUnsavedChanges && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-md"
                >
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                    You have unsaved changes
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MobileStickyActionBar;