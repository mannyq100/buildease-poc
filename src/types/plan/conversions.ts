/**
 * Type Conversion Utilities
 * Convert between plan and modal type formats
 */

import { PlanTask, ModalTask } from './task';
import { PlanMaterial, ModalMaterial } from './material';
import { PlanPhase, ModalPhase } from './phase';

// === Type Conversion Utilities ===

/**
 * Convert Plan Task to Modal Task
 */
export function convertPlanTaskToModal(planTask: PlanTask): ModalTask {
  return {
    ...planTask,
    duration: typeof planTask.duration === 'string' 
      ? parseInt(planTask.duration) || 1 
      : 1,
    startDate: planTask.startDate || new Date().toISOString().substring(0, 10),
    endDate: planTask.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
  };
}

/**
 * Convert Modal Task to Plan Task
 */
export function convertModalTaskToPlan(modalTask: ModalTask): PlanTask {
  return {
    ...modalTask,
    duration: typeof modalTask.duration === 'number' 
      ? `${modalTask.duration} days` 
      : '1 day'
  };
}

/**
 * Convert Plan Material to Modal Material
 */
export function convertPlanMaterialToModal(planMaterial: PlanMaterial): ModalMaterial {
  return {
    ...planMaterial,
    price: planMaterial.unitPrice ?? planMaterial.totalPrice,
    orderDate: planMaterial.orderDate,
    type: planMaterial.type ?? 'Other',
    status: planMaterial.status ?? 'pending',
    phaseId: planMaterial.phaseId || ''
  };
}

/**
 * Convert Modal Material to Plan Material
 */
export function convertModalMaterialToPlan(modalMaterial: ModalMaterial): PlanMaterial {
  return {
    ...modalMaterial,
    unitPrice: modalMaterial.price ?? modalMaterial.unitPrice,
    totalPrice: modalMaterial.totalPrice ?? 
               (modalMaterial.price ?? modalMaterial.unitPrice ?? 0) * modalMaterial.quantity,
    orderDate: modalMaterial.orderDate ?? modalMaterial.purchaseDate,
    status: modalMaterial.status ?? 'pending'
  };
}

/**
 * Convert Plan Phase to Modal Phase
 */
export function convertPlanPhaseToModal(planPhase: PlanPhase): ModalPhase {
  return {
    id: planPhase.id,
    name: planPhase.name,
    description: planPhase.description,
    order: planPhase.order,
    startDate: planPhase.startDate || new Date().toISOString().substring(0, 10),
    endDate: planPhase.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
    status: planPhase.status,
    progress: planPhase.progress,
    tasks: planPhase.tasks,
    materials: planPhase.materials
  };
}

/**
 * Convert Modal Phase to Plan Phase
 */
export function convertModalPhaseToPlan(modalPhase: ModalPhase): Omit<PlanPhase, 'tasks' | 'materials'> {
  return {
    id: modalPhase.id,
    name: modalPhase.name,
    description: modalPhase.description,
    order: modalPhase.order,
    duration: '1 week', // Default duration
    startDate: modalPhase.startDate,
    endDate: modalPhase.endDate,
    status: modalPhase.status,
    progress: modalPhase.progress
  };
}