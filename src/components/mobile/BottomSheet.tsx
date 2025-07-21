/**
 * Bottom Sheet component for mobile-first interactions
 * Provides native-like mobile experience for construction workers
 */

import React from 'react';
import { cn } from '@/utils/core/ui';
import { X } from 'lucide-react';
import { TouchOptimizedButton } from '@/components/ui/TouchOptimizedButton';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  snapPoints?: number[]; // Percentage heights: [50, 75, 100]
  initialSnap?: number; // Index of initial snap point
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className,
  snapPoints = [50, 100],
  initialSnap = 0
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = React.useState(initialSnap);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState(0);
  const sheetRef = React.useRef<HTMLDivElement>(null);
  
  // Handle drag gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientY);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sheetRef.current) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - dragStart;
    
    // Only allow dragging down
    if (deltaY > 0) {
      const sheet = sheetRef.current;
      sheet.style.transform = `translateY(${deltaY}px)`;
    }
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging || !sheetRef.current) return;
    
    const currentY = e.changedTouches[0].clientY;
    const deltaY = currentY - dragStart;
    const sheet = sheetRef.current;
    
    // Reset transform
    sheet.style.transform = 'translateY(0)';
    
    // Determine action based on drag distance
    if (deltaY > 100) {
      // Dragged down significantly - close or snap to lower point
      if (currentSnap > 0) {
        setCurrentSnap(currentSnap - 1);
      } else {
        onClose();
      }
    } else if (deltaY < -100 && currentSnap < snapPoints.length - 1) {
      // Dragged up significantly - snap to higher point
      setCurrentSnap(currentSnap + 1);
    }
    
    setIsDragging(false);
  };
  
  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  // Prevent body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const currentHeight = snapPoints[currentSnap];
  
  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div
        ref={sheetRef}
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl",
          "transition-all duration-300 ease-out",
          className
        )}
        style={{ height: `${currentHeight}vh` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-slate-300 rounded-full" />
        </div>
        
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <TouchOptimizedButton
              variant="ghost"
              touchSize="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="h-5 w-5" />
            </TouchOptimizedButton>
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>
        
        {/* Snap Point Indicators */}
        {snapPoints.length > 1 && (
          <div className="flex justify-center gap-2 pb-4">
            {snapPoints.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSnap(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === currentSnap 
                    ? "bg-buildease-blue-500" 
                    : "bg-slate-300"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Quick Actions Bottom Sheet for common construction tasks
 */
interface QuickActionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  actions: Array<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    onClick: () => void;
    variant?: 'default' | 'primary' | 'warning' | 'success';
  }>;
}

export function QuickActionsSheet({ isOpen, onClose, actions }: QuickActionsSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Actions"
      snapPoints={[40, 70]}
    >
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <TouchOptimizedButton
            key={index}
            touchSize="lg"
            hapticFeedback
            variant="outline"
            onClick={() => {
              action.onClick();
              onClose();
            }}
            className={cn(
              "flex flex-col items-center gap-3 h-24 rounded-xl",
              action.variant === 'primary' && "border-buildease-blue-500 bg-buildease-blue-50",
              action.variant === 'warning' && "border-orange-500 bg-orange-50",
              action.variant === 'success' && "border-green-500 bg-green-50"
            )}
          >
            <action.icon className="h-8 w-8" />
            <span className="text-sm font-medium text-center">{action.label}</span>
          </TouchOptimizedButton>
        ))}
      </div>
    </BottomSheet>
  );
}