/**
 * Material Service
 * Provides methods for working with material and inventory data
 */
import { Material } from '@/types/material'
import apiClient from '@/lib/api-client'
import { createService } from './serviceFactory'
import * as mockMaterialService from '@/data/mock/services/materialService'

// Real API implementation
const realMaterialService = {
  /**
   * Get all materials in inventory
   * @returns Promise that resolves to an array of materials
   */
  getMaterials: async (): Promise<Material[]> => {
    const response = await apiClient.get<Material[]>('/materials')
    return response
  },

  /**
   * Get a material by ID
   * @param id Material ID
   * @returns Promise that resolves to a material or null if not found
   */
  getMaterialById: async (id: string): Promise<Material | null> => {
    try {
      const response = await apiClient.get<Material>(`/materials/${id}`)
      return response
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  /**
   * Get materials for a specific project
   * @param projectId Project ID
   * @returns Promise that resolves to an array of materials allocated to the project
   */
  getMaterialsByProject: async (projectId: string): Promise<Material[]> => {
    const response = await apiClient.get<Material[]>(`/projects/${projectId}/materials`)
    return response
  },

  /**
   * Get material categories for filtering
   * @returns Promise that resolves to an array of material categories
   */
  getMaterialCategories: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/materials/categories')
    return response
  },

  /**
   * Get material suppliers
   * @returns Promise that resolves to an array of material suppliers
   */
  getMaterialSuppliers: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/materials/suppliers')
    return response
  },

  /**
   * Get low stock materials that need reordering
   * @returns Promise that resolves to an array of materials below threshold
   */
  getLowStockMaterials: async (): Promise<Material[]> => {
    const response = await apiClient.get<Material[]>('/materials/low-stock')
    return response
  },

  /**
   * Create a new material in inventory
   * @param material Material data to create
   * @returns Promise that resolves to the created material
   */
  createMaterial: async (material: Omit<Material, 'id'>): Promise<Material> => {
    const response = await apiClient.post<Material>('/materials', material)
    return response
  },

  /**
   * Update an existing material
   * @param id Material ID
   * @param updates Partial material data to update
   * @returns Promise that resolves to the updated material or null if not found
   */
  updateMaterial: async (id: string, updates: Partial<Material>): Promise<Material | null> => {
    try {
      const response = await apiClient.put<Material>(`/materials/${id}`, updates)
      return response
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  /**
   * Delete a material from inventory
   * @param id Material ID
   * @returns Promise that resolves to a boolean indicating success
   */
  deleteMaterial: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/materials/${id}`)
      return true
    } catch (error) {
      return false
    }
  },

  /**
   * Adjust inventory quantity for a material
   * @param id Material ID
   * @param quantity New quantity (absolute value, not relative adjustment)
   * @returns Promise that resolves to the updated material or null if not found
   */
  updateInventoryQuantity: async (id: string, quantity: number): Promise<Material | null> => {
    try {
      const response = await apiClient.patch<Material>(
        `/materials/${id}/quantity`, 
        { quantity }
      )
      return response
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  }
}

// Export the appropriate implementation based on configuration
export const {
  getMaterials,
  getMaterialById,
  getMaterialsByProject,
  getMaterialCategories,
  getMaterialSuppliers,
  getLowStockMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  updateInventoryQuantity
} = createService<typeof realMaterialService>(
  'materials',
  mockMaterialService,
  realMaterialService
)
