// src/components/shared/modals/TeamModal.tsx
import React, { useCallback } from 'react';
import { User, Briefcase, Mail, Phone, Activity, ShieldQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TeamMember, TeamMemberStatus } from '@/types/team';
import { useFormState } from '@/hooks/useFormState';
import { BaseModal } from './BaseModal';
import { FormField, SelectField, ModalFooter } from '@/components/ui/form-fields';

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
  const defaultValues: Partial<TeamMember> = {
    name: '',
    role: ROLES[0],
    email: '',
    phone: '',
    status: STATUS_OPTIONS[0],
    permissions: PERMISSIONS[2], // Default to 'Viewer'
  };

  // Validation function
  const validateForm = useCallback((data: Partial<TeamMember>) => {
    const errors: Partial<Record<keyof TeamMember, string>> = {};
    
    if (!data.name?.trim()) errors.name = 'Name is required';
    if (!data.role?.trim()) errors.role = 'Role is required';
    if (!data.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(data.email)) {
      errors.email = 'Invalid email format';
    }
    if (!data.status) errors.status = 'Status is required';
    
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
  } = useFormState<Partial<TeamMember>>(initialData, defaultValues, show, validateForm);

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    
    // Prepare data to save
    const saveData: Partial<TeamMember> = {
      id: formData.id,
      name: formData.name,
      role: formData.role,
      email: formData.email,
      phone: formData.phone,
      status: formData.status,
      permissions: formData.permissions,
    };

    // Simulate API call with slight delay
    setTimeout(() => {
      onSave(saveData);
      setSaving(false);
      onClose();
    }, 300);
  }, [formData, validate, onSave, onClose, setSaving]);

  // Create the footer component
  const modalFooter = (
    <ModalFooter
      onClose={onClose}
      onSubmit={handleSubmit}
      isNew={isNewItem}
      saving={saving}
    />
  );

  return (
    <BaseModal
      show={show}
      onClose={onClose}
      title={isNewItem ? 'Add New Team Member' : 'Edit Team Member'}
      footer={modalFooter}
      saving={saving}
    >
      <form id="team-member-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <FormField
          label="Full Name"
          name="name"
          value={formData.name || ''}
          onChange={handleChange}
          placeholder="e.g., Jane Doe"
          required
          icon={User}
          error={errors.name}
        />

        {/* Role Dropdown */}
        <SelectField
          label="Role"
          name="role"
          value={formData.role || ''}
          onValueChange={(value) => handleSelectChange('role', value)}
          options={ROLES.map(role => ({ value: role, label: role }))}
          required
          icon={Briefcase}
          error={errors.role}
        />

        {/* Permissions Dropdown */}
        <SelectField
          label="Permissions"
          name="permissions"
          value={formData.permissions || ''}
          onValueChange={(value) => handleSelectChange('permissions', value as TeamMember['permissions'])}
          options={PERMISSIONS.map(perm => ({ value: perm, label: perm }))}
          icon={ShieldQuestion}
        />

        {/* Email Field */}
        <FormField
          label="Email Address"
          name="email"
          type="email"
          value={formData.email || ''}
          onChange={handleChange}
          placeholder="e.g., jane.doe@example.com"
          required
          icon={Mail}
          error={errors.email}
        />

        {/* Phone Field */}
        <FormField
          label="Phone Number"
          name="phone"
          type="tel"
          value={formData.phone || ''}
          onChange={handleChange}
          placeholder="e.g., (555) 123-4567"
          icon={Phone}
          error={errors.phone}
        />

        {/* Status Dropdown */}
        <SelectField
          label="Status"
          name="status"
          value={formData.status || ''}
          onValueChange={(value) => handleSelectChange('status', value as TeamMemberStatus)}
          options={STATUS_OPTIONS.map(status => ({
            value: status,
            label: status.replace('-', ' ').replace(/\b\w/g, char => char.toUpperCase())
          }))}
          required
          icon={Activity}
          error={errors.status}
        />
      </form>
    </BaseModal>
  );
}
