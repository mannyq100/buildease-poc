// src/components/shared/modals/TeamModal.tsx
import React, { useCallback, useEffect } from 'react';
import { User, Briefcase, Mail, Phone, Activity, ShieldQuestion } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { TeamMember, TeamMemberStatus } from '@/types/team';
import { BaseModal } from './BaseModal';
import { FormField, SelectField, ModalFooter } from '@/components/ui/form-fields';
import { v4 as uuidv4 } from 'uuid';

interface TeamModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (item: Partial<TeamMember>) => void;
  initialData: TeamMember | null;
  isNewItem: boolean;
}

// Define constants for dropdown options
const ROLES = [
  'Project Manager',
  'Site Supervisor',
  'Foreman',
  'Engineer',
  'Architect',
  'Electrician',
  'Plumber',
  'Carpenter',
  'Laborer',
  'Safety Officer',
  'Administrator',
  'Other',
];

const PERMISSIONS: Array<TeamMember['permissions']> = ['Admin', 'Editor', 'Viewer', 'Restricted'];

const STATUS_OPTIONS: TeamMemberStatus[] = ['active', 'inactive', 'on-leave', 'remote'];

// Basic email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function TeamModal({ show, onClose, initialData, isNewItem, onSave }: TeamModalProps) {
  // Default form values
  const getDefaultValues = useCallback((): Partial<TeamMember> => ({
    id: initialData?.id || uuidv4(),
    name: initialData?.name || '',
    role: initialData?.role || ROLES[0],
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    status: initialData?.status || STATUS_OPTIONS[0],
    permissions: initialData?.permissions || PERMISSIONS[2], // Default to 'Viewer'
  }), [initialData]);

  // Initialize React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<Partial<TeamMember>>({
    defaultValues: getDefaultValues(),
    mode: 'onBlur'
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (show) {
      reset(getDefaultValues());
    }
  }, [show, reset, getDefaultValues]);

  // Handle form submission
  const onSubmit = useCallback((data: Partial<TeamMember>) => {
    // Simulate API call delay
    setTimeout(() => {
      onSave(data);
      onClose();
    }, 300);
  }, [onSave, onClose]);

  // Handle form submit wrapper
  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(onSubmit)(e);
  }, [handleSubmit, onSubmit]);

  // Create the footer component
  const modalFooter = (
    <ModalFooter
      onClose={onClose}
      onSubmit={handleFormSubmit}
      isNew={isNewItem}
      saving={isSubmitting}
    />
  );

  return (
    <BaseModal
      show={show}
      onClose={onClose}
      title={isNewItem ? 'Add New Team Member' : 'Edit Team Member'}
      footer={modalFooter}
      saving={isSubmitting}
    >
      <form id="team-member-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <Controller
          control={control}
          name="name"
          rules={{ 
            required: 'Name is required',
            validate: (value) => value?.trim() ? true : 'Name cannot be empty'
          }}
          render={({ field, fieldState: { error } }) => (
            <FormField
              label="Full Name"
              name="name"
              value={field.value || ''}
              onChange={field.onChange}
              placeholder="e.g., Jane Doe"
              required
              icon={User}
              error={error?.message}
            />
          )}
        />

        {/* Role Dropdown */}
        <Controller
          control={control}
          name="role"
          rules={{ required: 'Role is required' }}
          render={({ field, fieldState: { error } }) => (
            <SelectField
              label="Role"
              name="role"
              value={field.value || ''}
              onValueChange={field.onChange}
              options={ROLES.map(role => ({ value: role, label: role }))}
              required
              icon={Briefcase}
              error={error?.message}
            />
          )}
        />

        {/* Permissions Dropdown */}
        <Controller
          control={control}
          name="permissions"
          render={({ field, fieldState: { error } }) => (
            <SelectField
              label="Permissions"
              name="permissions"
              value={field.value || ''}
              onValueChange={(value) => field.onChange(value as TeamMember['permissions'])}
              options={PERMISSIONS.map(perm => ({ value: perm, label: perm }))}
              icon={ShieldQuestion}
              error={error?.message}
            />
          )}
        />

        {/* Email Field */}
        <Controller
          control={control}
          name="email"
          rules={{ 
            required: 'Email is required',
            validate: (value) => {
              if (!value?.trim()) return 'Email is required';
              if (!isValidEmail(value)) return 'Invalid email format';
              return true;
            }
          }}
          render={({ field, fieldState: { error } }) => (
            <FormField
              label="Email Address"
              name="email"
              type="email"
              value={field.value || ''}
              onChange={field.onChange}
              placeholder="e.g., jane.doe@example.com"
              required
              icon={Mail}
              error={error?.message}
            />
          )}
        />

        {/* Phone Field */}
        <Controller
          control={control}
          name="phone"
          render={({ field, fieldState: { error } }) => (
            <FormField
              label="Phone Number"
              name="phone"
              type="tel"
              value={field.value || ''}
              onChange={field.onChange}
              placeholder="e.g., (555) 123-4567"
              icon={Phone}
              error={error?.message}
            />
          )}
        />

        {/* Status Dropdown */}
        <Controller
          control={control}
          name="status"
          rules={{ required: 'Status is required' }}
          render={({ field, fieldState: { error } }) => (
            <SelectField
              label="Status"
              name="status"
              value={field.value || ''}
              onValueChange={(value) => field.onChange(value as TeamMemberStatus)}
              options={STATUS_OPTIONS.map(status => ({
                value: status,
                label: status.replace('-', ' ').replace(/\b\w/g, char => char.toUpperCase())
              }))}
              required
              icon={Activity}
              error={error?.message}
            />
          )}
        />
      </form>
    </BaseModal>
  );
}
