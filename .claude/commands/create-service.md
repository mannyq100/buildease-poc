# Create BuildEase Construction Service

Create a new service layer for the BuildEase construction management platform following established patterns and API conventions.

## Usage
```bash
# Example usage for different construction domains:
# Create project management service
create-service ProjectService --domain=project --crud=full

# Create inspection service
create-service InspectionService --domain=safety --crud=full

# Create material tracking service
create-service MaterialService --domain=materials --crud=basic

# Create team management service
create-service TeamService --domain=team --crud=full --realtime=true
```

## Arguments
- `<ServiceName>`: PascalCase service name ending with 'Service' (e.g., ProjectService, InspectionService)
- `--domain`: Construction domain (project|team|budget|safety|materials|timeline|reports|permits)
- `--crud`: CRUD operations level (basic|full|readonly)
  - `basic`: create, read, update
  - `full`: create, read, update, delete + domain-specific methods
  - `readonly`: read operations only
- `--realtime`: Include Supabase real-time subscriptions (default: false)
- `--offline`: Include offline support with sync (default: false)

## Output Files
- `src/services/<domain>Service.ts` - Main service implementation
- `src/types/<domain>.ts` - TypeScript interfaces (if new)
- `src/hooks/queries/use<Domain>.ts` - React Query hooks
- `src/hooks/mutations/use<Domain>.ts` - Mutation hooks
- `src/data/mock/<domain>.json` - Mock data for development

## Instructions

You are creating a service layer component for the BuildEase construction management platform. Follow these guidelines:

### Service Structure
Follow the established factory pattern from `src/services/serviceFactory.ts`:

```typescript
// src/services/inspectionService.ts
import { supabase } from '@/lib/supabase';
import { Inspection, CreateInspectionData, UpdateInspectionData } from '@/types/inspection';

export interface InspectionService {
  getInspectionsByProject(projectId: string): Promise<Inspection[]>;
  getInspectionById(id: string): Promise<Inspection>;
  createInspection(data: CreateInspectionData): Promise<Inspection>;
  updateInspection(id: string, data: UpdateInspectionData): Promise<Inspection>;
  deleteInspection(id: string): Promise<void>;
  scheduleInspection(id: string, scheduledDate: Date): Promise<Inspection>;
  completeInspection(id: string, notes: string): Promise<Inspection>;
}

class SupabaseInspectionService implements InspectionService {
  async getInspectionsByProject(projectId: string): Promise<Inspection[]> {
    const { data, error } = await supabase
      .from('be_inspection')
      .select(`
        *,
        inspector:inspector_id(id, full_name, email),
        phase:phase_id(id, name, phase_number)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch inspections: ${error.message}`);
    return data || [];
  }

  async getInspectionById(id: string): Promise<Inspection> {
    const { data, error } = await supabase
      .from('be_inspection')
      .select(`
        *,
        inspector:inspector_id(id, full_name, email),
        phase:phase_id(id, name, phase_number),
        project:project_id(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) throw new Error(`Failed to fetch inspection: ${error.message}`);
    if (!data) throw new Error('Inspection not found');
    return data;
  }

  async createInspection(data: CreateInspectionData): Promise<Inspection> {
    const { data: inspection, error } = await supabase
      .from('be_inspection')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(`Failed to create inspection: ${error.message}`);
    return inspection;
  }

  async updateInspection(id: string, data: UpdateInspectionData): Promise<Inspection> {
    const { data: inspection, error } = await supabase
      .from('be_inspection')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update inspection: ${error.message}`);
    return inspection;
  }

  async deleteInspection(id: string): Promise<void> {
    const { error } = await supabase
      .from('be_inspection')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete inspection: ${error.message}`);
  }

  async scheduleInspection(id: string, scheduledDate: Date): Promise<Inspection> {
    return this.updateInspection(id, { 
      scheduled_date: scheduledDate.toISOString(),
      status: 'pending'
    });
  }

  async completeInspection(id: string, notes: string): Promise<Inspection> {
    return this.updateInspection(id, {
      status: 'completed',
      completed_date: new Date().toISOString(),
      inspector_notes: notes
    });
  }
}

// Mock service for development/testing
class MockInspectionService implements InspectionService {
  // Implement mock methods using data from src/data/mock/
  async getInspectionsByProject(projectId: string): Promise<Inspection[]> {
    // Return mock data from src/data/mock/inspections.ts
    return [];
  }
  
  // ... implement other methods
}

// Export factory function
export const createInspectionService = (): InspectionService => {
  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  return useMockData ? new MockInspectionService() : new SupabaseInspectionService();
};

// Default export
export const inspectionService = createInspectionService();
```

### Key Guidelines

#### API Design
- Use clear, descriptive method names
- Follow RESTful patterns: `get`, `create`, `update`, `delete`
- Include domain-specific methods like `scheduleInspection`, `completeInspection`
- Return typed data using interfaces from `src/types/`

#### Error Handling
- Always check for Supabase errors
- Throw descriptive error messages
- Use consistent error patterns across all methods
- Handle edge cases (not found, unauthorized, etc.)

#### Query Patterns
- Use Supabase's `select()` with joins for related data
- Include relevant related data in queries
- Use proper ordering and filtering
- Consider performance with large datasets

#### Data Transformation
- Let Supabase handle most data transformation
- Convert dates to proper Date objects when needed
- Validate input data before sending to Supabase
- Use TypeScript types for compile-time safety

### Required Files to Create

#### 1. Types (`src/types/[domain].ts`)
```typescript
// src/types/inspection.ts
export interface Inspection {
  id: string;
  project_id: string;
  phase_id?: string;
  inspection_type: string;
  status: InspectionStatus;
  scheduled_date?: string;
  completed_date?: string;
  inspector_notes?: string;
  inspector_id?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  inspector?: User;
  phase?: Phase;
  project?: Project;
}

export type InspectionStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface CreateInspectionData {
  project_id: string;
  phase_id?: string;
  inspection_type: string;
  scheduled_date?: string;
  inspector_id?: string;
}

export interface UpdateInspectionData {
  inspection_type?: string;
  status?: InspectionStatus;
  scheduled_date?: string;
  completed_date?: string;
  inspector_notes?: string;
  inspector_id?: string;
}
```

#### 2. React Query Hooks (`src/hooks/queries/` & `src/hooks/mutations/`)
```typescript
// src/hooks/queries/useInspection.ts
import { useQuery } from '@tanstack/react-query';
import { inspectionService } from '@/services/inspectionService';

export const useInspectionsByProject = (projectId: string) => {
  return useQuery({
    queryKey: ['inspections', 'project', projectId],
    queryFn: () => inspectionService.getInspectionsByProject(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useInspection = (id: string) => {
  return useQuery({
    queryKey: ['inspection', id],
    queryFn: () => inspectionService.getInspectionById(id),
    enabled: !!id,
  });
};
```

```typescript
// src/hooks/mutations/useInspection.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inspectionService } from '@/services/inspectionService';
import { CreateInspectionData, UpdateInspectionData } from '@/types/inspection';

export const useCreateInspection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInspectionData) => 
      inspectionService.createInspection(data),
    onSuccess: (newInspection) => {
      // Invalidate and refetch inspections for the project
      queryClient.invalidateQueries({ 
        queryKey: ['inspections', 'project', newInspection.project_id] 
      });
    },
  });
};

export const useUpdateInspection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInspectionData }) =>
      inspectionService.updateInspection(id, data),
    onSuccess: (updatedInspection) => {
      // Update specific inspection in cache
      queryClient.setQueryData(
        ['inspection', updatedInspection.id],
        updatedInspection
      );
      // Invalidate project inspections list
      queryClient.invalidateQueries({
        queryKey: ['inspections', 'project', updatedInspection.project_id]
      });
    },
  });
};
```

#### 3. Mock Data (`src/data/mock/[domain].ts`)
```typescript
// src/data/mock/inspections.ts
import { Inspection } from '@/types/inspection';

export const mockInspections: Inspection[] = [
  {
    id: '1',
    project_id: 'project-1',
    phase_id: 'phase-1',
    inspection_type: 'electrical',
    status: 'completed',
    scheduled_date: '2024-01-15T10:00:00Z',
    completed_date: '2024-01-15T11:30:00Z',
    inspector_notes: 'All electrical work passes inspection.',
    inspector_id: 'inspector-1',
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-15T11:30:00Z',
  },
  // ... more mock data
];
```

### Integration Steps

1. **Create the service file** in `src/services/`
2. **Define types** in `src/types/`
3. **Add mock data** in `src/data/mock/`
4. **Create React Query hooks** in `src/hooks/`
5. **Export from barrel files** (`index.ts`)
6. **Test the service** with existing components
7. **Update service factory** if needed

### Best Practices

- **Consistent naming**: Use domain-specific terminology
- **Type safety**: Use TypeScript throughout
- **Error handling**: Provide helpful error messages
- **Performance**: Consider caching and query optimization
- **Testing**: Include mock implementations for testing
- **Documentation**: Add JSDoc comments for complex methods

### Remember
- Follow existing service patterns in the codebase
- Use Supabase RLS policies for security
- Consider offline functionality for mobile users
- Test both mock and real API implementations
- Update related components after creating the service