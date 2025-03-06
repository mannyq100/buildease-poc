/**
 * Material-related type definitions
 */

export interface Material {
  id: number
  name: string
  category: string
  unit: string
  unitPrice: number
  inStock: number
  minStock: number
  onOrder: number
  supplier: string
  lastOrdered: string
  project: string
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'On Order'
}

export interface NewMaterial {
  name: string
  category: string
  unit: string
  unitPrice: number
  inStock: number
  minStock: number
  supplier: string
  project: string
}

// Badge variant types
export type StatusVariant = 'success' | 'warning' | 'destructive' | 'default'

// Status configuration
export const statusConfig = {
  'In Stock': { variant: 'success' as StatusVariant, text: 'In Stock' },
  'Low Stock': { variant: 'warning' as StatusVariant, text: 'Low Stock' },
  'Out of Stock': { variant: 'destructive' as StatusVariant, text: 'Out of Stock' },
  'On Order': { variant: 'default' as StatusVariant, text: 'On Order' }
} 