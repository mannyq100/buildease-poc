# Create BuildEase Construction Component

Create a new React component specifically tailored for the BuildEase construction management platform, following established patterns for construction professionals and homeowners.

## Usage
```bash
# Example usage with specific component types:
# Create project management component
create-component ProjectTimelineCard --domain=project --type=card

# Create team management component  
create-component CrewAssignmentForm --domain=team --type=form

# Create safety component
create-component SafetyChecklistCard --domain=safety --type=card

# Create budget tracking component
create-component BudgetOverviewDashboard --domain=budget --type=dashboard
```

## Arguments
- `<ComponentName>`: PascalCase component name (e.g., ProjectStatusCard, PhaseTimelineView)
- `--domain`: Construction domain (project|team|budget|safety|materials|timeline|reports)
- `--type`: Component type (card|form|modal|dashboard|list|detail)
- `--mobile-first`: Optimize for mobile construction site usage (default: true)
- `--offline-capable`: Include offline functionality (default: false)

## Output Files
- `src/components/construction/<domain>/<ComponentName>.tsx` - Main component file
- `src/types/<domain>.ts` - TypeScript interfaces (if new)
- `src/data/mock/<domain>.json` - Mock data (if needed)
- `src/hooks/queries/use<Domain>.ts` - React Query hooks (if data-driven)

## Instructions

You are creating a React component for BuildEase - a construction management platform designed for contractors working on-site with mobile devices and homeowners tracking their projects. Every component must prioritize the construction industry context.

### BuildEase Construction Context
- **Primary Users**: Construction professionals (contractors, project managers, site supervisors) using mobile devices on job sites
- **Secondary Users**: Homeowners monitoring their construction/renovation projects
- **Environment**: Often used outdoors with unreliable internet, bright sunlight, and touch interactions
- **Industry Focus**: Construction terminology, workflows, and visual hierarchy appropriate for the building industry

### Component Architecture (BuildEase Standard)
```typescript
// File: src/components/construction/[ComponentName].tsx
export function [ComponentName]({ projectId, ...props }: [ComponentName]Props) {
  // 1. Supabase data hooks (construction-specific)
  const { data: project } = useProject(projectId);
  const { data: phases } = useProjectPhases(projectId);
  
  // 2. Construction-specific mutations
  const updatePhase = useUpdatePhase();
  const createTask = useCreateTask();
  
  // 3. Mobile-first loading states
  if (!project) return <ConstructionSkeleton type="project" />;
  
  // 4. Construction workflow logic
  const handlePhaseComplete = useCallback((phaseId: string) => {
    updatePhase.mutate({ 
      id: phaseId, 
      status: 'completed',
      completed_at: new Date().toISOString()
    });
  }, [updatePhase]);
  
  // 5. Mobile-first render with construction context
  return (
    <Card className="
      bg-white/90 backdrop-blur-sm border-slate-200
      p-4 rounded-xl shadow-lg
      sm:p-6 lg:p-8
    ">
      {/* Construction-specific header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-buildease-blue-600" />
          <h3 className="font-semibold text-slate-900">{project.name}</h3>
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>
      
      {/* Mobile-optimized content */}
      <div className="space-y-4">
        {/* Component content here */}
      </div>
      
      {/* Construction action buttons - mobile-first */}
      <div className="flex flex-col gap-2 mt-6 sm:flex-row sm:gap-4">
        <Button 
          onClick={() => handlePhaseComplete(currentPhase.id)}
          className="
            h-12 bg-buildease-orange-500 hover:bg-buildease-orange-600
            text-white font-medium rounded-lg
            sm:h-10 sm:px-6
          "
        >
          Mark Phase Complete
        </Button>
      </div>
    </Card>
  );
}

// Construction-specific subcomponents
function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const statusConfig = {
    'planning': { color: 'bg-amber-100 text-amber-800', label: 'Planning' },
    'active': { color: 'bg-green-100 text-green-800', label: 'Active' },
    'on-hold': { color: 'bg-red-100 text-red-800', label: 'On Hold' },
    'completed': { color: 'bg-blue-100 text-blue-800', label: 'Completed' }
  };
  
  const config = statusConfig[status];
  return (
    <Badge className={`${config.color} px-3 py-1 text-sm font-medium`}>
      {config.label}
    </Badge>
  );
}

// Construction-specific types
interface [ComponentName]Props {
  projectId: string;
  phaseId?: string;
  onPhaseUpdate?: (phase: ProjectPhase) => void;
  className?: string;
}
```

### BuildEase Design System (Construction Industry)

#### Colors (Construction Professional Palette)
```typescript
// Primary: Trust and professionalism for construction
const CONSTRUCTION_COLORS = {
  // Primary blue - trust, reliability, professional
  primary: 'bg-buildease-blue-600 hover:bg-buildease-blue-700', // #2B6CB0
  
  // Accent orange - action, urgency, calls-to-action
  accent: 'bg-buildease-orange-500 hover:bg-buildease-orange-600', // #ED8936
  
  // Construction status colors
  status: {
    planning: 'bg-amber-500 text-white', // Planning phase
    active: 'bg-green-600 text-white',   // Work in progress
    onHold: 'bg-red-600 text-white',     // Issues/delays
    completed: 'bg-blue-600 text-white', // Finished
    inspection: 'bg-purple-600 text-white' // Quality control
  },
  
  // Earth tones for construction context
  earth: {
    concrete: 'bg-slate-100 text-slate-800',
    steel: 'bg-slate-600 text-white',
    wood: 'bg-amber-100 text-amber-800',
    safety: 'bg-yellow-400 text-yellow-900'
  }
};
```

#### Mobile-First Construction Layouts
```typescript
// Construction site mobile patterns
const CONSTRUCTION_LAYOUTS = {
  // Project overview - thumb-friendly navigation
  projectCard: `
    grid grid-cols-1 gap-4 p-4
    sm:grid-cols-2 sm:gap-6 sm:p-6
    lg:grid-cols-3 lg:gap-8 lg:p-8
  `,
  
  // Phase timeline - horizontal scroll on mobile
  phaseTimeline: `
    flex gap-4 overflow-x-auto pb-4
    sm:grid sm:grid-cols-2 sm:overflow-visible
    lg:grid-cols-4
  `,
  
  // Task list - optimized for quick updates
  taskList: `
    space-y-3
    sm:space-y-4
    lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0
  `,
  
  // Action buttons - construction workflow
  actionBar: `
    flex flex-col gap-2 mt-6
    sm:flex-row sm:gap-4
    lg:justify-end
  `
};
```

### Construction-Specific Component Types

#### Project Management Components
- `ProjectOverviewCard` - Project status, progress, key metrics
- `PhaseTimelineView` - Construction phases with dependencies
- `TaskChecklistCard` - Daily tasks for construction crews
- `BudgetTracker` - Cost tracking with construction categories
- `TeamRosterCard` - Crew assignments and contact info
- `SafetyChecklistForm` - Daily safety inspections
- `MaterialsInventory` - Supply tracking and ordering
- `InspectionScheduler` - Code compliance and quality checks

#### Communication Components
- `ProjectUpdatesFeed` - Progress updates for homeowners
- `IssueReportForm` - Problem reporting with photos
- `WeatherAlertBanner` - Weather impact notifications
- `ClientMessageCenter` - Homeowner-contractor communication

#### Document Management
- `ConstructionPhotoGallery` - Progress photos with annotations
- `PermitTracker` - Building permits and approvals
- `BlueprintViewer` - Plan viewing optimized for mobile
- `ComplianceDocuments` - Regulatory documentation

### Mobile Construction Site Optimization

#### Touch Targets (Minimum 44px)
```typescript
// Construction-optimized touch targets
const TOUCH_TARGETS = {
  // Primary actions - easy with work gloves
  primaryButton: 'h-12 px-6 text-base font-medium', // 48px height
  
  // Secondary actions
  secondaryButton: 'h-10 px-4 text-sm', // 40px height
  
  // Form inputs - construction site friendly
  formInput: 'h-12 px-4 text-base', // Large enough for gloved hands
  
  // Navigation elements
  navButton: 'h-11 w-11 flex items-center justify-center', // 44px minimum
  
  // Status indicators - quick visual reference
  statusBadge: 'px-3 py-2 text-sm font-medium rounded-lg'
};
```

#### Construction Terminology Integration
```typescript
// Use industry-standard construction terms
const CONSTRUCTION_TERMS = {
  phases: ['Site Prep', 'Foundation', 'Framing', 'MEP', 'Finishes'],
  roles: ['Project Manager', 'Site Supervisor', 'Foreman', 'Tradesperson'],
  statuses: ['Not Started', 'In Progress', 'Under Review', 'Complete'],
  priorities: ['Critical Path', 'High Priority', 'Standard', 'When Possible']
};
```

### File Organization (Construction Domain)
```
src/components/construction/
├── project/
│   ├── ProjectOverviewCard.tsx
│   ├── ProjectStatusHero.tsx
│   └── index.ts
├── phases/
│   ├── PhaseTimelineView.tsx
│   ├── PhaseProgressCard.tsx
│   └── index.ts
├── tasks/
│   ├── TaskChecklistCard.tsx
│   ├── TaskAssignmentForm.tsx
│   └── index.ts
├── team/
│   ├── CrewRosterCard.tsx
│   ├── ContactQuickActions.tsx
│   └── index.ts
└── safety/
    ├── SafetyChecklistForm.tsx
    ├── IncidentReportForm.tsx
    └── index.ts
```

### BuildEase Implementation Checklist

#### Before Creating Component:
- [ ] Research existing BuildEase components for similar functionality
- [ ] Identify the construction workflow this component supports
- [ ] Determine primary user (contractor vs homeowner) and context
- [ ] Plan mobile-first layout for construction site usage

#### During Development:
- [ ] Use construction industry terminology consistently
- [ ] Implement 44px minimum touch targets for work gloves
- [ ] Apply BuildEase color palette (#2B6CB0, #ED8936)
- [ ] Test with construction project data and workflows
- [ ] Ensure offline-capable where possible

#### After Implementation:
- [ ] Test on actual mobile devices in bright sunlight
- [ ] Validate with construction professionals
- [ ] Verify accessibility for diverse construction teams
- [ ] Document construction-specific usage patterns

### Remember: Construction Site Reality
- **Environment**: Dusty, bright sunlight, work gloves, time pressure
- **Users**: Skilled tradespeople who may not be tech-savvy
- **Goals**: Get work done efficiently, communicate clearly, track progress
- **Constraints**: Limited time, mobile-only access, potential connectivity issues

Every BuildEase component should feel natural to construction professionals while being accessible to homeowners tracking their projects.