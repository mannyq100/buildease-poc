/**
 * Material domain utilities
 * Functions for managing construction materials, inventory, and procurement
 */
import { Material } from '@/types/material';

// BuildEase color scheme based on design principles
const BUILDEASE_COLORS = {
  primary: '#2B6CB0', // Warm blue for trust and professionalism
  accent: '#ED8936', // Warm orange for calls-to-action
  success: '#48BB78', // Green for success
  warning: '#F6AD55', // Amber for in-progress
  error: '#F56565', // Red for error
  earthTone1: '#9C6F44', // Muted earth tones for construction context
  earthTone2: '#8D6E63',
  earthTone3: '#A1887F'
};

/**
 * Returns CSS classes for material status badge
 * @param status Material status
 * @returns Tailwind CSS classes for the status badge
 */
export function getStatusClasses(status: Material['status']): string {
  switch (status) {
    case 'delivered':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'ordered':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'pending':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    case 'not-ordered':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300';
    case 'used':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'excess':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300';
  }
}

/**
 * Returns a color for material status (for charts and visualizations)
 * @param status Material status
 * @returns HEX color code
 */
export function getStatusColor(status: Material['status']): string {
  switch (status) {
    case 'delivered':
      return BUILDEASE_COLORS.success;
    case 'ordered':
      return BUILDEASE_COLORS.primary;
    case 'pending':
      return BUILDEASE_COLORS.warning;
    case 'not-ordered':
      return '#94A3B8'; // Slate-400
    case 'used':
      return '#8B5CF6'; // Purple-500
    case 'excess':
      return BUILDEASE_COLORS.error;
    default:
      return '#94A3B8'; // Slate-400
  }
}

/**
 * Calculate the total cost of a material
 * @param material Material to calculate
 * @returns Total cost (quantity * unitPrice)
 */
export function calculateTotalCost(material: Material): number {
  return material.quantity * material.unitPrice;
}

/**
 * Calculate the total cost of multiple materials
 * @param materials Array of materials
 * @returns Total cost of all materials
 */
export function calculateTotalMaterialsCost(materials: Material[]): number {
  return materials.reduce((total, material) => {
    return total + calculateTotalCost(material);
  }, 0);
}

/**
 * Filter materials by various criteria
 * @param materials Array of materials
 * @param filters Filter criteria
 * @returns Filtered materials array
 */
export function filterMaterials(
  materials: Material[],
  filters: {
    category?: string;
    supplier?: string;
    status?: Material['status'];
    projectId?: string;
    deliveryDateFrom?: string;
    deliveryDateTo?: string;
    search?: string;
  }
): Material[] {
  return materials.filter(material => {
    // Check search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const nameMatch = material.name.toLowerCase().includes(searchTerm);
      const descriptionMatch = material.description?.toLowerCase().includes(searchTerm) || false;
      const supplierMatch = material.supplier.toLowerCase().includes(searchTerm);
      const categoryMatch = material.category.toLowerCase().includes(searchTerm);
      
      if (!(nameMatch || descriptionMatch || supplierMatch || categoryMatch)) {
        return false;
      }
    }
    
    // Check category filter
    if (filters.category && material.category !== filters.category) {
      return false;
    }
    
    // Check supplier filter
    if (filters.supplier && material.supplier !== filters.supplier) {
      return false;
    }
    
    // Check status filter
    if (filters.status && material.status !== filters.status) {
      return false;
    }
    
    // Check project filter
    if (filters.projectId && material.projectId !== filters.projectId) {
      return false;
    }
    
    // Check delivery date range
    if (filters.deliveryDateFrom && new Date(material.deliveryDate) < new Date(filters.deliveryDateFrom)) {
      return false;
    }
    if (filters.deliveryDateTo && new Date(material.deliveryDate) > new Date(filters.deliveryDateTo)) {
      return false;
    }
    
    return true;
  });
}

/**
 * Group materials by a specified field
 * @param materials Array of materials
 * @param groupBy Field to group by
 * @returns Object with grouped materials
 */
export function groupMaterialsByField(
  materials: Material[],
  groupBy: 'category' | 'supplier' | 'status' | 'projectId'
): Record<string, Material[]> {
  const grouped: Record<string, Material[]> = {};
  
  materials.forEach(material => {
    const key = material[groupBy] as string;
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    
    grouped[key].push(material);
  });
  
  return grouped;
}

/**
 * Get unique categories from materials array
 * @param materials Array of materials
 * @returns Array of unique categories
 */
export function getUniqueCategories(materials: Material[]): string[] {
  const categories = new Set(materials.map(m => m.category));
  return Array.from(categories).sort();
}

/**
 * Get unique suppliers from materials array
 * @param materials Array of materials
 * @returns Array of unique suppliers
 */
export function getUniqueSuppliers(materials: Material[]): string[] {
  const suppliers = new Set(materials.map(m => m.supplier));
  return Array.from(suppliers).sort();
}

/**
 * Sort materials by a specified field
 * @param materials Array of materials
 * @param sortBy Field to sort by
 * @param sortDir Sort direction
 * @returns Sorted materials array
 */
export function sortMaterials(
  materials: Material[],
  sortBy: keyof Material = 'name',
  sortDir: 'asc' | 'desc' = 'asc'
): Material[] {
  return [...materials].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    // Handle numeric values
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDir === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // Handle date values
    if (sortBy === 'deliveryDate' || sortBy === 'lastUpdated') {
      const dateA = new Date(aValue as string).getTime();
      const dateB = new Date(bValue as string).getTime();
      return sortDir === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    // Handle string values
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDir === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    
    return 0;
  });
}

/**
 * Calculate materials delivery status statistics
 * @param materials Array of materials
 * @returns Object with counts for each status
 */
export function calculateMaterialsStats(materials: Material[]): Record<Material['status'], number> {
  const stats: Record<Material['status'], number> = {
    'not-ordered': 0,
    'pending': 0,
    'ordered': 0,
    'delivered': 0,
    'used': 0,
    'excess': 0
  };
  
  materials.forEach(material => {
    stats[material.status]++;
  });
  
  return stats;
}
