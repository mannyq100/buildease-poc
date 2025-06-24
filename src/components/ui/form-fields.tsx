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
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-[#2B6CB0] group-focus-within:text-[#2B6CB0] transition-all duration-200 z-30">
            <Icon className="h-4 w-4" />
          </span>
        )}
        {/* Focus enhancement overlay */}
        <div className="absolute inset-0 rounded-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="absolute inset-0 rounded-md ring-2 ring-[#2B6CB0]/20 shadow-lg shadow-[#2B6CB0]/10" />
        </div>
        
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
            ${error ? 'border-red-300 focus:ring-red-200 focus:border-red-400 bg-red-50/30 dark:bg-red-900/10' : 'focus:border-[#2B6CB0] focus:ring-[#2B6CB0]/10'} 
            ${className}
            transition-all duration-200 bg-white dark:bg-gray-800 shadow-sm hover:border-gray-400 dark:hover:border-gray-600
            hover:shadow-md focus:shadow-lg hover:scale-[1.01] focus:scale-[1.01]
            ${disabled ? 'bg-gray-50 dark:bg-gray-900 cursor-not-allowed' : ''}
            rounded-md relative z-20
          `}
        />
        
      </div>
      {error && (
        <motion.div 
          initial={{ opacity: 0, height: 0, scale: 0.95 }}
          animate={{ opacity: 1, height: 'auto', scale: 1 }}
          transition={{ duration: 0.2 }}
          className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-start gap-1 bg-red-50 dark:bg-red-900/20 p-2 rounded-md border border-red-200 dark:border-red-800/30"
        >
          <svg className="h-3 w-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{error}</span>
        </motion.div>
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
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-[#2B6CB0] transition-colors duration-200 z-30">
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
        <motion.div 
          initial={{ opacity: 0, height: 0, scale: 0.95 }}
          animate={{ opacity: 1, height: 'auto', scale: 1 }}
          transition={{ duration: 0.2 }}
          className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-start gap-1 bg-red-50 dark:bg-red-900/20 p-2 rounded-md border border-red-200 dark:border-red-800/30"
        >
          <svg className="h-3 w-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{error}</span>
        </motion.div>
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
    <motion.div 
      className="flex justify-end gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
    >
      <motion.button
        type="button"
        onClick={onClose}
        disabled={saving || disabled}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="px-6 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 
                 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500
                 transition-all duration-200 disabled:opacity-50 font-medium shadow-sm hover:shadow-md
                 focus:ring-2 focus:ring-gray-300/50 focus:outline-none"
      >
        {cancelText}
      </motion.button>
      
      <motion.button
        type="submit"
        onClick={onSubmit}
        disabled={saving || disabled}
        whileHover={{ scale: saving ? 1 : 1.02, y: saving ? 0 : -1 }}
        whileTap={{ scale: saving ? 1 : 0.98 }}
        className="px-6 py-2.5 text-sm bg-[#ED8936] hover:bg-[#ED8936]/90 dark:bg-[#ED8936] dark:hover:bg-[#ED8936]/90 
                 text-white rounded-md shadow-md hover:shadow-lg hover:shadow-[#ED8936]/25
                 transition-all duration-200 disabled:opacity-50 font-medium 
                 flex items-center justify-center min-w-[120px] relative overflow-hidden
                 focus:ring-2 focus:ring-[#ED8936]/50 focus:outline-none
                 active:shadow-md"
      >
        {/* Loading overlay */}
        {saving && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-[#ED8936]/20 flex items-center justify-center backdrop-blur-sm"
          />
        )}
        
        <motion.div
          className="flex items-center justify-center"
          animate={{ opacity: saving ? 0.7 : 1 }}
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
            <>
              <motion.span
                initial={{ x: 0 }}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2 }}
              >
                {submitText || (isNew ? 'Create' : 'Save Changes')}
              </motion.span>
              {!disabled && (
                <motion.svg 
                  className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  initial={{ x: -10, opacity: 0 }}
                  whileHover={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </motion.svg>
              )}
            </>
          )}
        </motion.div>
      </motion.button>
    </motion.div>
  );
}
