import React, { useCallback } from 'react';
import { Layers, Calendar, ListOrdered, ClipboardList } from 'lucide-react';
import { useFormState } from '@/hooks/useFormState';
import { BaseModal } from './BaseModal';
import { FormField, SelectField, ModalFooter } from '@/components/ui/form-fields';
import { v4 as uuidv4 } from 'uuid';

export interface Phase {
  id: string;
  name: string;
  description?: string;
  order: number;
  startDate: string;
  endDate: string;
  status: string;
  tasks?: any[];
  materials?: any[];
  progress?: number;
}

interface PhaseFormModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (phase: Phase) => void;
  phase?: Partial<Phase>;
  isNew?: boolean;
  statuses?: string[];
  currentOrder?: number;
}

export function PhaseFormModal({
  show,
  onClose,
  onSave,
  phase,
  isNew = true,
  statuses = ['planning', 'in-progress', 'on-hold', 'completed'],
  currentOrder = 1
}: PhaseFormModalProps) {
  // Default phase values
  const defaultValues: Phase = {
    id: uuidv4(),
    name: '',
    description: '',
    order: currentOrder,
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().substring(0, 10),
    status: 'planning',
    tasks: [],
    materials: [],
    progress: 0
  };

  // Phase validation function
  const validatePhase = useCallback((data: Phase) => {
    const errors: Partial<Record<keyof Phase, string>> = {};
    
    if (!data.name?.trim()) {
      errors.name = 'Phase name is required';
    }
    
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
    saving,
    setSaving,
    handleChange,
    handleSelectChange,
    validate
  } = useFormState<Phase>(
    phase ? { ...defaultValues, ...phase, id: phase.id || uuidv4() } : null, 
    defaultValues, 
    show, 
    validatePhase
  );

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    
    // Simulate API call with slight delay
    setTimeout(() => {
      onSave(formData);
      setSaving(false);
      onClose();
    }, 500);
  }, [formData, validate, onSave, onClose, setSaving]);

  // Create the modal footer
  const modalFooter = (
    <ModalFooter
      onClose={onClose}
      onSubmit={handleSubmit}
      isNew={isNew}
      saving={saving}
      submitText={isNew ? 'Create Phase' : 'Save Changes'}
    />
  );

  // Modal description based on whether we're creating or editing
  const modalDescription = isNew 
    ? 'Create a new construction phase for your project' 
    : 'Update the details of this construction phase';

  return (
    <BaseModal
      show={show}
      onClose={onClose}
      title={isNew ? 'Add New Phase' : 'Edit Phase'}
      description={modalDescription}
      footer={modalFooter}
      saving={saving}
    >
      <form id="phase-form" onSubmit={handleSubmit} className="space-y-5">
        {/* Basic information */}
        <FormField
          label="Phase Name"
          name="name"
          value={formData.name || ''}
          onChange={handleChange}
          placeholder="e.g., Foundation Work"
          required
          icon={Layers}
          error={errors.name}
        />

        {/* Description field */}
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
            Description
          </label>
          <div className="relative group">
            <ClipboardList className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-hover:text-[#2B6CB0] transition-colors duration-200" />
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="Enter phase description"
              rows={3}
              className={`w-full pl-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2B6CB0]/10 focus:border-[#2B6CB0] shadow-sm hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-200 ${errors.description ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''}`}
            />
          </div>
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
        </div>

        {/* Order and Status */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Order"
            name="order"
            type="number"
            value={formData.order || ''}
            onChange={handleChange}
            placeholder="e.g., 1"
            icon={ListOrdered}
            error={errors.order}
          />

          <SelectField
            label="Status"
            name="status"
            value={formData.status || ''}
            onValueChange={(value) => handleSelectChange('status', value)}
            options={statuses.map(status => ({
              value: status,
              label: status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ')
            }))}
            placeholder="Select status"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
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
      </form>
    </BaseModal>
  );
}
