/**
 * Material Type Definitions
 * Material interfaces for plan and modal contexts
 */

import { BaseMaterial } from './base';

/**
 * Plan Material Interface
 * Used in plan data and state management
 */
export interface PlanMaterial extends BaseMaterial {
  unitPrice?: number;
  totalPrice?: number;
  supplier?: string;
  orderDate?: string;
  deliveryDate?: string;
  type?: string;
}

/**
 * Modal Material Interface
 * Used in modal forms and UI components
 */
export interface ModalMaterial extends BaseMaterial {
  type?: string;
  unitPrice?: number;
  totalPrice?: number;
  price?: number; // Alternative to unitPrice for compatibility
  supplier?: string;
  purchaseDate?: string;
  deliveryDate?: string;
  orderDate?: string;
  notes?: string;
  phaseId: string; // Required in modal context
  
  // Index signature for form compatibility
  [key: string]: string | number | boolean | null | undefined;
}

// Legacy compatibility
export type Material = PlanMaterial;