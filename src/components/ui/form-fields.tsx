import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Text input field with label, optional icon, and error handling
 */
export function FormField({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  type = 'text',
  icon: Icon,
  className = '',
  disabled = false,
  min,
  max,
  step,
}: {
  label: string;
  name: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  icon?: LucideIcon;
  className?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <motion.div 
      className="relative space-y-1.5"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Label 
        htmlFor={name} 
        className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
      >
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative group">
        {Icon && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-[#2B6CB0] transition-colors duration-200">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <Input
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          type={type}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={`
            ${Icon ? 'pl-10' : ''} 
            ${error ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'focus:border-[#2B6CB0] focus:ring-[#2B6CB0]/10'} 
            ${className}
            transition-all duration-200 bg-white dark:bg-gray-800 shadow-sm hover:border-gray-400 dark:hover:border-gray-600
            ${disabled ? 'bg-gray-50 dark:bg-gray-900' : ''}
            rounded-md
          `}
        />
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-xs text-red-500 mt-1 flex items-start gap-1"
        >
          <span className="i-lucide-alert-circle h-3 w-3 mt-0.5 flex-shrink-0" />
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}

/**
 * Select/dropdown field with label, optional icon, and error handling
 */
export function SelectField({
  label,
  name,
  value,
  onValueChange,
  options,
  error,
  placeholder = 'Select...',
  required = false,
  icon: Icon,
  className = '',
  disabled = false,
}: {
  label: string;
  name: string;
  value: any;
  onValueChange: (value: string) => void;
  options: Array<{value: string, label: string}>;
  error?: string;
  placeholder?: string;
  required?: boolean;
  icon?: LucideIcon;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <motion.div 
      className="relative space-y-1.5"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Label 
        htmlFor={name} 
        className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
      >
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative group">
        {Icon && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-[#2B6CB0] transition-colors duration-200 z-10">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <Select
          value={value || ''}
          onValueChange={onValueChange}
          disabled={disabled}
        >
          <SelectTrigger 
            className={`
              w-full 
              ${Icon ? 'pl-10' : ''} 
              ${error ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-gray-300 dark:border-gray-700 focus:border-[#2B6CB0] focus:ring-[#2B6CB0]/10'} 
              transition-all duration-200 bg-white dark:bg-gray-800 shadow-sm hover:border-gray-400 dark:hover:border-gray-600 
              ${disabled ? 'bg-gray-50 dark:bg-gray-900' : ''}
              ${className}
              rounded-md
            `}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent 
            className="max-h-[280px] overflow-y-auto border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg rounded-md animate-in fade-in-80"
          >
            {options.map(option => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="focus:bg-[#2B6CB0]/10 focus:text-[#2B6CB0] dark:focus:bg-[#2B6CB0]/20 cursor-pointer"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-xs text-red-500 mt-1 flex items-start gap-1"
        >
          <span className="i-lucide-alert-circle h-3 w-3 mt-0.5 flex-shrink-0" />
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}

/**
 * Modal footer with standard cancel/save buttons with warm orange accent for primary action
 */
export function ModalFooter({
  onClose,
  onSubmit,
  isNew = true,
  saving = false,
  cancelText = 'Cancel',
  submitText,
  disabled = false,
}: {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isNew?: boolean;
  saving?: boolean;
  cancelText?: string;
  submitText?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        disabled={saving || disabled}
        className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 
                 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 font-medium"
      >
        {cancelText}
      </button>
      <button
        type="submit"
        onClick={onSubmit}
        disabled={saving || disabled}
        className="px-4 py-2 text-sm bg-[#ED8936] hover:bg-[#ED8936]/90 dark:bg-[#ED8936] dark:hover:bg-[#ED8936]/90 
                 text-white rounded-md shadow-md hover:shadow-lg transition-all duration-200 
                 disabled:opacity-50 font-medium flex items-center justify-center min-w-[96px]"
      >
        {saving ? (
          <>
            <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </>
        ) : (
          submitText || (isNew ? 'Create' : 'Save Changes')
        )}
      </button>
    </div>
  );
}
