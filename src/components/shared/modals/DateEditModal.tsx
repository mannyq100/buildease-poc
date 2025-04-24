import React, { useCallback, useEffect, useState } from 'react';
import { Calendar, Info } from 'lucide-react';
import { useFormState } from '@/hooks/useFormState';
import { BaseModal } from './BaseModal';
import { FormField, ModalFooter } from '@/components/ui/form-fields';
import { v4 as uuidv4 } from 'uuid';

export interface DateRange {
  id?: string;
  startDate: string;
  endDate: string;
  type?: 'project' | 'phase' | 'task';
  name?: string;
}

interface DateEditModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (dates: DateRange) => void;
  dateRange?: DateRange;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

export function DateEditModal({
  show,
  onClose,
  onSave,
  dateRange,
  title = 'Edit Dates',
  description = 'Update the start and end dates',
  isLoading = false
}: DateEditModalProps) {
  // Default date values
  const defaultValues: DateRange = {
    id: uuidv4(),
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().substring(0, 10),
    type: 'project'
  };

  // Date validation function
  const validateDates = useCallback((data: DateRange) => {
    const errors: Partial<Record<keyof DateRange, string>> = {};
    
    if (!data.startDate) {
      errors.startDate = 'Start date is required';
    }
    
    if (!data.endDate) {
      errors.endDate = 'End date is required';
    } else {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      
      if (end < start) {
        errors.endDate = 'End date cannot be before start date';
      }
    }
    
    return errors;
  }, []);

  // Use our custom form state hook
  const {
    formData,
    errors,
    saving: internalSaving,
    setSaving,
    handleChange,
    validate
  } = useFormState<DateRange>(
    dateRange ? { ...defaultValues, ...dateRange, id: dateRange.id || uuidv4() } : null, 
    defaultValues, 
    show, 
    validateDates
  );

  // Combine the internal saving state with any external loading state
  const saving = internalSaving || isLoading;

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    
    // Simulate API call with slight delay
    setTimeout(() => {
      onSave(formData);
      setSaving(false);
    }, 500);
  }, [formData, validate, onSave, setSaving]);

  // Create the modal footer
  const modalFooter = (
    <ModalFooter
      onClose={onClose}
      onSubmit={handleSubmit}
      isNew={false}
      saving={saving}
      submitText="Save Changes"
    />
  );

  // Modal description
  const modalDescription = description;

  return (
    <BaseModal
      show={show}
      onClose={onClose}
      title={title}
      description={modalDescription}
      footer={modalFooter}
      saving={saving}
      size="sm"
    >
      <form id="date-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="p-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate || ''}
              onChange={handleChange}
              icon={Calendar}
              required
              error={errors.startDate}
            />
            
            <FormField
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate || ''}
              onChange={handleChange}
              icon={Calendar}
              required
              error={errors.endDate}
            />
          </div>
          
          <div className="mt-6 bg-blue-50 dark:bg-gray-800 p-4 rounded-md text-sm border border-blue-100 dark:border-gray-700">
            <p className="flex items-start text-blue-800 dark:text-blue-300">
              <Info className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0" />
              Updating these dates will change the scheduled timeline for this project.
            </p>
          </div>
        </div>
      </form>
    </BaseModal>
  );
}
