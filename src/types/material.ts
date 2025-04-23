/**
 * Material-related type definitions
 */

export interface Material {
  id: string;
  name: string;
  category: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  supplier: string;
  deliveryDate: string;
  status: 'not-ordered' | 'pending' | 'ordered' | 'delivered' | 'used' | 'excess';
  projectId: string;
  description?: string;
  lastUpdated: string;
}
