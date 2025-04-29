import React, { useCallback, useEffect } from 'react';
import { Package, DollarSign, CirclePlus, Truck, ShoppingCart, Calendar, ListMinus, ArrowUpDown, Hash } from 'lucide-react';
import { useFormState } from '@/hooks/useFormState';
import { BaseModal } from './BaseModal';
import { FormField, SelectField, ModalFooter } from '@/components/ui/form-fields';
import { v4 as uuidv4 } from 'uuid';

export interface Material {
  id: string;
  name: string;
  type: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  supplier?: string;
  purchaseDate?: string;
  deliveryDate?: string;
  status: string;
  notes?: string;
  phaseId?: string;
}

interface MaterialModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (material: Material) => void;
  material?: Partial<Material>;
  isNew?: boolean;
  statuses?: string[];
  phaseId?: string;
  materialTypes?: string[];
  units?: string[];
}

export function MaterialModal({
  show,
  onClose,
  onSave,
  material,
  isNew = true,
  statuses = ['pending', 'ordered', 'delivered', 'installed', 'canceled'],
  phaseId,
  materialTypes = [
    'Concrete', 'Wood', 'Steel', 'Brick', 'Glass', 'Insulation', 'Drywall',
    'Paint', 'Flooring', 'Roofing', 'Plumbing', 'Electrical', 'HVAC',
    'Hardware', 'Doors', 'Windows', 'Trim', 'Tiles', 'Other'
  ],
  units = ['ea', 'sq.ft', 'sq.m', 'cu.yd', 'cu.m', 'ft', 'm', 'kg', 'lb', 'ton', 'box', 'roll', 'sheet', 'gal', 'L']
}: MaterialModalProps) {
  // Default material values
  const defaultValues: Material = {
    id: uuidv4(),
    name: '',
    type: '',
    quantity: 1,
    unit: 'ea',
    unitPrice: 0,
    totalPrice: 0,
    supplier: '',
    purchaseDate: '',
    deliveryDate: '',
    status: 'pending',
    notes: '',
    phaseId: phaseId || ''
  };

  // Material validation function
  const validateMaterial = useCallback((data: Material) => {
    const errors: Partial<Record<keyof Material, string>> = {};
    
    if (!data.name?.trim()) {
      errors.name = 'Material name is required';
    }
    
    if (!data.type) {
      errors.type = 'Material type is required';
    }
    
    if (!data.quantity || data.quantity <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }
    
    if (!data.unit) {
      errors.unit = 'Unit of measurement is required';
    }
    
    if (data.unitPrice < 0) {
      errors.unitPrice = 'Unit price cannot be negative';
    }
    
    if (data.deliveryDate && data.purchaseDate && new Date(data.deliveryDate) < new Date(data.purchaseDate)) {
      errors.deliveryDate = 'Delivery date cannot be before purchase date';
    }
    
    return errors;
  }, []);

  // Use our custom form state hook
  const {
    formData,
    setFormData,
    errors,
    saving,
    setSaving,
    handleChange,
    handleSelectChange,
    validate
  } = useFormState<Material>(
    material ? { ...defaultValues, ...material, id: material.id || uuidv4() } : null, 
    defaultValues, 
    show, 
    validateMaterial
  );

  // Update total price when quantity or unit price changes
  useEffect(() => {
    if (formData.quantity && formData.unitPrice) {
      const calculatedTotal = formData.quantity * formData.unitPrice;
      // Only update if the difference is significant (fixes precision issues)
      if (Math.abs(calculatedTotal - (formData.totalPrice || 0)) > 0.01) {
        setFormData(prev => ({ ...prev, totalPrice: calculatedTotal }));
      }
    }
  }, [formData.quantity, formData.unitPrice, setFormData]);

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
      submitText={isNew ? 'Add Material' : 'Save Changes'}
    />
  );

  // Modal description based on whether we're creating or editing
  const modalDescription = isNew 
    ? 'Add construction materials to your project inventory' 
    : 'Update details of this construction material';

  return (
    <BaseModal
      show={show}
      onClose={onClose}
      title={isNew ? 'Add New Material' : 'Edit Material'}
      description={modalDescription}
      footer={modalFooter}
      saving={saving}
    >
      <form id="material-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Basic information */}
        <div className="space-y-5">
          <FormField
            label="Material Name"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            placeholder="e.g., Concrete Mix Type II"
            required
            icon={Package}
            error={errors.name}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Material Type"
              name="type"
              value={formData.type || ''}
              onValueChange={(value) => handleSelectChange('type', value)}
              options={materialTypes.map(type => ({
                value: type,
                label: type
              }))}
              placeholder="Select type"
              icon={Package}
              error={errors.type}
              required
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
              icon={ArrowUpDown}
              error={errors.status}
            />
          </div>
        </div>

        {/* Quantity and price section */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 space-y-5">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-[#2B6CB0]" />
            Quantity & Pricing
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField
              label="Quantity"
              name="quantity"
              type="number"
              value={formData.quantity || ''}
              onChange={handleChange}
              placeholder="e.g., 100"
              icon={Hash}
              error={errors.quantity}
              required
              min={0}
              step={1}
            />

            <SelectField
              label="Unit"
              name="unit"
              value={formData.unit || ''}
              onValueChange={(value) => handleSelectChange('unit', value)}
              options={units.map(unit => ({
                value: unit,
                label: unit
              }))}
              placeholder="Select unit"
              icon={CirclePlus}
              error={errors.unit}
              required
            />

            <FormField
              label="Unit Price"
              name="unitPrice"
              type="number"
              value={formData.unitPrice || ''}
              onChange={handleChange}
              placeholder="e.g., 19.99"
              icon={DollarSign}
              error={errors.unitPrice}
              min={0}
              step={0.01}
            />
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md flex justify-between items-center border border-blue-100 dark:border-blue-900/30">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-[#2B6CB0]" /> Total Price
            </span>
            <span className="text-lg font-semibold text-[#2B6CB0] dark:text-blue-400">
              ${formData.totalPrice?.toFixed(2) || '0.00'}
            </span>
          </div>
        </div>

        {/* Supplier and delivery dates */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 space-y-5">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Truck className="h-4 w-4 text-[#2B6CB0]" />
            Supplier & Delivery
          </h3>

          <FormField
            label="Supplier"
            name="supplier"
            value={formData.supplier || ''}
            onChange={handleChange}
            placeholder="e.g., BuildMart Inc."
            icon={Truck}
            error={errors.supplier}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Purchase Date"
              name="purchaseDate"
              type="date"
              value={formData.purchaseDate || ''}
              onChange={handleChange}
              icon={ShoppingCart}
              error={errors.purchaseDate}
            />

            <FormField
              label="Expected Delivery"
              name="deliveryDate"
              type="date"
              value={formData.deliveryDate || ''}
              onChange={handleChange}
              icon={Calendar}
              error={errors.deliveryDate}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <ListMinus className="h-4 w-4 text-gray-500" /> Notes
          </label>
          <div className="relative group">
            <ListMinus className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-hover:text-[#2B6CB0] transition-colors duration-200" />
            <textarea
              id="notes"
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              placeholder="Additional information about this material"
              rows={2}
              className={`w-full pl-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2B6CB0]/10 focus:border-[#2B6CB0] shadow-sm hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-200 ${errors.notes ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''}`}
            />
          </div>
          {errors.notes && <p className="text-xs text-red-500 mt-1">{errors.notes}</p>}
        </div>
      </form>
    </BaseModal>
  );
}
