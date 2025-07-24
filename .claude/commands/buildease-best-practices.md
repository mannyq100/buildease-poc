# BuildEase AI Agent Best Practices

Essential guidelines for AI agents working on the BuildEase construction management platform.

## Core Mission & Context

BuildEase is a **construction management platform** designed for:
- **Primary Users**: Construction professionals (contractors, project managers, site supervisors) using mobile devices on job sites
- **Secondary Users**: Homeowners monitoring their construction/renovation projects
- **Environment**: Often used outdoors with unreliable internet, bright sunlight, work gloves, and time pressure

## Critical Best Practices

### 1. Always Check Existing Codebase First
**BEFORE creating any new component, service, or utility:**
```bash
# Search for existing similar functionality
grep -r "ProjectCard" src/components/
grep -r "useProject" src/hooks/
grep -r "ProjectService" src/services/
```

**Why**: Avoid code duplication and maintain consistency with existing patterns.

### 2. Mobile-First Construction Site Reality
**Every component must prioritize mobile usage:**
- **Touch Targets**: Minimum 44px for work gloves
- **Typography**: Large, readable fonts (16px base minimum)
- **Contrast**: High contrast for bright sunlight visibility
- **Offline Capability**: Consider unreliable internet connections
- **Quick Actions**: Minimize typing, maximize selections/toggles

### 3. Construction Industry Terminology
**Use industry-standard construction terms:**
```typescript
// ✅ Good - Construction terminology
const CONSTRUCTION_PHASES = ['Site Prep', 'Foundation', 'Framing', 'MEP', 'Finishes'];
const CREW_ROLES = ['Project Manager', 'Site Supervisor', 'Foreman', 'Tradesperson'];

// ❌ Bad - Generic terminology
const PHASES = ['Phase 1', 'Phase 2', 'Phase 3'];
const ROLES = ['Manager', 'Worker', 'Lead'];
```

### 4. BuildEase Design System Compliance
**Always use the established color palette:**
```typescript
// Primary colors
const BUILDEASE_COLORS = {
  primary: '#2B6CB0',      // Warm blue - trust and professionalism
  accent: '#ED8936',       // Warm orange - calls-to-action
  success: '#10B981',      // Green - completed/success states
  warning: '#F59E0B',      // Amber - in-progress/warning states
  error: '#EF4444',        // Red - error/danger states
};
```

### 5. File Organization Standards
**Follow established directory structure:**
```
src/
├── components/
│   ├── construction/          # Construction-specific components
│   │   ├── project/          # Project management components
│   │   ├── team/             # Team management components
│   │   ├── safety/           # Safety and compliance components
│   │   └── materials/        # Materials and inventory components
│   ├── shared/               # Reusable components
│   └── ui/                   # shadcn-ui components
├── hooks/
│   ├── queries/              # React Query hooks for data fetching
│   └── mutations/            # React Query hooks for data mutations
├── services/                 # Supabase service layer
├── types/                    # TypeScript type definitions
├── data/                     # Mock data and constants
└── utils/                    # Utility functions
```

### 6. Component Architecture Standards
**Follow this structure for all components:**
```typescript
// 1. Exports first
export function ProjectStatusCard({ projectId, ...props }: ProjectStatusCardProps) {
  // 2. Data hooks
  const { data: project } = useProject(projectId);
  
  // 3. Loading states
  if (!project) return <ConstructionSkeleton type="project" />;
  
  // 4. Business logic
  const handleStatusUpdate = useCallback(() => {
    // Implementation
  }, []);
  
  // 5. Render
  return (
    <Card className="bg-white/90 backdrop-blur-sm">
      {/* Component content */}
    </Card>
  );
}

// 6. Subcomponents
function StatusBadge({ status }: { status: ProjectStatus }) {
  // Implementation
}

// 7. Types
interface ProjectStatusCardProps {
  projectId: string;
  onStatusChange?: (status: ProjectStatus) => void;
}
```

### 7. Performance Optimization for Construction Sites
**Optimize for mobile devices with poor connectivity:**
- **Bundle Size**: Keep components under 400 lines, split when exceeded
- **Lazy Loading**: Use React.lazy for non-critical components
- **Image Optimization**: Compress and use responsive images
- **Caching**: Leverage React Query for intelligent caching
- **Offline Support**: Implement offline-first patterns where possible

### 8. TypeScript Excellence
**Use strong typing throughout:**
```typescript
// ✅ Good - Specific construction types
interface ProjectPhase {
  id: string;
  name: string;
  phase_category: 'site-prep' | 'foundation' | 'framing' | 'mep' | 'finishes';
  start_date: string;
  end_date: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold';
  crew_assignments: CrewMember[];
}

// ❌ Bad - Generic or any types
interface Phase {
  id: string;
  data: any;
  status: string;
}
```

### 9. Error Handling & User Feedback
**Provide clear, construction-context error messages:**
```typescript
// ✅ Good - Construction-specific error messages
const ERROR_MESSAGES = {
  PHASE_DEPENDENCY: "Cannot start framing until foundation inspection is complete",
  CREW_UNAVAILABLE: "Assigned crew member is not available on selected date",
  MATERIAL_SHORTAGE: "Insufficient materials in inventory for this task",
  WEATHER_DELAY: "Work suspended due to weather conditions"
};

// ❌ Bad - Generic error messages
const ERROR_MESSAGES = {
  VALIDATION_ERROR: "Invalid input",
  SERVER_ERROR: "Something went wrong",
  NETWORK_ERROR: "Connection failed"
};
```

### 10. Testing & Validation
**Test with construction scenarios:**
- **Mobile Devices**: Test on actual phones/tablets
- **Bright Sunlight**: Verify visibility in outdoor conditions
- **Work Gloves**: Ensure touch targets are accessible
- **Poor Connectivity**: Test offline functionality
- **Construction Data**: Use realistic project data for testing

## Command Execution Best Practices

### Before Executing Any Command:
1. **Research**: Search existing codebase for similar functionality
2. **Plan**: Understand the construction workflow being supported
3. **Context**: Consider mobile-first, construction site usage
4. **Dependencies**: Check for required types, services, or components

### During Command Execution:
1. **Follow Templates**: Use the argument templates provided in each command
2. **Construction Focus**: Apply construction industry terminology and workflows
3. **Mobile Optimization**: Prioritize mobile-first responsive design
4. **Type Safety**: Use strong TypeScript typing throughout
5. **Error Handling**: Implement construction-specific error messages

### After Command Execution:
1. **Test Mobile**: Verify functionality on mobile devices
2. **Validate Design**: Ensure BuildEase color palette and design system compliance
3. **Check Performance**: Verify fast loading and responsive interactions
4. **Document**: Update relevant documentation and type definitions

## Common Anti-Patterns to Avoid

### ❌ Don't Do This:
- Create components without checking for existing similar functionality
- Use generic terminology instead of construction industry terms
- Ignore mobile-first responsive design principles
- Hardcode colors instead of using BuildEase design system
- Create components over 400 lines without refactoring
- Use `any` types instead of proper TypeScript interfaces
- Implement desktop-first designs that don't work on mobile
- Create forms that require excessive typing on mobile devices

### ✅ Do This Instead:
- Search codebase first, reuse existing patterns
- Use construction industry terminology consistently
- Start with mobile design, scale up to desktop
- Use BuildEase color palette and design system
- Keep components focused and under 400 lines
- Use strong TypeScript typing throughout
- Design for mobile construction site usage first
- Create forms optimized for quick entry with selections/toggles

## Remember: Construction Site Reality

Every decision should consider:
- **Environment**: Dusty, bright sunlight, work gloves, time pressure
- **Users**: Skilled tradespeople who may not be tech-savvy
- **Goals**: Get work done efficiently, communicate clearly, track progress
- **Constraints**: Limited time, mobile-only access, potential connectivity issues

BuildEase components should feel natural to construction professionals while being accessible to homeowners tracking their projects.
