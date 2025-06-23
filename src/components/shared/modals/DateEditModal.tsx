import React, { useCallback, useEffect } from 'react';
import { Calendar, Info } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
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
  const getDefaultValues = useCallback((): DateRange => ({
    id: dateRange?.id || uuidv4(),
    startDate: dateRange?.startDate || new Date().toISOString().substring(0, 10),
    endDate: dateRange?.endDate || new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().substring(0, 10),
    type: dateRange?.type || 'project',
    name: dateRange?.name
  }), [dateRange]);

  // Initialize React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<DateRange>({
    defaultValues: getDefaultValues(),
    mode: 'onBlur'
  });

  // Watch startDate for validation
  const startDate = watch('startDate');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (show) {
      reset(getDefaultValues());
    }
  }, [show, reset, getDefaultValues]);

  // Combine the internal saving state with any external loading state
  const saving = isSubmitting || isLoading;

  // Handle form submission
  const onSubmit = useCallback((data: DateRange) => {
    // Simulate API call delay
    setTimeout(() => {
      onSave(data);
      onClose();
    }, 500);
  }, [onSave, onClose]);

  // Handle form submit wrapper
  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(onSubmit)(e);
  }, [handleSubmit, onSubmit]);

  // Create the modal footer
  const modalFooter = (
    <ModalFooter
      onClose={onClose}
      onSubmit={handleFormSubmit}
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
      <form id="date-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="p-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              control={control}
              name="startDate"
              rules={{ required: 'Start date is required' }}
              render={({ field, fieldState: { error } }) => (
                <FormField
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={field.value}
                  onChange={field.onChange}
                  icon={Calendar}
                  required
                  error={error?.message}
                />
              )}
            />
            
            <Controller
              control={control}
              name="endDate"
              rules={{ 
                required: 'End date is required',
                validate: (value) => {
                  if (startDate && value && new Date(value) < new Date(startDate)) {
                    return 'End date cannot be before start date';
                  }
                  return true;
                }
              }}
              render={({ field, fieldState: { error } }) => (
                <FormField
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={field.value}
                  onChange={field.onChange}
                  icon={Calendar}
                  required
                  error={error?.message}
                />
              )}
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
