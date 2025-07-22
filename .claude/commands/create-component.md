# Create BuildEase Component

Create a new React component following BuildEase patterns and conventions.

## Instructions

You are creating a React component for the BuildEase construction management platform. Follow these guidelines:

### Component Structure
- Use function declarations (not arrow functions)
- Export component at the top of the file
- Organize in this order: exported component → subcomponents → helpers → constants → types
- Keep files under 400 lines; refactor if exceeded

### Code Quality
- Use TypeScript with strong typing
- Write clean, simple solutions with clear naming
- Avoid code duplication by checking existing functionality
- Use pure functions with early returns for error handling

### UI/UX Requirements
- **Mobile-first responsive design** - Start with mobile breakpoints first
- Use shadcn-ui components when possible
- Apply BuildEase design tokens:
  - Primary: Warm blue (#2B6CB0) for trust and professionalism
  - Secondary: Muted earth tones for construction context
  - Accent: Warm orange (#ED8936) for calls-to-action
  - Status colors: Green (success), Amber (in-progress), Red (error)
- Ensure 44px minimum touch targets for mobile
- Implement progressive disclosure for complex workflows

### Technical Patterns
- Use TanStack Query for server state
- Use Zustand for client state when needed
- Use react-hook-form with Zod validation for forms
- Implement proper loading and error states
- Add error boundaries for critical components

### File Organization
- Place in appropriate domain folder under `src/components/`
- Create types in `src/types/[domain].ts`
- Add to barrel exports (`index.ts`) for clean imports
- Store mock data in `src/data/mock/` if needed

### Example Component Structure:
```typescript
// src/components/[domain]/ComponentName.tsx
export function ComponentName({ prop }: ComponentProps) {
  // Hooks at top
  const data = useQuery();
  const mutation = useMutation();
  
  // Early returns for loading/error states
  if (loading) return <Skeleton />;
  if (error) return <ErrorBoundary />;
  
  // Main render with mobile-first classes
  return (
    <Card className="flex flex-col gap-4 sm:flex-row sm:gap-6 lg:gap-8">
      {/* Content */}
    </Card>
  );
}

// Types
interface ComponentProps {
  prop: string;
}
```

### Remember
- Check existing components for similar functionality before creating new ones
- Ensure accessibility (WCAG AA compliant)
- Test on mobile first, then scale up
- Use construction industry terminology appropriately
- Follow BuildEase naming conventions