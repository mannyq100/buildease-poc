/**
 * Type Guard Functions
 * Runtime type checking utilities
 */

import { PlanTask, ModalTask } from './task';
import { PlanMaterial, ModalMaterial } from './material';

// === Type Guards ===

export function isPlanTask(task: unknown): task is PlanTask {
  return task !== null && typeof task === 'object' && typeof (task as PlanTask).duration === 'string';
}

export function isModalTask(task: unknown): task is ModalTask {
  return task !== null && typeof task === 'object' && 
    (typeof (task as ModalTask).duration === 'number' || (task as ModalTask).duration === undefined);
}

export function isPlanMaterial(material: unknown): material is PlanMaterial {
  return material !== null && typeof material === 'object' && 
    !Object.prototype.hasOwnProperty.call(material, 'price');
}

export function isModalMaterial(material: unknown): material is ModalMaterial {
  return material !== null && typeof material === 'object' && 
    Object.prototype.hasOwnProperty.call(material, 'phaseId');
}