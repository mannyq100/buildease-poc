/**
 * Mock Material Service
 * Provides mock implementations of material-related services
 */
import { Material } from '@/types/material';
import materialsData from '../json/materials.json';

// Valid material statuses based on our type definition
type MaterialStatus = 'not-ordered' | 'pending' | 'ordered' | 'delivered' | 'used' | 'excess';

/**
 * Get all materials
 * @returns Promise that resolves to an array of materials
 */
export function getMaterials(): Promise<Material[]> {
  // Convert the raw JSON data to the correct Material type with proper status enum
  const typedMaterials: Material[] = materialsData.list.map(m => ({
    ...m,
    status: m.status as MaterialStatus // Ensure status is properly typed
  }));
  return Promise.resolve(typedMaterials);
}

/**
 * Get a material by ID
 * @param id Material ID
 * @returns Promise that resolves to a material or null if not found
 */
export function getMaterialById(id: string): Promise<Material | null> {
  const material = materialsData.list.find(m => m.id === id);
  if (!material) return Promise.resolve(null);
  
  // Convert to Material type with proper status
  const typedMaterial: Material = {
    ...material,
    status: material.status as MaterialStatus
  };
  return Promise.resolve(typedMaterial);
}

/**
 * Get materials for a specific project
 * @param projectId Project ID
 * @returns Promise that resolves to an array of materials for the specified project
 */
export function getMaterialsByProject(projectId: string): Promise<Material[]> {
  const materials = materialsData.list.filter(m => m.projectId === projectId);
  
  // Convert to Material type with proper status
  const typedMaterials: Material[] = materials.map(m => ({
    ...m,
    status: m.status as MaterialStatus
  }));
  return Promise.resolve(typedMaterials);
}

/**
 * Get material categories for filtering
 * @returns Promise that resolves to an array of category options
 */
export function getMaterialCategories(): Promise<string[]> {
  // Return a static list rather than relying on possibly missing data
  return Promise.resolve([
    'Lumber', 'Concrete', 'Roofing', 'Electrical', 'Plumbing', 'Drywall', 
    'Insulation', 'Paint', 'Hardware', 'Tools', 'Flooring', 'Other'
  ]);
}

/**
 * Get material suppliers
 * @returns Promise that resolves to an array of material suppliers
 */
export function getMaterialSuppliers(): Promise<string[]> {
  // Extract unique suppliers from our materials data
  const suppliers = Array.from(new Set(materialsData.list.map(m => m.supplier)));
  return Promise.resolve(suppliers);
}

/**
 * Get low stock materials that need reordering
 * @returns Promise that resolves to an array of materials below threshold
 */
export function getLowStockMaterials(): Promise<Material[]> {
  // Define a threshold (e.g., quantity < 10)
  const threshold = 10;
  const lowStockMaterials = materialsData.list.filter(m => m.quantity < threshold);
  
  // Convert to Material type with proper status
  const typedMaterials: Material[] = lowStockMaterials.map(m => ({
    ...m,
    status: m.status as MaterialStatus
  }));
  return Promise.resolve(typedMaterials);
}

/**
 * Get material units for input
 * @returns Promise that resolves to an array of unit options
 */
export function getMaterialUnits(): Promise<string[]> {
  // Return a static list of common units
  return Promise.resolve([
    'sq ft', 'cu yd', 'linear ft', 'each', 'box', 'pallet', 'ton', 'lb', 'gal'
  ]);
}

/**
 * Get material statuses for filtering
 * @returns Promise that resolves to an array of status options
 */
export function getMaterialStatuses(): Promise<string[]> {
  // Return the valid statuses based on our type definition
  return Promise.resolve([
    'not-ordered', 'pending', 'ordered', 'delivered', 'used', 'excess'
  ]);
}

/**
 * Create a new material
 * @param material Material data to create
 * @returns Promise that resolves to the created material
 */
export function createMaterial(material: Omit<Material, 'id' | 'lastUpdated'>): Promise<Material> {
  // In a real implementation, this would make an API call
  // For mock, we just return a new material with a generated ID
  const newId = String(Math.max(...materialsData.list.map(m => Number(m.id))) + 1);
  const now = new Date().toISOString().split('T')[0];
  
  const newMaterial: Material = {
    ...material,
    id: newId,
    lastUpdated: now,
    status: material.status as MaterialStatus
  };
  
  return Promise.resolve(newMaterial);
}

/**
 * Update an existing material
 * @param id Material ID
 * @param updates Partial material data to update
 * @returns Promise that resolves to the updated material or null if not found
 */
export function updateMaterial(id: string, updates: Partial<Material>): Promise<Material | null> {
  const materialIndex = materialsData.list.findIndex(m => m.id === id);
  
  if (materialIndex === -1) {
    return Promise.resolve(null);
  }
  
  const baseMaterial = materialsData.list[materialIndex];
  const now = new Date().toISOString().split('T')[0];
  
  // Create a properly typed Material
  const updatedMaterial: Material = {
    ...baseMaterial,
    ...updates,
    id: baseMaterial.id, // Ensure ID doesn't change
    lastUpdated: now,
    status: (updates.status || baseMaterial.status) as MaterialStatus
  };
  
  return Promise.resolve(updatedMaterial);
}

/**
 * Delete a material
 * @param id Material ID
 * @returns Promise that resolves to a boolean indicating success
 */
export function deleteMaterial(id: string): Promise<boolean> {
  const materialExists = materialsData.list.some(m => m.id === id);
  return Promise.resolve(materialExists);
}

/**
 * Adjust inventory quantity for a material
 * @param id Material ID
 * @param quantity New quantity (absolute value, not relative adjustment)
 * @returns Promise that resolves to the updated material or null if not found
 */
export function updateInventoryQuantity(id: string, quantity: number): Promise<Material | null> {
  const material = materialsData.list.find(m => m.id === id);
  
  if (!material) {
    return Promise.resolve(null);
  }
  
  const now = new Date().toISOString().split('T')[0];
  
  const updatedMaterial: Material = {
    ...material,
    quantity,
    lastUpdated: now,
    status: material.status as MaterialStatus
  };
  
  return Promise.resolve(updatedMaterial);
}
