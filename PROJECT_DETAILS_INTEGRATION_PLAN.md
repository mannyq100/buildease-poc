# ProjectDetails Page Integration Plan

## 📋 Current State Analysis

### ✅ **Existing Modal Infrastructure**
- **PlanModalManager**: Complete modal system with 6 modals (Phase, Task, Material, DateEdit, Distribute, Confirmation)
- **Additional Modals**: BudgetModal, TeamModal already exist
- **State Management**: Zustand-based modalStore with hooks
- **Form Validation**: React Hook Form + Zod schemas implemented
- **API Integration**: Mock API services with optimistic updates

### ✅ **Existing Components**
- **TimelineView**: Drag-and-drop sortable phases with virtualization
- **QuickActionBar**: Responsive action button system
- **Various Views**: OverviewView, BudgetView, MaterialsView, TeamView, DocumentsView
- **Phase Management**: PhaseCard, SortableTimelinePhase components

## 🎯 Integration Strategy

### **Phase 1: Modal Integration** (2-3 hours)
1. **Import PlanModalManager** into ProjectDetails.tsx
2. **Add modal handlers ref** similar to GeneratedPlan pattern
3. **Connect QuickActionBar** actions to modal handlers
4. **Wire up DetailsAccordion** "All Phases & Timeline" to TimelineView

### **Phase 2: Data Flow** (2-3 hours)
1. **Adapt project data** to plan data format for modal compatibility
2. **Implement save handlers** for phase/task CRUD operations
3. **Add optimistic updates** using existing usePlanActionsOptimistic
4. **Connect to project API** (replace mock APIs)

### **Phase 3: UI Integration** (2-3 hours)
1. **Replace DetailsAccordion content** with actual functional views
2. **Add TimelineView** to "All Phases & Timeline" section
3. **Integrate BudgetView** to budget section
4. **Add TeamView** to team management section

## 🔧 Implementation Details

### **File Modifications Needed**

#### **1. ProjectDetails.tsx**
```typescript
// Add imports
import { PlanModalManager, PlanModalManagerHandlers } from '@/components/plan'
import { TimelineView, BudgetView, TeamView } from '@/components/plan'
import { usePlanActionsOptimistic } from '@/hooks/usePlanActionsOptimistic'

// Add modal handlers ref
const modalHandlersRef = useRef<PlanModalManagerHandlers>({} as PlanModalManagerHandlers)

// Update QuickActionBar actions
const quickActions = [
  {
    id: "add-phase",
    label: "Add Phase", 
    icon: <PlusCircle className="h-4 w-4" />,
    priority: "high" as const,
    onClick: () => modalHandlersRef.current?.openPhaseModal('', true)
  },
  // ... other actions
]

// Add PlanModalManager at bottom
<PlanModalManager 
  plan={adaptedProjectData}
  modalHandlersRef={modalHandlersRef}
  onSavePhase={handleSavePhase}
  onSaveTask={handleSaveTask}
  // ... other handlers
/>
```

#### **2. Data Adaptation Layer**
```typescript
// utils/projectDataAdapter.ts
export const adaptProjectToPlan = (project: Project): Plan => {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    phases: project.phases.map(adaptPhase),
    timeline: project.timeline,
    // ... other mappings
  }
}
```

#### **3. DetailsAccordion Content Updates**
```typescript
// Replace static content with functional components
{
  id: "all-phases",
  title: "All Phases & Timeline",
  content: (
    <TimelineView 
      plan={adaptedProjectData}
      onEditPhase={(phaseId) => modalHandlersRef.current?.openPhaseModal(phaseId)}
      onAddTask={(phaseId) => modalHandlersRef.current?.openTaskModal(phaseId, '', true)}
      // ... other handlers
    />
  )
}
```

### **Required Hooks & Services**

#### **1. useProjectMutations.ts**
```typescript
export const useProjectMutations = () => {
  const updateProject = useMutation(projectApi.update)
  const addPhase = useMutation(phaseApi.create) 
  const updatePhase = useMutation(phaseApi.update)
  const addTask = useMutation(taskApi.create)
  // ... other mutations
  
  return { updateProject, addPhase, updatePhase, addTask }
}
```

#### **2. projectApi.ts Integration**
```typescript
// Replace mock APIs in optimistic actions
const optimisticActions = usePlanActionsOptimistic({
  apiActions: {
    addPhase: projectApi.addPhase,
    updatePhase: projectApi.updatePhase,
    deletePhase: projectApi.deletePhase,
    addTask: projectApi.addTask,
    // ... real API endpoints
  }
})
```

## 🚀 Step-by-Step Implementation Guide

### **STEP 1: Import and Setup Modal Infrastructure**

**File: `/src/pages/ProjectDetails.tsx`**

1. Add imports at top of file:
```typescript
import { useRef } from "react";
import { PlanModalManager, PlanModalManagerHandlers } from "@/components/plan";
import { usePlanActionsOptimistic } from "@/hooks/usePlanActionsOptimistic";
```

2. Add modal handlers ref inside ProjectDetails function:
```typescript
const modalHandlersRef = useRef<PlanModalManagerHandlers>({} as PlanModalManagerHandlers);
```

3. Add PlanModalManager component before closing div:
```typescript
{/* Modal Manager */}
<PlanModalManager
  plan={project} // Will need adapter later
  isSaving={false}
  onSavePhase={(phaseData) => console.log('Save phase:', phaseData)}
  onSaveTask={(taskData) => console.log('Save task:', taskData)}
  onSaveMaterial={(materialData) => console.log('Save material:', materialData)}
  onSaveDates={(dateRange) => console.log('Save dates:', dateRange)}
  onDistribute={() => console.log('Distribute')}
  modalHandlersRef={modalHandlersRef}
/>
```

### **STEP 2: Connect QuickActionBar to Modals**

**File: `/src/pages/ProjectDetails.tsx`**

Update quickActions array:
```typescript
const quickActions = [
  {
    id: "add-phase",
    label: "Add Phase",
    icon: <PlusCircle className="h-4 w-4" />,
    priority: "high" as const,
    onClick: () => modalHandlersRef.current?.openPhaseModal('', true)
  },
  {
    id: "edit-project", 
    label: "Edit Project",
    icon: <Edit className="h-4 w-4" />,
    priority: "medium" as const,
    variant: "outline" as const,
    onClick: () => console.log('Edit project') // TODO: implement
  },
  {
    id: "schedule-meeting",
    label: "Schedule Meeting", 
    icon: <Calendar className="h-4 w-4" />,
    priority: "low" as const,
    variant: "ghost" as const,
    onClick: () => console.log('Schedule meeting') // TODO: implement
  },
];
```

### **STEP 3: Create Data Adapter**

**File: `/src/utils/projectDataAdapter.ts`** (Create new file)

```typescript
import type { Project, Phase, Task } from '@/types/project';
import type { Plan, Phase as PlanPhase, Task as PlanTask } from '@/types/plan';

export const adaptProjectToPlan = (project: Project): Plan => {
  return {
    id: project.id,
    name: project.name,
    description: project.description || '',
    status: project.status as 'draft' | 'final',
    phases: project.phases.map(adaptPhaseToPlanPhase),
    timeline: {
      start: project.timeline?.planned_start || new Date().toISOString(),
      end: project.timeline?.planned_end || new Date().toISOString(),
      duration: 0 // Calculate from phases
    },
    metadata: {
      version: '1.0',
      lastModified: new Date().toISOString(),
      createdBy: 'system'
    }
  };
};

const adaptPhaseToPlanPhase = (phase: Phase): PlanPhase => {
  return {
    id: phase.id,
    name: phase.name,
    description: phase.description || '',
    status: phase.status as 'planning' | 'in-progress' | 'completed' | 'on-hold',
    order: phase.order || 0,
    startDate: phase.startDate || new Date().toISOString(),
    endDate: phase.endDate || new Date().toISOString(),
    duration: 0, // Calculate
    tasks: phase.tasks.map(adaptTaskToPlanTask),
    materials: [], // Add if exists
    dependencies: []
  };
};

const adaptTaskToPlanTask = (task: Task): PlanTask => {
  return {
    id: task.id,
    name: task.name,
    description: task.description || '',
    status: task.status as 'not-started' | 'in-progress' | 'completed' | 'on-hold',
    assignee: task.assignee || '',
    startDate: task.startDate || new Date().toISOString(),
    endDate: task.endDate || new Date().toISOString(),
    progress: task.progress || 0,
    priority: task.priority as 'high' | 'medium' | 'low' || 'medium',
    dependencies: []
  };
};
```

### **STEP 4: Update ProjectDetails with Adapter**

**File: `/src/pages/ProjectDetails.tsx`**

1. Import adapter:
```typescript
import { adaptProjectToPlan } from "@/utils/projectDataAdapter";
```

2. Create adapted project data:
```typescript
const adaptedProject = useMemo(() => adaptProjectToPlan(project), [project]);
```

3. Update PlanModalManager to use adapted data:
```typescript
<PlanModalManager
  plan={adaptedProject}
  // ... rest of props
/>
```

### **STEP 5: Implement Save Handlers**

**File: `/src/pages/ProjectDetails.tsx`**

1. Add save handler functions:
```typescript
const handleSavePhase = useCallback((phaseData: any) => {
  console.log('Saving phase:', phaseData);
  // TODO: Implement actual save logic
  toast.success('Phase saved successfully');
}, []);

const handleSaveTask = useCallback((taskData: any) => {
  console.log('Saving task:', taskData);
  // TODO: Implement actual save logic  
  toast.success('Task saved successfully');
}, []);

const handleSaveMaterial = useCallback((materialData: any) => {
  console.log('Saving material:', materialData);
  // TODO: Implement actual save logic
  toast.success('Material saved successfully');
}, []);

const handleSaveDates = useCallback((dateRange: any) => {
  console.log('Saving dates:', dateRange);
  // TODO: Implement actual save logic
  toast.success('Dates updated successfully');
}, []);

const handleDistribute = useCallback(() => {
  console.log('Distributing plan');
  // TODO: Implement actual distribute logic
  toast.success('Plan distributed successfully');
}, []);
```

2. Add toast import:
```typescript
import { toast } from "sonner";
```

3. Update PlanModalManager with handlers:
```typescript
<PlanModalManager
  plan={adaptedProject}
  isSaving={false}
  onSavePhase={handleSavePhase}
  onSaveTask={handleSaveTask}
  onSaveMaterial={handleSaveMaterial}
  onSaveDates={handleSaveDates}
  onDistribute={handleDistribute}
  modalHandlersRef={modalHandlersRef}
/>
```

### **STEP 6: Add TimelineView to DetailsAccordion**

**File: `/src/pages/ProjectDetails.tsx`**

1. Import TimelineView:
```typescript
import { TimelineView } from "@/components/plan";
```

2. Update accordionSections array:
```typescript
const accordionSections = [
  {
    id: "all-phases",
    title: "All Phases & Timeline",
    badge: project.phases.length,
    icon: <Clock className="h-4 w-4" />,
    priority: "high" as const,
    content: (
      <TimelineView
        plan={adaptedProject}
        onEditPhase={(phaseId) => modalHandlersRef.current?.openPhaseModal(phaseId)}
        onAddTask={(phaseId) => modalHandlersRef.current?.openTaskModal(phaseId, '', true)}
        onEditTask={(phaseId, taskId) => modalHandlersRef.current?.openTaskModal(phaseId, taskId)}
        onEditDates={(type, phaseId) => modalHandlersRef.current?.openDateModal(type, phaseId)}
        onReorderPhase={(activeId, overId) => console.log('Reorder:', activeId, overId)}
      />
    ),
  },
  // ... other sections remain the same
];
```

### **STEP 7: Test Basic Functionality**

1. **Test Add Phase Modal**:
   - Click "Add Phase" button
   - Verify modal opens
   - Fill form and submit
   - Check console for save log

2. **Test Timeline View**:
   - Open "All Phases & Timeline" accordion
   - Verify phases display correctly
   - Test phase editing by clicking edit button
   - Test task creation by clicking add task

3. **Test Data Flow**:
   - Verify adapted project data displays correctly
   - Check that all modal forms pre-populate with correct data
   - Ensure save handlers are called with proper data

### **STEP 8: Add Real API Integration**

**File: `/src/services/projectApi.ts`** (Enhance existing or create)

```typescript
export const projectApi = {
  addPhase: async (projectId: string, phaseData: any) => {
    // Implement real API call
    const response = await fetch(`/api/projects/${projectId}/phases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(phaseData)
    });
    return response.json();
  },
  
  updatePhase: async (projectId: string, phaseId: string, phaseData: any) => {
    // Implement real API call
    const response = await fetch(`/api/projects/${projectId}/phases/${phaseId}`, {
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(phaseData)
    });
    return response.json();
  },
  
  // Add other CRUD operations...
};
```

### **STEP 9: Implement Optimistic Updates**

**File: `/src/pages/ProjectDetails.tsx`**

1. Import optimistic actions hook:
```typescript
import { usePlanActionsOptimistic } from "@/hooks/usePlanActionsOptimistic";
import { projectApi } from "@/services/projectApi";
```

2. Setup optimistic actions:
```typescript
const optimisticActions = usePlanActionsOptimistic({
  phases: adaptedProject.phases,
  apiActions: {
    addPhase: (phaseData) => projectApi.addPhase(project.id, phaseData),
    updatePhase: (phaseData) => projectApi.updatePhase(project.id, phaseData.id, phaseData),
    deletePhase: (phaseId) => projectApi.deletePhase(project.id, phaseId),
    addTask: (taskData) => projectApi.addTask(project.id, taskData),
    updateTask: (taskData) => projectApi.updateTask(project.id, taskData.id, taskData),
    // ... other API calls
  },
  setPhaseLoading: () => {},
  setTaskLoading: () => {},
  setMaterialLoading: () => {},
  setOperationLoading: () => {},
}, {
  enableOptimisticUpdates: true,
  enableToasts: true,
  rollbackDelay: 3000
});
```

3. Update save handlers to use optimistic actions:
```typescript
const handleSavePhase = useCallback((phaseData: any) => {
  optimisticActions.handleSavePhase(phaseData);
}, [optimisticActions]);

const handleSaveTask = useCallback((taskData: any) => {
  optimisticActions.handleSaveTask(taskData);
}, [optimisticActions]);
```

### **STEP 10: Final Polish and Testing**

1. **Add Loading States**:
   - Show loading indicators during API calls
   - Disable buttons while saving
   - Add skeleton loaders for timeline

2. **Error Handling**:
   - Wrap in error boundaries
   - Show user-friendly error messages
   - Implement retry logic

3. **Type Safety**:
   - Ensure all TypeScript types are correct
   - Remove any `any` types
   - Add proper interfaces

4. **Responsive Design**:
   - Test on mobile devices
   - Ensure modals work on small screens
   - Verify timeline is touch-friendly

5. **Accessibility**:
   - Add proper ARIA labels
   - Ensure keyboard navigation works
   - Test with screen readers

## 📊 Benefits of This Approach

- **Reuse Existing Infrastructure**: 90% of modal functionality already exists
- **Minimal Code Changes**: Leverage existing components and patterns
- **Consistent UX**: Same modal experience across GeneratedPlan and ProjectDetails
- **Maintainable**: Single source of truth for modal logic
- **Scalable**: Easy to add new modals or modify existing ones

## ⚠️ Considerations

1. **Data Format Compatibility**: Need adapter layer between Project and Plan types
2. **API Integration**: Replace mock APIs with real project endpoints  
3. **State Synchronization**: Ensure project state updates reflect in UI immediately
4. **Permission Handling**: Add role-based access control for different user types

This approach leverages the robust modal system already built while providing a seamless integration with minimal development effort.