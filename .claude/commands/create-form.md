# Create BuildEase Construction Form

Create a new form component specifically designed for construction workflows in the BuildEase platform, optimized for on-site mobile usage by construction professionals and accessible to homeowners.

## Usage
```bash
# Example usage for different construction forms:
# Create daily progress reporting form
create-form DailyProgressForm --domain=project --type=report --mobile-optimized=true

# Create safety inspection form
create-form SafetyInspectionForm --domain=safety --type=checklist --offline=true

# Create material request form
create-form MaterialRequestForm --domain=materials --type=request --quick-entry=true

# Create team assignment form
create-form CrewAssignmentForm --domain=team --type=assignment --validation=strict
```

## Arguments
- `<FormName>`: PascalCase form name ending with 'Form' (e.g., DailyProgressForm, SafetyChecklistForm)
- `--domain`: Construction domain (project|team|budget|safety|materials|timeline|reports|permits)
- `--type`: Form type (report|checklist|request|assignment|inspection|update)
- `--mobile-optimized`: Optimize for work gloves and outdoor usage (default: true)
- `--offline`: Include offline form submission with sync (default: false)
- `--quick-entry`: Minimize typing, maximize selections (default: true)
- `--validation`: Validation level (basic|strict|construction-specific)

## Output Files
- `src/components/construction/forms/<FormName>.tsx` - Main form component
- `src/types/<domain>.ts` - Form data interfaces (if new)
- `src/schemas/<domain>Schema.ts` - Zod validation schemas
- `src/hooks/mutations/use<Domain>.ts` - Form submission hooks

## Instructions

You are creating a form component for BuildEase construction management. Every form must be designed for the reality of construction sites: mobile devices, work gloves, time pressure, and industry-specific workflows.

### Construction Form Architecture

#### Core Principles for Construction Forms
- **Mobile-First**: Designed for on-site usage with work gloves
- **Quick Entry**: Minimize typing, maximize selection/toggles
- **Offline Capable**: Forms should work without internet connection
- **Industry Context**: Use construction terminology and workflows
- **Visual Feedback**: Clear status indicators and progress tracking

#### Construction Form Template
```typescript
// src/components/construction/forms/DailyProgressForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Camera, MapPin, Users, AlertTriangle } from 'lucide-react';
import { CreateProgressReportData } from '@/types/construction';

// Construction-specific validation schema
const dailyProgressSchema = z.object({
  project_id: z.string().min(1, 'Project ID is required'),
  phase_id: z.string().min(1, 'Current phase is required'),
  weather_conditions: z.enum(['clear', 'rain', 'snow', 'extreme_heat', 'high_winds']),
  crew_count: z.number().min(1, 'Crew count must be at least 1').max(50),
  work_completed: z.array(z.string()).min(1, 'Select at least one completed task'),
  materials_delivered: z.array(z.object({
    material_type: z.string(),
    quantity: z.number(),
    supplier: z.string().optional()
  })).optional(),
  safety_incidents: z.boolean(),
  incident_details: z.string().optional(),
  delays_encountered: z.boolean(),
  delay_reason: z.string().optional(),
  next_day_plan: z.string().min(10, 'Please provide tomorrow\'s work plan'),
  supervisor_notes: z.string().optional(),
  photo_urls: z.array(z.string()).optional()
});

type DailyProgressData = z.infer<typeof dailyProgressSchema>;

interface InspectionFormProps {
  projectId: string;
  initialData?: Partial<InspectionFormData>;
  onSubmit: (data: CreateInspectionData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  phases?: Array<{ id: string; name: string }>;
  inspectors?: Array<{ id: string; name: string }>;
}

export function InspectionForm({
  projectId,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  phases = [],
  inspectors = [],
}: InspectionFormProps) {
  const form = useForm<InspectionFormData>({
    resolver: zodResolver(inspectionFormSchema),
    defaultValues: {
      inspection_type: initialData?.inspection_type || '',
      scheduled_date: initialData?.scheduled_date || '',
      inspector_id: initialData?.inspector_id || '',
      phase_id: initialData?.phase_id || '',
      notes: initialData?.notes || '',
    },
  });

  const handleSubmit = (data: InspectionFormData) => {
    onSubmit({
      project_id: projectId,
      inspection_type: data.inspection_type,
      scheduled_date: data.scheduled_date || undefined,
      inspector_id: data.inspector_id || undefined,
      phase_id: data.phase_id || undefined,
    });
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleSubmit)} 
        className="space-y-6"
      >
        {/* Inspection Type */}
        <FormField
          control={form.control}
          name="inspection_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inspection Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12"> {/* Mobile-friendly height */}
                    <SelectValue placeholder="Select inspection type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="structural">Structural</SelectItem>
                  <SelectItem value="final">Final Inspection</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the type of inspection to be performed
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phase Selection */}
        {phases.length > 0 && (
          <FormField
            control={form.control}
            name="phase_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Phase</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select project phase (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {phases.map((phase) => (
                      <SelectItem key={phase.id} value={phase.id}>
                        {phase.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Scheduled Date */}
        <FormField
          control={form.control}
          name="scheduled_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scheduled Date</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  className="h-12"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                When should this inspection be performed?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Inspector Selection */}
        {inspectors.length > 0 && (
          <FormField
            control={form.control}
            name="inspector_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inspector</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Assign inspector (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {inspectors.map((inspector) => (
                      <SelectItem key={inspector.id} value={inspector.id}>
                        {inspector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional notes or requirements..."
                  className="resize-none min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="h-12 w-full sm:w-auto"
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            className="h-12 w-full sm:w-auto bg-orange-600 hover:bg-orange-700"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Inspection'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

### Key Guidelines

#### Form Validation
- Use Zod schemas for validation
- Provide clear error messages
- Include field descriptions for user guidance
- Validate on blur and submit

#### Mobile-First Design
- Use `h-12` (48px) minimum height for touch targets
- Stack buttons vertically on mobile, horizontal on larger screens
- Ensure proper spacing and touch-friendly interactions
- Test on mobile devices first

#### Form Structure
- Group related fields logically
- Use consistent spacing (`space-y-6`)
- Provide helpful descriptions and placeholders
- Include loading states for all actions

#### BuildEase Styling
- Use construction industry colors
- Apply consistent button styling with orange accent
- Ensure proper contrast ratios
- Follow BuildEase design tokens

### Form Patterns

#### 1. Simple Form (Input/Select)
```typescript
<FormField
  control={form.control}
  name="field_name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Field Label</FormLabel>
      <FormControl>
        <Input
          className="h-12"
          placeholder="Enter value..."
          {...field}
        />
      </FormControl>
      <FormDescription>Helpful description</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

#### 2. Select with Options
```typescript
<FormField
  control={form.control}
  name="status"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Status</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

#### 3. Date/Time Inputs
```typescript
<FormField
  control={form.control}
  name="due_date"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Due Date</FormLabel>
      <FormControl>
        <Input
          type="date"
          className="h-12"
          {...field}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

#### 4. Multi-line Text
```typescript
<FormField
  control={form.control}
  name="description"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Description</FormLabel>
      <FormControl>
        <Textarea
          placeholder="Enter description..."
          className="resize-none min-h-[100px]"
          {...field}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Integration with Services

#### Usage in Modal
```typescript
// In a modal component
import { InspectionForm } from '@/components/forms/InspectionForm';
import { useCreateInspection } from '@/hooks/mutations/useInspection';

export function CreateInspectionModal({ projectId, isOpen, onClose }) {
  const createInspection = useCreateInspection();

  const handleSubmit = (data: CreateInspectionData) => {
    createInspection.mutate(data, {
      onSuccess: () => {
        onClose();
        // Show success notification
      },
      onError: (error) => {
        // Handle error
        console.error('Failed to create inspection:', error);
      },
    });
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Create Inspection">
      <InspectionForm
        projectId={projectId}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={createInspection.isPending}
      />
    </BaseModal>
  );
}
```

### Validation Patterns

#### Common Validations
```typescript
const schema = z.object({
  // Required string
  name: z.string().min(1, 'Name is required'),
  
  // Email
  email: z.string().email('Invalid email address'),
  
  // Optional string
  description: z.string().optional(),
  
  // Number with range
  amount: z.number().min(0, 'Amount must be positive'),
  
  // Date
  date: z.string().min(1, 'Date is required'),
  
  // Enum
  status: z.enum(['pending', 'completed', 'cancelled']),
  
  // Array
  tags: z.array(z.string()).optional(),
  
  // Custom validation
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter'),
});
```

### Best Practices

1. **User Experience**
   - Provide immediate feedback on validation errors
   - Use descriptive labels and placeholders
   - Include helpful descriptions for complex fields
   - Show loading states during submission

2. **Accessibility**
   - Use proper ARIA labels
   - Ensure keyboard navigation works
   - Provide screen reader friendly error messages
   - Maintain focus management

3. **Performance**
   - Debounce validation for better UX
   - Use controlled components appropriately
   - Avoid unnecessary re-renders

4. **Error Handling**
   - Display server errors clearly
   - Provide actionable error messages
   - Allow users to retry failed submissions

### Remember
- Test forms on mobile devices first
- Follow BuildEase design system
- Use consistent validation patterns
- Integrate with existing service layer
- Provide excellent user feedback
- Consider offline form handling for mobile users