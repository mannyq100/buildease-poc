import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Material } from '@/data/mock/generatedPlan/planData';
import { Loader2, Package, Calendar, DollarSign, Truck, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion as m } from 'framer-motion';

interface MaterialFormModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (material: Partial<Material>) => void;
  material?: Material;
  isNew?: boolean;
}

export function MaterialFormModal({ 
  show, 
  onClose, 
  onSave, 
  material, 
  isNew = true
}: MaterialFormModalProps) {
  const [formData, setFormData] = useState<Partial<Material>>({
    id: '',
    name: '',
    quantity: 1,
    unit: '',
    unitPrice: 0,
    totalPrice: 0,
    supplier: '',
    status: 'pending',
    deliveryDate: ''
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Initialize form with material data if editing
  useEffect(() => {
    if (material) {
      setFormData({
        ...material
      });
    } else if (isNew) {
      setFormData({
        id: uuidv4(),
        name: '',
        quantity: 1,
        unit: '',
        unitPrice: 0,
        totalPrice: 0,
        supplier: '',
        status: 'pending',
        deliveryDate: ''
      });
    }
    setError('');
  }, [material, isNew]);
  
  // Calculate total price when quantity or unit price changes
  useEffect(() => {
    if (formData.quantity && formData.unitPrice) {
      setFormData(prev => ({
        ...prev,
        totalPrice: prev.quantity! * prev.unitPrice!
      }));
    }
  }, [formData.quantity, formData.unitPrice]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const parsedValue = type === 'number' ? parseFloat(value) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name?.trim()) {
      setError('Material name is required');
      return;
    }
    
    if (formData.quantity && formData.quantity <= 0) {
      setError('Quantity must be greater than zero');
      return;
    }
    
    if (formData.unitPrice && formData.unitPrice < 0) {
      setError('Unit price cannot be negative');
      return;
    }
    
    setSaving(true);
    setError('');
    
    // Simulate API delay
    setTimeout(() => {
      onSave(formData);
      setSaving(false);
      onClose();
    }, 500);
  };
  
  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-lg rounded-xl">
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <div className="bg-gradient-to-r from-[#2B6CB0] to-[#2B6CB0]/90 p-5 text-white">
            <DialogHeader className="pb-0">
              <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-white">
                <div className="bg-white/20 p-1.5 rounded-md">
                  <Package className="h-5 w-5" />
                </div>
                {isNew ? 'Add New Material' : 'Edit Material'}
              </DialogTitle>
              <p className="text-sm text-white/80 mt-2">
                {isNew ? 'Add construction materials needed for this phase' : 'Update the details of this material'}
              </p>
            </DialogHeader>
          </div>
          
          <div className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <m.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm flex items-start gap-2 border border-red-100 dark:border-red-800/30"
                >
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </m.div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium flex items-center gap-1.5">
                  <span className="text-[#2B6CB0] dark:text-[#93C5FD]">Material Name</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter material name"
                  className="w-full border-gray-300 dark:border-gray-700 focus:border-[#2B6CB0] focus:ring-[#2B6CB0]/20 transition-all duration-200"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-sm font-medium flex items-center gap-1.5">
                    <span className="text-[#2B6CB0] dark:text-[#93C5FD]">Quantity</span>
                  </Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full border-gray-300 dark:border-gray-700 focus:border-[#2B6CB0] focus:ring-[#2B6CB0]/20 transition-all duration-200"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="unit" className="text-sm font-medium flex items-center gap-1.5">
                    <span className="text-[#2B6CB0] dark:text-[#93C5FD]">Unit</span>
                  </Label>
                  <Input
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    placeholder="e.g., sq. ft, pieces"
                    className="w-full border-gray-300 dark:border-gray-700 focus:border-[#2B6CB0] focus:ring-[#2B6CB0]/20 transition-all duration-200"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unitPrice" className="text-sm font-medium flex items-center gap-1.5">
                    <span className="text-[#2B6CB0] dark:text-[#93C5FD]">Unit Price</span>
                    <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                  </Label>
                  <Input
                    id="unitPrice"
                    name="unitPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={handleChange}
                    className="w-full border-gray-300 dark:border-gray-700 focus:border-[#2B6CB0] focus:ring-[#2B6CB0]/20 transition-all duration-200"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="totalPrice" className="text-sm font-medium flex items-center gap-1.5">
                    <span className="text-[#2B6CB0] dark:text-[#93C5FD]">Total Price</span>
                    <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                  </Label>
                  <div className="relative">
                    <Input
                      id="totalPrice"
                      name="totalPrice"
                      type="number"
                      value={formData.totalPrice}
                      readOnly
                      className="w-full bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Auto</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supplier" className="text-sm font-medium flex items-center gap-1.5">
                  <span className="text-[#2B6CB0] dark:text-[#93C5FD]">Supplier</span>
                  <Truck className="h-3.5 w-3.5 text-gray-400" />
                </Label>
                <Input
                  id="supplier"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  placeholder="Enter supplier name"
                  className="w-full border-gray-300 dark:border-gray-700 focus:border-[#2B6CB0] focus:ring-[#2B6CB0]/20 transition-all duration-200"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium flex items-center gap-1.5">
                    <span className="text-[#2B6CB0] dark:text-[#93C5FD]">Status</span>
                  </Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B6CB0] dark:focus:ring-[#2B6CB0]/70 transition-all duration-200"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="ordered">Ordered</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deliveryDate" className="text-sm font-medium flex items-center gap-1.5">
                    <span className="text-[#2B6CB0] dark:text-[#93C5FD]">Delivery Date</span>
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  </Label>
                  <Input
                    id="deliveryDate"
                    name="deliveryDate"
                    type="date"
                    value={formData.deliveryDate ? formData.deliveryDate.substring(0, 10) : ''}
                    onChange={handleChange}
                    className="w-full border-gray-300 dark:border-gray-700 focus:border-[#2B6CB0] focus:ring-[#2B6CB0]/20 transition-all duration-200"
                  />
                </div>
              </div>
              
              <DialogFooter className="mt-6 gap-2 pb-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-all duration-200"
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#2B6CB0] hover:bg-[#2B6CB0]/90 text-white transition-all duration-200 shadow-sm hover:shadow"
                  disabled={saving}
                >
                  {saving ? (
                    <m.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center"
                    >
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </m.div>
                  ) : (
                    isNew ? 'Create Material' : 'Save Changes'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </m.div>
      </DialogContent>
    </Dialog>
  );
}
