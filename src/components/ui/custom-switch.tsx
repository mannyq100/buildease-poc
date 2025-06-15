
import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/core/ui';

interface CustomSwitchProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * A custom switch component that doesn't use Radix UI to avoid infinite update loops
 */
export function CustomSwitch({
  id,
  checked = false,
  onCheckedChange,
  className,
  disabled = false
}: CustomSwitchProps) {
  // Use local state to track selection and avoid direct onChange calls during render
  const [isChecked, setIsChecked] = useState<boolean>(checked);

  // Sync with external value when it changes
  useEffect(() => {
    if (checked !== isChecked) {
      setIsChecked(checked);
    }
  }, [checked]);

  // Handle toggle
  const handleToggle = () => {
    if (disabled) return;
    
    const newValue = !isChecked;
    setIsChecked(newValue);
    
    // Only call onCheckedChange if the value actually changed
    if (onCheckedChange && newValue !== checked) {
      onCheckedChange(newValue);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={isChecked}
      disabled={disabled}
      onClick={handleToggle}
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        isChecked ? "bg-[#2B6CB0]" : "bg-slate-200 dark:bg-slate-700",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
          isChecked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}
