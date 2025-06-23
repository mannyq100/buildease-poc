/**
 * Example Compound Modal Implementation
 * Demonstrates how to use the new Modal compound component system
 * This can be used as a template for other modals
 */

import React from 'react';
import { Modal, useModalState } from '@/components/ui/compound/ModalSystem';
import { Form, useFormValidation } from '@/components/ui/compound/FormSystem';
import { User, Mail, Phone } from 'lucide-react';

interface ExampleFormData {
  name: string;
  email: string;
  phone: string;
}

interface ExampleCompoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ExampleFormData) => void;
  initialData?: Partial<ExampleFormData>;
  isLoading?: boolean;
}

export function ExampleCompoundModal({
  isOpen,
  onClose,
  onSave,
  initialData = {},
  isLoading = false
}: ExampleCompoundModalProps) {
  const [formData, setFormData] = React.useState<ExampleFormData>({
    name: initialData.name || '',
    email: initialData.email || '',
    phone: initialData.phone || ''
  });

  // Form validation using the compound form system
  const { errors, touched, validate, touch } = useFormValidation<ExampleFormData>(
    (values) => {
      const errors: Record<string, string> = {};
      
      if (!values.name.trim()) {
        errors.name = 'Name is required';
      }
      
      if (!values.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = 'Please enter a valid email address';
      }
      
      if (values.phone && !/^\(\d{3}\) \d{3}-\d{4}$/.test(values.phone)) {
        errors.phone = 'Please enter a valid phone number';
      }
      
      return errors;
    }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    touch(e.target.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate(formData)) {
      onSave(formData);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: initialData.name || '',
      email: initialData.email || '',
      phone: initialData.phone || ''
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
    >
      <Modal.Header>
        <Modal.Title>
          {initialData.name ? 'Edit Contact' : 'Add New Contact'}
        </Modal.Title>
        <Modal.Description>
          {initialData.name 
            ? 'Update the contact information below.' 
            : 'Enter the contact details for the new team member.'}
        </Modal.Description>
      </Modal.Header>

      <Modal.Body>
        <Form
          onSubmit={handleSubmit}
          errors={errors}
          touched={touched}
          isSubmitting={isLoading}
          size="md"
          layout="vertical"
        >
          <Form.Field
            name="name"
            label="Full Name"
            required
            description="Enter the person's full name"
          >
            <Form.Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder="e.g., John Doe"
              icon={User}
            />
          </Form.Field>

          <Form.Field
            name="email"
            label="Email Address"
            required
            description="This will be used for notifications and communication"
          >
            <Form.Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder="e.g., john.doe@example.com"
              icon={Mail}
            />
          </Form.Field>

          <Form.Field
            name="phone"
            label="Phone Number"
            description="Optional contact number"
          >
            <Form.Input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder="e.g., (555) 123-4567"
              icon={Phone}
            />
          </Form.Field>

          {/* Success message example */}
          {!Object.keys(errors).length && Object.keys(touched).length > 0 && (
            <Form.Message type="success">
              All fields are valid! You can now save the contact.
            </Form.Message>
          )}
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Modal.Actions
          onCancel={handleCancel}
          onConfirm={handleSubmit}
          cancelText="Cancel"
          confirmText={initialData.name ? 'Update Contact' : 'Add Contact'}
          isLoading={isLoading}
          disabled={Object.keys(errors).length > 0}
        />
      </Modal.Footer>
    </Modal>
  );
}

// Example of how to use the modal with the useModalState hook
export function ExampleModalUsage() {
  const modal = useModalState();
  
  const handleSave = (data: ExampleFormData) => {
    console.log('Saving contact:', data);
    // Simulate API call
    setTimeout(() => {
      modal.close();
    }, 1000);
  };

  return (
    <div>
      <button onClick={modal.open}>
        Open Example Modal
      </button>
      
      <ExampleCompoundModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        onSave={handleSave}
      />
    </div>
  );
}