/**
 * usePlanState Hook
 * Centralized state management for AI-generated construction plans using useReducer
 * Replaces complex useState chains with a single source of truth
 */

import { useReducer, useCallback, useMemo } from 'react';
import { ConstructionPlan, Phase, Task, Material } from '@/data/mock/generatedPlan/planData';
import { v4 as uuidv4 } from 'uuid';

// Action Types
export enum PlanActionType {
  // Plan actions
  SET_PLAN = 'SET_PLAN',
  UPDATE_PLAN_STATUS = 'UPDATE_PLAN_STATUS',
  UPDATE_PLAN_DATES = 'UPDATE_PLAN_DATES',
  SET_GENERATING = 'SET_GENERATING',
  SET_SAVING = 'SET_SAVING',
  
  // Phase actions
  ADD_PHASE = 'ADD_PHASE',
  UPDATE_PHASE = 'UPDATE_PHASE',
  DELETE_PHASE = 'DELETE_PHASE',
  REORDER_PHASES = 'REORDER_PHASES',
  
  // Task actions
  ADD_TASK = 'ADD_TASK',
  UPDATE_TASK = 'UPDATE_TASK',
  DELETE_TASK = 'DELETE_TASK',
  
  // Material actions
  ADD_MATERIAL = 'ADD_MATERIAL',
  UPDATE_MATERIAL = 'UPDATE_MATERIAL',
  DELETE_MATERIAL = 'DELETE_MATERIAL',
  
  // UI state actions
  SET_ACTIVE_VIEW = 'SET_ACTIVE_VIEW',
  SET_LOADING_STATE = 'SET_LOADING_STATE'
}

// Action Interfaces
interface SetPlanAction {
  type: PlanActionType.SET_PLAN;
  payload: ConstructionPlan;
}

interface UpdatePlanStatusAction {
  type: PlanActionType.UPDATE_PLAN_STATUS;
  payload: 'draft' | 'final';
}

interface UpdatePlanDatesAction {
  type: PlanActionType.UPDATE_PLAN_DATES;
  payload: { startDate: string; endDate: string };
}

interface SetGeneratingAction {
  type: PlanActionType.SET_GENERATING;
  payload: boolean;
}

interface SetSavingAction {
  type: PlanActionType.SET_SAVING;
  payload: boolean;
}

interface AddPhaseAction {
  type: PlanActionType.ADD_PHASE;
  payload: Omit<Phase, 'id' | 'tasks' | 'materials'>;
}

interface UpdatePhaseAction {
  type: PlanActionType.UPDATE_PHASE;
  payload: { id: string; updates: Partial<Phase> };
}

interface DeletePhaseAction {
  type: PlanActionType.DELETE_PHASE;
  payload: string; // phase id
}

interface ReorderPhasesAction {
  type: PlanActionType.REORDER_PHASES;
  payload: { phaseId: string; direction: 'up' | 'down' };
}

interface AddTaskAction {
  type: PlanActionType.ADD_TASK;
  payload: { phaseId: string; task: Omit<Task, 'id'> };
}

interface UpdateTaskAction {
  type: PlanActionType.UPDATE_TASK;
  payload: { phaseId: string; taskId: string; updates: Partial<Task> };
}

interface DeleteTaskAction {
  type: PlanActionType.DELETE_TASK;
  payload: { phaseId: string; taskId: string };
}

interface AddMaterialAction {
  type: PlanActionType.ADD_MATERIAL;
  payload: { phaseId: string; material: Omit<Material, 'id'> };
}

interface UpdateMaterialAction {
  type: PlanActionType.UPDATE_MATERIAL;
  payload: { phaseId: string; materialId: string; updates: Partial<Material> };
}

interface DeleteMaterialAction {
  type: PlanActionType.DELETE_MATERIAL;
  payload: { phaseId: string; materialId: string };
}

interface SetActiveViewAction {
  type: PlanActionType.SET_ACTIVE_VIEW;
  payload: string;
}

interface SetLoadingStateAction {
  type: PlanActionType.SET_LOADING_STATE;
  payload: { key: string; value: boolean };
}

export type PlanAction = 
  | SetPlanAction
  | UpdatePlanStatusAction
  | UpdatePlanDatesAction
  | SetGeneratingAction
  | SetSavingAction
  | AddPhaseAction
  | UpdatePhaseAction
  | DeletePhaseAction
  | ReorderPhasesAction
  | AddTaskAction
  | UpdateTaskAction
  | DeleteTaskAction
  | AddMaterialAction
  | UpdateMaterialAction
  | DeleteMaterialAction
  | SetActiveViewAction
  | SetLoadingStateAction;

// State Interface
export interface PlanState {
  plan: ConstructionPlan | null;
  isGenerating: boolean;
  isSaving: boolean;
  activeView: string;
  loadingStates: Record<string, boolean>;
}

// Initial State
const initialState: PlanState = {
  plan: null,
  isGenerating: false,
  isSaving: false,
  activeView: 'overview',
  loadingStates: {}
};

// Reducer Function
function planReducer(state: PlanState, action: PlanAction): PlanState {
  switch (action.type) {
    case PlanActionType.SET_PLAN:
      return {
        ...state,
        plan: action.payload
      };

    case PlanActionType.UPDATE_PLAN_STATUS:
      if (!state.plan) return state;
      return {
        ...state,
        plan: {
          ...state.plan,
          status: action.payload,
          lastUpdated: new Date().toISOString()
        }
      };

    case PlanActionType.UPDATE_PLAN_DATES:
      if (!state.plan) return state;
      return {
        ...state,
        plan: {
          ...state.plan,
          startDate: action.payload.startDate,
          endDate: action.payload.endDate,
          lastUpdated: new Date().toISOString()
        }
      };

    case PlanActionType.SET_GENERATING:
      return {
        ...state,
        isGenerating: action.payload
      };

    case PlanActionType.SET_SAVING:
      return {
        ...state,
        isSaving: action.payload
      };

    case PlanActionType.ADD_PHASE: {
      if (!state.plan) return state;
      const newPhase: Phase = {
        ...action.payload,
        id: uuidv4(),
        tasks: [],
        materials: []
      };
      return {
        ...state,
        plan: {
          ...state.plan,
          phases: [...state.plan.phases, newPhase].sort((a, b) => a.order - b.order),
          lastUpdated: new Date().toISOString()
        }
      };
    }

    case PlanActionType.UPDATE_PHASE:
      if (!state.plan) return state;
      return {
        ...state,
        plan: {
          ...state.plan,
          phases: state.plan.phases.map(phase =>
            phase.id === action.payload.id
              ? { ...phase, ...action.payload.updates }
              : phase
          ),
          lastUpdated: new Date().toISOString()
        }
      };

    case PlanActionType.DELETE_PHASE: {
      if (!state.plan) return state;
      const remainingPhases = state.plan.phases.filter(phase => phase.id !== action.payload);
      
      // Reorder remaining phases to maintain sequential order numbers
      const reorderedPhases = remainingPhases.map((phase, index) => ({
        ...phase,
        order: index + 1
      }));
      
      return {
        ...state,
        plan: {
          ...state.plan,
          phases: reorderedPhases,
          lastUpdated: new Date().toISOString()
        }
      };
    }

    case PlanActionType.REORDER_PHASES: {
      if (!state.plan) return state;
      const phases = [...state.plan.phases];
      const phaseIndex = phases.findIndex(p => p.id === action.payload.phaseId);
      
      if (phaseIndex === -1) return state;
      
      const newIndex = action.payload.direction === 'up' ? phaseIndex - 1 : phaseIndex + 1;
      
      if (newIndex < 0 || newIndex >= phases.length) return state;
      
      // Swap phases
      [phases[phaseIndex], phases[newIndex]] = [phases[newIndex], phases[phaseIndex]];
      
      // Correctly update order numbers after swap
      phases[phaseIndex].order = newIndex + 1;
      phases[newIndex].order = phaseIndex + 1;
      
      // Sort phases by order to maintain consistency
      const sortedPhases = phases.sort((a, b) => a.order - b.order);
      
      return {
        ...state,
        plan: {
          ...state.plan,
          phases: sortedPhases,
          lastUpdated: new Date().toISOString()
        }
      };
    }

    case PlanActionType.ADD_TASK: {
      if (!state.plan) return state;
      const newTask: Task = {
        ...action.payload.task,
        id: uuidv4()
      };
      return {
        ...state,
        plan: {
          ...state.plan,
          phases: state.plan.phases.map(phase =>
            phase.id === action.payload.phaseId
              ? { ...phase, tasks: [...phase.tasks, newTask] }
              : phase
          ),
          lastUpdated: new Date().toISOString()
        }
      };
    }

    case PlanActionType.UPDATE_TASK:
      if (!state.plan) return state;
      return {
        ...state,
        plan: {
          ...state.plan,
          phases: state.plan.phases.map(phase =>
            phase.id === action.payload.phaseId
              ? {
                  ...phase,
                  tasks: phase.tasks.map(task =>
                    task.id === action.payload.taskId
                      ? { ...task, ...action.payload.updates }
                      : task
                  )
                }
              : phase
          ),
          lastUpdated: new Date().toISOString()
        }
      };

    case PlanActionType.DELETE_TASK:
      if (!state.plan) return state;
      return {
        ...state,
        plan: {
          ...state.plan,
          phases: state.plan.phases.map(phase =>
            phase.id === action.payload.phaseId
              ? {
                  ...phase,
                  tasks: phase.tasks.filter(task => task.id !== action.payload.taskId)
                }
              : phase
          ),
          lastUpdated: new Date().toISOString()
        }
      };

    case PlanActionType.ADD_MATERIAL: {
      if (!state.plan) return state;
      const newMaterial: Material = {
        ...action.payload.material,
        id: uuidv4()
      };
      return {
        ...state,
        plan: {
          ...state.plan,
          phases: state.plan.phases.map(phase =>
            phase.id === action.payload.phaseId
              ? { ...phase, materials: [...phase.materials, newMaterial] }
              : phase
          ),
          lastUpdated: new Date().toISOString()
        }
      };
    }

    case PlanActionType.UPDATE_MATERIAL:
      if (!state.plan) return state;
      return {
        ...state,
        plan: {
          ...state.plan,
          phases: state.plan.phases.map(phase =>
            phase.id === action.payload.phaseId
              ? {
                  ...phase,
                  materials: phase.materials.map(material =>
                    material.id === action.payload.materialId
                      ? { ...material, ...action.payload.updates }
                      : material
                  )
                }
              : phase
          ),
          lastUpdated: new Date().toISOString()
        }
      };

    case PlanActionType.DELETE_MATERIAL:
      if (!state.plan) return state;
      return {
        ...state,
        plan: {
          ...state.plan,
          phases: state.plan.phases.map(phase =>
            phase.id === action.payload.phaseId
              ? {
                  ...phase,
                  materials: phase.materials.filter(material => material.id !== action.payload.materialId)
                }
              : phase
          ),
          lastUpdated: new Date().toISOString()
        }
      };

    case PlanActionType.SET_ACTIVE_VIEW:
      return {
        ...state,
        activeView: action.payload
      };

    case PlanActionType.SET_LOADING_STATE:
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          [action.payload.key]: action.payload.value
        }
      };

    default:
      return state;
  }
}

// Custom Hook
export function usePlanState(initialPlan?: ConstructionPlan) {
  const [state, dispatch] = useReducer(planReducer, {
    ...initialState,
    plan: initialPlan || null
  });

  // Action Creators with useCallback for performance
  const setPlan = useCallback((plan: ConstructionPlan) => {
    dispatch({ type: PlanActionType.SET_PLAN, payload: plan });
  }, []);

  const updatePlanStatus = useCallback((status: 'draft' | 'final') => {
    dispatch({ type: PlanActionType.UPDATE_PLAN_STATUS, payload: status });
    // Toast will be handled by the calling component to avoid duplicates
  }, []);

  const updatePlanDates = useCallback((startDate: string, endDate: string) => {
    dispatch({ type: PlanActionType.UPDATE_PLAN_DATES, payload: { startDate, endDate } });
    // Toast will be handled by the calling component to avoid duplicates
  }, []);

  const setGenerating = useCallback((generating: boolean) => {
    dispatch({ type: PlanActionType.SET_GENERATING, payload: generating });
  }, []);

  const setSaving = useCallback((saving: boolean) => {
    dispatch({ type: PlanActionType.SET_SAVING, payload: saving });
  }, []);

  // Phase actions
  const addPhase = useCallback((phase: Omit<Phase, 'id' | 'tasks' | 'materials'>) => {
    dispatch({ type: PlanActionType.ADD_PHASE, payload: phase });
    // Toast will be handled by the calling component to avoid duplicates
  }, []);

  const updatePhase = useCallback((id: string, updates: Partial<Phase>) => {
    dispatch({ type: PlanActionType.UPDATE_PHASE, payload: { id, updates } });
    // Toast will be handled by the calling component to avoid duplicates
  }, []);

  const deletePhase = useCallback((id: string) => {
    dispatch({ type: PlanActionType.DELETE_PHASE, payload: id });
    // Toast will be handled by the calling component to avoid duplicates
  }, []);

  const reorderPhase = useCallback((phaseId: string, direction: 'up' | 'down') => {
    dispatch({ type: PlanActionType.REORDER_PHASES, payload: { phaseId, direction } });
    // Toast will be handled by the calling component to avoid duplicates
  }, []);

  // Task actions
  const addTask = useCallback((phaseId: string, task: Omit<Task, 'id'>) => {
    dispatch({ type: PlanActionType.ADD_TASK, payload: { phaseId, task } });
    // Toast will be handled by the calling component to avoid duplicates
  }, []);

  const updateTask = useCallback((phaseId: string, taskId: string, updates: Partial<Task>) => {
    dispatch({ type: PlanActionType.UPDATE_TASK, payload: { phaseId, taskId, updates } });
    // Toast will be handled by the calling component to avoid duplicates
  }, []);

  const deleteTask = useCallback((phaseId: string, taskId: string) => {
    dispatch({ type: PlanActionType.DELETE_TASK, payload: { phaseId, taskId } });
    // Toast will be handled by the calling component to avoid duplicates
  }, []);

  // Material actions
  const addMaterial = useCallback((phaseId: string, material: Omit<Material, 'id'>) => {
    dispatch({ type: PlanActionType.ADD_MATERIAL, payload: { phaseId, material } });
    // Toast will be handled by the calling component to avoid duplicates
  }, []);

  const updateMaterial = useCallback((phaseId: string, materialId: string, updates: Partial<Material>) => {
    dispatch({ type: PlanActionType.UPDATE_MATERIAL, payload: { phaseId, materialId, updates } });
    // Toast will be handled by the calling component to avoid duplicates
  }, []);

  const deleteMaterial = useCallback((phaseId: string, materialId: string) => {
    dispatch({ type: PlanActionType.DELETE_MATERIAL, payload: { phaseId, materialId } });
    // Toast will be handled by the calling component to avoid duplicates
  }, []);

  // UI actions
  const setActiveView = useCallback((view: string) => {
    dispatch({ type: PlanActionType.SET_ACTIVE_VIEW, payload: view });
  }, []);

  const setLoadingState = useCallback((key: string, value: boolean) => {
    dispatch({ type: PlanActionType.SET_LOADING_STATE, payload: { key, value } });
  }, []);

  // Create stable actions object to prevent unnecessary re-renders
  const actions = useMemo(() => ({
    setPlan,
    updatePlanStatus,
    updatePlanDates,
    setGenerating,
    setSaving,
    addPhase,
    updatePhase,
    deletePhase,
    reorderPhase,
    addTask,
    updateTask,
    deleteTask,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    setActiveView,
    setLoadingState
  }), [
    setPlan,
    updatePlanStatus,
    updatePlanDates,
    setGenerating,
    setSaving,
    addPhase,
    updatePhase,
    deletePhase,
    reorderPhase,
    addTask,
    updateTask,
    deleteTask,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    setActiveView,
    setLoadingState
  ]);

  return {
    state,
    actions,
    // Derived state for convenience
    plan: state.plan,
    isGenerating: state.isGenerating,
    isSaving: state.isSaving,
    activeView: state.activeView,
    loadingStates: state.loadingStates
  };
}