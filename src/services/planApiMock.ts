/**
 * Mock Plan API Service
 * Simulates async operations for testing optimistic updates
 * In production, these would be real API calls
 */

import { PlanPhase, PlanTask, PlanMaterial } from '@/types/plan/index';

// Simulate network delay
const delay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate random failures for testing
const shouldFail = (failureRate: number = 0.1) => Math.random() < failureRate;

export class PlanApiMock {
  // === Phase Operations ===
  
  static async addPhase(phaseData: Omit<PlanPhase, 'id' | 'tasks' | 'materials'>): Promise<PlanPhase> {
    await delay(800);
    
    if (shouldFail(0.05)) { // 5% failure rate
      throw new Error('Failed to create phase');
    }

    const newPhase: PlanPhase = {
      ...phaseData,
      id: `phase-${Date.now()}`,
      tasks: [],
      materials: []
    };

    return newPhase;
  }

  static async updatePhase(phaseId: string, phaseData: Partial<PlanPhase>): Promise<PlanPhase> {
    await delay(600);
    
    if (shouldFail(0.08)) { // 8% failure rate
      throw new Error('Failed to update phase');
    }

    // In real app, this would update the phase on the server and return the result
    const updatedPhase: PlanPhase = {
      id: phaseId,
      name: phaseData.name || 'Updated Phase',
      description: phaseData.description || '',
      order: phaseData.order || 1,
      startDate: phaseData.startDate || new Date().toISOString().substring(0, 10),
      endDate: phaseData.endDate || new Date().toISOString().substring(0, 10),
      status: phaseData.status || 'PLANNING',
      progress: phaseData.progress || 0,
      tasks: phaseData.tasks || [],
      materials: phaseData.materials || []
    };

    return updatedPhase;
  }

  static async deletePhase(phaseId: string): Promise<void> {
    await delay(500);
    
    if (shouldFail(0.1)) { // 10% failure rate
      throw new Error('Failed to delete phase');
    }

    // In real app, this would delete the phase on the server
  }

  static async reorderPhase(oldIndex: number, newIndex: number, phases: PlanPhase[]): Promise<PlanPhase[]> {
    await delay(400);
    
    if (shouldFail(0.05)) {
      throw new Error('Failed to reorder phase');
    }

    // Create a new array with the reordered phases
    const reorderedPhases = [...phases];
    const [movedPhase] = reorderedPhases.splice(oldIndex, 1);
    reorderedPhases.splice(newIndex, 0, movedPhase);
    
    // Update the order property for all phases
    const updatedPhases = reorderedPhases.map((phase, index) => ({
      ...phase,
      order: index + 1
    }));

    return updatedPhases;
  }

  // === Task Operations ===
  
  static async addTask(phaseId: string, taskData: Omit<PlanTask, 'id'>): Promise<PlanTask> {
    await delay(700);
    
    if (shouldFail(0.06)) {
      throw new Error('Failed to create task');
    }

    const newTask: PlanTask = {
      ...taskData,
      id: `task-${Date.now()}`
    };

    return newTask;
  }

  static async updateTask(phaseId: string, taskId: string, taskData: Partial<PlanTask>): Promise<PlanTask> {
    await delay(500);
    
    if (shouldFail(0.07)) {
      throw new Error('Failed to update task');
    }

    const updatedTask: PlanTask = {
      id: taskId,
      name: taskData.name || 'Updated Task',
      description: taskData.description || '',
      status: taskData.status || 'pending',
      startDate: taskData.startDate || new Date().toISOString().substring(0, 10),
      endDate: taskData.endDate || new Date().toISOString().substring(0, 10),
      assignedTo: taskData.assignedTo || '',
      progress: taskData.progress || 0,
      dependencies: taskData.dependencies || [],
      duration: taskData.duration || '1 day'
    };

    return updatedTask;
  }

  static async deleteTask(phaseId: string, taskId: string): Promise<void> {
    await delay(400);
    
    if (shouldFail(0.08)) {
      throw new Error('Failed to delete task');
    }

    // Task deleted successfully
  }

  // === Material Operations ===
  
  static async addMaterial(phaseId: string, materialData: Omit<PlanMaterial, 'id'>): Promise<PlanMaterial> {
    await delay(600);
    
    if (shouldFail(0.05)) {
      throw new Error('Failed to create material');
    }

    const newMaterial: PlanMaterial = {
      ...materialData,
      id: `material-${Date.now()}`
    };

    return newMaterial;
  }

  static async updateMaterial(phaseId: string, materialId: string, materialData: Partial<PlanMaterial>): Promise<PlanMaterial> {
    await delay(500);
    
    if (shouldFail(0.06)) {
      throw new Error('Failed to update material');
    }

    const updatedMaterial: PlanMaterial = {
      id: materialId,
      name: materialData.name || 'Updated Material',
      description: materialData.description || '',
      quantity: materialData.quantity || 1,
      unit: materialData.unit || 'item',
      cost: materialData.cost || 0,
      vendor: materialData.vendor || '',
      category: materialData.category || 'Other'
    };

    return updatedMaterial;
  }

  static async deleteMaterial(phaseId: string, materialId: string): Promise<void> {
    await delay(400);
    
    if (shouldFail(0.07)) {
      throw new Error('Failed to delete material');
    }

    // Material deleted successfully
  }

  // === Plan-level Operations ===
  
  static async updatePlanDates(startDate: string, endDate: string): Promise<void> {
    await delay(800);
    
    if (shouldFail(0.05)) {
      throw new Error('Failed to update plan dates');
    }

    // Plan dates updated successfully
  }
}