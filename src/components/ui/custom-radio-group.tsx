import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/core/ui';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactElement;
}

interface CustomRadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  renderOption?: (option: RadioOption, isSelected: boolean) => React.ReactNode;
}

/**
 * A custom radio group component that doesn't use Radix UI to avoid infinite update loops
 */
export function CustomRadioGroup({
  options,
  value,
  onChange,
  className,
  renderOption
}: CustomRadioGroupProps) {
  // Use local state to track selection and avoid direct onChange calls during render
  const [selectedValue, setSelectedValue] = useState<string>(value || '');

  // Sync with external value when it changes
  useEffect(() => {
    if (value !== selectedValue) {
      setSelectedValue(value);
    }
  }, [value]);

  // Handle selection change
  const handleSelect = (newValue: string) => {
    setSelectedValue(newValue);
    // Only call onChange if the value actually changed
    if (newValue !== value) {
      onChange(newValue);
    }
  };

  return (
    <div className={cn("grid gap-4", className)}>
      {options.map((option) => {
        const isSelected = selectedValue === option.value;
        
        if (renderOption) {
          return (
            <div key={option.value} onClick={() => handleSelect(option.value)}>
              {renderOption(option, isSelected)}
            </div>
          );
        }
        
        return (
          <div
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={cn(
              "flex items-start gap-4 p-5 border-2 cursor-pointer transition-all duration-300 rounded-xl shadow-sm hover:shadow-md",
              isSelected 
                ? "border-[#2B6CB0] bg-[#2B6CB0]/5 dark:bg-[#2B6CB0]/10 shadow-md" 
                : "border-slate-300 dark:border-slate-600 hover:border-[#2B6CB0]/50",
              "bg-white dark:bg-slate-800"
            )}
          >
            {/* Radio Button Circle */}
            <div 
              className={cn(
                "relative flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 transition-all duration-200",
                isSelected
                  ? "border-[#2B6CB0] bg-[#2B6CB0]"
                  : "border-slate-400 dark:border-slate-500"
              )}
            >
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>

            {option.icon && (
              <div 
                className={cn(
                  "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200",
                  isSelected
                    ? "bg-[#2B6CB0] text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                )}
              >
                {React.cloneElement(option.icon, { className: "h-6 w-6" })}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1 font-inter">
                {option.label}
              </h3>
              {option.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 font-opensans leading-relaxed">
                  {option.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
