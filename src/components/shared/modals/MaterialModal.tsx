import React, { useCallback, useEffect } from 'react';
import { Package, DollarSign, CirclePlus, Truck, ShoppingCart, Calendar, ListMinus, ArrowUpDown, Hash } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { BaseModal } from './BaseModal';
import { FormField, SelectField, ModalFooter } from '@/components/ui/form-fields';
import { v4 as uuidv4 } from 'uuid';
import { ModalMaterial } from '@/types/plan/index';

// Re-export for backward compatibility
export type Material = ModalMaterial;

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
  const getDefaultValues = useCallback((): Material => ({
    id: material?.id || uuidv4(),
    name: material?.name || '',
    type: material?.type || '',
    quantity: material?.quantity || 1,
    unit: material?.unit || 'ea',
    unitPrice: material?.unitPrice || 0,
    totalPrice: material?.totalPrice || 0,
    supplier: material?.supplier || '',
    purchaseDate: material?.purchaseDate || '',
    deliveryDate: material?.deliveryDate || '',
    status: material?.status || 'pending',
    notes: material?.notes || '',
    phaseId: material?.phaseId || phaseId || ''
  }), [material, phaseId]);

  // Initialize React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<Material>({
    defaultValues: getDefaultValues(),
    mode: 'onBlur'
  });

  // Watch quantity and unitPrice for totalPrice calculation
  const quantity = watch('quantity');
  const unitPrice = watch('unitPrice');
  const purchaseDate = watch('purchaseDate');
  const deliveryDate = watch('deliveryDate');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (show) {
      reset(getDefaultValues());
    }
  }, [show, reset, getDefaultValues]);

  // Update total price when quantity or unit price changes
  useEffect(() => {
    if (quantity !== undefined && unitPrice !== undefined) {
      const calculatedTotal = quantity * unitPrice;
      setValue('totalPrice', calculatedTotal);
    }
  }, [quantity, unitPrice, setValue]);

  // Handle form submission
  const onSubmit = useCallback((data: Material) => {
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
      isNew={isNew}
      saving={isSubmitting}
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
      saving={isSubmitting}
    >
      <form id="material-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic information */}
        <div className="space-y-5">
          <Controller
            control={control}
            name="name"
            rules={{ required: 'Material name is required' }}
            render={({ field, fieldState: { error } }) => (
              <FormField
                label="Material Name"
                name="name"
                value={field.value}
                onChange={field.onChange}
                placeholder="e.g., Concrete Mix Type II"
                required
                icon={Package}
                error={error?.message}
              />
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              control={control}
              name="type"
              rules={{ required: 'Material type is required' }}
              render={({ field, fieldState: { error } }) => (
                <SelectField
                  label="Material Type"
                  name="type"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={materialTypes.map(type => ({
                    value: type,
                    label: type
                  }))}
                  placeholder="Select type"
                  icon={Package}
                  error={error?.message}
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="status"
              render={({ field, fieldState: { error } }) => (
                <SelectField
                  label="Status"
                  name="status"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={statuses.map(status => ({
                    value: status,
                    label: status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ')
                  }))}
                  placeholder="Select status"
                  icon={ArrowUpDown}
                  error={error?.message}
                />
              )}
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
            <Controller
              control={control}
              name="quantity"
              rules={{ 
                required: 'Quantity is required',
                min: { value: 1, message: 'Quantity must be greater than 0' }
              }}
              render={({ field, fieldState: { error } }) => (
                <FormField
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={field.value?.toString() || ''}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  placeholder="e.g., 100"
                  icon={Hash}
                  error={error?.message}
                  required
                  min="1"
                  step="1"
                />
              )}
            />

            <Controller
              control={control}
              name="unit"
              rules={{ required: 'Unit of measurement is required' }}
              render={({ field, fieldState: { error } }) => (
                <SelectField
                  label="Unit"
                  name="unit"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={units.map(unit => ({
                    value: unit,
                    label: unit
                  }))}
                  placeholder="Select unit"
                  icon={CirclePlus}
                  error={error?.message}
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="unitPrice"
              rules={{ 
                min: { value: 0, message: 'Unit price cannot be negative' }
              }}
              render={({ field, fieldState: { error } }) => (
                <FormField
                  label="Unit Price"
                  name="unitPrice"
                  type="number"
                  value={field.value?.toString() || ''}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  placeholder="e.g., 19.99"
                  icon={DollarSign}
                  error={error?.message}
                  min="0"
                  step="0.01"
                />
              )}
            />
          </div>
          
          <Controller
            control={control}
            name="totalPrice"
            render={({ field }) => (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md flex justify-between items-center border border-blue-100 dark:border-blue-900/30">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-[#2B6CB0]" /> Total Price
                </span>
                <span className="text-lg font-semibold text-[#2B6CB0] dark:text-blue-400">
                  ${field.value?.toFixed(2) || '0.00'}
                </span>
              </div>
            )}
          />
        </div>

        {/* Supplier and delivery dates */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 space-y-5">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Truck className="h-4 w-4 text-[#2B6CB0]" />
            Supplier & Delivery
          </h3>

          <Controller
            control={control}
            name="supplier"
            render={({ field, fieldState: { error } }) => (
              <FormField
                label="Supplier"
                name="supplier"
                value={field.value}
                onChange={field.onChange}
                placeholder="e.g., BuildMart Inc."
                icon={Truck}
                error={error?.message}
              />
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              control={control}
              name="purchaseDate"
              render={({ field, fieldState: { error } }) => (
                <FormField
                  label="Purchase Date"
                  name="purchaseDate"
                  type="date"
                  value={field.value}
                  onChange={field.onChange}
                  icon={ShoppingCart}
                  error={error?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="deliveryDate"
              rules={{
                validate: (value) => {
                  if (purchaseDate && value && new Date(value) < new Date(purchaseDate)) {
                    return 'Delivery date cannot be before purchase date';
                  }
                  return true;
                }
              }}
              render={({ field, fieldState: { error } }) => (
                <FormField
                  label="Expected Delivery"
                  name="deliveryDate"
                  type="date"
                  value={field.value}
                  onChange={field.onChange}
                  icon={Calendar}
                  error={error?.message}
                />
              )}
            />
          </div>
        </div>

        {/* Notes */}
        <Controller
          control={control}
          name="notes"
          render={({ field, fieldState: { error } }) => (
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <ListMinus className="h-4 w-4 text-gray-500" /> Notes
              </label>
              <div className="relative group">
                <ListMinus className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-hover:text-[#2B6CB0] transition-colors duration-200" />
                <textarea
                  id="notes"
                  name="notes"
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Additional information about this material"
                  rows={2}
                  className={`w-full pl-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2B6CB0]/10 focus:border-[#2B6CB0] shadow-sm hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-200 ${error ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''}`}
                />
              </div>
              {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
            </div>
          )}
        />
      </form>
    </BaseModal>
  );
}
