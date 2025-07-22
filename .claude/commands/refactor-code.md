# Refactor Code

Code refactoring guide for the BuildEase construction management platform.

## Instructions

You are refactoring code in the BuildEase platform to improve maintainability, performance, and code quality. Follow these systematic approaches.

### Refactoring Principles

1. **Keep files under 400 lines** - Split when exceeded
2. **Extract reusable logic** - DRY (Don't Repeat Yourself)
3. **Improve type safety** - Use TypeScript effectively
4. **Enhance readability** - Clear naming and structure
5. **Maintain functionality** - Refactor without breaking features

### Common Refactoring Patterns

#### 1. Extract Custom Hooks
**Before: Logic scattered in components**
```typescript
// Component with mixed concerns
function ProjectCard({ project }: { project: Project }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(project);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSave = async () => {
    setIsLoading(true);
    try {
      await projectService.updateProject(project.id, formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Complex component logic...
}
```

**After: Extracted custom hook**
```typescript
// Custom hook for project editing logic
export function useProjectEditor(project: Project) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(project);
  const updateProject = useUpdateProject();

  const startEditing = useCallback(() => {
    setIsEditing(true);
    setFormData(project);
  }, [project]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setFormData(project);
  }, [project]);

  const saveChanges = useCallback(() => {
    updateProject.mutate(
      { id: project.id, data: formData },
      {
        onSuccess: () => setIsEditing(false),
      }
    );
  }, [project.id, formData, updateProject]);

  return {
    isEditing,
    formData,
    setFormData,
    isLoading: updateProject.isPending,
    startEditing,
    cancelEditing,
    saveChanges,
  };
}

// Clean component
function ProjectCard({ project }: { project: Project }) {
  const editor = useProjectEditor(project);

  return (
    <Card>
      {editor.isEditing ? (
        <ProjectEditForm
          data={editor.formData}
          onChange={editor.setFormData}
          onSave={editor.saveChanges}
          onCancel={editor.cancelEditing}
          isLoading={editor.isLoading}
        />
      ) : (
        <ProjectDisplay
          project={project}
          onEdit={editor.startEditing}
        />
      )}
    </Card>
  );
}
```

#### 2. Extract Service Functions
**Before: API logic in components**
```typescript
// Component with embedded API calls
function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('be_project')
          .select(`
            *,
            phases:be_phase(count),
            materials:be_material(count)
          `)
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setProjects(data || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, [user.id]);

  // Component rendering...
}
```

**After: Service layer with React Query**
```typescript
// Service function
export class ProjectService {
  async getProjectsWithCounts(userId: string): Promise<ProjectWithCounts[]> {
    const { data, error } = await supabase
      .from('be_project')
      .select(`
        *,
        phase_count:be_phase(count),
        material_count:be_material(count)
      `)
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch projects: ${error.message}`);
    return data || [];
  }
}

// Query hook
export function useProjectsWithCounts(userId: string) {
  return useQuery({
    queryKey: ['projects', 'with-counts', userId],
    queryFn: () => projectService.getProjectsWithCounts(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Clean component
function ProjectsList() {
  const { data: projects, isLoading } = useProjectsWithCounts(user.id);

  if (isLoading) return <ProjectsListSkeleton />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects?.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

#### 3. Component Composition
**Before: Monolithic component**
```typescript
// Large, hard-to-maintain component
function ProjectDetails({ projectId }: { projectId: string }) {
  // 300+ lines of mixed logic
  const [activeTab, setActiveTab] = useState('overview');
  const [project, setProject] = useState<Project | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  
  // Multiple useEffects for different data
  // Complex rendering logic
  // Mixed UI and business logic
  
  return (
    <div className="complex-layout">
      {/* Hundreds of lines of JSX */}
    </div>
  );
}
```

**After: Composed components**
```typescript
// Main component focused on layout
function ProjectDetails({ projectId }: { projectId: string }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex flex-col h-full">
      <ProjectHeader projectId={projectId} />
      
      <ProjectTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 p-6">
        {activeTab === 'overview' && <ProjectOverviewTab projectId={projectId} />}
        {activeTab === 'phases' && <ProjectPhasesTab projectId={projectId} />}
        {activeTab === 'materials' && <ProjectMaterialsTab projectId={projectId} />}
        {activeTab === 'budget' && <ProjectBudgetTab projectId={projectId} />}
      </div>
    </div>
  );
}

// Focused sub-components
function ProjectOverviewTab({ projectId }: { projectId: string }) {
  const { data: project } = useProject(projectId);
  
  if (!project) return <Skeleton />;
  
  return (
    <div className="space-y-6">
      <ProjectStatusCard project={project} />
      <ProjectProgressCard project={project} />
      <RecentActivityCard projectId={projectId} />
    </div>
  );
}
```

#### 4. Extract Utility Functions
**Before: Repeated logic**
```typescript
// Repeated formatting logic across components
function ProjectCard({ project }) {
  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Component logic...
}
```

**After: Centralized utilities**
```typescript
// src/utils/format.ts
export const formatters = {
  currency: (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  },

  date: (date: string | Date, options?: Intl.DateTimeFormatOptions) => {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    
    return new Date(date).toLocaleDateString('en-US', {
      ...defaultOptions,
      ...options,
    });
  },

  duration: (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffInDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 1) return '1 day';
    if (diffInDays < 7) return `${diffInDays} days`;
    if (diffInDays < 30) return `${Math.ceil(diffInDays / 7)} weeks`;
    return `${Math.ceil(diffInDays / 30)} months`;
  },
};

// Clean component usage
function ProjectCard({ project }) {
  return (
    <Card>
      <h3>{project.name}</h3>
      <p>Budget: {formatters.currency(project.budget)}</p>
      <p>Created: {formatters.date(project.created_at)}</p>
      <p>Duration: {formatters.duration(project.start_date, project.end_date)}</p>
    </Card>
  );
}
```

### Type Safety Refactoring

#### 1. Better Type Definitions
**Before: Loose types**
```typescript
// Weak typing
interface Project {
  id: string;
  name: string;
  data?: any; // Too generic
  status: string; // Should be enum
  budget?: number;
}

function updateProject(id: string, updates: any) {
  // No type safety
}
```

**After: Strong typing**
```typescript
// Strong, specific types
export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  budget: number;
  start_date: string;
  end_date?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  
  // Optional joined data
  phases?: Phase[];
  materials?: Material[];
  team_members?: TeamMember[];
}

export interface CreateProjectData {
  name: string;
  description: string;
  budget: number;
  start_date: string;
  end_date?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  budget?: number;
  start_date?: string;
  end_date?: string;
}

// Type-safe functions
function updateProject(id: string, updates: UpdateProjectData): Promise<Project> {
  return projectService.updateProject(id, updates);
}
```

#### 2. Generic Utilities
**Before: Repeated patterns**
```typescript
// Repeated API response handling
function handleProjectResponse(response: any) {
  if (response.error) throw new Error(response.error);
  return response.data;
}

function handlePhaseResponse(response: any) {
  if (response.error) throw new Error(response.error);
  return response.data;
}
```

**After: Generic utility**
```typescript
// Generic response handler
export type ApiResponse<T> = {
  data: T | null;
  error: { message: string } | null;
};

export function handleApiResponse<T>(response: ApiResponse<T>): T {
  if (response.error) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error('No data received');
  }
  return response.data;
}

// Usage
async function getProject(id: string): Promise<Project> {
  const response = await supabase
    .from('be_project')
    .select('*')
    .eq('id', id)
    .single();
    
  return handleApiResponse(response);
}
```

### Performance Refactoring

#### 1. Memoization
**Before: Expensive recalculations**
```typescript
function ProjectMetrics({ project }: { project: Project }) {
  // Recalculated on every render
  const totalBudget = project.phases.reduce((sum, phase) => {
    return sum + phase.materials.reduce((phaseSum, material) => {
      return phaseSum + (material.cost * material.quantity);
    }, 0);
  }, 0);

  const completionPercentage = project.phases.reduce((total, phase) => {
    return total + (phase.completion_percentage / project.phases.length);
  }, 0);

  // Component rendering...
}
```

**After: Memoized calculations**
```typescript
function ProjectMetrics({ project }: { project: Project }) {
  const metrics = useMemo(() => {
    const totalBudget = project.phases.reduce((sum, phase) => {
      return sum + phase.materials.reduce((phaseSum, material) => {
        return phaseSum + (material.cost * material.quantity);
      }, 0);
    }, 0);

    const completionPercentage = project.phases.reduce((total, phase) => {
      return total + (phase.completion_percentage / project.phases.length);
    }, 0);

    const remainingBudget = project.budget - totalBudget;
    const isOverBudget = remainingBudget < 0;

    return {
      totalBudget,
      completionPercentage,
      remainingBudget,
      isOverBudget,
    };
  }, [project.phases, project.budget]);

  return (
    <div>
      <MetricCard 
        title="Total Spent" 
        value={formatters.currency(metrics.totalBudget)}
        trend={metrics.isOverBudget ? 'negative' : 'positive'}
      />
      <MetricCard 
        title="Completion" 
        value={`${Math.round(metrics.completionPercentage)}%`}
      />
    </div>
  );
}
```

### File Organization Refactoring

#### 1. Split Large Files
**Before: One large file (500+ lines)**
```
src/components/project/ProjectDetails.tsx  // 500+ lines
```

**After: Organized structure**
```
src/components/project/
├── ProjectDetails/
│   ├── index.ts                    // Barrel export
│   ├── ProjectDetails.tsx          // Main component (< 100 lines)
│   ├── ProjectHeader.tsx           // Header section
│   ├── ProjectTabs.tsx            // Tab navigation
│   ├── tabs/
│   │   ├── OverviewTab.tsx        // Overview content
│   │   ├── PhasesTab.tsx          // Phases content
│   │   ├── MaterialsTab.tsx       // Materials content
│   │   └── BudgetTab.tsx          // Budget content
│   └── hooks/
│       ├── useProjectDetails.ts    // Custom hooks
│       └── useProjectMetrics.ts
```

#### 2. Barrel Exports
```typescript
// src/components/project/index.ts
export { ProjectCard } from './ProjectCard';
export { ProjectDetails } from './ProjectDetails';
export { ProjectForm } from './ProjectForm';
export { ProjectList } from './ProjectList';

// Clean imports
import { ProjectCard, ProjectDetails } from '@/components/project';
```

### Refactoring Checklist

#### Before Refactoring
- [ ] Write tests for existing functionality
- [ ] Document current behavior
- [ ] Identify specific issues to address
- [ ] Plan the refactoring approach

#### During Refactoring
- [ ] Make small, incremental changes
- [ ] Run tests after each change
- [ ] Maintain existing functionality
- [ ] Update types and interfaces

#### After Refactoring
- [ ] Run full test suite
- [ ] Check TypeScript compilation
- [ ] Test in browser/mobile
- [ ] Update documentation
- [ ] Review code with team

### Systematic Refactoring Process

#### 1. Identify Refactoring Targets
```bash
# Find large files
find src -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -nr | head -10

# Find duplicate code patterns
grep -r "useEffect.*useState" src/ | wc -l

# Check for complex components
grep -r "useState.*useState.*useState" src/
```

#### 2. Extract Reusable Hooks
```typescript
// Look for patterns like this to extract
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [data, setData] = useState<T | null>(null);

// Extract to:
function useAsyncOperation<T>() {
  const [state, setState] = useState({
    loading: false,
    error: null as string | null,
    data: null as T | null,
  });

  const execute = useCallback(async (operation: () => Promise<T>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await operation();
      setState({ loading: false, error: null, data: result });
      return result;
    } catch (error) {
      setState({ loading: false, error: (error as Error).message, data: null });
      throw error;
    }
  }, []);

  return { ...state, execute };
}
```

### Remember
- Refactor incrementally, not all at once
- Always maintain existing functionality
- Write tests before refactoring
- Use TypeScript to catch breaking changes
- Focus on one improvement at a time
- Document the reasoning behind changes